import { prisma } from '../config/db.js';

class AssetCategoryRepository {
  async create(data) {
    return prisma.assetCategory.create({ data });
  }

  async update(id, data) {
    return prisma.assetCategory.update({
      where: { id },
      data
    });
  }

  async getById(id) {
    return prisma.assetCategory.findUnique({
      where: { id },
      include: { assets: true }
    });
  }

  async list() {
    return prisma.assetCategory.findMany({
      include: { _count: { select: { assets: true } } }
    });
  }

  async delete(id) {
    return prisma.assetCategory.delete({ where: { id } });
  }
}

export default new AssetCategoryRepository();
