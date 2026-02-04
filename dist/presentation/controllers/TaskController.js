"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const TaskSchemas_js_1 = require("../../application/schemas/TaskSchemas.js");
const zod_1 = require("zod");
const Task_js_1 = require("../../domain/entities/Task.js");
class TaskController {
    taskService;
    constructor(taskService) {
        this.taskService = taskService;
    }
    async getTasks(req, res) {
        try {
            const filters = TaskSchemas_js_1.TaskFiltersSchema.parse(req.query);
            const result = await this.taskService.getTasks(filters);
            res.json(result);
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                throw new Task_js_1.ValidationError(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
            }
            throw error;
        }
    }
    async getTaskById(req, res) {
        const task = await this.taskService.getTaskById(req.params.id);
        res.json(task.toJSON());
    }
    async createTask(req, res) {
        try {
            const taskData = TaskSchemas_js_1.CreateTaskSchema.parse(req.body);
            const task = await this.taskService.createTask(taskData);
            res.status(201).json(task.toJSON());
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                throw new Task_js_1.ValidationError(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
            }
            throw error;
        }
    }
    async updateTask(req, res) {
        try {
            const taskData = TaskSchemas_js_1.UpdateTaskSchema.parse(req.body);
            const task = await this.taskService.updateTask(req.params.id, taskData);
            res.json(task.toJSON());
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                throw new Task_js_1.ValidationError(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
            }
            throw error;
        }
    }
    async toggleComplete(req, res) {
        const version = req.body.version ? parseInt(req.body.version) : undefined;
        const task = await this.taskService.toggleTaskComplete(req.params.id, version);
        res.json(task.toJSON());
    }
    async deleteTask(req, res) {
        await this.taskService.deleteTask(req.params.id);
        res.status(204).send();
    }
    async restoreTask(req, res) {
        const task = await this.taskService.restoreTask(req.params.id);
        res.json(task.toJSON());
    }
    async getDeletedTasks(req, res) {
        try {
            const filters = TaskSchemas_js_1.TaskFiltersSchema.omit({ status: true }).parse(req.query);
            const tasks = await this.taskService.getDeletedTasks(filters);
            res.json(tasks.map(task => task.toJSON()));
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                throw new Task_js_1.ValidationError(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
            }
            throw error;
        }
    }
    async renderTasksPage(req, res) {
        try {
            res.render('tasks/index', {
                title: 'Tasks',
                tasks: [],
                pagination: { page: 1, pages: 1, total: 0, limit: 25 },
                filters: {}
            });
        }
        catch (error) {
            throw error;
        }
    }
}
exports.TaskController = TaskController;
//# sourceMappingURL=TaskController.js.map