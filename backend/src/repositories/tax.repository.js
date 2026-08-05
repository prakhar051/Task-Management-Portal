import { prisma } from '../config/db.js';

class TaxRepository {
  async createRule(data) {
    return prisma.taxRule.create({
      data
    });
  }

  async listRules() {
    return prisma.taxRule.findMany({
      orderBy: { minIncome: 'asc' }
    });
  }

  async clearRules() {
    return prisma.taxRule.deleteMany();
  }

  async deleteRule(id) {
    return prisma.taxRule.delete({
      where: { id }
    });
  }
}

export default new TaxRepository();
