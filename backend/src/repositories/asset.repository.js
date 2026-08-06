import { prisma } from '../config/db.js';

class AssetRepository {
  async create(data) {
    return prisma.asset.create({
      data,
      include: {
        category: { select: { name: true } },
        vendor: { select: { name: true } }
      }
    });
  }

  async update(id, data) {
    return prisma.asset.update({
      where: { id },
      data,
      include: {
        category: { select: { name: true } },
        vendor: { select: { name: true } },
        currentEmployee: { select: { firstName: true, lastName: true } }
      }
    });
  }

  async getById(id) {
    return prisma.asset.findUnique({
      where: { id },
      include: {
        category: true,
        vendor: true,
        department: true,
        currentEmployee: true,
        assignments: { include: { employee: true, assignedBy: true }, orderBy: { assignedAt: 'desc' } },
        transfers: { include: { fromEmployee: true, toEmployee: true, transferredBy: true }, orderBy: { transferredAt: 'desc' } },
        maintenanceRecords: { orderBy: { scheduledDate: 'desc' } },
        history: { orderBy: { createdAt: 'desc' } },
        depreciationRecords: { orderBy: { depreciationDate: 'desc' } }
      }
    });
  }

  async list() {
    return prisma.asset.findMany({
      include: {
        category: { select: { name: true } },
        vendor: { select: { name: true } },
        currentEmployee: { select: { firstName: true, lastName: true } },
        department: { select: { name: true } }
      }
    });
  }

  async delete(id) {
    return prisma.asset.delete({ where: { id } });
  }

  async createAssignment(data) {
    return prisma.assetAssignment.create({
      data,
      include: {
        asset: true,
        employee: true
      }
    });
  }

  async updateAssignment(id, data) {
    return prisma.assetAssignment.update({
      where: { id },
      data,
      include: {
        asset: true,
        employee: true
      }
    });
  }

  async getAssignmentById(id) {
    return prisma.assetAssignment.findUnique({
      where: { id },
      include: { asset: true, employee: true }
    });
  }

  async listAssignments() {
    return prisma.assetAssignment.findMany({
      include: {
        asset: { select: { name: true, tag: true } },
        employee: { select: { firstName: true, lastName: true } },
        assignedBy: { select: { firstName: true, lastName: true } }
      },
      orderBy: { assignedAt: 'desc' }
    });
  }

  async createTransfer(data) {
    return prisma.assetTransfer.create({
      data,
      include: {
        asset: true,
        toEmployee: true
      }
    });
  }

  async logHistory(data) {
    return prisma.assetHistory.create({
      data
    });
  }

  async createDepreciation(data) {
    return prisma.depreciationRecord.create({
      data
    });
  }

  async listDepreciation(assetId) {
    return prisma.depreciationRecord.findMany({
      where: { assetId },
      orderBy: { depreciationDate: 'desc' }
    });
  }
}

export default new AssetRepository();
