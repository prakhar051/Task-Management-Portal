import TimesheetRepository from '../repositories/timesheet.repository.js';
import { prisma } from '../config/db.js';
import AttendanceRepository from '../repositories/attendance.repository.js';

class TimesheetService {
  async getEmployeeByUserId(userId) {
    const emp = await prisma.employee.findUnique({
      where: { userId }
    });
    if (!emp) throw new Error('Employee profile not found.');
    return emp;
  }

  async getTimesheets(user, query = {}) {
    const where = {};

    if (user.role === 'EMPLOYEE') {
      const emp = await this.getEmployeeByUserId(user.id);
      where.employeeId = emp.id;
    } else if (user.role === 'MANAGER') {
      const emp = await this.getEmployeeByUserId(user.id);
      if (!emp.departmentId) {
        where.employeeId = 'none';
      } else {
        where.employee = { departmentId: emp.departmentId };
      }
    }

    if (query.employeeId) {
      where.employeeId = query.employeeId;
    }

    if (query.startDate || query.endDate) {
      where.startDate = {};
      if (query.startDate) {
        where.startDate.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.startDate.lte = new Date(query.endDate);
      }
    }

    return TimesheetRepository.getTimesheets(where);
  }

  async getTimesheetById(user, id) {
    const timesheet = await TimesheetRepository.getTimesheetById(id);
    if (!timesheet) throw new Error('Timesheet record not found.');

    if (user.role === 'EMPLOYEE') {
      const emp = await this.getEmployeeByUserId(user.id);
      if (timesheet.employeeId !== emp.id) {
        throw new Error('Unauthorized: You cannot access this timesheet.');
      }
    } else if (user.role === 'MANAGER') {
      const managerEmp = await this.getEmployeeByUserId(user.id);
      if (timesheet.employee.departmentId !== managerEmp.departmentId) {
        throw new Error('Unauthorized: You cannot access this timesheet.');
      }
    }

    return timesheet;
  }

  async getMonthlySummary(user, query = {}) {
    const year = query.year ? parseInt(query.year) : new Date().getUTCFullYear();
    const month = query.month ? parseInt(query.month) : new Date().getUTCMonth() + 1;

    let targetEmployeeId = query.employeeId;

    if (user.role === 'EMPLOYEE') {
      const emp = await this.getEmployeeByUserId(user.id);
      targetEmployeeId = emp.id;
    } else if (!targetEmployeeId) {
      const emp = await this.getEmployeeByUserId(user.id);
      targetEmployeeId = emp.id;
    }

    const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
    const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    // Find all attendance records for the month
    const attendances = await prisma.attendance.findMany({
      where: {
        employeeId: targetEmployeeId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      orderBy: { date: 'asc' }
    });

    // Calculate total working days in the month (excluding weekends)
    let totalWorkingDays = 0;
    let temp = new Date(startOfMonth);
    while (temp <= endOfMonth) {
      const day = temp.getUTCDay();
      if (day !== 0 && day !== 6) {
        totalWorkingDays++;
      }
      temp.setUTCDate(temp.getUTCDate() + 1);
    }

    // Compile productivity calculations
    const stats = this.calculateProductivityMetrics(attendances, totalWorkingDays);

    return {
      year,
      month,
      employeeId: targetEmployeeId,
      totalWorkingDaysCount: totalWorkingDays,
      ...stats,
      logs: attendances
    };
  }

  calculateProductivityMetrics(attendances, totalWorkingDaysCount) {
    let totalWorkingHours = 0;
    let totalOvertimeHours = 0;
    let totalBreakDurationMin = 0;
    let presentDaysCount = 0;
    let halfDaysCount = 0;
    let leaveDaysCount = 0;

    let checkInMinutesSum = 0;
    let checkInCount = 0;
    let checkOutMinutesSum = 0;
    let checkOutCount = 0;

    attendances.forEach((att) => {
      totalWorkingHours += att.totalHours;
      totalOvertimeHours += att.overtimeHours;
      totalBreakDurationMin += att.breakDuration;

      if (att.status === 'PRESENT') presentDaysCount++;
      if (att.status === 'HALF_DAY') halfDaysCount++;
      if (att.status === 'LEAVE') leaveDaysCount++;

      if (att.clockIn) {
        const time = new Date(att.clockIn);
        const minutes = time.getUTCHours() * 60 + time.getUTCMinutes();
        checkInMinutesSum += minutes;
        checkInCount++;
      }

      if (att.clockOut) {
        const time = new Date(att.clockOut);
        const minutes = time.getUTCHours() * 60 + time.getUTCMinutes();
        checkOutMinutesSum += minutes;
        checkOutCount++;
      }
    });

    const activeDays = presentDaysCount + (halfDaysCount * 0.5);
    const attendancePercentage = totalWorkingDaysCount > 0
      ? parseFloat(((activeDays / totalWorkingDaysCount) * 100).toFixed(2))
      : 0;

    const formatMinutesToHHMM = (totalMin) => {
      const hours = Math.floor(totalMin / 60);
      const mins = Math.round(totalMin % 60);
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    const avgCheckInTime = checkInCount > 0
      ? formatMinutesToHHMM(checkInMinutesSum / checkInCount)
      : '09:00';

    const avgCheckOutTime = checkOutCount > 0
      ? formatMinutesToHHMM(checkOutMinutesSum / checkOutCount)
      : '17:00';

    return {
      totalWorkingHours: parseFloat(totalWorkingHours.toFixed(2)),
      totalOvertimeHours: parseFloat(totalOvertimeHours.toFixed(2)),
      totalBreakDurationMin,
      attendancePercentage,
      avgCheckInTime,
      avgCheckOutTime,
      presentDays: presentDaysCount,
      halfDays: halfDaysCount,
      leaveDays: leaveDaysCount,
      totalLogged: attendances.length
    };
  }

  async getTimesheetsExport(user, query = {}) {
    const timesheets = await this.getTimesheets(user, query);

    let csv = 'Timesheet ID,Employee,Designation,Start Date,End Date,Regular Hours,Overtime Hours,Attendance %,Status\r\n';
    timesheets.forEach((ts) => {
      const name = `${ts.employee?.firstName} ${ts.employee?.lastName}`;
      csv += `"${ts.id}","${name}","${ts.employee?.designation}","${ts.startDate.toISOString().split('T')[0]}","${ts.endDate.toISOString().split('T')[0]}",${ts.totalRegularHours},${ts.totalOvertimeHours},${ts.attendancePercentage},"${ts.status}"\r\n`;
    });

    return csv;
  }
}

export default new TimesheetService();
