import { z } from 'zod';

export const taskStatusEnum = z.enum([
  'TODO',
  'IN_PROGRESS',
  'IN_REVIEW',
  'COMPLETED',
  'BLOCKED',
  'CANCELLED',
]);

export const taskPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

const dateFromString = z
  .union([z.string(), z.date()])
  .optional()
  .nullable()
  .transform((v) => {
    if (v === undefined || v === null || v === '') return null;
    const d = v instanceof Date ? v : new Date(v);
    return isNaN(d.getTime()) ? null : d;
  });

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).optional().nullable(),
  projectId: z.string().min(1),
  assignedToId: z.string().min(1).optional().nullable(),
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
  dueDate: dateFromString,
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(5000).optional().nullable(),
  assignedToId: z.string().min(1).optional().nullable(),
  priority: taskPriorityEnum.optional(),
  dueDate: dateFromString,
});

export const updateStatusSchema = z.object({
  status: taskStatusEnum,
});

export const assignTaskSchema = z.object({
  assignedToId: z.string().min(1).nullable(),
});

export const taskIdParamSchema = z.object({
  id: z.string().min(1),
});

const intFromString = z
  .union([z.string(), z.number()])
  .optional()
  .transform((v) => (v === undefined || v === '' ? undefined : Number(v)))
  .pipe(z.number().int().min(1).max(100).optional());

export const listTasksQuerySchema = z.object({
  projectId: z.string().min(1).optional(),
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
  assignedToMe: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((v) => v === 'true' || v === true),
  q: z.string().trim().min(1).max(200).optional(),
  page: intFromString.transform((v) => v ?? 1),
  pageSize: intFromString.transform((v) => v ?? 20),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
