import { EmployeeRepository } from '../repositories/employee.repository.js';
import { prisma } from '../config/db.js';
import NotificationService from './notification.service.js';
import ActivityService from './activity.service.js';

export class EmployeeService {
  /**
   * Generates a unique employee code format (EMP-YYYY-NNNN)
   */
  static async generateEmployeeCode() {
    const year = new Date().getFullYear();
    const count = await prisma.employee.count();
    const sequence = String(count + 1).padStart(4, '0');
    let code = `EMP-${year}-${sequence}`;

    // Verify code uniqueness (collision checks)
    let exists = await EmployeeRepository.findByCode(code);
    while (exists) {
      const randomId = Math.floor(1000 + Math.random() * 9000);
      code = `EMP-${year}-${randomId}`;
      exists = await EmployeeRepository.findByCode(code);
    }
    return code;
  }

  /**
   * Retrieves a paginated list of employees with search and filters, honoring RBAC rules.
   */
  static async listEmployees({ page = 1, limit = 10, search, status, designation, managerId, isDeleted = 'false', sortBy, sortOrder }, role, currentUserId) {
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    // Build query criteria
    const whereConditions = {
      isDeleted: isDeleted === 'true'
    };

    // Apply search matches (Name, Email, Employee Code, Phone, Designation)
    if (search) {
      whereConditions.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeCode: { contains: search, mode: 'insensitive' } },
        { designation: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Apply status and designation filters
    if (status) {
      whereConditions.status = status;
    }
    if (designation) {
      whereConditions.designation = designation;
    }
    if (managerId) {
      whereConditions.managerId = managerId;
    }

    // RBAC Filter Scope adjustments:
    // ADMIN sees all records.
    // MANAGER sees only team members.
    if (role === 'MANAGER') {
      whereConditions.managerId = currentUserId;
    }

    // Sorting parameters
    const orderBy = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder === 'desc' ? 'desc' : 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const { employees, total } = await EmployeeRepository.findAndCount({
      where: whereConditions,
      skip,
      take,
      orderBy
    });

    return {
      employees,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        pages: Math.ceil(total / take)
      }
    };
  }

  /**
   * Fetch an employee by primary UUID, enforcing RBAC scope access.
   */
  static async getEmployeeById(id, role, currentUserId) {
    const employee = await EmployeeRepository.findById(id);
    if (!employee) {
      throw new Error('Employee profile not found.');
    }

    // RBAC Security Boundary:
    // Employees can only fetch their own profile card
    if (role === 'EMPLOYEE' && employee.userId !== currentUserId) {
      throw new Error('Forbidden: You are only allowed to access your own employee profile.');
    }

    return employee;
  }

  /**
   * Creates an employee profile, checking for duplicate emails/codes.
   */
  static async createEmployee(payload, creatorId) {
    // Check if email already registered
    const emailExists = await EmployeeRepository.findByEmail(payload.email);
    if (emailExists) {
      throw new Error('Email address already registered.');
    }

    // Autocomplete code if not provided
    if (!payload.employeeCode) {
      payload.employeeCode = await this.generateEmployeeCode();
    } else {
      const codeExists = await EmployeeRepository.findByCode(payload.employeeCode);
      if (codeExists) {
        throw new Error('Employee Code already registered.');
      }
    }

    const hireDate = new Date(payload.hireDate);
    if (isNaN(hireDate.getTime())) {
      throw new Error('Invalid hire date format.');
    }

    const data = {
      ...payload,
      hireDate,
      createdById: creatorId
    };

    const employee = await EmployeeRepository.create(data);

    // Log Creation Activity
    await ActivityService.logActivity({
      userId: creatorId,
      action: 'CREATE',
      entityType: 'EMPLOYEE',
      entityId: employee.id,
      description: `Employee profile ${employee.employeeCode} (${employee.firstName} ${employee.lastName}) created`,
      metadata: { before: null, after: employee, changes: null }
    });

    // Notify Employee if their user account mapping is present
    if (employee.userId) {
      await NotificationService.createNotification({
        userId: employee.userId,
        title: 'Profile Created',
        message: `Welcome to the team, ${employee.firstName}! Your employee profile has been created.`,
        type: 'EMPLOYEE_CREATED',
        priority: 'MEDIUM',
        entityType: 'EMPLOYEE',
        entityId: employee.id
      });
    }

    try {
      const AutomationService = (await import('./automation.service.js')).default;
      await AutomationService.trigger('EMPLOYEE_JOINED', employee);
    } catch (err) {
      console.error('Automation check failed inside employee creation workflow:', err);
    }

    return employee;
  }

