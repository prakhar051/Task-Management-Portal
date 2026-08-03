import { prisma } from '../config/db.js';

export class EmployeeRepository {
  /**
   * Fetch a paginated list of employees along with the total matching count.
   */
  static async findAndCount({ where, skip, take, orderBy }) {
    // Run counting and selections in parallel
    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          user: {
            select: {
              role: true
            }
          }
        }
      }),
      prisma.employee.count({ where })
    ]);
    return { employees, total };
  }

  /**
   * Search an employee profile by primary UUID.
   */
  static async findById(id) {
    return prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });
  }

  /**
   * Search an employee by code registry identifier.
   */
  static async findByCode(employeeCode) {
    return prisma.employee.findUnique({
      where: { employeeCode }
    });
  }

  /**
   * Find an employee profile by email.
   */
  static async findByEmail(email) {
    return prisma.employee.findUnique({
      where: { email }
    });
  }

  /**
   * Write a new employee profile to the database.
   */
  static async create(data) {
    return prisma.employee.create({
      data
    });
  }

  /**
   * Modify properties of an existing employee.
   */
  static async update(id, data) {
    return prisma.employee.update({
      where: { id },
      data
    });
  }

  /**
   * Soft-delete an employee row.
   */
  static async softDelete(id, deletedById) {
    return prisma.employee.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedById
      }
    });
  }

  /**
   * Restore a soft-deleted employee.
   */
  static async restore(id) {
    return prisma.employee.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
        deletedById: null
      }
    });
  }

  /**
   * Soft-delete multiple employee rows at once.
   */
  static async bulkSoftDelete(ids, deletedById) {
    return prisma.employee.updateMany({
      where: { id: { in: ids } },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedById
      }
    });
  }

  /**
   * Update status fields for multiple employees.
   */
  static async bulkUpdateStatus(ids, status, updatedById) {
    return prisma.employee.updateMany({
      where: { id: { in: ids } },
      data: {
        status,
        updatedById
      }
    });
  }

  /**
   * Restore multiple soft-deleted employees.
   */
  static async bulkRestore(ids) {
    return prisma.employee.updateMany({
      where: { id: { in: ids } },
      data: {
        isDeleted: false,
        deletedAt: null,
        deletedById: null
      }
    });
  }

  /**
   * Query all active matching records for file downloads.
   */
  static async findAllActiveForExport({ where, orderBy }) {
    return prisma.employee.findMany({
      where,
      orderBy
    });
  }
}
