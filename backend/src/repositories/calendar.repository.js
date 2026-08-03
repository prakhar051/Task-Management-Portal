import { prisma } from '../config/db.js';

class CalendarRepository {
  async createEvent(data) {
    return prisma.calendarEvent.create({
      data,
      include: {
        employee: { select: { firstName: true, lastName: true } },
        project: { select: { name: true, code: true } },
        task: { select: { title: true, taskCode: true } }
      }
    });
  }

  async createEventsBulk(dataArray) {
    return prisma.calendarEvent.createMany({
      data: dataArray
    });
  }

  async getEventById(id) {
    return prisma.calendarEvent.findUnique({
      where: { id },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        project: { select: { id: true, name: true, code: true } },
        task: { select: { id: true, title: true, taskCode: true } }
      }
    });
  }

  async getEvents(where) {
    return prisma.calendarEvent.findMany({
      where,
      include: {
        employee: { select: { firstName: true, lastName: true } },
        project: { select: { name: true, code: true } },
        task: { select: { title: true, taskCode: true } }
      },
      orderBy: { startDate: 'asc' }
    });
  }

  async updateEvent(id, data) {
    return prisma.calendarEvent.update({
      where: { id },
      data,
      include: {
        employee: { select: { firstName: true, lastName: true } },
        project: { select: { name: true, code: true } },
        task: { select: { title: true, taskCode: true } }
      }
    });
  }

  async deleteEvent(id) {
    return prisma.calendarEvent.delete({
      where: { id }
    });
  }

  async deleteEventsByLeaveId(leaveId) {
    return prisma.calendarEvent.deleteMany({
      where: { leaveId }
    });
  }

  async createHoliday(data) {
    return prisma.holiday.create({
      data
    });
  }

  async getHolidays(where) {
    return prisma.holiday.findMany({
      where,
      orderBy: { date: 'asc' }
    });
  }

  async createRecurringEvent(data) {
    return prisma.recurringEvent.create({
      data
    });
  }

  async getUpcomingEvents(where, limit = 5) {
    return prisma.calendarEvent.findMany({
      where,
      orderBy: { startDate: 'asc' },
      limit,
      include: {
        project: { select: { name: true } },
        task: { select: { title: true } }
      }
    });
  }
}

export default new CalendarRepository();
