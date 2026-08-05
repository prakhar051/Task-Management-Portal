import { prisma } from '../config/db.js';

class TimesheetRepository {
  async createTimesheet(data) {
    return prisma.timesheet.create({
      data,
      include: {
        employee: { select: { firstName: true, lastName: true } }
      }
    });
  }

  async getTimesheetById(id) {
    return prisma.timesheet.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            designation: true,
            department: { select: { name: true } }
          }
        }
      }
    });
  }

  async getTimesheets(where) {
    return prisma.timesheet.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            designation: true,
            department: { select: { name: true } }
          }
        }
      },
      orderBy: { startDate: 'desc' }
    });
  }

  async updateTimesheet(id, data) {
    return prisma.timesheet.update({
      where: { id },
      data,
      include: {
        employee: { select: { firstName: true, lastName: true } }
      }
    });
  }
}

export default new TimesheetRepository();
