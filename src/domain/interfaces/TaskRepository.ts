import { Task, Priority } from '../entities/Task.js';

export interface TaskFilters {
  page: number;
  limit: number;
  search?: string;
  priority?: Priority;
  status?: 'completed' | 'incomplete';
  dueDate?: 'overdue' | 'today' | 'week' | 'none';
  tags?: string[];
  sortBy: 'createdAt' | 'dueDate' | 'priority' | 'title' | 'completed';
  sortOrder: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface TaskRepository {
  findById(id: string): Promise<Task | null>;
  findMany(filters: TaskFilters): Promise<Task[]>;
  count(filters: TaskFilters): Promise<number>;
  create(task: Task): Promise<Task>;
  update(id: string, task: Task): Promise<Task>;
  delete(id: string): Promise<void>;
  findDeleted(filters: Omit<TaskFilters, 'status'>): Promise<Task[]>;
  restore(id: string): Promise<Task>;
}
