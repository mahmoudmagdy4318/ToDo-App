"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = exports.ConflictError = exports.NotFoundError = exports.ValidationError = exports.Priority = void 0;
var Priority;
(function (Priority) {
    Priority["LOW"] = "LOW";
    Priority["MEDIUM"] = "MEDIUM";
    Priority["HIGH"] = "HIGH";
})(Priority || (exports.Priority = Priority = {}));
class ValidationError extends Error {
    field;
    constructor(message, field) {
        super(message);
        this.field = field;
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class NotFoundError extends Error {
    constructor(resource, id) {
        super(`${resource} with id ${id} not found`);
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConflictError';
    }
}
exports.ConflictError = ConflictError;
class Task {
    id;
    title;
    description;
    priority;
    completed;
    dueDate;
    tags;
    createdAt;
    updatedAt;
    deletedAt;
    version;
    constructor(id, title, description = null, priority = Priority.MEDIUM, completed = false, dueDate = null, tags = [], createdAt = new Date(), updatedAt = new Date(), deletedAt = null, version = 1) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.completed = completed;
        this.dueDate = dueDate;
        this.tags = tags;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
        this.version = version;
        this.validate();
    }
    validate() {
        if (!this.title?.trim()) {
            throw new ValidationError('Task title is required', 'title');
        }
        if (this.title.length > 200) {
            throw new ValidationError('Task title must be 200 characters or less', 'title');
        }
        if (this.description && this.description.length > 1000) {
            throw new ValidationError('Task description must be 1000 characters or less', 'description');
        }
        if (this.tags.length > 10) {
            throw new ValidationError('Task cannot have more than 10 tags', 'tags');
        }
        for (const tag of this.tags) {
            if (tag.length > 30) {
                throw new ValidationError('Tag must be 30 characters or less', 'tags');
            }
        }
    }
    markCompleted() {
        this.completed = true;
        this.updatedAt = new Date();
        this.version++;
    }
    markIncomplete() {
        this.completed = false;
        this.updatedAt = new Date();
        this.version++;
    }
    toggleComplete() {
        if (this.completed) {
            this.markIncomplete();
        }
        else {
            this.markCompleted();
        }
    }
    isOverdue() {
        if (!this.dueDate || this.completed) {
            return false;
        }
        return this.dueDate < new Date();
    }
    softDelete() {
        this.deletedAt = new Date();
        this.updatedAt = new Date();
        this.version++;
    }
    restore() {
        this.deletedAt = null;
        this.updatedAt = new Date();
        this.version++;
    }
    update(data) {
        if (data.title !== undefined)
            this.title = data.title;
        if (data.description !== undefined)
            this.description = data.description;
        if (data.priority !== undefined)
            this.priority = data.priority;
        if (data.completed !== undefined)
            this.completed = data.completed;
        if (data.dueDate !== undefined)
            this.dueDate = data.dueDate;
        if (data.tags !== undefined)
            this.tags = data.tags;
        this.updatedAt = new Date();
        this.version++;
        this.validate();
    }
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            priority: this.priority,
            completed: this.completed,
            dueDate: this.dueDate?.toISOString() || null,
            tags: this.tags,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
            deletedAt: this.deletedAt?.toISOString() || null,
            isOverdue: this.isOverdue(),
            version: this.version
        };
    }
}
exports.Task = Task;
//# sourceMappingURL=Task.js.map