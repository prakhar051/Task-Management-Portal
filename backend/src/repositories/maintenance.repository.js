import { prisma } from '../config/db.js';

class MaintenanceRepository {
  async create(data) {
    return prisma.maintenanceRecord.create({
      data,
      include: { asset: { select: { name: true, tag: true } } }
    });
  }

  async update(id, data) {
    return prisma.maintenanceRecord.update({
      where: { id },
      data,
      include: { asset: { select: { name: true, tag: true } } }
    });
  }

  async getById(id) {
    return prisma.maintenanceRecord.findUnique({
      where: { id },
      include: { asset: true }
    });
  }

  async list() {
    return prisma.maintenanceRecord.findMany({
      include: { asset: { select: { id: true, name: true, tag: true } } }
    });
  }

  async delete(id) {
    return prisma.maintenanceRecord.delete({ where: { id } });
  }
}

export default new MaintenanceRepository();
