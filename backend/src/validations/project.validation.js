import { z } from 'zod';

const ProjectStatusEnum = z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']);
const ProjectPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
const ProjectMemberRoleEnum = z.enum([
  'PROJECT_MANAGER',
  'TEAM_LEAD',
  'DEVELOPER',
  'TESTER',
  'DESIGNER',
  'BUSINESS_ANALYST',
  'MEMBER'
]);

const projectBaseSchema = z.object({
  name: z.string().trim().min(2, 'Project name must be at least 2 characters long.'),
  code: z.string().trim().min(2, 'Project code must be at least 2 characters long.'),
  description: z.string().trim().nullable().optional(),
  departmentId: z.string().uuid('Invalid department UUID reference.'),
  managerId: z.string().uuid('Invalid manager employee UUID reference.').nullable().optional(),
  startDate: z.string().datetime('Start date must be a valid ISO date string.'),
  endDate: z.string().datetime('End date must be a valid ISO date string.'),
  priority: ProjectPriorityEnum.default('MEDIUM'),
  status: ProjectStatusEnum.default('PLANNING'),
  budget: z.number().nonnegative('Budget must be a non-negative decimal value.').nullable().optional(),
  progress: z.number().int().min(0, 'Progress must be at least 0.').max(100, 'Progress cannot exceed 100.').default(0)
});

export const createProjectSchema = projectBaseSchema.refine((data) => {
  const start = new Date(data.startDate).getTime();
  const end = new Date(data.endDate).getTime();
  return start <= end;
}, {
  message: 'End date must be greater than or equal to start date.',
  path: ['endDate']
});

export const updateProjectSchema = projectBaseSchema.partial().refine((data) => {
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate).getTime();
    const end = new Date(data.endDate).getTime();
    return start <= end;
  }
  return true;
}, {
  message: 'End date must be greater than or equal to start date.',
  path: ['endDate']
});

export const assignManagerSchema = z.object({
  managerId: z.string().uuid('Invalid manager employee UUID reference.').nullable()
});

export const assignMembersSchema = z.object({
  members: z.array(
    z.object({
      employeeId: z.string().uuid('Invalid member employee UUID reference.'),
      role: ProjectMemberRoleEnum.default('MEMBER')
    })
  ).min(1, 'Target members allocation list cannot be empty.')
});

export const bulkStatusSchema = z.object({
  ids: z.array(z.string().uuid('Invalid UUID elements in list.')).min(1, 'Target ID list cannot be empty.'),
  status: ProjectStatusEnum
});

export const bulkActionSchema = z.object({
  ids: z.array(z.string().uuid('Invalid UUID elements in list.')).min(1, 'Target ID list cannot be empty.')
});
