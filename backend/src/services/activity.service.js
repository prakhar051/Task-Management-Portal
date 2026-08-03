import ActivityRepository from '../repositories/activity.repository.js';
import prisma from '../config/prisma.js';
import { contextStorage } from '../utils/context.js';

class ActivityService {
  async logActivity(data) {
    try {
      const req = contextStorage.getStore();
      const currentUserId = req?.user?.id || data.userId || null;
      const currentIp = req?.ip || req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || data.ipAddress || '127.0.0.1';
      const currentAgent = req?.headers?.['user-agent'] || data.userAgent || 'Unknown browser';

      const { action, entityType, entityId, description, metadata } = data;

      // Enforce the consistent audit metadata schema: { before, after, changes }
      const cleanMetadata = metadata || { before: null, after: null, changes: null };

      return await ActivityRepository.create({
        userId: currentUserId,
        action,
        entityType,
        entityId,
        description,
        metadata: cleanMetadata,
        ipAddress: currentIp,
        userAgent: currentAgent
      });
    } catch (err) {
      // NON-BLOCKING: Log and recover without interrupting main operation
      console.error('[ActivityService] Non-blocking logActivity error:', err);
      return null;
    }
  }

  async getScopeUserIds(user) {
    if (user.role === 'ADMIN') {
      return null; // No scoping limitation for administrators
    }

    if (user.role === 'MANAGER') {
      // Fetch manager's employee details to locate their department
      const employee = await prisma.employee.findUnique({
        where: { userId: user.id }
      });

      if (employee && employee.departmentId) {
        // Query users representing employees inside manager's department
        const employees = await prisma.employee.findMany({
          where: { departmentId: employee.departmentId },
          select: { userId: true }
        });
        const ids = employees.map((e) => e.userId).filter(Boolean);
        // Include manager's own activities
        if (!ids.includes(user.id)) {
          ids.push(user.id);
        }
        return ids;
      }
    }

    // Default scope is only themselves for normal employees
    return [user.id];
  }

  async getActivities(user, query) {
    const { page, limit, search, action, entityType, userId, startDate, endDate } = query;

    const userIdsScope = await this.getScopeUserIds(user);
    const filters = { search, action, entityType, userId, startDate, endDate };
    const pagination = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10
    };

    return await ActivityRepository.findAll(userIdsScope, filters, pagination);
  }

  async getActivityById(id, user) {
    const activity = await ActivityRepository.findById(id);
    if (!activity) {
      throw new Error('Activity log entry not found.');
    }

    // Enforce RBAC security checks
    const userIdsScope = await this.getScopeUserIds(user);
    if (userIdsScope !== null && !userIdsScope.includes(activity.userId)) {
      throw new Error('Access denied: Unauthorized view permissions.');
    }

    return activity;
  }

  async getEntityActivities(entityType, entityId, user) {
    // In early deployment audit trails, let's limit scope filters to authorized scopes
    const activities = await ActivityRepository.findByEntity(entityType, entityId);
    
    const userIdsScope = await this.getScopeUserIds(user);
    if (userIdsScope !== null) {
      // Filter out activities of users that are not inside manager's/employee's visibility scope
      return activities.filter((a) => userIdsScope.includes(a.userId));
    }

    return activities;
  }

  async getUserActivities(targetUserId, user, query) {
    const userIdsScope = await this.getScopeUserIds(user);
    if (userIdsScope !== null && !userIdsScope.includes(targetUserId)) {
      throw new Error('Access denied: Unauthorized view permissions.');
    }

    const { page, limit } = query;
    const pagination = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10
    };

    return await ActivityRepository.findByUser(targetUserId, pagination);
  }

  async exportCSV(user, query) {
    const { search, action, entityType, userId, startDate, endDate } = query;
    const userIdsScope = await this.getScopeUserIds(user);
    const filters = { search, action, entityType, userId, startDate, endDate };

    const logs = await ActivityRepository.exportAll(userIdsScope, filters);

    // Convert list to CSV format strings
    let csv = 'ID,UserEmail,UserName,Action,EntityType,EntityID,Description,IPAddress,UserAgent,CreatedAt\n';
    for (const log of logs) {
      const id = log.id;
      const email = log.user?.email || 'N/A';
      const name = log.user?.name || 'N/A';
      const action = log.action;
      const type = log.entityType;
      const entityId = log.entityId;
      const desc = `"${(log.description || '').replace(/"/g, '""')}"`;
      const ip = log.ipAddress;
      const agent = `"${(log.userAgent || '').replace(/"/g, '""')}"`;
      const cAt = log.createdAt ? log.createdAt.toISOString() : '';
      csv += `${id},${email},${name},${action},${type},${entityId},${desc},${ip},${agent},${cAt}\n`;
    }

    return csv;
  }
}

export default new ActivityService();
