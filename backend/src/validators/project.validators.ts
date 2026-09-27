import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).optional().nullable(),
  status: z.enum(['PLANNING', 'ACTIVE', 'COMPLETED', 'ARCHIVED']).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  status: z.enum(['PLANNING', 'ACTIVE', 'COMPLETED', 'ARCHIVED']).optional(),
});

export const projectIdParamSchema = z.object({
  id: z.string().min(1),
});

export const addMemberSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(['OWNER', 'MANAGER', 'MEMBER', 'VIEWER']).optional(),
});

export const removeMemberParamsSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
});

const intFromString = z
  .union([z.string(), z.number()])
  .optional()
  .transform((v) => (v === undefined || v === '' ? undefined : Number(v)))
  .pipe(z.number().int().min(1).max(100).optional());

export const listProjectsQuerySchema = z.object({
  status: z.enum(['PLANNING', 'ACTIVE', 'COMPLETED', 'ARCHIVED']).optional(),
  q: z.string().trim().min(1).max(100).optional(),
  page: intFromString.transform((v) => v ?? 1),
  pageSize: intFromString.transform((v) => v ?? 20),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;
