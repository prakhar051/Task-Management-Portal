import CalendarRepository from '../repositories/calendar.repository.js';
import { prisma } from '../config/db.js';

class CalendarService {
  /**
   * Helper to fetch active Employee profile by user ID.
   */
  async getEmployeeByUserId(userId) {
    const emp = await prisma.employee.findUnique({
      where: { userId }
    });
    return emp;
  }

  /**
   * Returns a unified list of calendar events mapping Deadlines, Holidays, Leaves, and Custom Events.
   */
  async getUnifiedFeed(user, filters = {}) {
    const start = filters.startDate ? new Date(filters.startDate) : new Date(Date.now() - 30 * 86400000);
    const end = filters.endDate ? new Date(filters.endDate) : new Date(Date.now() + 90 * 86400000);

    const emp = await this.getEmployeeByUserId(user.id);
    const deptId = user.role === 'MANAGER' && emp ? emp.departmentId : filters.departmentId;

    // 1. Fetch calendar_events table
    const eventWhere = {
      startDate: { gte: start },
      endDate: { lte: end }
    };

    if (user.role === 'EMPLOYEE' && emp) {
      eventWhere.OR = [
        { employeeId: emp.id },
        { employeeId: null } // Global events
      ];
    } else if (user.role === 'MANAGER' && deptId) {
      eventWhere.OR = [
        { employee: { departmentId: deptId } },
        { employeeId: null }
      ];
    } else if (filters.employeeId) {
      eventWhere.employeeId = filters.employeeId;
    }

    const dbEvents = await CalendarRepository.getEvents(eventWhere);

    // 2. Fetch Holidays
    const holidayWhere = {
      date: { gte: start, lte: end }
    };
    const holidays = await CalendarRepository.getHolidays(holidayWhere);

    // 3. Fetch Tasks (Deadlines)
    const taskWhere = {
      isDeleted: false,
      dueDate: { gte: start, lte: end }
    };

    if (user.role === 'EMPLOYEE' && emp) {
      taskWhere.assignees = { some: { employeeId: emp.id } };
    } else if (user.role === 'MANAGER' && deptId) {
      taskWhere.project = { departmentId: deptId };
    } else {
      if (filters.employeeId) {
        taskWhere.assignees = { some: { employeeId: filters.employeeId } };
      }
      if (deptId) {
        taskWhere.project = { departmentId: deptId };
      }
    }

    if (filters.projectId) {
      taskWhere.projectId = filters.projectId;
    }

    const tasks = await prisma.task.findMany({
      where: taskWhere,
      select: {
        id: true,
        taskCode: true,
        title: true,
        dueDate: true,
        status: true,
        project: { select: { name: true } }
      }
    });

    // 4. Fetch Projects (Deadlines / Milestones)
    const projectWhere = {
      isDeleted: false,
      endDate: { gte: start, lte: end }
    };

    if (user.role === 'EMPLOYEE' && emp) {
      projectWhere.OR = [
        { managerId: emp.id },
        { members: { some: { employeeId: emp.id } } }
      ];
    } else if (deptId) {
      projectWhere.departmentId = deptId;
    }

    if (filters.projectId) {
      projectWhere.id = filters.projectId;
    }

    const projects = await prisma.project.findMany({
      where: projectWhere,
      select: {
        id: true,
        code: true,
        name: true,
        endDate: true,
        status: true
      }
    });

    // 5. Merge and compile unified feed model
    const unifiedEvents = [];

    // Map DB Events
    dbEvents.forEach((ev) => {
      unifiedEvents.push({
        id: ev.id,
        title: ev.title,
        description: ev.description || '',
        type: ev.type,
        startDate: ev.startDate,
        endDate: ev.endDate,
        isAllDay: ev.isAllDay,
        associatedEntityId: ev.taskId || ev.projectId || ev.leaveId || null,
        code: ev.task?.taskCode || ev.project?.code || null,
        color: ev.type === 'LEAVE' ? 'rgba(168, 85, 247, 0.15)' : ev.type === 'MEETING' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(234, 179, 8, 0.15)'
      });
    });

    // Map Holidays
    holidays.forEach((h) => {
      unifiedEvents.push({
        id: h.id,
        title: `🎉 ${h.name}`,
        description: 'Public Holiday',
        type: 'HOLIDAY',
        startDate: h.date,
        endDate: h.date,
        isAllDay: true,
        associatedEntityId: null,
        code: null,
        color: 'rgba(239, 68, 68, 0.15)'
      });
    });

    // Map Tasks Deadlines
    tasks.forEach((t) => {
      unifiedEvents.push({
        id: t.id,
        title: `📋 Task: ${t.title}`,
        description: `Project: ${t.project?.name || 'None'} | Status: ${t.status}`,
        type: 'TASK',
        startDate: t.dueDate,
        endDate: t.dueDate,
        isAllDay: true,
        associatedEntityId: t.id,
        code: t.taskCode,
        color: 'rgba(16, 185, 129, 0.15)'
      });
    });

    // Map Projects Milestones
    projects.forEach((p) => {
      unifiedEvents.push({
        id: p.id,
        title: `📂 Project Deadline: ${p.name}`,
        description: `Status: ${p.status}`,
        type: 'PROJECT',
        startDate: p.endDate,
        endDate: p.endDate,
        isAllDay: true,
        associatedEntityId: p.id,
        code: p.code,
        color: 'rgba(245, 158, 11, 0.15)'
      });
    });

    return unifiedEvents;
  }

