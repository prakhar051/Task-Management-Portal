import AssetRepository from '../repositories/asset.repository.js';
import NotificationService from './notification.service.js';
import ActivityService from './activity.service.js';
import { prisma } from '../config/db.js';
import { broadcastToAll } from '../utils/socket.js';

class AssetService {
  async createAsset(user, data) {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data.tag)}`;
    const barcodeUrl = `https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(data.tag)}`;

    const asset = await AssetRepository.create({
      ...data,
      purchaseDate: new Date(data.purchaseDate),
      warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : null,
      qrCodeUrl,
      barcodeUrl
    });

    // Write history
    await AssetRepository.logHistory({
      assetId: asset.id,
      action: 'CREATE',
      description: `Asset registered in inventory. Initial status: AVAILABLE.`,
      userId: user.id
    });

    // Log Activity
    await ActivityService.logActivity({
      userId: user.id,
      action: 'CREATE',
      entityType: 'ASSET',
      entityId: asset.id,
      description: `Registered asset tag: ${asset.tag} - "${asset.name}"`
    });

    return asset;
  }

  async updateAsset(user, id, data) {
    const updated = await AssetRepository.update(id, {
      ...data,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
      warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : undefined
    });

    await AssetRepository.logHistory({
      assetId: id,
      action: 'UPDATE',
      description: `Asset specifications modified.`,
      userId: user.id
    });

    return updated;
  }

  async getAssetById(user, id) {
    return AssetRepository.getById(id);
  }

  async listAssets(user) {
    return AssetRepository.list();
  }

  async deleteAsset(user, id) {
    await AssetRepository.delete(id);
  }

  async assignAsset(user, data) {
    return prisma.$transaction(async (tx) => {
      const asset = await tx.asset.findUnique({ where: { id: data.assetId } });
      if (!asset) throw new Error('Asset not found.');
      if (asset.status !== 'AVAILABLE') {
        throw new Error(`Asset cannot be assigned. Current status is ${asset.status}`);
      }

      // Resolve employeeId from user profile
      let empId = user.employeeId;
      if (!empId) {
        const empRecord = await tx.employee.findUnique({
          where: { userId: user.id }
        });
        empId = empRecord?.id || data.employeeId; // Fallback to assignee if not found
      }

      // Create Assignment
      const assignment = await tx.assetAssignment.create({
        data: {
          assetId: data.assetId,
          employeeId: data.employeeId,
          conditionOnAssign: data.conditionOnAssign || 'NEW',
          notes: data.notes,
          assignedById: empId
        },
        include: { employee: true, asset: true }
      });

      // Update Asset Status
      await tx.asset.update({
        where: { id: data.assetId },
        data: {
          status: 'ASSIGNED',
          currentEmployeeId: data.employeeId
        }
      });

      // Log history
      await tx.assetHistory.create({
        data: {
          assetId: data.assetId,
          action: 'ASSIGN',
          description: `Assigned to employee: ${assignment.employee.firstName} ${assignment.employee.lastName}`,
          userId: user.id
        }
      });

      // Send push notifications
      await tx.notification.create({
        data: {
          userId: assignment.employee.userId,
          title: 'Asset Assigned',
          message: `Hardware asset tag "${assignment.asset.tag}" has been assigned to you.`,
          type: 'TASK_ASSIGNED',
          priority: 'MEDIUM',
          entityType: 'ASSET',
          entityId: data.assetId
        }
      });

      // Log Activity
      await tx.activityLog.create({
        data: {
          userId: user.id,
          action: 'ASSIGN',
          entityType: 'ASSET',
          entityId: data.assetId,
          description: `Assigned asset tag ${assignment.asset.tag} to Employee ID: ${data.employeeId}`,
          metadata: {},
          ipAddress: '127.0.0.1',
          userAgent: 'System/AssetManagement'
        }
      });

      broadcastToAll('asset:update', { type: 'assign', assetId: data.assetId, eventVersion: 1 });

      return assignment;
    });
  }

  async returnAsset(user, assignmentId, data) {
    return prisma.$transaction(async (tx) => {
      const assignment = await tx.assetAssignment.findUnique({
        where: { id: assignmentId },
        include: { asset: true, employee: true }
      });
      if (!assignment) throw new Error('Assignment log not found.');
      if (assignment.returnedAt) throw new Error('Asset has already been returned.');

      const returnedAt = new Date();

      // Update Assignment Log
      await tx.assetAssignment.update({
        where: { id: assignmentId },
        data: {
          returnedAt,
          conditionOnReturn: data.conditionOnReturn || 'GOOD',
          notes: data.notes
        }
      });

      // Update Asset Status
      const finalStatus = (data.conditionOnReturn === 'DAMAGED' || data.conditionOnReturn === 'POOR') ? 'DAMAGED' : 'AVAILABLE';

      await tx.asset.update({
        where: { id: assignment.assetId },
        data: {
          status: finalStatus,
          condition: data.conditionOnReturn || undefined,
          currentEmployeeId: null
        }
      });

      // Log history
      await tx.assetHistory.create({
        data: {
          assetId: assignment.assetId,
          action: 'RETURN',
          description: `Returned by employee: ${assignment.employee.firstName} ${assignment.employee.lastName}. Condition: ${data.conditionOnReturn}`,
          userId: user.id
        }
      });

      // Log Activity
      await tx.activityLog.create({
        data: {
          userId: user.id,
          action: 'UNASSIGN',
          entityType: 'ASSET',
          entityId: assignment.assetId,
          description: `Asset tag ${assignment.asset.tag} returned by Employee ID: ${assignment.employeeId}`,
          metadata: {},
          ipAddress: '127.0.0.1',
          userAgent: 'System/AssetManagement'
        }
      });

      broadcastToAll('asset:update', { type: 'return', assetId: assignment.assetId, eventVersion: 1 });

      return assignment;
    });
  }

  async transferAsset(user, data) {
    return prisma.$transaction(async (tx) => {
      const asset = await tx.asset.findUnique({
        where: { id: data.assetId },
        include: { currentEmployee: true }
      });
      if (!asset) throw new Error('Asset not found.');

      const fromEmployeeId = asset.currentEmployeeId;

      // Close previous active assignment
      if (fromEmployeeId) {
        const activeAssignment = await tx.assetAssignment.findFirst({
          where: { assetId: data.assetId, returnedAt: null }
        });
        if (activeAssignment) {
          await tx.assetAssignment.update({
            where: { id: activeAssignment.id },
            data: { returnedAt: new Date(), conditionOnReturn: 'GOOD' }
          });
        }
      }

      // Resolve employeeId from user profile
      let empId = user.employeeId;
      if (!empId) {
        const empRecord = await tx.employee.findUnique({
          where: { userId: user.id }
        });
        empId = empRecord?.id || data.toEmployeeId; // Fallback
      }

      // Create new assignment
      const newAssignment = await tx.assetAssignment.create({
        data: {
          assetId: data.assetId,
          employeeId: data.toEmployeeId,
          conditionOnAssign: 'GOOD',
          assignedById: empId
        },
        include: { employee: true }
      });

      // Create Transfer Log
      const transfer = await tx.assetTransfer.create({
        data: {
          assetId: data.assetId,
          fromEmployeeId,
          toEmployeeId: data.toEmployeeId,
          notes: data.notes,
          transferredById: empId
        }
      });

      // Update Asset Current Employee
      await tx.asset.update({
        where: { id: data.assetId },
        data: {
          currentEmployeeId: data.toEmployeeId,
          status: 'ASSIGNED'
        }
      });

      // Log history
      await tx.assetHistory.create({
        data: {
          assetId: data.assetId,
          action: 'TRANSFER',
          description: `Transferred assignment to Employee: ${newAssignment.employee.firstName} ${newAssignment.employee.lastName}`,
          userId: user.id
        }
      });

      broadcastToAll('asset:update', { type: 'transfer', assetId: data.assetId, eventVersion: 1 });

      // Log Activity
      await tx.activityLog.create({
        data: {
          userId: user.id,
          action: 'UPDATE',
          entityType: 'ASSET',
          entityId: data.assetId,
          description: `Transferred asset tag ${asset.tag} to Employee ID: ${data.toEmployeeId}`,
          metadata: {},
          ipAddress: '127.0.0.1',
          userAgent: 'System/AssetManagement'
        }
      });

      return transfer;
    });
  }

  async calculateDepreciation(user, assetId, method, months = 1) {
    const asset = await AssetRepository.getById(assetId);
    if (!asset) throw new Error('Asset not found.');

    let currentBookValue = asset.purchasePrice;
    const usefulLife = asset.usefulLifeYears || 5;
    const salvage = asset.salvageValue || 0;

    const records = await prisma.depreciationRecord.findMany({
      where: { assetId },
      orderBy: { depreciationDate: 'desc' }
    });

    if (records.length > 0) {
      currentBookValue = records[0].bookValue;
    }

    const results = [];
    let tempBookValue = currentBookValue;

    for (let i = 1; i <= months; i++) {
      let depAmount = 0;
      if (method === 'STRAIGHT_LINE') {
        depAmount = ((asset.purchasePrice - salvage) / usefulLife) / 12;
      } else {
        // DECLINING_BALANCE (Standard Double-Declining multiplier)
        depAmount = (tempBookValue * (2.0 / usefulLife)) / 12;
      }

      depAmount = Math.max(0, Math.min(depAmount, tempBookValue - salvage));
      tempBookValue -= depAmount;

      const depDate = new Date();
      depDate.setMonth(depDate.getMonth() - (months - i));

      const record = await prisma.depreciationRecord.create({
        data: {
          assetId,
          depreciationDate: depDate,
          depreciatedValue: depAmount,
          bookValue: tempBookValue,
          method
        }
      });
      results.push(record);
    }

    return results;
  }
}

export default new AssetService();
