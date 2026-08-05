import { prisma } from '../config/db.js';

class ActivityRepository {
  async create(data) {
    return await prisma.activityLog.create({
      data
    });
  }

  async findById(id) {
    return await prisma.activityLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      }
    });
  }

  async findAll(userIdsScope = null, filters = {}, pagination = {}) {
    const { search, action, entityType, userId, startDate, endDate } = filters;
    const { page = 1, limit = 10 } = pagination;

    const where = {};

    // Scope list of logs if target scoped userIds list is provided (e.g. manager department employees)
    if (userIdsScope !== null) {
      where.userId = { in: userIdsScope };
    }

    // Individual user filter takes precedence or narrows scope
    if (userId) {
      if (userIdsScope !== null && !userIdsScope.includes(userId)) {
        // Requested user is outside permitted scope
        where.userId = { in: [] }; 
      } else {
        where.userId = userId;
      }
    }

    if (action) {
      where.action = action;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { entityType: { contains: search, mode: 'insensitive' } },
        { entityId: { contains: search, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          }
        }
      ];
    }

    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, name: true, role: true }
          }
        }
      }),
      prisma.activityLog.count({ where })
    ]);

    return {
      activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async findByEntity(entityType, entityId) {
    return await prisma.activityLog.findMany({
      where: {
        entityType,
        entityId
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, email: true, name: true }
        }
      }
    });
  }

  async findByUser(userId, pagination = {}) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, name: true }
          }
        }
      }),
      prisma.activityLog.count({ where: { userId } })
    ]);

    return {
      activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async exportAll(userIdsScope = null, filters = {}) {
    const { search, action, entityType, userId, startDate, endDate } = filters;
    const where = {};

    if (userIdsScope !== null) {
      where.userId = { in: userIdsScope };
    }

    if (userId) {
      if (userIdsScope !== null && !userIdsScope.includes(userId)) {
        where.userId = { in: [] };
      } else {
        where.userId = userId;
      }
    }

    if (action) {
      where.action = action;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { entityType: { contains: search, mode: 'insensitive' } },
        { entityId: { contains: search, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          }
        }
      ];
    }

    return await prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { email: true, name: true }
        }
      }
    });
  }
}

export default new ActivityRepository();
