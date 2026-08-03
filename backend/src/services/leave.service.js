import LeaveRepository from '../repositories/leave.repository.js';
import CalendarRepository from '../repositories/calendar.repository.js';
import { prisma } from '../config/db.js';

class LeaveService {
  /**
   * Helper to fetch active Employee profile by user ID.
   */
  async getEmployeeByUserId(userId) {
    const emp = await prisma.employee.findUnique({
      where: { userId }
    });
    if (!emp) throw new Error('Employee profile not found for active user.');
    return emp;
  }

  async createLeave(user, data) {
    let empId = data.employeeId;

    if (user.role === 'EMPLOYEE') {
      const emp = await this.getEmployeeByUserId(user.id);
      empId = emp.id;
    } else if (!empId) {
      const emp = await this.getEmployeeByUserId(user.id);
      empId = emp.id;
    }

    // Verify date bounds
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (start > end) throw new Error('Start date cannot be after end date.');

    // Prevent overlapping approved leave requests
    const hasOverlap = await LeaveRepository.checkOverlappingLeaves(empId, start, end);
    if (hasOverlap) {
      throw new Error('Employee already has an approved leave request that overlaps with this date range.');
    }

    return LeaveRepository.createLeave({
      employeeId: empId,
      type: data.type,
      startDate: start,
      endDate: end,
      reason: data.reason,
      status: 'PENDING'
    });
  }

  async getLeaves(user, filters = {}) {
    const where = {};

    if (user.role === 'EMPLOYEE') {
      const emp = await this.getEmployeeByUserId(user.id);
      where.employeeId = emp.id;
    } else if (user.role === 'MANAGER') {
      const managerEmp = await this.getEmployeeByUserId(user.id);
      if (!managerEmp.departmentId) {
        where.employeeId = 'none';
      } else {
        where.employee = { departmentId: managerEmp.departmentId };
      }
    }

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.employeeId) {
      where.employeeId = filters.employeeId;
    }

    return LeaveRepository.getLeaves(where);
  }

  async approveLeave(user, leaveId) {
    const leave = await LeaveRepository.getLeaveById(leaveId);
    if (!leave) throw new Error('Leave request not found.');

    if (leave.status !== 'PENDING') {
      throw new Error(`Leave request has already been ${leave.status.toLowerCase()}.`);
    }

    const reviewerEmp = await this.getEmployeeByUserId(user.id);

    // Enforce MANAGER role bounds
    if (user.role === 'MANAGER') {
      const managerEmp = await this.getEmployeeByUserId(user.id);
      if (leave.employee.departmentId !== managerEmp.departmentId) {
        throw new Error('Unauthorized: You can only approve leave requests within your department.');
      }
    }

    // Update leave status to APPROVED
    const updatedLeave = await LeaveRepository.updateLeave(leaveId, {
      status: 'APPROVED',
      approvedById: reviewerEmp.id
    });

    // Automatically create corresponding calendar event
    const name = `${leave.employee.firstName} ${leave.employee.lastName}`;
    await CalendarRepository.createEvent({
      title: `🌴 Leave: ${name} (${leave.type})`,
      description: leave.reason,
      type: 'LEAVE',
      startDate: leave.startDate,
      endDate: leave.endDate,
      isAllDay: true,
      employeeId: leave.employeeId,
      leaveId: leave.id
    });

    return updatedLeave;
  }

  async rejectLeave(user, leaveId, rejectionReason) {
    const leave = await LeaveRepository.getLeaveById(leaveId);
    if (!leave) throw new Error('Leave request not found.');

    if (leave.status !== 'PENDING') {
      throw new Error(`Leave request has already been ${leave.status.toLowerCase()}.`);
    }

    const reviewerEmp = await this.getEmployeeByUserId(user.id);

    // Enforce MANAGER role bounds
    if (user.role === 'MANAGER') {
      const managerEmp = await this.getEmployeeByUserId(user.id);
      if (leave.employee.departmentId !== managerEmp.departmentId) {
        throw new Error('Unauthorized: You can only reject leave requests within your department.');
      }
    }

    // Update leave status to REJECTED
    return LeaveRepository.updateLeave(leaveId, {
      status: 'REJECTED',
      approvedById: reviewerEmp.id,
      rejectionReason: rejectionReason || 'Rejected by manager'
    });
  }

  async cancelLeave(user, leaveId) {
    const leave = await LeaveRepository.getLeaveById(leaveId);
    if (!leave) throw new Error('Leave request not found.');

    // Only Admin, Manager (if same dept), or the Employee who created it can cancel
    const emp = await this.getEmployeeByUserId(user.id);
    if (user.role === 'EMPLOYEE' && leave.employeeId !== emp.id) {
      throw new Error('Unauthorized: You can only cancel your own leave requests.');
    }
    if (user.role === 'MANAGER' && leave.employee.departmentId !== emp.departmentId) {
      throw new Error('Unauthorized: You can only cancel leave requests within your department.');
    }

    // Cancel the request
    const updatedLeave = await LeaveRepository.updateLeave(leaveId, {
      status: 'CANCELLED'
    });

    // Remove any created calendar events
    await CalendarRepository.deleteEventsByLeaveId(leaveId);

    return updatedLeave;
  }

  async deleteLeave(user, leaveId) {
    if (user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Only administrators can delete leave request records.');
    }
    // Delete events first
    await CalendarRepository.deleteEventsByLeaveId(leaveId);
    return LeaveRepository.deleteLeave(leaveId);
  }
}

export default new LeaveService();
