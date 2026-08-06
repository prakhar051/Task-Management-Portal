import { prisma } from '../config/db.js';

class JobRepository {
  async create(data) {
    return prisma.jobOpening.create({
      data,
      include: {
        department: { select: { name: true } },
        hiringManager: { select: { firstName: true, lastName: true } }
      }
    });
  }

  async update(id, data) {
    return prisma.jobOpening.update({
      where: { id },
      data,
      include: {
        department: { select: { name: true } },
        hiringManager: { select: { firstName: true, lastName: true } }
      }
    });
  }

  async getById(id) {
    return prisma.jobOpening.findUnique({
      where: { id },
      include: {
        department: { select: { name: true } },
        hiringManager: { select: { id: true, firstName: true, lastName: true, designation: true } },
        candidates: true
      }
    });
  }

  async list() {
    return prisma.jobOpening.findMany({
      include: {
        department: { select: { name: true } },
        hiringManager: { select: { firstName: true, lastName: true } },
        _count: { select: { candidates: true } }
      }
    });
  }

  async delete(id) {
    return prisma.jobOpening.delete({
      where: { id }
    });
  }

  async createStage(data) {
    return prisma.recruitmentStage.upsert({
      where: { name: data.name },
      update: { sequence: data.sequence },
      create: data
    });
  }

  async listStages() {
    return prisma.recruitmentStage.findMany({
      orderBy: { sequence: 'asc' }
    });
  }
}

export default new JobRepository();
