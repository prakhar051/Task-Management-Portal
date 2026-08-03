import { prisma } from '../config/db.js';

export class ProjectRepository {
  /**
   * Fetch a paginated list of projects along with the total count and relations metrics.
   */
  static async findAndCount({ where, skip, take, orderBy }) {
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          department: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          _count: {
            select: {
              members: true
            }
          }
        }
      }),
      prisma.project.count({ where })
    ]);
    return { projects, total };
  }

  /**
   * Search project by primary UUID.
   */
  static async findById(id) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        members: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
                designation: true
              }
            }
          }
        },
        _count: {
          select: {
            members: true
          }
        }
      }
    });
  }

  /**
   * Find project by code.
   */
  static async findByCode(code) {
    return prisma.project.findUnique({
      where: { code }
    });
  }

  /**
   * Create a new project.
   */
  static async create(data) {
    return prisma.project.create({
      data
    });
  }

  /**
   * Update project metadata.
   */
  static async update(id, data) {
    return prisma.project.update({
      where: { id },
      data
    });
  }

  /**
   * Soft delete project.
   */
  static async softDelete(id, deletedById) {
    return prisma.$transaction(async (tx) => {
      const project = await tx.project.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedById,
          managerId: null // Clear manager reference
        }
      });

      // Clear memberships on soft-delete
      await tx.projectMember.deleteMany({
        where: { projectId: id }
      });

      return project;
    });
  }

  /**
   * Restore project.
   */
  static async restore(id) {
    return prisma.project.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
        deletedById: null
      }
    });
  }

  /**
   * Assign manager.
   */
  static async assignManager(id, managerId, updatedById) {
    return prisma.project.update({
      where: { id },
      data: {
        managerId,
        updatedById
      }
    });
  }

  /**
   * Transaction-safe Member Assignment.
   * Verifies employee existence, project existence, clears existing records, and bulk inserts new ones.
   */
  static async assignMembers(id, members, updatedById) {
    return prisma.$transaction(async (tx) => {
      // 1. Verify project exists and is not cancelled/deleted
      const project = await tx.project.findUnique({ where: { id } });
      if (!project) {
        throw new Error('Project not found.');
      }
      if (project.isDeleted) {
        throw new Error('Cannot assign members to a soft-deleted project.');
      }
      if (project.status === 'CANCELLED') {
        throw new Error('Cancelled projects cannot receive new members.');
      }

      // 2. Validate employee existence
      const employeeIds = members.map((m) => m.employeeId);
      const employeesCount = await tx.employee.count({
        where: { id: { in: employeeIds }, isDeleted: false }
      });
      if (employeesCount !== employeeIds.length) {
        throw new Error('One or more selected employee profiles are invalid or deleted.');
      }

      // 3. Clear existing members for this project to prevent duplicate entries
      await tx.projectMember.deleteMany({
        where: { projectId: id }
      });

      // 4. Bulk create members join table entries
      const membersData = members.map((m) => ({
        projectId: id,
        employeeId: m.employeeId,
        role: m.role
      }));

      await tx.projectMember.createMany({
        data: membersData
      });

      // 5. Update modification tracking audit fields
      return await tx.project.update({
        where: { id },
        data: { updatedById }
      });
    });
  }

  /**
   * Bulk soft delete projects.
   */
  static async bulkSoftDelete(ids, deletedById) {
    return prisma.$transaction(async (tx) => {
      await tx.project.updateMany({
        where: { id: { in: ids } },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedById,
          managerId: null
        }
      });

      await tx.projectMember.deleteMany({
        where: { projectId: { in: ids } }
      });
    });
  }

  /**
   * Bulk status update.
   */
  static async bulkUpdateStatus(ids, status, updatedById) {
    return prisma.project.updateMany({
      where: { id: { in: ids } },
      data: {
        status,
        updatedById
      }
    });
  }

  /**
   * Bulk restore.
   */
  static async bulkRestore(ids) {
    return prisma.project.updateMany({
      where: { id: { in: ids } },
      data: {
        isDeleted: false,
        deletedAt: null,
        deletedById: null
      }
    });
  }

  /**
   * Find project member list.
   */
  static async getMembers(id) {
    return prisma.projectMember.findMany({
      where: { projectId: id },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            designation: true
          }
        }
      },
      orderBy: { joinedAt: 'asc' }
    });
  }

  /**
   * Find all active projects matching conditions for export.
   */
  static async findAllActiveForExport({ where, orderBy }) {
    return prisma.project.findMany({
      where,
      orderBy,
      include: {
        department: {
          select: {
            name: true
          }
        },
        manager: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            members: true
          }
        }
      }
    });
  }
}
