import AttendanceRepository from '../repositories/attendance.repository.js';
import NotificationService from './notification.service.js';
import ActivityService from './activity.service.js';
import { prisma } from '../config/db.js';
import { broadcastToAll } from '../utils/socket.js';

class AttendanceService {
  async getEmployeeByUserId(userId) {
    const emp = await prisma.employee.findUnique({
      where: { userId }
    });
    if (!emp) throw new Error('Employee profile not found.');
    return emp;
  }

  async checkIn(user) {
    const emp = await this.getEmployeeByUserId(user.id);
    const today = new Date();
    const midnight = AttendanceRepository.normalizeToMidnightUTC(today);

    // Sync leaves for today first
    await this.syncApprovedLeavesToAttendance(emp.id, midnight, midnight);

    let attendance = await AttendanceRepository.getAttendanceForDay(emp.id, midnight);

    if (attendance) {
      const activeSession = await AttendanceRepository.getActiveWorkSession(attendance.id);
      if (activeSession) {
        throw new Error('You are already checked in with an active working session.');
      }
    }

    // Resolve initial status: if leave exists it was synced as LEAVE, but if they check in they are active
    const approvedLeave = await prisma.leave.findFirst({
      where: {
        employeeId: emp.id,
        status: 'APPROVED',
        startDate: { lte: today },
        endDate: { gte: today }
      }
    });

    const resolvedStatus = approvedLeave ? 'LEAVE' : 'PRESENT';

    if (!attendance) {
      attendance = await AttendanceRepository.createAttendance({
        employeeId: emp.id,
        date: midnight,
        status: resolvedStatus,
        clockIn: today,
        totalHours: 0,
        overtimeHours: 0,
        breakDuration: 0
      });
    } else {
      // Update clock-in timestamp if not already set
      attendance = await AttendanceRepository.updateAttendance(attendance.id, {
        clockIn: attendance.clockIn || today,
        status: resolvedStatus
      });
    }

    // Start working session
    await AttendanceRepository.createWorkSession({
      attendanceId: attendance.id,
      type: 'WORKING',
      status: 'ACTIVE',
      startTime: today
    });

    const result = await AttendanceRepository.getAttendanceForDay(emp.id, midnight);
    broadcastToAll('attendance:update', { type: 'checkin', employeeId: emp.id, date: midnight, eventVersion: 1 });
    return result;
  }

  async checkOut(user) {
    const emp = await this.getEmployeeByUserId(user.id);
    const today = new Date();
    const midnight = AttendanceRepository.normalizeToMidnightUTC(today);

    const attendance = await AttendanceRepository.getAttendanceForDay(emp.id, midnight);
    if (!attendance) {
      throw new Error('No attendance record found for today. Please clock in first.');
    }

    const activeSession = await AttendanceRepository.getActiveWorkSession(attendance.id);
    if (!activeSession) {
      throw new Error('No active work session found.');
    }

    // End active session (if break, close it; else close working session)
    await AttendanceRepository.updateWorkSession(activeSession.id, {
      status: 'COMPLETED',
      endTime: today
    });

    // Update check-out timestamp
    const updatedAttendance = await AttendanceRepository.updateAttendance(attendance.id, {
      clockOut: today
    });

    // Recalculate totals
    await this.recalculateAttendanceTotals(updatedAttendance.id);

    const result = await AttendanceRepository.getAttendanceForDay(emp.id, midnight);
    broadcastToAll('attendance:update', { type: 'checkout', employeeId: emp.id, date: midnight, eventVersion: 1 });
    return result;
  }

  async startBreak(user) {
    const emp = await this.getEmployeeByUserId(user.id);
    const today = new Date();
    const midnight = AttendanceRepository.normalizeToMidnightUTC(today);

    const attendance = await AttendanceRepository.getAttendanceForDay(emp.id, midnight);
    if (!attendance) {
      throw new Error('Please check in before starting a break.');
    }

    const activeSession = await AttendanceRepository.getActiveWorkSession(attendance.id);
    if (!activeSession) {
      throw new Error('No active working session found to pause.');
    }

    if (activeSession.type === 'BREAK') {
      throw new Error('Break is already active.');
    }

    // Pause working session
    await AttendanceRepository.updateWorkSession(activeSession.id, {
      status: 'COMPLETED',
      endTime: today
    });

    // Start break session
    await AttendanceRepository.createWorkSession({
      attendanceId: attendance.id,
      type: 'BREAK',
      status: 'ACTIVE',
      startTime: today
    });

    const result = await AttendanceRepository.getAttendanceForDay(emp.id, midnight);
    broadcastToAll('attendance:update', { type: 'break', employeeId: emp.id, date: midnight, eventVersion: 1 });
    return result;
  }

