import { Task, Priority, ValidationError, NotFoundError, ConflictError } from '../../domain/entities/Task.js';
import { TaskRepository, TaskFilters, PaginatedResult } from '../../domain/interfaces/TaskRepository.js';
import { CreateTaskDto, UpdateTaskDto } from '../schemas/TaskSchemas.js';
import { randomBytes } from 'crypto';

export class TaskService {
  constructor(private taskRepository: TaskRepository) {}

  async importTasksFromJson(payload: unknown): Promise<{ imported: number; errors: Array<{ index: number; message: string }> }> {
    if (!Array.isArray(payload)) {
      throw new ValidationError('Invalid import payload: expected an array');
    }

    const errors: Array<{ index: number; message: string }> = [];
    let imported = 0;

    for (let i = 0; i < payload.length; i++) {
      const item = payload[i] as Partial<CreateTaskDto>;
      try {
        if (!item || typeof item !== 'object') throw new ValidationError('Invalid item');
        if (!item.title || typeof item.title !== 'string') throw new ValidationError('Title is required');

        const createDto: CreateTaskDto = {
          title: item.title,
          description: item.description ?? null,
          priority: item.priority ?? Priority.MEDIUM,
          completed: item.completed ?? false,
          // normalize dueDate to midnight UTC if yyyy-mm-dd
          dueDate: item.dueDate
            ? typeof item.dueDate === 'string' && !item.dueDate.includes('T')
              ? (item.dueDate + 'T00:00:00.000Z') as any
              : (item.dueDate as any)
            : undefined,
          tags: item.tags ?? []
        } as any;

        const task = await this.createTask(createDto);
        if (task) imported++;
      } catch (e: any) {
        const message = e?.message ?? 'Unknown error';
        errors.push({ index: i, message });
      }
    }

    return { imported, errors };
  }

  async getTasks(filters: TaskFilters): Promise<PaginatedResult<Task>> {
    const [tasks, total] = await Promise.all([
      this.taskRepository.findMany(filters),
      this.taskRepository.count(filters)
    ]);

    return {
      data: tasks,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages: Math.ceil(total / filters.limit)
      }
    };
  }

  async getTaskById(id: string): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new NotFoundError('Task', id);
    }
    return task;
  }

  async createTask(data: CreateTaskDto): Promise<Task> {
    const id = this.generateId();
    const now = new Date();
    
    // Parse date if provided
    let dueDate: Date | null = null;
    if (data.dueDate) {
      if (typeof data.dueDate === 'string' && data.dueDate.includes('T')) {
        dueDate = new Date(data.dueDate);
      } else {
        dueDate = new Date(data.dueDate + 'T00:00:00.000Z');
      }
    }

    const task = new Task(
      id,
      data.title,
      data.description || null,
      data.priority || Priority.MEDIUM,
      false,
      dueDate,
      data.tags || [],
      now,
      now
    );

    return await this.taskRepository.create(task);
  }

  async updateTask(id: string, data: UpdateTaskDto): Promise<Task> {
    const existingTask = await this.getTaskById(id);

    // Check version for optimistic concurrency control
    if (data.version && data.version !== existingTask.version) {
      throw new ConflictError('Task has been modified by another user. Please refresh and try again.');
    }

    // Parse date if provided
    let dueDate: Date | null | undefined = undefined;
    if (data.dueDate !== undefined) {
      if (data.dueDate === null) {
        dueDate = null;
      } else if (typeof data.dueDate === 'string' && data.dueDate.includes('T')) {
        dueDate = new Date(data.dueDate);
      } else if (typeof data.dueDate === 'string') {
        dueDate = new Date(data.dueDate + 'T00:00:00.000Z');
      }
    }

    const updateData: Partial<Omit<Task, 'id' | 'createdAt' | 'deletedAt' | 'version'>> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.completed !== undefined) updateData.completed = data.completed;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (data.tags !== undefined) updateData.tags = data.tags;

    existingTask.update(updateData);

    return await this.taskRepository.update(id, existingTask);
  }

  async toggleTaskComplete(id: string, version?: number): Promise<Task> {
    const existingTask = await this.getTaskById(id);

    // Check version for optimistic concurrency control
    if (version && version !== existingTask.version) {
      throw new ConflictError('Task has been modified by another user. Please refresh and try again.');
    }

    existingTask.toggleComplete();

    return await this.taskRepository.update(id, existingTask);
  }

  async deleteTask(id: string): Promise<void> {
    const existingTask = await this.getTaskById(id);
    existingTask.softDelete();
    await this.taskRepository.update(id, existingTask);
  }

  async restoreTask(id: string): Promise<Task> {
    // Find task in deleted tasks
    const task = await this.taskRepository.findById(id);
    if (!task || !task.deletedAt) {
      throw new NotFoundError('Deleted task', id);
    }

    task.restore();
    return await this.taskRepository.update(id, task);
  }

  async getDeletedTasks(filters: Omit<TaskFilters, 'status'>): Promise<Task[]> {
    return await this.taskRepository.findDeleted(filters);
  }

  private generateId(): string {
    // Generate a random ID (cuid-like)
    return 'task_' + randomBytes(12).toString('base64url');
  }
}
