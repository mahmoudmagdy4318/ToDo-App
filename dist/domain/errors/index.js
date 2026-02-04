"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionError = exports.DatabaseQueryError = exports.DatabaseConnectionError = exports.RepositoryError = exports.TaskLimitExceededError = exports.InvalidTaskOperationError = exports.TaskDeletionError = exports.TaskVersionConflictError = exports.TaskAlreadyCompletedError = exports.TaskValidationError = exports.TaskNotFoundError = exports.DomainError = void 0;
class DomainError extends Error {
    code;
    statusCode;
    constructor(message, code, statusCode = 500) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.statusCode = statusCode;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
exports.DomainError = DomainError;
class TaskNotFoundError extends DomainError {
    constructor(taskId) {
        super(`Task with ID ${taskId} not found`, 'TASK_NOT_FOUND', 404);
    }
}
exports.TaskNotFoundError = TaskNotFoundError;
class TaskValidationError extends DomainError {
    constructor(message, field) {
        super(field ? `Validation error for ${field}: ${message}` : `Validation error: ${message}`, 'TASK_VALIDATION_ERROR', 400);
    }
}
exports.TaskValidationError = TaskValidationError;
class TaskAlreadyCompletedError extends DomainError {
    constructor(taskId) {
        super(`Task ${taskId} is already completed`, 'TASK_ALREADY_COMPLETED', 409);
    }
}
exports.TaskAlreadyCompletedError = TaskAlreadyCompletedError;
class TaskVersionConflictError extends DomainError {
    constructor(taskId, expectedVersion, actualVersion) {
        super(`Task ${taskId} version conflict. Expected: ${expectedVersion}, Actual: ${actualVersion}`, 'TASK_VERSION_CONFLICT', 409);
    }
}
exports.TaskVersionConflictError = TaskVersionConflictError;
class TaskDeletionError extends DomainError {
    constructor(taskId, reason) {
        super(reason ? `Cannot delete task ${taskId}: ${reason}` : `Cannot delete task ${taskId}`, 'TASK_DELETION_ERROR', 409);
    }
}
exports.TaskDeletionError = TaskDeletionError;
class InvalidTaskOperationError extends DomainError {
    constructor(operation, taskId) {
        super(taskId
            ? `Invalid operation '${operation}' for task ${taskId}`
            : `Invalid task operation: ${operation}`, 'INVALID_TASK_OPERATION', 400);
    }
}
exports.InvalidTaskOperationError = InvalidTaskOperationError;
class TaskLimitExceededError extends DomainError {
    constructor(limit) {
        super(`Task limit of ${limit} exceeded`, 'TASK_LIMIT_EXCEEDED', 409);
    }
}
exports.TaskLimitExceededError = TaskLimitExceededError;
class RepositoryError extends DomainError {
    constructor(message, originalError) {
        super(`Repository error: ${message}`, 'REPOSITORY_ERROR', 500);
        if (originalError) {
            this.stack = `${this.stack}\nCaused by: ${originalError.stack}`;
        }
    }
}
exports.RepositoryError = RepositoryError;
class DatabaseConnectionError extends DomainError {
    constructor(originalError) {
        super('Database connection failed', 'DATABASE_CONNECTION_ERROR', 500);
        if (originalError) {
            this.stack = `${this.stack}\nCaused by: ${originalError.stack}`;
        }
    }
}
exports.DatabaseConnectionError = DatabaseConnectionError;
class DatabaseQueryError extends DomainError {
    constructor(query, originalError) {
        super(`Database query failed: ${query}`, 'DATABASE_QUERY_ERROR', 500);
        if (originalError) {
            this.stack = `${this.stack}\nCaused by: ${originalError.stack}`;
        }
    }
}
exports.DatabaseQueryError = DatabaseQueryError;
class TransactionError extends DomainError {
    constructor(operation, originalError) {
        super(`Transaction failed during ${operation}`, 'TRANSACTION_ERROR', 500);
        if (originalError) {
            this.stack = `${this.stack}\nCaused by: ${originalError.stack}`;
        }
    }
}
exports.TransactionError = TransactionError;
//# sourceMappingURL=index.js.map