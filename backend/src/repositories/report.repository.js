import { prisma } from '../config/db.js';

class ReportRepository {
  /**
   * Fetch employees data.
   */
  async getEmployeesData(where) {
    return prisma.employee.findMany({
      where,
      include: {
        department: { select: { name: true } },
        user: { select: { role: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Fetch departments data.
   */
  async getDepartmentsData(where) {
    return prisma.department.findMany({
      where,
      include: {
        manager: { select: { firstName: true, lastName: true } },
        _count: {
          select: { employees: { where: { isDeleted: false } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Fetch projects data.
   */
  async getProjectsData(where) {
    return prisma.project.findMany({
      where,
      include: {
        department: { select: { name: true } },
        manager: { select: { firstName: true, lastName: true } },
        _count: {
          select: { members: true, tasks: { where: { isDeleted: false } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Fetch tasks data.
   */
  async getTasksData(where) {
    return prisma.task.findMany({
      where,
      include: {
        project: { select: { name: true } },
        reporter: { select: { firstName: true, lastName: true } },
        assignees: {
          include: {
            employee: { select: { firstName: true, lastName: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Fetch productivity records (completed tasks list).
   */
  async getProductivityData(where) {
    return prisma.task.findMany({
      where: {
        ...where,
        status: 'COMPLETED'
      },
      include: {
        project: {
          select: {
            name: true,
            department: { select: { name: true } }
          }
        },
        assignees: {
          include: {
            employee: { select: { firstName: true, lastName: true } }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }
}

export default new ReportRepository();
