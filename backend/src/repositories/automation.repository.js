import { prisma } from '../config/db.js';

class AutomationRepository {
  async createRule(data) {
    return prisma.automationRule.create({
      data,
      include: { createdBy: { select: { id: true, name: true } } }
    });
  }

  async updateRule(id, data) {
    return prisma.automationRule.update({
      where: { id },
      data,
      include: { createdBy: { select: { id: true, name: true } } }
    });
  }

  async deleteRule(id) {
    return prisma.automationRule.delete({
      where: { id }
    });
  }

  async getRuleById(id) {
    return prisma.automationRule.findUnique({
      where: { id },
      include: { executions: { orderBy: { executedAt: 'desc' }, take: 50 } }
    });
  }

  async listRules(filters = {}) {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.trigger) where.trigger = filters.trigger;

    return prisma.automationRule.findMany({
      where,
      include: { createdBy: { select: { id: true, name: true } } },
      orderBy: { updatedAt: 'desc' }
    });
  }

  // Executions logs
  async logExecution(data) {
    return prisma.automationExecution.create({ data });
  }

  async listExecutions(filters = {}) {
    const where = {};
    if (filters.ruleId) where.ruleId = filters.ruleId;
    if (filters.status) where.status = filters.status;

    return prisma.automationExecution.findMany({
      where,
      include: { rule: true },
      orderBy: { executedAt: 'desc' },
      take: 100
    });
  }
}

export default new AutomationRepository();
