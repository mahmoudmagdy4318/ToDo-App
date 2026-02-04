"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const Task_js_1 = require("../../domain/entities/Task.js");
const crypto_1 = require("crypto");
class TaskService {
    taskRepository;
    constructor(taskRepository) {
        this.taskRepository = taskRepository;
    }
    async getTasks(filters) {
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
    async getTaskById(id) {
        const task = await this.taskRepository.findById(id);
        if (!task) {
            throw new Task_js_1.NotFoundError('Task', id);
        }
        return task;
    }
    async createTask(data) {
        const id = this.generateId();
        const now = new Date();
        let dueDate = null;
        if (data.dueDate) {
            if (typeof data.dueDate === 'string' && data.dueDate.includes('T')) {
                dueDate = new Date(data.dueDate);
            }
            else {
                dueDate = new Date(data.dueDate + 'T00:00:00.000Z');
            }
        }
        const task = new Task_js_1.Task(id, data.title, data.description || null, data.priority || Task_js_1.Priority.MEDIUM, false, dueDate, data.tags || [], now, now);
        return await this.taskRepository.create(task);
    }
    async updateTask(id, data) {
        const existingTask = await this.getTaskById(id);
        if (data.version && data.version !== existingTask.version) {
            throw new Task_js_1.ConflictError('Task has been modified by another user. Please refresh and try again.');
        }
        let dueDate = undefined;
        if (data.dueDate !== undefined) {
            if (data.dueDate === null) {
                dueDate = null;
            }
            else if (typeof data.dueDate === 'string' && data.dueDate.includes('T')) {
                dueDate = new Date(data.dueDate);
            }
            else if (typeof data.dueDate === 'string') {
                dueDate = new Date(data.dueDate + 'T00:00:00.000Z');
            }
        }
        const updateData = {};
        if (data.title !== undefined)
            updateData.title = data.title;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.priority !== undefined)
            updateData.priority = data.priority;
        if (data.completed !== undefined)
            updateData.completed = data.completed;
        if (dueDate !== undefined)
            updateData.dueDate = dueDate;
        if (data.tags !== undefined)
            updateData.tags = data.tags;
        existingTask.update(updateData);
        return await this.taskRepository.update(id, existingTask);
    }
    async toggleTaskComplete(id, version) {
        const existingTask = await this.getTaskById(id);
        if (version && version !== existingTask.version) {
            throw new Task_js_1.ConflictError('Task has been modified by another user. Please refresh and try again.');
        }
        existingTask.toggleComplete();
        return await this.taskRepository.update(id, existingTask);
    }
    async deleteTask(id) {
        const existingTask = await this.getTaskById(id);
        existingTask.softDelete();
        await this.taskRepository.update(id, existingTask);
    }
    async restoreTask(id) {
        const task = await this.taskRepository.findById(id);
        if (!task || !task.deletedAt) {
            throw new Task_js_1.NotFoundError('Deleted task', id);
        }
        task.restore();
        return await this.taskRepository.update(id, task);
    }
    async getDeletedTasks(filters) {
        return await this.taskRepository.findDeleted(filters);
    }
    generateId() {
        return 'task_' + (0, crypto_1.randomBytes)(12).toString('base64url');
    }
}
exports.TaskService = TaskService;
//# sourceMappingURL=TaskService.js.map