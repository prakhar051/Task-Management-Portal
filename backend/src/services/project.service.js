import { ProjectRepository } from '../repositories/project.repository.js';
import { prisma } from '../config/db.js';
import NotificationService from './notification.service.js';
import ActivityService from './activity.service.js';

export class ProjectService {
  /**
   * Helper method to get the employee associated with a user.
   */
  static async getAssociatedEmployee(userId) {
    return prisma.employee.findFirst({
      where: { userId, isDeleted: false }
    });
  }

  /**
   * List projects with pagination, filters, sorting, and debounced search.
   * Scopes queries by RBAC permissions.
   */
  static async listProjects({
    page = 1,
    limit = 10,
    search = '',
    status = '',
    priority = '',
    departmentId = '',
    managerId = '',
    isDeleted = 'false',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    user
  }) {
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    // Setup base where conditions
    const where = {
      isDeleted: isDeleted === 'true'
    };

    // Apply role-based filters (RBAC)
    if (user.role !== 'ADMIN') {
      const employee = await this.getAssociatedEmployee(user.id);
      if (!employee) {
        // Non-admin users without an employee profile have no project scopes
        return {
          projects: [],
          pagination: { page: parseInt(page), limit: take, total: 0, pages: 0 }
        };
      }

      if (user.role === 'MANAGER') {
        // MANAGER can view: projects they manage OR projects in their department
        where.OR = [
          { managerId: employee.id },
          { departmentId: employee.departmentId }
        ];
      } else if (user.role === 'EMPLOYEE') {
        // EMPLOYEE can view: only projects they are members of
        where.members = {
          some: {
            employeeId: employee.id
          }
        };
      }
    }

    // Apply basic filter criteria
    if (status) {
      where.status = status;
    }
    if (priority) {
      where.priority = priority;
    }
    if (departmentId) {
      where.departmentId = departmentId;
    }
    if (managerId) {
      where.managerId = managerId;
    }

    // Apply search query criteria (case-insensitive)
    if (search) {
      const searchLower = search.toLowerCase();
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { code: { contains: search, mode: 'insensitive' } },
            {
              manager: {
                OR: [
                  { firstName: { contains: search, mode: 'insensitive' } },
                  { lastName: { contains: search, mode: 'insensitive' } }
                ]
              }
            },
            {
              department: {
                name: { contains: search, mode: 'insensitive' }
              }
            }
          ]
        }
      ];
    }

    // Setup sorting criteria
    let orderBy = { [sortBy]: sortOrder };
    if (sortBy === 'name') {
      orderBy = { name: sortOrder };
    } else if (sortBy === 'progress') {
      orderBy = { progress: sortOrder };
    } else if (sortBy === 'startDate') {
      orderBy = { startDate: sortOrder };
    } else if (sortBy === 'endDate') {
      orderBy = { endDate: sortOrder };
    }

    const { projects, total } = await ProjectRepository.findAndCount({
      where,
      skip,
      take,
      orderBy
    });

    const pages = Math.ceil(total / take);

    return {
      projects,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        pages
      }
    };
  }

  /**
   * Fetch project details with RBAC authorization check.
   */
  static async getProjectById(id, user) {
    const project = await ProjectRepository.findById(id);
    if (!project) {
      throw new Error('Project not found.');
    }

    // Check permissions
    if (user.role !== 'ADMIN') {
      const employee = await this.getAssociatedEmployee(user.id);
      if (!employee) {
        throw new Error('Unauthorized. Employee profile required.');
      }

      if (user.role === 'MANAGER') {
        const isManager = project.managerId === employee.id;
        const isSameDept = project.departmentId === employee.departmentId;
        if (!isManager && !isSameDept) {
          throw new Error('Unauthorized. You can only view projects in your department or assigned to you.');
        }
      } else if (user.role === 'EMPLOYEE') {
        const isMember = project.members.some((m) => m.employeeId === employee.id);
        if (!isMember) {
          throw new Error('Unauthorized. You can only view projects you are assigned to.');
        }
      }
    }

    return project;
  }

  /**
   * Create a new project.
   */
  static async createProject(data, createdById) {
    // 1. Verify code uniqueness
    const codeDup = await ProjectRepository.findByCode(data.code);
    if (codeDup) {
      throw new Error(`Project code "${data.code}" already exists.`);
    }

    // 2. Dates timeline checks
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (start > end) {
      throw new Error('Project start date cannot exceed its end date.');
    }

    // 3. Business rule progress default for Completed
    let progress = data.progress ?? 0;
    if (data.status === 'COMPLETED' && progress !== 100) {
      progress = 100;
    }

    const project = await ProjectRepository.create({
      ...data,
      progress,
      createdById
    });

    // Log Activity
    await ActivityService.logActivity({
      userId: createdById,
      action: 'CREATE',
      entityType: 'PROJECT',
      entityId: project.id,
      description: `Project ${project.name} (${project.code}) created`,
      metadata: { before: null, after: project, changes: null }
    });

    // Notify Project Manager
    if (project.managerId) {
      const managerEmp = await prisma.employee.findUnique({ where: { id: project.managerId } });
      if (managerEmp && managerEmp.userId) {
        await NotificationService.createNotification({
          userId: managerEmp.userId,
          title: 'Assigned as Project Manager',
          message: `You have been assigned as the Project Manager for project ${project.name} (${project.code}).`,
          type: 'PROJECT_CREATED',
          priority: 'HIGH',
          entityType: 'PROJECT',
          entityId: project.id
        });
      }
    }

    return project;
  }

  /**
   * Update project details.
   */
  static async updateProject(id, data, updatedById, user) {
    const project = await ProjectRepository.findById(id);
    if (!project) {
      throw new Error('Project not found.');
    }

    // Check authorization: only ADMIN can perform normal edits
    if (user.role !== 'ADMIN') {
      throw new Error('Unauthorized. Only administrators can edit projects.');
    }

    // Verify code modifications
    if (data.code && data.code !== project.code) {
      const codeDup = await ProjectRepository.findByCode(data.code);
      if (codeDup) {
        throw new Error(`Project code "${data.code}" already exists.`);
      }
    }

    // Verify dates
    const start = new Date(data.startDate || project.startDate);
    const end = new Date(data.endDate || project.endDate);
    if (start > end) {
      throw new Error('Project start date cannot exceed its end date.');
    }

    // Check status vs progress business rule
    let progress = data.progress;
    if (data.status === 'COMPLETED' && progress !== 100) {
      progress = 100;
    }

    const updatedProj = await ProjectRepository.update(id, {
      ...data,
      ...(progress !== undefined && { progress }),
      updatedById
    });

    // Log update activity
    await ActivityService.logActivity({
      userId: updatedById,
      action: 'UPDATE',
      entityType: 'PROJECT',
      entityId: id,
      description: `Project ${updatedProj.name} (${updatedProj.code}) updated`,
      metadata: { before: project, after: updatedProj, changes: data }
    });

    // Notify Project Manager
    if (updatedProj.managerId) {
      const managerEmp = await prisma.employee.findUnique({ where: { id: updatedProj.managerId } });
      if (managerEmp && managerEmp.userId) {
        await NotificationService.createNotification({
          userId: managerEmp.userId,
          title: 'Project Details Updated',
          message: `The details for project ${updatedProj.name} (${updatedProj.code}) have been updated.`,
          type: 'PROJECT_UPDATED',
          priority: 'MEDIUM',
          entityType: 'PROJECT',
          entityId: id
        });
      }
    }

    return updatedProj;
  }

  /**
   * Soft delete a project.
   */
  static async softDeleteProject(id, deletedById) {
    const project = await ProjectRepository.findById(id);
    if (!project) {
      throw new Error('Project not found.');
    }
    const result = await ProjectRepository.softDelete(id, deletedById);
    await ActivityService.logActivity({
      userId: deletedById,
      action: 'DELETE',
      entityType: 'PROJECT',
      entityId: id,
      description: `Project ${project.name} (${project.code}) soft deleted`,
      metadata: { before: project, after: result, changes: null }
    });
    return result;
  }

  /**
   * Restore a soft-deleted project.
   */
  static async restoreProject(id) {
    const project = await ProjectRepository.findById(id);
    if (!project) {
      throw new Error('Project not found.');
    }
    const result = await ProjectRepository.restore(id);
    await ActivityService.logActivity({
      action: 'RESTORE',
      entityType: 'PROJECT',
      entityId: id,
      description: `Project ${project.name} (${project.code}) restored`,
      metadata: { before: project, after: result, changes: null }
    });
    return result;
  }

  /**
   * Assign manager.
   */
  static async assignManager(id, managerId, updatedById) {
    const project = await ProjectRepository.findById(id);
    if (!project) {
      throw new Error('Project not found.');
    }

    if (managerId) {
      const employee = await prisma.employee.findUnique({
        where: { id: managerId, isDeleted: false }
      });
      if (!employee) {
        throw new Error('Selected employee manager profile does not exist or is deleted.');
      }
    }

    const result = await ProjectRepository.assignManager(id, managerId, updatedById);

    // Log Activity
    await ActivityService.logActivity({
      userId: updatedById,
      action: 'ASSIGN',
      entityType: 'PROJECT',
      entityId: id,
      description: `Project manager updated for project ${project.name} (${project.code})`,
      metadata: { before: project.managerId, after: managerId, changes: { managerId } }
    });

    // Notify Manager
    if (managerId) {
      const managerEmp = await prisma.employee.findUnique({ where: { id: managerId } });
      if (managerEmp && managerEmp.userId) {
        await NotificationService.createNotification({
          userId: managerEmp.userId,
          title: 'Assigned as Project Manager',
          message: `You have been assigned as the Project Manager for project ${project.name} (${project.code}).`,
          type: 'PROJECT_CREATED',
          priority: 'HIGH',
          entityType: 'PROJECT',
          entityId: id
        });
      }
    }

    return result;
  }

  /**
   * Assign members.
   */
  static async assignMembers(id, members, updatedById) {
    const project = await ProjectRepository.findById(id);
    if (!project) {
      throw new Error('Project not found.');
    }

    const result = await ProjectRepository.assignMembers(id, members, updatedById);

    // Log Activity
    await ActivityService.logActivity({
      userId: updatedById,
      action: 'ASSIGN',
      entityType: 'PROJECT',
      entityId: id,
      description: `Project members list updated for project ${project.name} (${project.code})`,
      metadata: { before: project.members, after: members, changes: { members } }
    });

    // Notify newly assigned members
    const employeeIds = members.map((m) => m.employeeId);
    const employees = await prisma.employee.findMany({
      where: { id: { in: employeeIds } },
      select: { id: true, userId: true, firstName: true }
    });

    for (const emp of employees) {
      const wasMember = project.members?.some((m) => m.employeeId === emp.id);
      if (!wasMember && emp.userId) {
        await NotificationService.createNotification({
          userId: emp.userId,
          title: 'Assigned to Project',
          message: `You have been added as a member of project ${project.name} (${project.code}).`,
          type: 'PROJECT_UPDATED',
          priority: 'MEDIUM',
          entityType: 'PROJECT',
          entityId: id
        });
      }
    }

    return result;
  }

  /**
   * Get members list.
   */
  static async getProjectMembers(id) {
    const project = await ProjectRepository.findById(id);
    if (!project) {
      throw new Error('Project not found.');
    }
    return ProjectRepository.getMembers(id);
  }

  /**
   * Get project-specific statistics (progress, days remaining, member headcount).
   */
  static async getProjectSpecificStatistics(id) {
    const project = await ProjectRepository.findById(id);
    if (!project) {
      throw new Error('Project not found.');
    }

    const now = new Date();
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
    
    const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
    const elapsedDays = Math.max(0, Math.ceil((now.getTime() - start.getTime()) / (1000 * 3600 * 24)));
    const daysRemaining = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 3600 * 24)));

    const isOverdue = now > end && project.status !== 'COMPLETED' && project.status !== 'CANCELLED';

    return {
      projectId: project.id,
      name: project.name,
      code: project.code,
      progress: project.progress,
      status: project.status,
      memberCount: project._count?.members || 0,
      totalDurationDays: totalDays,
      elapsedDays,
      daysRemaining,
      isOverdue
    };
  }

  /**
   * Get overall global statistics.
   */
  static async getGlobalStatistics() {
    const now = new Date();
    const endingThreshold = new Date(now.getTime() + 7 * 24 * 3600 * 1000);

    // Queries counts using aggregates
    const [
      totalProjects,
      activeProjects,
      completedProjects,
      onHoldProjects,
      cancelledProjects,
      overdueProjects,
      endingSoonProjects,
      progressAgg,
      totalMembers,
      allActiveProjects
    ] = await Promise.all([
      prisma.project.count({ where: { isDeleted: false } }),
      prisma.project.count({ where: { status: 'ACTIVE', isDeleted: false } }),
      prisma.project.count({ where: { status: 'COMPLETED', isDeleted: false } }),
      prisma.project.count({ where: { status: 'ON_HOLD', isDeleted: false } }),
      prisma.project.count({ where: { status: 'CANCELLED', isDeleted: false } }),
      prisma.project.count({
        where: {
          status: { in: ['ACTIVE', 'PLANNING', 'ON_HOLD'] },
          endDate: { lt: now },
          isDeleted: false
        }
      }),
      prisma.project.count({
        where: {
          status: { in: ['ACTIVE', 'PLANNING', 'ON_HOLD'] },
          endDate: { gte: now, lte: endingThreshold },
          isDeleted: false
        }
      }),
      prisma.project.aggregate({
        _avg: { progress: true },
        where: { isDeleted: false }
      }),
      prisma.projectMember.count(),
      prisma.project.findMany({
        where: { isDeleted: false },
        select: { startDate: true, endDate: true }
      })
    ]);

    // Average duration in days calculation
    let averageDurationDays = 0;
    if (allActiveProjects.length > 0) {
      const totalDurationsMs = allActiveProjects.reduce((acc, proj) => {
        const start = new Date(proj.startDate).getTime();
        const end = new Date(proj.endDate).getTime();
        return acc + (end - start);
      }, 0);
      const avgMs = totalDurationsMs / allActiveProjects.length;
      averageDurationDays = Math.round(avgMs / (1000 * 3600 * 24));
    }

    // Grouping status distributions
    const statusGroups = await prisma.project.groupBy({
      by: ['status'],
      _count: { id: true },
      where: { isDeleted: false }
    });

    const statusDistribution = statusGroups.reduce((acc, curr) => {
      acc[curr.status] = curr._count.id;
      return acc;
    }, { PLANNING: 0, ACTIVE: 0, ON_HOLD: 0, COMPLETED: 0, CANCELLED: 0 });

    // Grouping departments distributions
    const departmentGroups = await prisma.project.groupBy({
      by: ['departmentId'],
      _count: { id: true },
      where: { isDeleted: false }
    });

    // Fetch department names to map distributions
    const departments = await prisma.department.findMany({
      where: { id: { in: departmentGroups.map((d) => d.departmentId) } },
      select: { id: true, name: true }
    });

    const departmentDistribution = departmentGroups.reduce((acc, curr) => {
      const dept = departments.find((d) => d.id === curr.departmentId);
      const name = dept ? dept.name : 'Unknown';
      acc[name] = curr._count.id;
      return acc;
    }, {});

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      onHoldProjects,
      cancelledProjects,
      overdueProjects,
      endingWithin7Days: endingSoonProjects,
      averageProgress: Math.round(progressAgg._avg.progress || 0),
      averageDuration: averageDurationDays,
      totalMembers,
      departmentDistribution,
      statusDistribution
    };
  }

  /**
   * Bulk soft delete.
   */
  static async bulkSoftDelete(ids, deletedById) {
    return ProjectRepository.bulkSoftDelete(ids, deletedById);
  }

  /**
   * Bulk status update.
   */
  static async bulkUpdateStatus(ids, status, updatedById) {
    return ProjectRepository.bulkUpdateStatus(ids, status, updatedById);
  }

  /**
   * Bulk restore.
   */
  static async bulkRestore(ids) {
    return ProjectRepository.bulkRestore(ids);
  }

  /**
   * Export project list to CSV buffer stream.
   */
  static async exportProjectsCSV(user) {
    await ActivityService.logActivity({
      userId: user.id,
      action: 'EXPORT',
      entityType: 'PROJECT',
      entityId: 'all',
      description: 'Exported projects roster list to CSV'
    });

    const where = { isDeleted: false };

    // Apply same RBAC filter as listing projects
    if (user.role !== 'ADMIN') {
      const employee = await this.getAssociatedEmployee(user.id);
      if (employee) {
        if (user.role === 'MANAGER') {
          where.OR = [
            { managerId: employee.id },
            { departmentId: employee.departmentId }
          ];
        } else if (user.role === 'EMPLOYEE') {
          where.members = { some: { employeeId: employee.id } };
        }
      } else {
        return 'Project Code,Name,Department,Manager,Status,Priority,Progress,Start Date,End Date,Budget\n';
      }
    }

    const projects = await ProjectRepository.findAllActiveForExport({
      where,
      orderBy: { createdAt: 'desc' }
    });

    let csvContent = 'Project Code,Name,Department,Manager,Status,Priority,Progress,Start Date,End Date,Budget\n';

    projects.forEach((proj) => {
      const code = proj.code.toUpperCase();
      const name = `"${proj.name.replace(/"/g, '""')}"`;
      const deptName = proj.department ? `"${proj.department.name.replace(/"/g, '""')}"` : 'None';
      const managerName = proj.manager ? `"${proj.manager.firstName} ${proj.manager.lastName}"` : 'Unassigned';
      const status = proj.status;
      const priority = proj.priority;
      const progress = `${proj.progress}%`;
      const start = proj.startDate.toISOString().split('T')[0];
      const end = proj.endDate.toISOString().split('T')[0];
      const budget = proj.budget ? proj.budget.toFixed(2) : '0.00';

      csvContent += `${code},${name},${deptName},${managerName},${status},${priority},${progress},${start},${end},${budget}\n`;
    });

    return csvContent;
  }
}
