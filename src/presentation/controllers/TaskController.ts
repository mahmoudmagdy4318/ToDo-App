import { Request, Response } from 'express';
import { TaskService } from '../../application/services/TaskService.js';
import { CreateTaskSchema, UpdateTaskSchema, TaskFiltersSchema } from '../../application/schemas/TaskSchemas.js';
import { ZodError } from 'zod';
import { ValidationError } from '../../domain/entities/Task.js';

export class TaskController {
  constructor(private taskService: TaskService) {}

  async importTasks(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.taskService.importTasksFromJson(req.body);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
        return;
      }
      throw error;
    }
  }

  async getTasks(req: Request, res: Response): Promise<void> {
    try {
      const filters = TaskFiltersSchema.parse(req.query);
      const result = await this.taskService.getTasks(filters);
      res.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  async getTaskById(req: Request, res: Response): Promise<void> {
    const task = await this.taskService.getTaskById(req.params.id);
    res.json(task.toJSON());
  }

  async createTask(req: Request, res: Response): Promise<void> {
    try {
      const taskData = CreateTaskSchema.parse(req.body);
      const task = await this.taskService.createTask(taskData);
      res.status(201).json(task.toJSON());
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  async updateTask(req: Request, res: Response): Promise<void> {
    try {
      const taskData = UpdateTaskSchema.parse(req.body);
      const task = await this.taskService.updateTask(req.params.id, taskData);
      res.json(task.toJSON());
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  async toggleComplete(req: Request, res: Response): Promise<void> {
    const version = req.body.version ? parseInt(req.body.version) : undefined;
    const task = await this.taskService.toggleTaskComplete(req.params.id, version);
    res.json(task.toJSON());
  }

  async deleteTask(req: Request, res: Response): Promise<void> {
    await this.taskService.deleteTask(req.params.id);
    res.status(204).send();
  }

  async restoreTask(req: Request, res: Response): Promise<void> {
    const task = await this.taskService.restoreTask(req.params.id);
    res.json(task.toJSON());
  }

  async getDeletedTasks(req: Request, res: Response): Promise<void> {
    try {
      const filters = TaskFiltersSchema.omit({ status: true }).parse(req.query);
      const tasks = await this.taskService.getDeletedTasks(filters);
      res.json(tasks.map(task => task.toJSON()));
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  async renderTasksPage(req: Request, res: Response): Promise<void> {
    try {
      // Render the tasks page with initial data
      res.render('tasks/index', { 
        title: 'Tasks',
        tasks: [], // Tasks will be loaded via JavaScript
        pagination: { page: 1, pages: 1, total: 0, limit: 25 },
        filters: {}
      });
    } catch (error) {
      throw error;
    }
  }
}
