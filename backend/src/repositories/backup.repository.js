import { prisma } from '../config/db.js';

class BackupRepository {
  async createBackup(data) {
    return prisma.systemBackup.create({ data });
  }

  async updateBackupStatus(id, status, details = {}) {
    return prisma.systemBackup.update({
      where: { id },
      data: {
        status,
        ...details
      }
    });
  }

  async listBackups() {
    return prisma.systemBackup.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async getBackupById(id) {
    return prisma.systemBackup.findUnique({
      where: { id }
    });
  }
}

export default new BackupRepository();
