import { z } from 'zod';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const strongPassword = z.string()
  .min(8, { message: 'Password must be at least 8 characters long.' })
  .regex(passwordRegex, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@, $, !, %, *, ?, &).'
  });

export const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long.' }).trim(),
  email: z.string().email({ message: 'Provide a valid email address.' }).toLowerCase().trim(),
  password: strongPassword,
  role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE']).default('EMPLOYEE'),
});

export const loginSchema = z.object({
  email: z.string().email({ message: 'Provide a valid email address.' }).toLowerCase().trim(),
  password: z.string().min(1, { message: 'Password cannot be empty.' }),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long.' }).trim().optional(),
  email: z.string().email({ message: 'Provide a valid email address.' }).toLowerCase().trim().optional(),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, { message: 'Current password cannot be empty.' }),
  newPassword: strongPassword,
}).refine((data) => data.oldPassword !== data.newPassword, {
  message: 'New password must be different from current password.',
  path: ['newPassword'],
});
