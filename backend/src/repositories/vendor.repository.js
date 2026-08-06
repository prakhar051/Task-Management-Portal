import { prisma } from '../config/db.js';

class VendorRepository {
  async create(data) {
    return prisma.vendor.create({ data });
  }

  async update(id, data) {
    return prisma.vendor.update({
      where: { id },
      data
    });
  }

  async getById(id) {
    return prisma.vendor.findUnique({
      where: { id },
      include: { assets: true, purchaseOrders: true }
    });
  }

  async list() {
    return prisma.vendor.findMany({
      include: {
        _count: { select: { assets: true, purchaseOrders: true } }
      }
    });
  }

  async delete(id) {
    return prisma.vendor.delete({ where: { id } });
  }
}

export default new VendorRepository();
