import { z } from 'zod';

const TaskStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED', 'COMPLETED', 'CANCELLED']);
const TaskPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
const TaskTypeEnum = z.enum(['FEATURE', 'BUG', 'IMPROVEMENT', 'DOCUMENTATION', 'RESEARCH']);

export const createTaskSchema = z.object({
  title: z.string().trim().min(2, 'Task title must be at least 2 characters long.'),
  description: z.string().trim().nullable().optional(),
  projectId: z.string().uuid('Invalid project UUID reference.'),
  parentTaskId: z.string().uuid('Invalid parent task UUID reference.').nullable().optional(),
  reporterId: z.string().uuid('Invalid reporter employee UUID reference.').nullable().optional(),
  status: TaskStatusEnum.default('TODO'),
  priority: TaskPriorityEnum.default('MEDIUM'),
  type: TaskTypeEnum.default('FEATURE'),
  dueDate: z.string().datetime('Due date must be a valid ISO date string.').nullable().optional(),
  estimatedHours: z.number().nonnegative('Estimated hours must be a non-negative decimal.').nullable().optional(),
  actualHours: z.number().nonnegative('Actual hours must be a non-negative decimal.').nullable().optional(),
  completionPercentage: z.number().int().min(0, 'Completion percentage must be at least 0.').max(100, 'Completion percentage cannot exceed 100.').default(0)
});

export const updateTaskSchema = createTaskSchema.partial();

export const statusUpdateSchema = z.object({
  status: TaskStatusEnum
});

export const progressUpdateSchema = z.object({
  completionPercentage: z.number().int().min(0, 'Completion percentage must be at least 0.').max(100, 'Completion percentage cannot exceed 100.')
});

export const assigneesSchema = z.object({
  employeeIds: z.array(z.string().uuid('Invalid employee UUID reference.')).min(1, 'Target assignees list cannot be empty.')
});

export const commentSchema = z.object({
  comment: z.string().trim().min(1, 'Comment text content cannot be blank.')
});

export const dependencySchema = z.object({
  dependsOnTaskId: z.string().uuid('Invalid target blocker task UUID reference.')
});

export const bulkStatusSchema = z.object({
  ids: z.array(z.string().uuid('Invalid UUID elements in list.')).min(1, 'Target ID list cannot be empty.'),
  status: TaskStatusEnum
});

export const bulkPrioritySchema = z.object({
  ids: z.array(z.string().uuid('Invalid UUID elements in list.')).min(1, 'Target ID list cannot be empty.'),
  priority: TaskPriorityEnum
});

export const bulkActionSchema = z.object({
  ids: z.array(z.string().uuid('Invalid UUID elements in list.')).min(1, 'Target ID list cannot be empty.')
});
