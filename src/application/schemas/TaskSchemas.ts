import { z } from 'zod';
import { Priority } from '../../domain/entities/Task.js';

export const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  dueDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  tags: z.array(z.string().max(30)).max(10, 'Too many tags').default([])
});

export const UpdateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  priority: z.nativeEnum(Priority).optional(),
  completed: z.boolean().optional(),
  dueDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  tags: z.array(z.string().max(30)).max(10, 'Too many tags').optional(),
  version: z.number().int().positive().optional()
});

export const TaskFiltersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(25),
  search: z.string().optional(),
  priority: z.nativeEnum(Priority).optional(),
  status: z.enum(['completed', 'incomplete']).optional(),
  dueDate: z.enum(['overdue', 'today', 'week', 'none']).optional(),
  tags: z.array(z.string()).optional(),
  sortBy: z.enum(['createdAt', 'dueDate', 'priority', 'title', 'completed']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export type CreateTaskDto = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskDto = z.infer<typeof UpdateTaskSchema>;
export type TaskFiltersDto = z.infer<typeof TaskFiltersSchema>;