  async endBreak(user) {
    const emp = await this.getEmployeeByUserId(user.id);
    const today = new Date();
    const midnight = AttendanceRepository.normalizeToMidnightUTC(today);

    const attendance = await AttendanceRepository.getAttendanceForDay(emp.id, midnight);
    if (!attendance) {
      throw new Error('Attendance record not found.');
    }

    const activeSession = await AttendanceRepository.getActiveWorkSession(attendance.id);
    if (!activeSession || activeSession.type !== 'BREAK') {
      throw new Error('No active break session found to resume.');
    }

    // End break session
    await AttendanceRepository.updateWorkSession(activeSession.id, {
      status: 'COMPLETED',
      endTime: today
    });

    // Resume working session
    await AttendanceRepository.createWorkSession({
      attendanceId: attendance.id,
      type: 'WORKING',
      status: 'ACTIVE',
      startTime: today
    });

    const result = await AttendanceRepository.getAttendanceForDay(emp.id, midnight);
    broadcastToAll('attendance:update', { type: 'break_end', employeeId: emp.id, date: midnight, eventVersion: 1 });
    return result;
  }

  async submitCorrectionRequest(user, data) {
    const emp = await this.getEmployeeByUserId(user.id);
    const requestDate = new Date(data.date);

    // Get current parameters
    const existing = await AttendanceRepository.getAttendanceForDay(emp.id, requestDate);

    return AttendanceRepository.createAttendanceRequest({
      employeeId: emp.id,
      date: requestDate,
      requestedStatus: data.requestedStatus || 'PRESENT',
      originalClockIn: existing?.clockIn || null,
      originalClockOut: existing?.clockOut || null,
      requestedClockIn: data.requestedClockIn ? new Date(data.requestedClockIn) : null,
      requestedClockOut: data.requestedClockOut ? new Date(data.requestedClockOut) : null,
      reason: data.reason,
      status: 'PENDING'
    });
  }

  async getAttendanceRequests(user) {
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

    return AttendanceRepository.getAttendanceRequests(where);
  }

  async approveRequest(user, requestId) {
    const request = await AttendanceRepository.getAttendanceRequestById(requestId);
    if (!request) throw new Error('Correction request not found.');

    if (request.status !== 'PENDING') {
      throw new Error(`Correction request has already been ${request.status.toLowerCase()}.`);
    }

    const reviewer = await this.getEmployeeByUserId(user.id);

    // RBAC validation
    if (user.role === 'MANAGER') {
      const managerEmp = await this.getEmployeeByUserId(user.id);
      if (request.employee.departmentId !== managerEmp.departmentId) {
        throw new Error('Unauthorized: You can only approve requests in your department.');
      }
    }

    // Apply override to attendance record
    const targetDate = AttendanceRepository.normalizeToMidnightUTC(request.date);
    let attendance = await AttendanceRepository.getAttendanceForDay(request.employeeId, targetDate);

    if (!attendance) {
      attendance = await AttendanceRepository.createAttendance({
        employeeId: request.employeeId,
        date: targetDate,
        status: request.requestedStatus || 'PRESENT',
        clockIn: request.requestedClockIn,
        clockOut: request.requestedClockOut,
        totalHours: 0,
        overtimeHours: 0,
        breakDuration: 0
      });
    } else {
      attendance = await AttendanceRepository.updateAttendance(attendance.id, {
        status: request.requestedStatus || attendance.status,
        clockIn: request.requestedClockIn || attendance.clockIn,
        clockOut: request.requestedClockOut || attendance.clockOut
      });
    }

    // Re-create work session placeholder matching the request parameters
    await prisma.workSession.deleteMany({ where: { attendanceId: attendance.id } });
    
    if (attendance.clockIn && attendance.clockOut) {
      await AttendanceRepository.createWorkSession({
        attendanceId: attendance.id,
        type: 'WORKING',
        status: 'COMPLETED',
        startTime: attendance.clockIn,
        endTime: attendance.clockOut
      });
    }

    await this.recalculateAttendanceTotals(attendance.id);

    // Update request
    const approvedRequest = await AttendanceRepository.updateAttendanceRequest(requestId, {
      status: 'APPROVED',
      approvedById: reviewer.id
    });

    // Notify employee (Non-blocking)
    await NotificationService.createNotification({
      userId: request.employee.userId,
      type: 'TASK_UPDATED', // Fallback type matching existing preference filters
      title: 'Attendance Request Approved',
      description: `Your manual attendance request for ${new Date(request.date).toLocaleDateString()} has been approved.`,
      priority: 'MEDIUM'
    });

    // Log Activity
    await ActivityService.logActivity({
      userId: user.id,
      action: 'UPDATE',
      entityType: 'ATTENDANCE',
      entityId: attendance.id,
      description: `Approved attendance correction request for Employee: ${request.employee.firstName} ${request.employee.lastName}`,
      metadata: { after: approvedRequest }
    });

    return approvedRequest;
  }

