import { Priority } from '../../domain/entities/Task.js';
export interface TaskDto {
    id: string;
    title: string;
    description?: string;
    priority: Priority;
    completed: boolean;
    dueDate?: Date;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    version: number;
}
export interface CreateTaskRequest {
    title: string;
    description?: string;
    priority?: Priority;
    dueDate?: string | Date;
    tags?: string[];
}
export interface UpdateTaskRequest {
    title?: string;
    description?: string;
    priority?: Priority;
    completed?: boolean;
    dueDate?: string | Date;
    tags?: string[];
    version?: number;
}
export interface TaskFilters {
    page?: number;
    limit?: number;
    search?: string;
    priority?: Priority;
    status?: 'completed' | 'incomplete';
    dueDate?: 'overdue' | 'today' | 'week' | 'none';
    tags?: string[];
    sortBy?: 'createdAt' | 'dueDate' | 'priority' | 'title' | 'completed';
    sortOrder?: 'asc' | 'desc';
}
export interface PaginationMeta {
    page: number;
    pages: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export interface TaskListResponse {
    data: TaskDto[];
    pagination: PaginationMeta;
    filters: TaskFilters;
}
export interface TaskSummary {
    total: number;
    completed: number;
    incomplete: number;
    overdue: number;
    dueToday: number;
    dueThisWeek: number;
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        field?: string;
    };
    meta?: {
        timestamp: string;
        requestId?: string;
        version?: string;
    };
}
export interface ApiError {
    code: string;
    message: string;
    field?: string;
    statusCode?: number;
}
export type PartialTask = Partial<Omit<TaskDto, 'id' | 'createdAt' | 'updatedAt'>>;
export declare function isTaskDto(obj: any): obj is TaskDto;
export declare function isApiResponse(obj: any): obj is ApiResponse;
export declare function taskToDto(task: any): TaskDto;
export declare function createApiResponse<T>(data: T, success?: boolean, error?: ApiError): ApiResponse<T>;
export declare function createApiResponse<T>(data: undefined, success: boolean, error: ApiError): ApiResponse<T>;
export declare function createApiError(code: string, message: string, field?: string, statusCode?: number): ApiError;
//# sourceMappingURL=index.d.ts.map