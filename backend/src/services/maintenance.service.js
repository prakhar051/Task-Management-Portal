import MaintenanceRepository from '../repositories/maintenance.repository.js';
import AssetRepository from '../repositories/asset.repository.js';
import NotificationService from './notification.service.js';
import ActivityService from './activity.service.js';
import { prisma } from '../config/db.js';

class MaintenanceService {
  async createRecord(user, data) {
    return prisma.$transaction(async (tx) => {
      const record = await tx.maintenanceRecord.create({
        data,
        include: { asset: true }
      });

      // Change asset status to UNDER_MAINTENANCE
      await tx.asset.update({
        where: { id: data.assetId },
        data: { status: 'UNDER_MAINTENANCE' }
      });

      // Log Asset history
      await tx.assetHistory.create({
        data: {
          assetId: data.assetId,
          action: 'MAINTENANCE',
          description: `Scheduled maintenance: "${data.title}"`,
          userId: user.id
        }
      });

      // Notify managers
      await NotificationService.createNotification({
        userId: user.id,
        type: 'TASK_ASSIGNED',
        title: 'Asset Maintenance Scheduled',
        message: `Maintenance scheduled for Asset tag: ${record.asset.tag} - "${data.title}".`,
        priority: 'MEDIUM',
        entityType: 'MAINTENANCE',
        entityId: record.id
      });

      // Log Activity
      await tx.activityLog.create({
        data: {
          userId: user.id,
          action: 'CREATE',
          entityType: 'MAINTENANCE',
          entityId: record.id,
          description: `Scheduled maintenance for asset tag ${record.asset.tag}: "${data.title}"`,
          metadata: {},
          ipAddress: '127.0.0.1',
          userAgent: 'System/AssetManagement'
        }
      });

      return record;
    });
  }

  async updateRecord(user, id, data) {
    return prisma.$transaction(async (tx) => {
      const record = await tx.maintenanceRecord.update({
        where: { id },
        data,
        include: { asset: true }
      });

      // Close maintenance -> make AVAILABLE again
      if (data.status === 'COMPLETED' || data.status === 'CANCELLED') {
        await tx.asset.update({
          where: { id: record.assetId },
          data: { status: 'AVAILABLE' }
        });

        // Log history
        await tx.assetHistory.create({
          data: {
            assetId: record.assetId,
            action: 'MAINTENANCE',
            description: `Maintenance closed. Status: ${data.status}`,
            userId: user.id
          }
        });

        await NotificationService.createNotification({
          userId: user.id,
          type: 'TASK_COMPLETED',
          title: 'Asset Maintenance Completed',
          message: `Maintenance completed for Asset tag: ${record.asset.tag}.`,
          priority: 'MEDIUM',
          entityType: 'MAINTENANCE',
          entityId: id
        });
      }

      return record;
    });
  }

  async getRecordById(user, id) {
    return MaintenanceRepository.getById(id);
  }

  async listRecords(user) {
    return MaintenanceRepository.list();
  }

  async deleteRecord(user, id) {
    const record = await MaintenanceRepository.getById(id);
    await MaintenanceRepository.delete(id);

    await ActivityService.logActivity({
      userId: user.id,
      action: 'DELETE',
      entityType: 'MAINTENANCE',
      entityId: id,
      description: `Removed maintenance record: "${record?.title}"`
    });
  }
}

export default new MaintenanceService();
