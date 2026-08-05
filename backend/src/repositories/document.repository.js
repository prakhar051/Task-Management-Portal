import { prisma } from '../config/db.js';

class DocumentRepository {
  async createDocument(data) {
    return prisma.document.create({
      data,
      include: {
        versions: { orderBy: { versionNumber: 'desc' } },
        uploadedBy: { select: { firstName: true, lastName: true } }
      }
    });
  }

  async createVersion(data) {
    return prisma.documentVersion.create({
      data,
      include: {
        uploadedBy: { select: { firstName: true, lastName: true } }
      }
    });
  }

  async updateDocument(id, data) {
    return prisma.document.update({
      where: { id },
      data,
      include: {
        versions: { orderBy: { versionNumber: 'desc' } },
        uploadedBy: { select: { firstName: true, lastName: true } }
      }
    });
  }

  async getById(id) {
    return prisma.document.findUnique({
      where: { id },
      include: {
        versions: { orderBy: { versionNumber: 'desc' } },
        uploadedBy: { select: { id: true, firstName: true, lastName: true, departmentId: true } }
      }
    });
  }

  async search(where, search = '', pagination = {}) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const queryWhere = {
      ...where,
      isDeleted: false
    };

    if (search.trim()) {
      queryWhere.name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    const [total, data] = await prisma.$transaction([
      prisma.document.count({ where: queryWhere }),
      prisma.document.findMany({
        where: queryWhere,
        include: {
          versions: { orderBy: { versionNumber: 'desc' } },
          uploadedBy: { select: { firstName: true, lastName: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      })
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data
    };
  }

  async softDelete(id) {
    return prisma.document.update({
      where: { id },
      data: {
        isDeleted: true,
        status: 'DELETED',
        deletedAt: new Date()
      }
    });
  }

  async restore(id) {
    return prisma.document.update({
      where: { id },
      data: {
        isDeleted: false,
        status: 'ACTIVE',
        deletedAt: null
      }
    });
  }

  async bulkLookup(ids) {
    return prisma.document.findMany({
      where: {
        id: { in: ids },
        isDeleted: false
      },
      include: {
        versions: { orderBy: { versionNumber: 'desc' } }
      }
    });
  }
}

export default new DocumentRepository();
