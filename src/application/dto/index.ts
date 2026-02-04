import { Priority } from '../../domain/entities/Task.js';

/**
 * Data Transfer Objects for Task operations
 */

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

// Utility type for partial updates
export type PartialTask = Partial<Omit<TaskDto, 'id' | 'createdAt' | 'updatedAt'>>;

// Type guards
export function isTaskDto(obj: any): obj is TaskDto {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.priority === 'string' &&
    typeof obj.completed === 'boolean' &&
    Array.isArray(obj.tags) &&
    obj.createdAt instanceof Date &&
    obj.updatedAt instanceof Date &&
    typeof obj.version === 'number'
  );
}

export function isApiResponse(obj: any): obj is ApiResponse {
  return obj && typeof obj.success === 'boolean';
}

// Helper functions
export function taskToDto(task: any): TaskDto {
  return {
    id: task.id,
    title: task.title,
    description: task.description || undefined,
    priority: task.priority as Priority,
    completed: task.completed,
    dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
    tags: task.tags || [],
    createdAt: new Date(task.createdAt),
    updatedAt: new Date(task.updatedAt),
    version: task.version
  };
}

export function createApiResponse<T>(
  data: T,
  success: boolean = true,
  error?: ApiError
): ApiResponse<T>;
export function createApiResponse<T>(
  data: undefined,
  success: boolean,
  error: ApiError
): ApiResponse<T>;
export function createApiResponse<T>(
  data?: T,
  success: boolean = true,
  error?: ApiError
): ApiResponse<T> {
  return {
    success,
    ...(data !== undefined && { data }),
    ...(error && { error }),
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  };
}

export function createApiError(
  code: string,
  message: string,
  field?: string,
  statusCode?: number
): ApiError {
  return {
    code,
    message,
    ...(field && { field }),
    ...(statusCode && { statusCode })
  };
}
