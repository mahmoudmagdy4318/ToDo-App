import { z } from 'zod';
import { Priority } from '../../domain/entities/Task.js';
export declare const CreateTaskSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodDefault<z.ZodNativeEnum<typeof Priority>>;
    dueDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodOptional<z.ZodString>]>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    title: string;
    tags: string[];
    priority: Priority;
    description?: string | undefined;
    dueDate?: string | undefined;
}, {
    title: string;
    description?: string | undefined;
    tags?: string[] | undefined;
    priority?: Priority | undefined;
    dueDate?: string | undefined;
}>;
export declare const UpdateTaskSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodNativeEnum<typeof Priority>>;
    completed: z.ZodOptional<z.ZodBoolean>;
    dueDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodOptional<z.ZodString>]>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    version: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    description?: string | undefined;
    tags?: string[] | undefined;
    version?: number | undefined;
    priority?: Priority | undefined;
    completed?: boolean | undefined;
    dueDate?: string | undefined;
}, {
    title?: string | undefined;
    description?: string | undefined;
    tags?: string[] | undefined;
    version?: number | undefined;
    priority?: Priority | undefined;
    completed?: boolean | undefined;
    dueDate?: string | undefined;
}>;
export declare const TaskFiltersSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodNativeEnum<typeof Priority>>;
    status: z.ZodOptional<z.ZodEnum<["completed", "incomplete"]>>;
    dueDate: z.ZodOptional<z.ZodEnum<["overdue", "today", "week", "none"]>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "dueDate", "priority", "title", "completed"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortBy: "title" | "createdAt" | "priority" | "completed" | "dueDate";
    sortOrder: "asc" | "desc";
    tags?: string[] | undefined;
    priority?: Priority | undefined;
    dueDate?: "overdue" | "today" | "week" | "none" | undefined;
    status?: "completed" | "incomplete" | undefined;
    search?: string | undefined;
}, {
    tags?: string[] | undefined;
    priority?: Priority | undefined;
    dueDate?: "overdue" | "today" | "week" | "none" | undefined;
    status?: "completed" | "incomplete" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    sortBy?: "title" | "createdAt" | "priority" | "completed" | "dueDate" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export type CreateTaskDto = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskDto = z.infer<typeof UpdateTaskSchema>;
export type TaskFiltersDto = z.infer<typeof TaskFiltersSchema>;
//# sourceMappingURL=TaskSchemas.d.ts.map