  async getUpcomingEvents(user, limit = 5) {
    const emp = await this.getEmployeeByUserId(user.id);
    const start = new Date();
    const end = new Date(Date.now() + 15 * 86400000); // Look ahead 15 days

    const feed = await this.getUnifiedFeed(user, {
      startDate: start.toISOString(),
      endDate: end.toISOString()
    });

    return feed
      .filter((ev) => new Date(ev.startDate) >= start)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .slice(0, limit);
  }

  async createEvent(user, data) {
    let empId = data.employeeId;
    if (user.role === 'EMPLOYEE' && !empId) {
      const emp = await this.getEmployeeByUserId(user.id);
      empId = emp.id;
    }

    return CalendarRepository.createEvent({
      title: data.title,
      description: data.description,
      type: data.type || 'CUSTOM',
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      isAllDay: !!data.isAllDay,
      employeeId: empId,
      projectId: data.projectId,
      taskId: data.taskId
    });
  }

  async updateEvent(user, id, data) {
    const event = await CalendarRepository.getEventById(id);
    if (!event) throw new Error('Calendar event not found.');

    // Security check: Employee can only update own custom events
    if (user.role === 'EMPLOYEE') {
      const emp = await this.getEmployeeByUserId(user.id);
      if (event.employeeId !== emp.id) {
        throw new Error('Unauthorized: You can only edit your own calendar events.');
      }
    }

    return CalendarRepository.updateEvent(id, {
      title: data.title,
      description: data.description,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      isAllDay: data.isAllDay !== undefined ? !!data.isAllDay : undefined
    });
  }

  /**
   * Syncs dragged calendar actions directly back to original tables (Tasks/Projects/Custom).
   */
  async handleDragDrop(user, eventId, type, newStartDate, newEndDate) {
    const start = new Date(newStartDate);
    const end = new Date(newEndDate);

    if (type === 'TASK') {
      // Direct task update
      if (user.role === 'EMPLOYEE') {
        throw new Error('Unauthorized: Only administrators and managers can adjust task deadlines.');
      }
      return prisma.task.update({
        where: { id: eventId },
        data: { dueDate: end }
      });
    }

    if (type === 'PROJECT') {
      // Direct project update
      if (user.role === 'EMPLOYEE') {
        throw new Error('Unauthorized: Only administrators and managers can adjust project milestones.');
      }
      return prisma.project.update({
        where: { id: eventId },
        data: { endDate: end }
      });
    }

    // Default: update custom calendar events
    const event = await CalendarRepository.getEventById(eventId);
    if (!event) throw new Error('Calendar event not found.');

    if (user.role === 'EMPLOYEE') {
      const emp = await this.getEmployeeByUserId(user.id);
      if (event.employeeId !== emp.id) {
        throw new Error('Unauthorized: You cannot modify calendar events belonging to other users.');
      }
    }

    return CalendarRepository.updateEvent(eventId, {
      startDate: start,
      endDate: end
    });
  }

  async deleteEvent(user, id) {
    const event = await CalendarRepository.getEventById(id);
    if (!event) throw new Error('Calendar event not found.');

    if (user.role === 'EMPLOYEE') {
      const emp = await this.getEmployeeByUserId(user.id);
      if (event.employeeId !== emp.id) {
        throw new Error('Unauthorized: You can only delete your own calendar events.');
      }
    }

    return CalendarRepository.deleteEvent(id);
  }

  /**
   * Registers a recurring pattern and generates the first 3 months of child events.
   */
  async createRecurringEvent(user, data) {
    let empId = data.employeeId;
    if (user.role === 'EMPLOYEE') {
      const emp = await this.getEmployeeByUserId(user.id);
      empId = emp.id;
    }

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    const recEvent = await CalendarRepository.createRecurringEvent({
      title: data.title,
      description: data.description,
      type: data.type || 'MEETING',
      startDate: start,
      endDate: end,
      recurrenceRule: data.recurrenceRule, // 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'
      recurrenceEndDate: data.recurrenceEndDate ? new Date(data.recurrenceEndDate) : null,
      employeeId: empId
    });

    // Generate future child occurrences lazily (Max 3 months limit)
    await this.generateOccurrences(recEvent);

    return recEvent;
  }

  async generateOccurrences(recurringEvent) {
    const occurrences = [];
    const rule = recurringEvent.recurrenceRule;
    const startDate = new Date(recurringEvent.startDate);
    
    // Set 3 months limit
    const maxEndDate = new Date();
    maxEndDate.setMonth(maxEndDate.getMonth() + 3);

    const endDateLimit = recurringEvent.recurrenceEndDate
      ? new Date(Math.min(new Date(recurringEvent.recurrenceEndDate), maxEndDate))
      : maxEndDate;

    let current = new Date(startDate);
    const duration = new Date(recurringEvent.endDate).getTime() - startDate.getTime();

    while (current <= endDateLimit) {
      occurrences.push({
        title: recurringEvent.title,
        description: recurringEvent.description,
        type: recurringEvent.type,
        startDate: new Date(current),
        endDate: new Date(current.getTime() + duration),
        isAllDay: false,
        employeeId: recurringEvent.employeeId,
        recurringEventId: recurringEvent.id
      });

      if (rule === 'DAILY') {
        current.setDate(current.getDate() + 1);
      } else if (rule === 'WEEKLY') {
        current.setDate(current.getDate() + 7);
      } else if (rule === 'MONTHLY') {
        current.setMonth(current.getMonth() + 1);
      } else if (rule === 'YEARLY') {
        current.setFullYear(current.getFullYear() + 1);
      } else {
        break;
      }
    }

    if (occurrences.length > 0) {
      await CalendarRepository.createEventsBulk(occurrences);
    }
  }
}

export default new CalendarService();