  /**
   * Updates an employee profile.
   */
  static async updateEmployee(id, payload, role, currentUserId) {
    const employee = await this.getEmployeeById(id, role, currentUserId);

    // Employees can only update their own profile card
    if (role === 'EMPLOYEE' && employee.userId !== currentUserId) {
      throw new Error('Forbidden: You are only allowed to modify your own employee profile.');
    }

    // Check duplicate email on changes
    if (payload.email && payload.email !== employee.email) {
      const emailExists = await EmployeeRepository.findByEmail(payload.email);
      if (emailExists) {
        throw new Error('Email address already registered.');
      }
    }

    // Check duplicate code on changes
    if (payload.employeeCode && payload.employeeCode !== employee.employeeCode) {
      const codeExists = await EmployeeRepository.findByCode(payload.employeeCode);
      if (codeExists) {
        throw new Error('Employee Code already registered.');
      }
    }

    if (payload.hireDate) {
      payload.hireDate = new Date(payload.hireDate);
    }

    const data = {
      ...payload,
      updatedById: currentUserId
    };

    const updatedEmployee = await EmployeeRepository.update(id, data);

    // Log update activity
    await ActivityService.logActivity({
      userId: currentUserId,
      action: 'UPDATE',
      entityType: 'EMPLOYEE',
      entityId: id,
      description: `Employee profile ${updatedEmployee.employeeCode} updated`,
      metadata: { before: employee, after: updatedEmployee, changes: payload }
    });

    // Log status change if applicable
    if (payload.status && payload.status !== employee.status) {
      await ActivityService.logActivity({
        userId: currentUserId,
        action: 'STATUS_CHANGE',
        entityType: 'EMPLOYEE',
        entityId: id,
        description: `Employee ${updatedEmployee.employeeCode} status changed from ${employee.status} to ${updatedEmployee.status}`,
        metadata: { before: employee.status, after: updatedEmployee.status, changes: null }
      });
    }

    return updatedEmployee;
  }

  /**
   * Soft-deletes a single employee.
   */
  static async deleteEmployee(id, deletedById) {
    const employee = await EmployeeRepository.findById(id);
    if (!employee) {
      throw new Error('Employee profile not found.');
    }
    const result = await EmployeeRepository.softDelete(id, deletedById);
    await ActivityService.logActivity({
      userId: deletedById,
      action: 'DELETE',
      entityType: 'EMPLOYEE',
      entityId: id,
      description: `Employee profile ${employee.employeeCode} soft deleted`,
      metadata: { before: employee, after: result, changes: null }
    });
    return result;
  }

  /**
   * Restores a soft-deleted employee.
   */
  static async restoreEmployee(id) {
    const employee = await EmployeeRepository.findById(id);
    if (!employee || !employee.isDeleted) {
      throw new Error('Employee profile not found or not in trash.');
    }
    const result = await EmployeeRepository.restore(id);
    await ActivityService.logActivity({
      action: 'RESTORE',
      entityType: 'EMPLOYEE',
      entityId: id,
      description: `Employee profile ${employee.employeeCode} restored`,
      metadata: { before: employee, after: result, changes: null }
    });
    return result;
  }

  /**
   * Bulk soft-deletes a list of employees.
   */
  static async bulkDelete(ids, deletedById) {
    return await EmployeeRepository.bulkSoftDelete(ids, deletedById);
  }

  /**
   * Bulk updates the status of multiple employees.
   */
  static async bulkUpdateStatus(ids, status, updatedById) {
    return await EmployeeRepository.bulkUpdateStatus(ids, status, updatedById);
  }

  /**
   * Bulk restores a list of soft-deleted employees.
   */
  static async bulkRestore(ids) {
    return await EmployeeRepository.bulkRestore(ids);
  }

  /**
   * Generates a CSV export buffer string based on filters.
   */
  static async exportToCSV(filters, role, currentUserId) {
    await ActivityService.logActivity({
      userId: currentUserId,
      action: 'EXPORT',
      entityType: 'EMPLOYEE',
      entityId: 'all',
      description: 'Exported employees roster list to CSV'
    });

    const whereConditions = {
      isDeleted: false
    };

    if (role === 'MANAGER') {
      whereConditions.managerId = currentUserId;
    }

    if (filters.status) {
      whereConditions.status = filters.status;
    }

    if (filters.designation) {
      whereConditions.designation = filters.designation;
    }

    const employees = await EmployeeRepository.findAllActiveForExport({
      where: whereConditions,
      orderBy: { createdAt: 'desc' }
    });

    let csvContent = 'Employee Code,First Name,Last Name,Email,Phone,Designation,Status,Hire Date\n';
    employees.forEach((emp) => {
      const formattedDate = emp.hireDate ? new Date(emp.hireDate).toISOString().split('T')[0] : '';
      csvContent += `"${emp.employeeCode}","${emp.firstName}","${emp.lastName}","${emp.email}","${emp.phone}","${emp.designation}","${emp.status}","${formattedDate}"\n`;
    });

    return csvContent;
  }
}
