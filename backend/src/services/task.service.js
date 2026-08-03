import { TaskRepository } from '../repositories/task.repository.js';
import { prisma } from '../config/db.js';

export class TaskService {
  /**
   * Helper method to get the employee associated with a user.
   */
  static async getAssociatedEmployee(userId) {
    return prisma.employee.findFirst({
      where: { userId, isDeleted: false }
    });
  }

  /**
   * Status Workflow Validation.
   * Restricts transitions according to specified rules.
   */
  static validateStatusTransition(current, target) {
    if (current === target) return true;
    if (current === 'CANCELLED') {
      throw new Error('Task is in terminal CANCELLED status and cannot be modified.');
    }
    if (target === 'CANCELLED') return true; // Any state can go to Cancelled
    if (target === 'BLOCKED') {
      if (current === 'COMPLETED') {
        throw new Error('Completed task cannot be BLOCKED.');
      }
      return true;
    }

    if (current === 'TODO') {
      if (target !== 'IN_PROGRESS' && target !== 'BLOCKED') {
        throw new Error('TODO tasks can only transition to IN_PROGRESS or BLOCKED.');
      }
    } else if (current === 'IN_PROGRESS') {
      if (target !== 'IN_REVIEW' && target !== 'BLOCKED') {
        throw new Error('IN_PROGRESS tasks can only transition to IN_REVIEW or BLOCKED.');
      }
    } else if (current === 'IN_REVIEW') {
      if (target !== 'COMPLETED' && target !== 'IN_PROGRESS' && target !== 'TODO') {
        throw new Error('IN_REVIEW tasks can only transition to COMPLETED, IN_PROGRESS, or TODO.');
      }
    } else if (current === 'BLOCKED') {
      if (target !== 'IN_PROGRESS') {
        throw new Error('BLOCKED tasks can only transition to IN_PROGRESS.');
      }
    } else if (current === 'COMPLETED') {
      if (target !== 'IN_PROGRESS') {
        throw new Error('COMPLETED tasks can only transition back to IN_PROGRESS.');
      }
    }
    return true;
  }

  /**
   * Recursive Parent Loop Detection.
   * Ensures task X is not an ancestor of task Y before setting X as parent of Y.
   */
  static async checkCircularParent(taskId, parentTaskId) {
    if (!parentTaskId) return false;
    if (taskId === parentTaskId) return true; // Self-parenting is circular

    let currentParentId = parentTaskId;
    while (currentParentId) {
      if (currentParentId === taskId) {
        return true; // Cycle detected
      }
      const parent = await prisma.task.findUnique({
        where: { id: currentParentId },
        select: { parentTaskId: true }
      });
      currentParentId = parent ? parent.parentTaskId : null;
    }
    return false;
  }

  /**
   * BFS Circular Dependency Loop Detection.
   * Verifies that adding taskId -> dependsOnTaskId does not create a loop.
   */
  static async checkCircularDependency(taskId, dependsOnTaskId) {
    if (taskId === dependsOnTaskId) return true; // Self dependency is circular

    const visited = new Set();
    const queue = [dependsOnTaskId];

    while (queue.length > 0) {
      const currentId = queue.shift();
      if (currentId === taskId) {
        return true; // Loop detected
      }

      if (!visited.has(currentId)) {
        visited.add(currentId);
        // Find everything currentId depends on
        const deps = await prisma.taskDependency.findMany({
          where: { taskId: currentId },
          select: { dependsOnTaskId: true }
        });
        for (const d of deps) {
          queue.push(d.dependsOnTaskId);
        }
      }
    }
    return false;
  }

