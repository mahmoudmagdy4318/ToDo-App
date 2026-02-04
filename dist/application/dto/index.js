"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTaskDto = isTaskDto;
exports.isApiResponse = isApiResponse;
exports.taskToDto = taskToDto;
exports.createApiResponse = createApiResponse;
exports.createApiError = createApiError;
function isTaskDto(obj) {
    return (obj &&
        typeof obj.id === 'string' &&
        typeof obj.title === 'string' &&
        typeof obj.priority === 'string' &&
        typeof obj.completed === 'boolean' &&
        Array.isArray(obj.tags) &&
        obj.createdAt instanceof Date &&
        obj.updatedAt instanceof Date &&
        typeof obj.version === 'number');
}
function isApiResponse(obj) {
    return obj && typeof obj.success === 'boolean';
}
function taskToDto(task) {
    return {
        id: task.id,
        title: task.title,
        description: task.description || undefined,
        priority: task.priority,
        completed: task.completed,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        tags: task.tags || [],
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        version: task.version
    };
}
function createApiResponse(data, success = true, error) {
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
function createApiError(code, message, field, statusCode) {
    return {
        code,
        message,
        ...(field && { field }),
        ...(statusCode && { statusCode })
    };
}
//# sourceMappingURL=index.js.map