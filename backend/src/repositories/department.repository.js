import { prisma } from '../config/db.js';

export class DepartmentRepository {
  /**
   * Fetch a paginated list of departments along with the total count and relations metrics.
   */
  static async findAndCount({ where, skip, take, orderBy }) {
    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
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
              employees: true
            }
          }
        }
      }),
      prisma.department.count({ where })
    ]);
    return { departments, total };
  }

  /**
   * Search department by primary UUID.
   */
  static async findById(id) {
    return prisma.department.findUnique({
      where: { id },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        _count: {
          select: {
            employees: true
          }
        }
      }
    });
  }

  /**
   * Find department by code identifier.
   */
  static async findByCode(code) {
    return prisma.department.findUnique({
      where: { code }
    });
  }

  /**
   * Find department by name.
   */
  static async findByName(name) {
    return prisma.department.findUnique({
      where: { name }
    });
  }

  /**
   * Check if a manager is already assigned to another active department.
   */
  static async findByManagerId(managerId) {
    if (!managerId) return null;
    return prisma.department.findFirst({
      where: {
        managerId,
        isDeleted: false
      }
    });
  }

  /**
   * Create new department record.
   */
  static async create(data) {
    return prisma.department.create({
      data
    });
  }

  /**
   * Update department metadata.
   */
  static async update(id, data) {
    return prisma.department.update({
      where: { id },
      data
    });
  }

  /**
   * Soft-delete department and dissociate its manager.
   */
  static async softDelete(id, deletedById) {
    return prisma.$transaction(async (tx) => {
      // 1. Soft delete department
      const department = await tx.department.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedById,
          managerId: null // Relinquish manager relationship on soft-delete
        }
      });

      // 2. Remove department reference from its employees
      await tx.employee.updateMany({
        where: { departmentId: id },
        data: { departmentId: null }
      });

      return department;
    });
  }

  /**
   * Restore department.
   */
  static async restore(id) {
    return prisma.department.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
        deletedById: null
      }
    });
  }

  /**
   * Bulk soft-delete multiple departments.
   */
  static async bulkSoftDelete(ids, deletedById) {
    return prisma.$transaction(async (tx) => {
      // 1. Mark departments as deleted
      await tx.department.updateMany({
        where: { id: { in: ids } },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedById,
          managerId: null
        }
      });

      // 2. Dissociate employees
      await tx.employee.updateMany({
        where: { departmentId: { in: ids } },
        data: { departmentId: null }
      });
    });
  }

  /**
   * Bulk status updates.
   */
  static async bulkUpdateStatus(ids, status, updatedById) {
    return prisma.department.updateMany({
      where: { id: { in: ids } },
      data: {
        status,
        updatedById
      }
    });
  }

  /**
   * Bulk restore soft-deleted departments.
   */
  static async bulkRestore(ids) {
    return prisma.department.updateMany({
      where: { id: { in: ids } },
      data: {
        isDeleted: false,
        deletedAt: null,
        deletedById: null
      }
    });
  }

  /**
   * Transactional Manager Assignment
   * Ensures manager is assigned to only one department, and sets department association.
   */
  static async assignManager(id, managerId, updatedById) {
    return prisma.$transaction(async (tx) => {
      // 1. Clear manager from any other active department to enforce "A Manager may manage only ONE department"
      if (managerId) {
        await tx.department.updateMany({
          where: { managerId, id: { not: id }, isDeleted: false },
          data: { managerId: null }
        });
      }

      // 2. Set managerId for the target department
      const department = await tx.department.update({
        where: { id },
        data: {
          managerId,
          updatedById
        }
      });

      // 3. Make sure the manager employee's departmentId matches this department
      if (managerId) {
        await tx.employee.update({
          where: { id: managerId },
          data: { departmentId: id }
        });
      }

      return department;
    });
  }

  /**
   * Mappings Assignment of employees.
   */
  static async assignEmployees(id, employeeIds, updatedById) {
    return prisma.$transaction(async (tx) => {
      // Update employee entries
      await tx.employee.updateMany({
        where: { id: { in: employeeIds } },
        data: { departmentId: id }
      });

      // Touch department modification timestamp
      return await tx.department.update({
        where: { id },
        data: { updatedById }
      });
    });
  }

  /**
   * Query all departments for downloads.
   */
  static async findAllActiveForExport({ where, orderBy }) {
    return prisma.department.findMany({
      where,
      orderBy,
      include: {
        manager: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            employees: true
          }
        }
      }
    });
  }
}
