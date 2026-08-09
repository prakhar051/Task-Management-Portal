import { prisma } from '../config/db.js';

class MonitoringRepository {
  async createHealthSnapshot(data) {
    return prisma.systemHealthSnapshot.create({ data });
  }

  async getLatestHealthSnapshot() {
    return prisma.systemHealthSnapshot.findFirst({
      orderBy: { createdAt: 'desc' }
    });
  }

  async listHealthSnapshots(limit = 60) {
    return prisma.systemHealthSnapshot.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  async createSystemLog(data) {
    return prisma.systemLog.create({ data });
  }

  async listSystemLogs(filters = {}) {
    const where = {};
    if (filters.level) where.level = filters.level;
    if (filters.module) where.module = filters.module;
    if (filters.userId) where.userId = filters.userId;
    if (filters.startDate && filters.endDate) {
      where.createdAt = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate)
      };
    }

    return prisma.systemLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200
    });
  }

  async createErrorLog(data) {
    return prisma.errorLog.create({ data });
  }

  async updateErrorLog(id, data) {
    return prisma.errorLog.update({
      where: { id },
      data
    });
  }

  async listErrorLogs(filters = {}) {
    const where = {};
    if (filters.module) where.module = filters.module;
    if (filters.resolutionStatus) where.resolutionStatus = filters.resolutionStatus;

    return prisma.errorLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100
    });
  }
}

export default new MonitoringRepository();
