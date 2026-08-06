import { prisma } from '../config/db.js';

class CandidateRepository {
  async create(data) {
    return prisma.candidate.create({
      data,
      include: {
        job: { select: { title: true } }
      }
    });
  }

  async update(id, data) {
    return prisma.candidate.update({
      where: { id },
      data,
      include: {
        job: { select: { title: true } },
        documents: { include: { document: true } }
      }
    });
  }

  async getById(id) {
    return prisma.candidate.findUnique({
      where: { id },
      include: {
        job: { include: { department: true, hiringManager: true } },
        documents: { include: { document: true } },
        interviews: { include: { panelMembers: { include: { employee: true } }, feedbacks: true } },
        offers: true,
        stageHistory: { include: { changedBy: true }, orderBy: { createdAt: 'asc' } }
      }
    });
  }

  async getByEmailAndPhone(email, phone) {
    return prisma.candidate.findFirst({
      where: {
        OR: [
          { email },
          { phone }
        ]
      }
    });
  }

  async list(jobOpeningId = null) {
    return prisma.candidate.findMany({
      where: jobOpeningId ? { jobOpeningId } : {},
      include: {
        job: { select: { title: true, status: true } },
        documents: { include: { document: true } }
      }
    });
  }

  async delete(id) {
    return prisma.candidate.delete({
      where: { id }
    });
  }

  async addDocument(data) {
    return prisma.candidateDocument.create({
      data,
      include: { document: true }
    });
  }

  async addStageHistory(data) {
    return prisma.candidateStageHistory.create({
      data
    });
  }
}

export default new CandidateRepository();
