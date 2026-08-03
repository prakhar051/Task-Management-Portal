import { prisma } from '../config/db.js';

export class TaskRepository {
  /**
   * Fetch a paginated list of tasks along with total count and relational metrics.
   */
  static async findAndCount({ where, skip, take, orderBy }) {
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          project: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          reporter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          assignees: {
            include: {
              employee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatar: true
                }
              }
            }
          },
          labels: {
            select: {
              id: true,
              name: true,
              color: true
            }
          }
        }
      }),
      prisma.task.count({ where })
    ]);
    return { tasks, total };
  }

  /**
   * Find task by primary UUID.
   */
  static async findById(id) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            code: true,
            status: true
          }
        },
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        parentTask: {
          select: {
            id: true,
            title: true,
            taskCode: true
          }
        },
        subTasks: {
          where: { isDeleted: false },
          select: {
            id: true,
            title: true,
            taskCode: true,
            status: true,
            priority: true
          }
        },
        assignees: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
                designation: true
              }
            }
          }
        },
        labels: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        dependencies: {
          include: {
            dependsOnTask: {
              select: {
                id: true,
                title: true,
                taskCode: true,
                status: true
              }
            }
          }
        },
        blockedTasks: {
          include: {
            task: {
              select: {
                id: true,
                title: true,
                taskCode: true,
                status: true
              }
            }
          }
        }
      }
    });
  }

  /**
   * Find task by code.
   */
  static async findByCode(taskCode) {
    return prisma.task.findUnique({
      where: { taskCode }
    });
  }

  /**
   * Create task.
   */
  static async create(data) {
    return prisma.task.create({
      data
    });
  }

  /**
   * Update task metadata.
   */
  static async update(id, data) {
    return prisma.task.update({
      where: { id },
      data
    });
  }

  /**
   * Soft delete task.
   */
  static async softDelete(id, deletedById) {
    return prisma.$transaction(async (tx) => {
      const task = await tx.task.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedById
        }
      });

      // Clear assignees
      await tx.taskAssignee.deleteMany({ where: { taskId: id } });
      // Clear dependency references
      await tx.taskDependency.deleteMany({
        where: {
          OR: [
            { taskId: id },
            { dependsOnTaskId: id }
          ]
        }
      });

      return task;
    });
  }

  /**
   * Restore task.
   */
  static async restore(id) {
    return prisma.task.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
        deletedById: null
      }
    });
  }

  /**
   * Assign assignees.
   */
  static async assignAssignees(id, employeeIds) {
    return prisma.$transaction(async (tx) => {
      // 1. Verify project state
      const task = await tx.task.findUnique({
        where: { id },
        include: {
          project: {
            select: { status: true }
          }
        }
      });
      if (!task) {
        throw new Error('Task not found.');
      }
      if (task.project.status === 'CANCELLED') {
        throw new Error('Cancelled projects/tasks cannot receive new assignees.');
      }

      // 2. Validate employees existence
      const count = await tx.employee.count({
        where: { id: { in: employeeIds }, isDeleted: false }
      });
      if (count !== employeeIds.length) {
        throw new Error('One or more selected employee profiles are invalid or deleted.');
      }

      // 3. Clear previous assignees
      await tx.taskAssignee.deleteMany({ where: { taskId: id } });

      // 4. Bulk create mappings
      await tx.taskAssignee.createMany({
        data: employeeIds.map((empId) => ({
          taskId: id,
          employeeId: empId
        }))
      });

      return await tx.task.findUnique({
        where: { id },
        include: {
          assignees: {
            include: { employee: true }
          }
        }
      });
    });
  }

  /**
   * Sync dependencies.
   */
  static async updateDependencies(id, dependsOnTaskIds) {
    return prisma.$transaction(async (tx) => {
      // 1. Verify blocker targets are not deleted
      const activeCount = await tx.task.count({
        where: { id: { in: dependsOnTaskIds }, isDeleted: false }
      });
      if (activeCount !== dependsOnTaskIds.length) {
        throw new Error('One or more blocker target tasks are deleted or do not exist.');
      }

      // 2. Clear old dependencies
      await tx.taskDependency.deleteMany({ where: { taskId: id } });

      // 3. Bulk insert dependency relationships
      await tx.taskDependency.createMany({
        data: dependsOnTaskIds.map((blockerId) => ({
          taskId: id,
          dependsOnTaskId: blockerId
        }))
      });

      return await tx.task.findUnique({
        where: { id },
        include: {
          dependencies: true
        }
      });
    });
  }

  /**
   * Comments CRUD.
   */
  static async createComment(taskId, employeeId, comment) {
    return prisma.taskComment.create({
      data: {
        taskId,
        employeeId,
        comment
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });
  }

  static async updateComment(commentId, comment, employeeId) {
    const commentRecord = await prisma.taskComment.findUnique({ where: { id: commentId } });
    if (!commentRecord) {
      throw new Error('Comment not found.');
    }
    if (commentRecord.employeeId !== employeeId) {
      throw new Error('Unauthorized. You can only edit your own comments.');
    }

    return prisma.taskComment.update({
      where: { id: commentId },
      data: { comment },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });
  }

  static async deleteComment(commentId, employeeId) {
    const commentRecord = await prisma.taskComment.findUnique({ where: { id: commentId } });
    if (!commentRecord) {
      throw new Error('Comment not found.');
    }
    // Only comment owner or admin can soft delete comments
    if (commentRecord.employeeId !== employeeId) {
      const user = await prisma.employee.findUnique({
        where: { id: employeeId },
        include: { user: true }
      });
      if (user?.user?.role !== 'ADMIN') {
        throw new Error('Unauthorized. You can only delete your own comments.');
      }
    }

    return prisma.taskComment.update({
      where: { id: commentId },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });
  }

  static async getComments(taskId) {
    return prisma.taskComment.findMany({
      where: { taskId, isDeleted: false },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Attachments.
   */
  static async createAttachment(taskId, fileName, filePath, fileType, uploadedById) {
    return prisma.taskAttachment.create({
      data: {
        taskId,
        fileName,
        filePath,
        fileType,
        uploadedById
      }
    });
  }

  static async deleteAttachment(attachmentId, employeeId) {
    const attachment = await prisma.taskAttachment.findUnique({ where: { id: attachmentId } });
    if (!attachment) {
      throw new Error('Attachment not found.');
    }

    return prisma.taskAttachment.delete({
      where: { id: attachmentId }
    });
  }

  static async getAttachments(taskId) {
    return prisma.taskAttachment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Bulk operations.
   */
  static async bulkSoftDelete(ids, deletedById) {
    return prisma.$transaction(async (tx) => {
      await tx.task.updateMany({
        where: { id: { in: ids } },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedById
        }
      });

      await tx.taskAssignee.deleteMany({
        where: { taskId: { in: ids } }
      });

      await tx.taskDependency.deleteMany({
        where: {
          OR: [
            { taskId: { in: ids } },
            { dependsOnTaskId: { in: ids } }
          ]
        }
      });
    });
  }

  static async bulkUpdateStatus(ids, status, updatedById) {
    return prisma.task.updateMany({
      where: { id: { in: ids } },
      data: {
        status,
        updatedById
      }
    });
  }

  static async bulkUpdatePriority(ids, priority, updatedById) {
    return prisma.task.updateMany({
      where: { id: { in: ids } },
      data: {
        priority,
        updatedById
      }
    });
  }

  static async bulkRestore(ids) {
    return prisma.task.updateMany({
      where: { id: { in: ids } },
      data: {
        isDeleted: false,
        deletedAt: null,
        deletedById: null
      }
    });
  }

  /**
   * Find all tasks for export.
   */
  static async findAllActiveForExport({ where, orderBy }) {
    return prisma.task.findMany({
      where,
      orderBy,
      include: {
        project: {
          select: {
            name: true
          }
        },
        reporter: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        assignees: {
          include: {
            employee: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });
  }
}
