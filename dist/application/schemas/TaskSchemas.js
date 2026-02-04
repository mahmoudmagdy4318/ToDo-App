"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskFiltersSchema = exports.UpdateTaskSchema = exports.CreateTaskSchema = void 0;
const zod_1 = require("zod");
const Task_js_1 = require("../../domain/entities/Task.js");
exports.CreateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(200, 'Title too long'),
    description: zod_1.z.string().max(1000, 'Description too long').optional(),
    priority: zod_1.z.nativeEnum(Task_js_1.Priority).default(Task_js_1.Priority.MEDIUM),
    dueDate: zod_1.z.string().datetime().optional().or(zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
    tags: zod_1.z.array(zod_1.z.string().max(30)).max(10, 'Too many tags').default([])
});
exports.UpdateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
    description: zod_1.z.string().max(1000, 'Description too long').optional(),
    priority: zod_1.z.nativeEnum(Task_js_1.Priority).optional(),
    completed: zod_1.z.boolean().optional(),
    dueDate: zod_1.z.string().datetime().optional().or(zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
    tags: zod_1.z.array(zod_1.z.string().max(30)).max(10, 'Too many tags').optional(),
    version: zod_1.z.number().int().positive().optional()
});
exports.TaskFiltersSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(25),
    search: zod_1.z.string().optional(),
    priority: zod_1.z.nativeEnum(Task_js_1.Priority).optional(),
    status: zod_1.z.enum(['completed', 'incomplete']).optional(),
    dueDate: zod_1.z.enum(['overdue', 'today', 'week', 'none']).optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    sortBy: zod_1.z.enum(['createdAt', 'dueDate', 'priority', 'title', 'completed']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc')
});
//# sourceMappingURL=TaskSchemas.js.map