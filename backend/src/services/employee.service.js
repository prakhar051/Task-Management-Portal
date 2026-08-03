import { EmployeeRepository } from '../repositories/employee.repository.js';
import { prisma } from '../config/db.js';

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

    return await EmployeeRepository.create(data);
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

    return await EmployeeRepository.update(id, data);
  }

  /**
   * Soft-deletes a single employee.
   */
  static async deleteEmployee(id, deletedById) {
    const employee = await EmployeeRepository.findById(id);
    if (!employee) {
      throw new Error('Employee profile not found.');
    }
    return await EmployeeRepository.softDelete(id, deletedById);
  }

  /**
   * Restores a soft-deleted employee.
   */
  static async restoreEmployee(id) {
    const employee = await EmployeeRepository.findById(id);
    if (!employee || !employee.isDeleted) {
      throw new Error('Employee profile not found or not in trash.');
    }
    return await EmployeeRepository.restore(id);
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
