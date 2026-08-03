import NotificationRepository from '../repositories/notification.repository.js';

class NotificationService {
  async createNotification(data) {
    try {
      const { userId, type } = data;
      if (!userId) return null;

      // Retrieve preferences for target user
      const prefs = await NotificationRepository.getPreferences(userId);

      // Check global in-app notification preference
      if (!prefs.inApp) {
        return null;
      }

      // Check type-specific preferences
      const typeToPrefMap = {
        TASK_ASSIGNED: 'taskAssigned',
        TASK_UPDATED: 'taskUpdated',
        TASK_COMPLETED: 'taskCompleted',
        PROJECT_CREATED: 'projectCreated',
        PROJECT_UPDATED: 'projectUpdated',
        COMMENT_ADDED: 'commentAdded',
        ATTACHMENT_ADDED: 'attachmentAdded'
      };

      const prefKey = typeToPrefMap[type];
      if (prefKey !== undefined && !prefs[prefKey]) {
        // User disabled notifications of this specific type
        return null;
      }

      return await NotificationRepository.create(data);
    } catch (err) {
      // NON-BLOCKING: Log error but do NOT throw, so parent operation succeeds
      console.error('[NotificationService] Non-blocking createNotification error:', err);
      return null;
    }
  }

  async getNotifications(userId, query) {
    const { page, limit, search, isRead, priority, type, sortBy, sortOrder } = query;

    const filters = { search, isRead, priority, type };
    const pagination = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10
    };
    const sorting = { sortBy, sortOrder };

    return await NotificationRepository.findAll(userId, filters, pagination, sorting);
  }

  async getUnreadCount(userId) {
    const count = await NotificationRepository.countUnread(userId);
    return { count };
  }

  async markAsRead(id, userId) {
    return await NotificationRepository.markAsRead(id, userId);
  }

  async markAllAsRead(userId) {
    await NotificationRepository.markAllAsRead(userId);
    return { success: true };
  }

  async deleteNotification(id, userId) {
    return await NotificationRepository.delete(id, userId);
  }

  async deleteBulkNotifications(ids, userId) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error('Notification IDs array must be provided.');
    }
    return await NotificationRepository.deleteBulk(ids, userId);
  }

  async getPreferences(userId) {
    return await NotificationRepository.getPreferences(userId);
  }

  async updatePreferences(userId, data) {
    // Whitelist preferences properties to prevent payload pollution
    const allowed = [
      'email',
      'inApp',
      'taskAssigned',
      'taskUpdated',
      'taskCompleted',
      'projectCreated',
      'projectUpdated',
      'commentAdded',
      'attachmentAdded'
    ];

    const cleanData = {};
    for (const key of allowed) {
      if (data[key] !== undefined) {
        cleanData[key] = data[key] === 'true' || data[key] === true;
      }
    }

    return await NotificationRepository.updatePreferences(userId, cleanData);
  }

  async exportCSV(userId, query) {
    const { search, isRead, priority, type } = query;
    const filters = { search, isRead, priority, type };
    const notifications = await NotificationRepository.exportAll(userId, filters);

    // Convert list to CSV format strings
    let csv = 'ID,Type,Priority,Title,Message,IsRead,ReadAt,CreatedAt\n';
    for (const n of notifications) {
      const id = n.id;
      const type = n.type;
      const prio = n.priority;
      // Escape commas in message content fields
      const title = `"${(n.title || '').replace(/"/g, '""')}"`;
      const msg = `"${(n.message || '').replace(/"/g, '""')}"`;
      const isRead = n.isRead;
      const readAt = n.readAt ? n.readAt.toISOString() : '';
      const cAt = n.createdAt ? n.createdAt.toISOString() : '';
      csv += `${id},${type},${prio},${title},${msg},${isRead},${readAt},${cAt}\n`;
    }

    return csv;
  }
}

export default new NotificationService();
