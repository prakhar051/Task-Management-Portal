import { z } from 'zod';

const DepartmentStatusEnum = z.enum(['ACTIVE', 'INACTIVE']);

export const createDepartmentSchema = z.object({
  name: z.string().trim().min(2, 'Department name must be at least 2 characters long.'),
  code: z.string().trim().min(3, 'Department code must be at least 3 characters long.'),
  description: z.string().trim().nullable().optional(),
  managerId: z.string().uuid().nullable().optional(),
  location: z.string().trim().min(2, 'Location details are required.'),
  email: z.string().trim().email('Invalid email address format.'),
  phone: z.string().trim().min(10, 'Phone number must be at least 10 digits long.').max(15, 'Phone number too long.'),
  status: DepartmentStatusEnum.default('ACTIVE')
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

export const assignManagerSchema = z.object({
  managerId: z.string().uuid('Invalid manager employee UUID.').nullable()
});

export const assignEmployeesSchema = z.object({
  employeeIds: z.array(z.string().uuid('Invalid employee UUID.')).min(1, 'Target employee UUID list cannot be empty.')
});

export const bulkStatusSchema = z.object({
  ids: z.array(z.string().uuid('Invalid UUID elements in list.')).min(1, 'Target ID list cannot be empty.'),
  status: DepartmentStatusEnum
});

export const bulkActionSchema = z.object({
  ids: z.array(z.string().uuid('Invalid UUID elements in list.')).min(1, 'Target ID list cannot be empty.')
});
