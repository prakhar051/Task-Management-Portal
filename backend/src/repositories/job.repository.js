import { prisma } from '../config/db.js';

class JobRepository {
  async listJobs() {
    return prisma.scheduledJob.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async getJobById(id) {
    return prisma.scheduledJob.findUnique({
      where: { id }
    });
  }

  async getJobByName(name) {
    return prisma.scheduledJob.findUnique({
      where: { name }
    });
  }

  async updateJob(id, data) {
    return prisma.scheduledJob.update({
      where: { id },
      data
    });
  }

  async createJob(data) {
    return prisma.scheduledJob.create({ data });
  }

  async createExecution(data) {
    return prisma.jobExecution.create({ data });
  }

  async updateExecution(id, data) {
    return prisma.jobExecution.update({
      where: { id },
      data
    });
  }

  async listExecutions(filters = {}) {
    const where = {};
    if (filters.jobId) where.jobId = filters.jobId;
    if (filters.status) where.status = filters.status;

    return prisma.jobExecution.findMany({
      where,
      orderBy: { executedAt: 'desc' },
      take: 100,
      include: {
        job: true
      }
    });
  }
}

export default new JobRepository();