  async rejectRequest(user, requestId, rejectionReason) {
    const request = await AttendanceRepository.getAttendanceRequestById(requestId);
    if (!request) throw new Error('Correction request not found.');

    if (request.status !== 'PENDING') {
      throw new Error(`Correction request has already been ${request.status.toLowerCase()}.`);
    }

    const reviewer = await this.getEmployeeByUserId(user.id);

    // RBAC validation
    if (user.role === 'MANAGER') {
      const managerEmp = await this.getEmployeeByUserId(user.id);
      if (request.employee.departmentId !== managerEmp.departmentId) {
        throw new Error('Unauthorized: You can only reject requests in your department.');
      }
    }

    const rejectedRequest = await AttendanceRepository.updateAttendanceRequest(requestId, {
      status: 'REJECTED',
      approvedById: reviewer.id,
      rejectionReason: rejectionReason || 'Rejected by reviewer'
    });

    // Notify employee (Non-blocking)
    await NotificationService.createNotification({
      userId: request.employee.userId,
      type: 'TASK_UPDATED',
      title: 'Attendance Request Rejected',
      description: `Your manual attendance request for ${new Date(request.date).toLocaleDateString()} was rejected.`,
      priority: 'MEDIUM'
    });

    // Log Activity
    await ActivityService.logActivity({
      userId: user.id,
      action: 'UPDATE',
      entityType: 'ATTENDANCE',
      entityId: request.id,
      description: `Rejected attendance correction request for Employee: ${request.employee.firstName} ${request.employee.lastName}`,
      metadata: { after: rejectedRequest }
    });

    return rejectedRequest;
  }

  async getAttendances(user, filters = {}) {
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

    if (filters.employeeId) {
      where.employeeId = filters.employeeId;
    }

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = AttendanceRepository.normalizeToMidnightUTC(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = AttendanceRepository.normalizeToMidnightUTC(filters.endDate);
      }
    }

    // Auto sync leaves prior to return
    if (where.employeeId && where.employeeId !== 'none' && filters.startDate && filters.endDate) {
      await this.syncApprovedLeavesToAttendance(
        where.employeeId,
        new Date(filters.startDate),
        new Date(filters.endDate)
      );
    }

    return AttendanceRepository.getAttendances(where);
  }

  /**
   * Recalculates working hours, break durations, and overtime metrics.
   */
  async recalculateAttendanceTotals(attendanceId) {
    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
      include: { workSessions: true }
    });

    if (!attendance) return;

    let totalWorkingMs = 0;
    let totalBreakMs = 0;

    attendance.workSessions.forEach((session) => {
      if (session.status === 'COMPLETED' && session.endTime) {
        const duration = new Date(session.endTime).getTime() - new Date(session.startTime).getTime();
        if (session.type === 'BREAK') {
          totalBreakMs += duration;
        } else {
          totalWorkingMs += duration;
        }
      }
    });

    const workingHours = parseFloat((totalWorkingMs / 3600000).toFixed(2));
    const breakMinutes = Math.round(totalBreakMs / 60000);
    const overtimeHours = workingHours > 8 ? parseFloat((workingHours - 8).toFixed(2)) : 0;

    let finalStatus = attendance.status;
    if (attendance.status !== 'LEAVE') {
      if (workingHours < 4) {
        finalStatus = 'HALF_DAY';
      } else {
        finalStatus = 'PRESENT';
      }
    }

    await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        totalHours: workingHours,
        breakDuration: breakMinutes,
        overtimeHours: overtimeHours,
        status: finalStatus
      }
    });
  }

  /**
   * Sync approved leave request blocks to the daily attendance logs dynamically.
   */
  async syncApprovedLeavesToAttendance(employeeId, startDate, endDate) {
    const start = AttendanceRepository.normalizeToMidnightUTC(startDate);
    const end = AttendanceRepository.normalizeToMidnightUTC(endDate);

    const leaves = await prisma.leave.findMany({
      where: {
        employeeId,
        status: 'APPROVED',
        startDate: { lte: end },
        endDate: { gte: start }
      }
    });

    for (const leave of leaves) {
      let current = new Date(Math.max(new Date(leave.startDate), start));
      const endLimit = new Date(Math.min(new Date(leave.endDate), end));

      while (current <= endLimit) {
        const midnight = AttendanceRepository.normalizeToMidnightUTC(current);
        
        const existing = await prisma.attendance.findUnique({
          where: {
            employeeId_date: { employeeId, date: midnight }
          }
        });

        if (!existing) {
          await prisma.attendance.create({
            data: {
              employeeId,
              date: midnight,
              status: 'LEAVE',
              totalHours: 0,
              overtimeHours: 0,
              breakDuration: 0
            }
          });
        } else if (existing.status !== 'LEAVE' && !existing.clockIn) {
          await prisma.attendance.update({
            where: { id: existing.id },
            data: { status: 'LEAVE' }
          });
        }

        current.setDate(current.getDate() + 1);
      }
    }
  }
}

export default new AttendanceService();
