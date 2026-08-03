import { prisma } from '../config/db.js';

class LeaveRepository {
  async createLeave(data) {
    return prisma.leave.create({
      data,
      include: {
        employee: { select: { firstName: true, lastName: true } }
      }
    });
  }

  async getLeaveById(id) {
    return prisma.leave.findUnique({
      where: { id },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, departmentId: true } },
        approvedBy: { select: { firstName: true, lastName: true } }
      }
    });
  }

  async getLeaves(where) {
    return prisma.leave.findMany({
      where,
      include: {
        employee: { select: { firstName: true, lastName: true, departmentId: true } },
        approvedBy: { select: { firstName: true, lastName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateLeave(id, data) {
    return prisma.leave.update({
      where: { id },
      data,
      include: {
        employee: { select: { firstName: true, lastName: true } }
      }
    });
  }

  async deleteLeave(id) {
    return prisma.leave.delete({
      where: { id }
    });
  }

  /**
   * Checks if an employee has any APPROVED leave request that overlaps with the given range.
   */
  async checkOverlappingLeaves(employeeId, startDate, endDate) {
    const overlapping = await prisma.leave.findFirst({
      where: {
        employeeId,
        status: 'APPROVED',
        OR: [
          {
            // Requested range starts inside an existing approved leave
            startDate: { lte: new Date(startDate) },
            endDate: { gte: new Date(startDate) }
          },
          {
            // Requested range ends inside an existing approved leave
            startDate: { lte: new Date(endDate) },
            endDate: { gte: new Date(endDate) }
          },
          {
            // Requested range fully encapsulates an existing approved leave
            startDate: { gte: new Date(startDate) },
            endDate: { lte: new Date(endDate) }
          }
        ]
      }
    });
    return !!overlapping;
  }
}

export default new LeaveRepository();
