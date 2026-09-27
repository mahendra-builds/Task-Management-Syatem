import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),
    avatarUrl: z.string().trim().url().max(500).optional().nullable(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z
      .string()
      .min(8)
      .max(128)
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[a-z]/, 'Password must contain a lowercase letter')
      .regex(/[0-9]/, 'Password must contain a digit'),
  }),
});

export const adminUpdateUserSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),
    role: z.enum(['ADMIN', 'MANAGER', 'MEMBER']).optional(),
    isActive: z.boolean().optional(),
    avatarUrl: z.string().trim().url().max(500).optional().nullable(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>['body'];
