import { prisma } from '../config/db.js';

class FeatureFlagRepository {
  async createFlag(data) {
    return prisma.featureFlag.create({ data });
  }

  async updateFlag(id, data) {
    return prisma.featureFlag.update({
      where: { id },
      data
    });
  }

  async deleteFlag(id) {
    return prisma.featureFlag.delete({
      where: { id }
    });
  }

  async findFlagByKey(key) {
    return prisma.featureFlag.findUnique({
      where: { key }
    });
  }

  async listFlags() {
    return prisma.featureFlag.findMany({
      orderBy: { key: 'asc' }
    });
  }
}

export default new FeatureFlagRepository();