  /**
   * List tasks with pagination, filters, sorting, and debounced search.
   * Enforces RBAC visibility constraints.
   */
  static async listTasks({
    page = 1,
    limit = 10,
    search = '',
    status = '',
    priority = '',
    type = '',
    projectId = '',
    assigneeId = '',
    reporterId = '',
    dueDate = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    user
  }) {
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    // Setup base query filters
    const where = {
      isDeleted: false
    };

    // Apply RBAC filters
    if (user.role !== 'ADMIN') {
      const employee = await this.getAssociatedEmployee(user.id);
      if (!employee) {
        return {
          tasks: [],
          pagination: { page: parseInt(page), limit: take, total: 0, pages: 0 }
        };
      }

      if (user.role === 'MANAGER') {
        // MANAGER can view: tasks of projects in their department OR projects they manage
        where.project = {
          OR: [
            { managerId: employee.id },
            { departmentId: employee.departmentId }
          ]
        };
      } else if (user.role === 'EMPLOYEE') {
        // EMPLOYEE can view: tasks of projects they are members of, OR tasks assigned to them, OR reported by them
        where.OR = [
          { project: { members: { some: { employeeId: employee.id } } } },
          { assignees: { some: { employeeId: employee.id } } },
          { reporterId: employee.id }
        ];
      }
    }

    // Apply filters
    if (status) {
      where.status = status;
    }
    if (priority) {
      where.priority = priority;
    }
    if (type) {
      where.type = type;
    }
    if (projectId) {
      where.projectId = projectId;
    }
    if (assigneeId) {
      where.assignees = {
        some: {
          employeeId: assigneeId
        }
      };
    }
    if (reporterId) {
      where.reporterId = reporterId;
    }
    if (dueDate) {
      const targetDate = new Date(dueDate);
      where.dueDate = {
        gte: new Date(targetDate.setHours(0, 0, 0, 0)),
        lte: new Date(targetDate.setHours(23, 59, 59, 999))
      };
    }

    // Apply search query criteria (case-insensitive)
    if (search) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { taskCode: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { project: { name: { contains: search, mode: 'insensitive' } } },
            {
              assignees: {
                some: {
                  employee: {
                    OR: [
                      { firstName: { contains: search, mode: 'insensitive' } },
                      { lastName: { contains: search, mode: 'insensitive' } }
                    ]
                  }
                }
              }
            },
            {
              reporter: {
                OR: [
                  { firstName: { contains: search, mode: 'insensitive' } },
                  { lastName: { contains: search, mode: 'insensitive' } }
                ]
              }
            }
          ]
        }
      ];
    }

    // Setup sorting criteria
    let orderBy = { [sortBy]: sortOrder };
    if (sortBy === 'dueDate') {
      orderBy = { dueDate: sortOrder };
    } else if (sortBy === 'priority') {
      orderBy = { priority: sortOrder };
    } else if (sortBy === 'status') {
      orderBy = { status: sortOrder };
    }

    const { tasks, total } = await TaskRepository.findAndCount({
      where,
      skip,
      take,
      orderBy
    });

    const pages = Math.ceil(total / take);

    return {
      tasks,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        pages
      }
    };
  }

  /**
   * Fetch task details.
   */
  static async getTaskById(id, user) {
    const task = await TaskRepository.findById(id);
    if (!task) {
      throw new Error('Task not found.');
    }

    // Check RBAC permissions
    if (user.role !== 'ADMIN') {
      const employee = await this.getAssociatedEmployee(user.id);
      if (!employee) {
        throw new Error('Unauthorized. Employee profile required.');
      }

      if (user.role === 'MANAGER') {
        const isManager = task.project.managerId === employee.id;
        const isSameDept = task.project.departmentId === employee.departmentId;
        if (!isManager && !isSameDept) {
          throw new Error('Unauthorized. You can only view tasks belonging to your department projects.');
        }
      } else if (user.role === 'EMPLOYEE') {
        const isAssignee = task.assignees.some((a) => a.employeeId === employee.id);
        const isReporter = task.reporterId === employee.id;
        const isProjectMember = task.project.members?.some((m) => m.employeeId === employee.id);
        if (!isAssignee && !isReporter && !isProjectMember) {
          throw new Error('Unauthorized. You can only view tasks assigned to you, reported by you, or in your projects.');
        }
      }
    }

    return task;
  }

  /**
   * Create a new task.
   */
  static async createTask(data, createdById) {
    // 1. Fetch project to extract code prefix
    const project = await prisma.project.findUnique({ where: { id: data.projectId } });
    if (!project) {
      throw new Error('Target project does not exist.');
    }

    // 2. Count existing tasks in project to generate sequential code prefix
    const taskCount = await prisma.task.count({
      where: { projectId: data.projectId }
    });
    const taskCode = `${project.code}-${String(taskCount + 1).padStart(3, '0')}`.toUpperCase();

    // 3. Parent loop validation
    if (data.parentTaskId) {
      const parentTask = await prisma.task.findUnique({ where: { id: data.parentTaskId } });
      if (!parentTask || parentTask.isDeleted) {
        throw new Error('Parent task is deleted or invalid.');
      }
    }

    // 4. Progress automatic checks
    let progress = data.completionPercentage ?? 0;
    if (data.status === 'TODO') {
      progress = 0;
    } else if (data.status === 'COMPLETED') {
      progress = 100;
    }

    return TaskRepository.create({
      ...data,
      taskCode,
      completionPercentage: progress,
      createdById
    });
  }

  /**
   * Update task details.
   */
  static async updateTask(id, data, updatedById, user) {
    const task = await TaskRepository.findById(id);
    if (!task) {
      throw new Error('Task not found.');
    }

    // RBAC validation: Admins hold full permissions; employees/managers can only modify if they are assignee or reporter
    if (user.role !== 'ADMIN') {
      const employee = await this.getAssociatedEmployee(user.id);
      if (!employee) {
        throw new Error('Unauthorized. Employee profile required.');
      }

      const isAssignee = task.assignees.some((a) => a.employeeId === employee.id);
      const isReporter = task.reporterId === employee.id;
      if (!isAssignee && !isReporter) {
        throw new Error('Unauthorized. You can only modify tasks assigned to you or reported by you.');
      }
    }

    // 1. Validate status transitions
    if (data.status && data.status !== task.status) {
      this.validateStatusTransition(task.status, data.status);
    }

    // 2. Validate parent hierarchy circular reference
    if (data.parentTaskId && data.parentTaskId !== task.parentTaskId) {
      const loop = await this.checkCircularParent(id, data.parentTaskId);
      if (loop) {
        throw new Error('Circular parent hierarchy detected. This task cannot be set as parent of its ancestor.');
      }
    }

    // 3. Progress resets checks
    let progress = data.completionPercentage;
    const targetStatus = data.status || task.status;
    if (targetStatus === 'TODO') {
      progress = 0;
    } else if (targetStatus === 'COMPLETED') {
      progress = 100;
    }

    return TaskRepository.update(id, {
      ...data,
      ...(progress !== undefined && { completionPercentage: progress }),
      updatedById
    });
  }

  /**
   * Update status.
   */
  static async updateStatus(id, status, updatedById, user) {
    const task = await TaskRepository.findById(id);
    if (!task) {
      throw new Error('Task not found.');
    }

    // Validate transition
    this.validateStatusTransition(task.status, status);

    let progress = task.completionPercentage;
    if (status === 'TODO') {
      progress = 0;
    } else if (status === 'COMPLETED') {
      progress = 100;
    }

    return TaskRepository.update(id, {
      status,
      completionPercentage: progress,
      updatedById
    });
  }

  /**
   * Update progress.
   */
  static async updateProgress(id, progress, updatedById) {
    const task = await TaskRepository.findById(id);
    if (!task) {
      throw new Error('Task not found.');
    }

    return TaskRepository.update(id, {
      completionPercentage: progress,
      updatedById
    });
  }

  /**
   * Assign assignees.
   */
  static async assignAssignees(id, employeeIds) {
    return TaskRepository.assignAssignees(id, employeeIds);
  }

  /**
   * Sync dependencies blocker relationships.
   */
  static async updateDependencies(id, dependsOnTaskIds, updatedById) {
    // 1. Block self dependency
    if (dependsOnTaskIds.includes(id)) {
      throw new Error('Self dependency is not allowed. A task cannot block itself.');
    }

    // 2. BFS cycle validation
    for (const blockerId of dependsOnTaskIds) {
      const loop = await this.checkCircularDependency(id, blockerId);
      if (loop) {
        throw new Error('Circular dependency loop detected. Adding this blocker would cause a cycle.');
      }
    }

    return TaskRepository.updateDependencies(id, dependsOnTaskIds);
  }

  /**
   * Comments logic.
   */
  static async addComment(taskId, employeeId, comment) {
    const task = await TaskRepository.findById(taskId);
    if (!task) {
      throw new Error('Task not found.');
    }
    return TaskRepository.createComment(taskId, employeeId, comment);
  }

  static async updateComment(commentId, comment, employeeId) {
    return TaskRepository.updateComment(commentId, comment, employeeId);
  }

  static async deleteComment(commentId, employeeId) {
    return TaskRepository.deleteComment(commentId, employeeId);
  }

  static async getComments(taskId) {
    return TaskRepository.getComments(taskId);
  }

  /**
   * Attachments logic.
   */
  static async addAttachment(taskId, fileName, filePath, fileType, uploadedById) {
    const task = await TaskRepository.findById(taskId);
    if (!task) {
      throw new Error('Task not found.');
    }
    return TaskRepository.createAttachment(taskId, fileName, filePath, fileType, uploadedById);
  }

  static async deleteAttachment(attachmentId, employeeId) {
    return TaskRepository.deleteAttachment(attachmentId, employeeId);
  }

  static async getAttachments(taskId) {
    return TaskRepository.getAttachments(taskId);
  }

  static async softDeleteTask(id, deletedById) {
    return TaskRepository.softDelete(id, deletedById);
  }

  static async restoreTask(id) {
    return TaskRepository.restore(id);
  }

  /**
   * Bulk operations.
   */
  static async bulkSoftDelete(ids, deletedById) {
    return TaskRepository.bulkSoftDelete(ids, deletedById);
  }

  static async bulkUpdateStatus(ids, status, updatedById) {
    return TaskRepository.bulkUpdateStatus(ids, status, updatedById);
  }

  static async bulkUpdatePriority(ids, priority, updatedById) {
    return TaskRepository.bulkUpdatePriority(ids, priority, updatedById);
  }

  static async bulkRestore(ids) {
    return TaskRepository.bulkRestore(ids);
  }

  /**
   * Export to CSV text buffer.
   */
  static async exportTasksCSV(user) {
    const where = { isDeleted: false };

    // Apply RBAC filters
    if (user.role !== 'ADMIN') {
      const employee = await this.getAssociatedEmployee(user.id);
      if (employee) {
        if (user.role === 'MANAGER') {
          where.project = {
            OR: [
              { managerId: employee.id },
              { departmentId: employee.departmentId }
            ]
          };
        } else if (user.role === 'EMPLOYEE') {
          where.OR = [
            { project: { members: { some: { employeeId: employee.id } } } },
            { assignees: { some: { employeeId: employee.id } } },
            { reporterId: employee.id }
          ];
        }
      } else {
        return 'Task Code,Title,Project,Priority,Status,Progress,Due Date,Assignees\n';
      }
    }

    const tasks = await TaskRepository.findAllActiveForExport({
      where,
      orderBy: { createdAt: 'desc' }
    });

    let csvContent = 'Task Code,Title,Project,Priority,Status,Progress,Due Date,Assignees\n';

    tasks.forEach((task) => {
      const code = task.taskCode.toUpperCase();
      const title = `"${task.title.replace(/"/g, '""')}"`;
      const project = `"${task.project?.name.replace(/"/g, '""')}"`;
      const priority = task.priority;
      const status = task.status;
      const progress = `${task.completionPercentage}%`;
      const dueDate = task.dueDate ? task.dueDate.toISOString().split('T')[0] : 'None';
      const assigneesList = task.assignees?.map((a) => `${a.employee?.firstName} ${a.employee?.lastName}`).join('; ') || 'None';
      const assignees = `"${assigneesList.replace(/"/g, '""')}"`;

      csvContent += `${code},${title},${project},${priority},${status},${progress},${dueDate},${assignees}\n`;
    });

    return csvContent;
  }
}
