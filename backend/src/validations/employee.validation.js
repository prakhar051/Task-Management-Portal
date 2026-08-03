import { z } from 'zod';

const EmployeeStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE']);

export const createEmployeeSchema = z.object({
  firstName: z.string().trim().min(2, 'First name must be at least 2 characters long.'),
  lastName: z.string().trim().min(2, 'Last name must be at least 2 characters long.'),
  email: z.string().trim().email('Invalid email address format.'),
  phone: z.string().trim().min(10, 'Phone number must be at least 10 digits long.').max(15, 'Phone number too long.'),
  designation: z.string().trim().min(2, 'Designation title must be at least 2 characters long.'),
  departmentId: z.string().uuid().nullable().optional(),
  managerId: z.string().uuid().nullable().optional(),
  hireDate: z.string().datetime('Hire date must be a valid ISO-8601 date string.'),
  status: EmployeeStatusEnum.default('ACTIVE'),
  employeeCode: z.string().trim().min(3, 'Employee code must be at least 3 characters.').optional()
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export const bulkStatusSchema = z.object({
  ids: z.array(z.string().uuid('Invalid UUID elements in list.')).min(1, 'Target ID list cannot be empty.'),
  status: EmployeeStatusEnum
});

export const bulkActionSchema = z.object({
  ids: z.array(z.string().uuid('Invalid UUID elements in list.')).min(1, 'Target ID list cannot be empty.')
});
