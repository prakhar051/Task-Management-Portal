import { prisma } from '../config/db.js';

class AttendanceRepository {
  /**
   * Helper to normalize a date string or object to midnight UTC date.
   */
  normalizeToMidnightUTC(dateInput) {
    const d = new Date(dateInput);
    const dateStr = d.toISOString().split('T')[0];
    return new Date(`${dateStr}T00:00:00.000Z`);
  }

  async getAttendanceForDay(employeeId, date) {
    const targetDate = this.normalizeToMidnightUTC(date);
    return prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: targetDate
        }
      },
      include: {
        workSessions: { orderBy: { startTime: 'asc' } },
        employee: { select: { firstName: true, lastName: true, designation: true } }
      }
    });
  }

  async createAttendance(data) {
    const targetDate = this.normalizeToMidnightUTC(data.date);
    return prisma.attendance.create({
      data: {
        ...data,
        date: targetDate
      },
      include: {
        workSessions: true
      }
    });
  }

  async updateAttendance(id, data) {
    const payload = { ...data };
    if (data.date) {
      payload.date = this.normalizeToMidnightUTC(data.date);
    }
    return prisma.attendance.update({
      where: { id },
      data: payload,
      include: {
        workSessions: true
      }
    });
  }

  async getAttendances(where) {
    return prisma.attendance.findMany({
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
        },
        workSessions: { orderBy: { startTime: 'asc' } }
      },
      orderBy: { date: 'desc' }
    });
  }

  async createWorkSession(data) {
    return prisma.workSession.create({
      data
    });
  }

  async getActiveWorkSession(attendanceId) {
    return prisma.workSession.findFirst({
      where: {
        attendanceId,
        status: 'ACTIVE'
      }
    });
  }

  async updateWorkSession(id, data) {
    return prisma.workSession.update({
      where: { id },
      data
    });
  }

  async createAttendanceRequest(data) {
    return prisma.attendanceRequest.create({
      data,
      include: {
        employee: { select: { firstName: true, lastName: true } }
      }
    });
  }

  async getAttendanceRequests(where) {
    return prisma.attendanceRequest.findMany({
      where,
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            departmentId: true
          }
        },
        approvedBy: { select: { firstName: true, lastName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAttendanceRequestById(id) {
    return prisma.attendanceRequest.findUnique({
      where: { id },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, departmentId: true } }
      }
    });
  }

  async updateAttendanceRequest(id, data) {
    return prisma.attendanceRequest.update({
      where: { id },
      data,
      include: {
        employee: { select: { firstName: true, lastName: true } }
      }
    });
  }
}

export default new AttendanceRepository();
