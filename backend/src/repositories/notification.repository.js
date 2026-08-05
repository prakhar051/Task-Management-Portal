import { prisma } from '../config/db.js';

class NotificationRepository {
  async create(data) {
    return await prisma.notification.create({
      data
    });
  }

  async findById(id) {
    return await prisma.notification.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });
  }

  async findAll(userId, filters = {}, pagination = {}, sorting = {}) {
    const { search, isRead, priority, type } = filters;
    const { page = 1, limit = 10 } = pagination;
    const { sortBy = 'createdAt', sortOrder = 'desc' } = sorting;

    const where = { userId };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (isRead !== undefined) {
      where.isRead = isRead === 'true' || isRead === true;
    }

    if (priority) {
      where.priority = priority;
    }

    if (type) {
      where.type = type;
    }

    const skip = (page - 1) * limit;

    let orderBy = {};
    if (sortBy === 'priority') {
      // Basic fallback since priority is enum; order by createdAt as tie-breaker
      orderBy = [
        { priority: sortOrder },
        { createdAt: 'desc' }
      ];
    } else {
      orderBy = { [sortBy]: sortOrder };
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: { id: true, email: true, name: true }
          }
        }
      }),
      prisma.notification.count({ where })
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async countUnread(userId) {
    return await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });
  }

  async markAsRead(id, userId) {
    return await prisma.notification.update({
      where: { id, userId },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  }

  async markAllAsRead(userId) {
    return await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  }

  async delete(id, userId) {
    return await prisma.notification.delete({
      where: { id, userId }
    });
  }

  async deleteBulk(ids, userId) {
    return await prisma.notification.deleteMany({
      where: {
        id: { in: ids },
        userId
      }
    });
  }

  async getPreferences(userId) {
    let prefs = await prisma.notificationPreference.findUnique({
      where: { userId }
    });

    if (!prefs) {
      // Auto-create default preferences if they don't exist
      prefs = await prisma.notificationPreference.create({
        data: { userId }
      });
    }

    return prefs;
  }

  async updatePreferences(userId, data) {
    return await prisma.notificationPreference.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data
      }
    });
  }

  async exportAll(userId, filters = {}) {
    const { search, isRead, priority, type } = filters;
    const where = { userId };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (isRead !== undefined) {
      where.isRead = isRead === 'true' || isRead === true;
    }

    if (priority) {
      where.priority = priority;
    }

    if (type) {
      where.type = type;
    }

    return await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }
}

export default new NotificationRepository();
