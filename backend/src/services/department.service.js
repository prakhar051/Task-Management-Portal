import { DepartmentRepository } from '../repositories/department.repository.js';
import { prisma } from '../config/db.js';
import NotificationService from './notification.service.js';
import ActivityService from './activity.service.js';

export class DepartmentService {
  /**
   * List departments with search, sorting, filtering, and role scoping.
   */
  static async listDepartments({ page = 1, limit = 10, search, status, managerId, location, sortBy, sortOrder, isDeleted = 'false' }, role, currentUserId) {
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    const whereConditions = {
      isDeleted: isDeleted === 'true'
    };

    // Apply search filters (Name, Code, Location, Manager Name)
    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        {
          manager: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } }
            ]
          }
        }
      ];
    }

    if (status) {
      whereConditions.status = status;
    }
    if (managerId) {
      whereConditions.managerId = managerId;
    }
    if (location) {
      whereConditions.location = { contains: location, mode: 'insensitive' };
    }

    // RBAC Scope Adjustments:
    // EMPLOYEE can only see their own department.
    if (role === 'EMPLOYEE') {
      const employee = await prisma.employee.findUnique({ where: { userId: currentUserId } });
      if (!employee || !employee.departmentId) {
        return {
          departments: [],
          pagination: { page: parseInt(page), limit: take, total: 0, pages: 1 }
        };
      }
      whereConditions.id = employee.departmentId;
    }

    // Sort mappings
    const orderBy = {};
    if (sortBy === 'employeeCount') {
      orderBy.employees = { _count: sortOrder === 'desc' ? 'desc' : 'asc' };
    } else if (sortBy) {
      orderBy[sortBy] = sortOrder === 'desc' ? 'desc' : 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const { departments, total } = await DepartmentRepository.findAndCount({
      where: whereConditions,
      skip,
      take,
      orderBy
    });

    return {
      departments,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        pages: Math.ceil(total / take)
      }
    };
  }

  /**
   * Fetch single department record.
   */
  static async getDepartmentById(id, role, currentUserId) {
    const department = await DepartmentRepository.findById(id);
    if (!department) {
      throw new Error('Department not found.');
    }

    // RBAC Security check
    if (role === 'EMPLOYEE') {
      const employee = await prisma.employee.findUnique({ where: { userId: currentUserId } });
      if (!employee || employee.departmentId !== id) {
        throw new Error('Forbidden: You are only allowed to view details for your assigned department.');
      }
    }

    return department;
  }

  /**
   * Create new department record.
   */
  static async createDepartment(payload, creatorId) {
    // Check duplicate code
    const codeExists = await DepartmentRepository.findByCode(payload.code);
    if (codeExists) {
      throw new Error('Department code already registered.');
    }

    // Check duplicate name
    const nameExists = await DepartmentRepository.findByName(payload.name);
    if (nameExists) {
      throw new Error('Department name already registered.');
    }

    const data = {
      ...payload,
      createdById: creatorId
    };

    const department = await DepartmentRepository.create(data);

    // Log Activity
    await ActivityService.logActivity({
      userId: creatorId,
      action: 'CREATE',
      entityType: 'DEPARTMENT',
      entityId: department.id,
      description: `Department ${department.name} (${department.code}) created`,
      metadata: { before: null, after: department, changes: null }
    });

    // Notify System Creator
    await NotificationService.createNotification({
      userId: creatorId,
      title: 'Department Created',
      message: `Department ${department.name} (${department.code}) was created successfully.`,
      type: 'DEPARTMENT_CREATED',
      priority: 'LOW',
      entityType: 'DEPARTMENT',
      entityId: department.id
    });

    return department;
  }

  /**
   * Update department.
   */
  static async updateDepartment(id, payload, updatedById) {
    const department = await DepartmentRepository.findById(id);
    if (!department) {
      throw new Error('Department not found.');
    }

    if (payload.code && payload.code !== department.code) {
      const codeExists = await DepartmentRepository.findByCode(payload.code);
      if (codeExists) {
        throw new Error('Department code already registered.');
      }
    }

    if (payload.name && payload.name !== department.name) {
      const nameExists = await DepartmentRepository.findByName(payload.name);
      if (nameExists) {
        throw new Error('Department name already registered.');
      }
    }

    const data = {
      ...payload,
      updatedById
    };

    const updatedDept = await DepartmentRepository.update(id, data);

    // Log update activity
    await ActivityService.logActivity({
      userId: updatedById,
      action: 'UPDATE',
      entityType: 'DEPARTMENT',
      entityId: id,
      description: `Department ${updatedDept.name} (${updatedDept.code}) updated`,
      metadata: { before: department, after: updatedDept, changes: payload }
    });

    return updatedDept;
  }

  /**
   * Soft delete department.
   */
  static async deleteDepartment(id, deletedById) {
    const department = await DepartmentRepository.findById(id);
    if (!department) {
      throw new Error('Department not found.');
    }
    const result = await DepartmentRepository.softDelete(id, deletedById);
    await ActivityService.logActivity({
      userId: deletedById,
      action: 'DELETE',
      entityType: 'DEPARTMENT',
      entityId: id,
      description: `Department ${department.name} (${department.code}) soft deleted`,
      metadata: { before: department, after: result, changes: null }
    });
    return result;
  }

  /**
   * Restore department.
   */
  static async restoreDepartment(id) {
    const department = await prisma.department.findUnique({ where: { id } });
    if (!department || !department.isDeleted) {
      throw new Error('Department not found or not in trash.');
    }
    const result = await DepartmentRepository.restore(id);
    await ActivityService.logActivity({
      action: 'RESTORE',
      entityType: 'DEPARTMENT',
      entityId: id,
      description: `Department ${department.name} (${department.code}) restored`,
      metadata: { before: department, after: result, changes: null }
    });
    return result;
  }

  /**
   * Assign manager profile.
   */
  static async assignManager(id, managerId, updatedById) {
    const department = await DepartmentRepository.findById(id);
    if (!department) {
      throw new Error('Department not found.');
    }

    if (managerId) {
      // Validate managing employee exists
      const employee = await prisma.employee.findUnique({ where: { id: managerId } });
      if (!employee) {
        throw new Error('Manager employee profile not found.');
      }
    }

    return await DepartmentRepository.assignManager(id, managerId, updatedById);
  }

  /**
   * Fetch employees associated with this department.
   */
  static async getDepartmentEmployees(id, role, currentUserId) {
    await this.getDepartmentById(id, role, currentUserId); // Enforces RBAC check

    return prisma.employee.findMany({
      where: {
        departmentId: id,
        isDeleted: false
      },
      orderBy: { firstName: 'asc' }
    });
  }

  /**
   * Mappings Assignment of employees.
   */
  static async assignEmployees(id, employeeIds, updatedById) {
    const department = await DepartmentRepository.findById(id);
    if (!department) {
      throw new Error('Department not found.');
    }

    // Verify all employee ids exist
    const count = await prisma.employee.count({
      where: { id: { in: employeeIds }, isDeleted: false }
    });

    if (count !== employeeIds.length) {
      throw new Error('One or more employee identifiers are invalid.');
    }

    return await DepartmentRepository.assignEmployees(id, employeeIds, updatedById);
  }

  /**
   * Bulk soft-delete.
   */
  static async bulkDelete(ids, deletedById) {
    return await DepartmentRepository.bulkSoftDelete(ids, deletedById);
  }

  /**
   * Bulk status update.
   */
  static async bulkUpdateStatus(ids, status, updatedById) {
    return await DepartmentRepository.bulkUpdateStatus(ids, status, updatedById);
  }

  /**
   * Bulk restore.
   */
  static async bulkRestore(ids) {
    return await DepartmentRepository.bulkRestore(ids);
  }

  /**
   * Generate metrics statistics.
   */
  static async getStatistics() {
    const [
      totalDept,
      activeDept,
      inactiveDept,
      totalEmp,
      activeEmp,
      assignedManagerCount
    ] = await Promise.all([
      prisma.department.count({ where: { isDeleted: false } }),
      prisma.department.count({ where: { status: 'ACTIVE', isDeleted: false } }),
      prisma.department.count({ where: { status: 'INACTIVE', isDeleted: false } }),
      prisma.employee.count({ where: { isDeleted: false } }),
      prisma.employee.count({ where: { status: 'ACTIVE', isDeleted: false } }),
      prisma.department.count({ where: { managerId: { not: null }, isDeleted: false } })
    ]);

    // Find largest department
    const largestDeptResult = await prisma.department.findMany({
      where: { isDeleted: false },
      orderBy: { employees: { _count: 'desc' } },
      take: 1,
      select: { name: true, employees: { _count: true } }
    });
    const largestDepartment = largestDeptResult[0]?.name || 'None';

    // Find smallest department
    const smallestDeptResult = await prisma.department.findMany({
      where: { isDeleted: false },
      orderBy: { employees: { _count: 'asc' } },
      take: 1,
      select: { name: true, employees: { _count: true } }
    });
    const smallestDepartment = smallestDeptResult[0]?.name || 'None';

    const averageEmployees = totalDept > 0 ? (totalEmp / totalDept).toFixed(1) : '0';
    const noManagerCount = totalDept - assignedManagerCount;

    return {
      totalDepartments: totalDept,
      activeDepartments: activeDept,
      inactiveDepartments: inactiveDept,
      totalEmployees: totalEmp,
      activeEmployees: activeEmp,
      largestDepartment,
      smallestDepartment,
      averageEmployeesPerDepartment: averageEmployees,
      managerAssigned: assignedManagerCount,
      departmentsWithoutManagers: noManagerCount,
      openPositions: 15 // Placeholder target count
    };
  }

  /**
   * Export to CSV text buffer.
   */
  static async exportToCSV(filters, role, currentUserId) {
    await ActivityService.logActivity({
      userId: currentUserId,
      action: 'EXPORT',
      entityType: 'DEPARTMENT',
      entityId: 'all',
      description: 'Exported departments list to CSV'
    });

    const whereConditions = {
      isDeleted: false
    };

    if (filters.status) {
      whereConditions.status = filters.status;
    }
    if (filters.location) {
      whereConditions.location = { contains: filters.location, mode: 'insensitive' };
    }

    if (role === 'EMPLOYEE') {
      const employee = await prisma.employee.findUnique({ where: { userId: currentUserId } });
      if (!employee || !employee.departmentId) {
        return 'Department Name,Code,Manager,Employees Count,Status,Location,Created Date\n';
      }
      whereConditions.id = employee.departmentId;
    }

    const depts = await DepartmentRepository.findAllActiveForExport({
      where: whereConditions,
      orderBy: { createdAt: 'desc' }
    });

    let csvContent = 'Department Name,Code,Manager,Employees Count,Status,Location,Created Date\n';
    depts.forEach((d) => {
      const managerName = d.manager ? `"${d.manager.firstName} ${d.manager.lastName}"` : 'None';
      const formattedDate = d.createdAt ? new Date(d.createdAt).toISOString().split('T')[0] : '';
      csvContent += `"${d.name}","${d.code}",${managerName},"${d._count.employees}","${d.status}","${d.location}","${formattedDate}"\n`;
    });

    return csvContent;
  }
}
