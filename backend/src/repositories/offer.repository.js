import { prisma } from '../config/db.js';

class OfferRepository {
  async create(data) {
    return prisma.offerLetter.create({
      data,
      include: {
        candidate: { select: { firstName: true, lastName: true } },
        jobOpening: { select: { title: true } },
        document: true
      }
    });
  }

  async update(id, data) {
    return prisma.offerLetter.update({
      where: { id },
      data,
      include: {
        candidate: { select: { firstName: true, lastName: true } },
        jobOpening: { select: { title: true } },
        document: true
      }
    });
  }

  async getById(id) {
    return prisma.offerLetter.findUnique({
      where: { id },
      include: {
        candidate: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        jobOpening: { select: { id: true, title: true, departmentId: true, hiringManagerId: true } },
        document: true
      }
    });
  }

  async list() {
    return prisma.offerLetter.findMany({
      include: {
        candidate: { select: { firstName: true, lastName: true } },
        jobOpening: { select: { title: true } },
        document: true
      }
    });
  }

  async delete(id) {
    return prisma.offerLetter.delete({
      where: { id }
    });
  }
}

export default new OfferRepository();
