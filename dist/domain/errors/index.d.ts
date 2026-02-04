export declare abstract class DomainError extends Error {
    readonly code: string;
    readonly statusCode: number;
    constructor(message: string, code: string, statusCode?: number);
}
export declare class TaskNotFoundError extends DomainError {
    constructor(taskId: string);
}
export declare class TaskValidationError extends DomainError {
    constructor(message: string, field?: string);
}
export declare class TaskAlreadyCompletedError extends DomainError {
    constructor(taskId: string);
}
export declare class TaskVersionConflictError extends DomainError {
    constructor(taskId: string, expectedVersion: number, actualVersion: number);
}
export declare class TaskDeletionError extends DomainError {
    constructor(taskId: string, reason?: string);
}
export declare class InvalidTaskOperationError extends DomainError {
    constructor(operation: string, taskId?: string);
}
export declare class TaskLimitExceededError extends DomainError {
    constructor(limit: number);
}
export declare class RepositoryError extends DomainError {
    constructor(message: string, originalError?: Error);
}
export declare class DatabaseConnectionError extends DomainError {
    constructor(originalError?: Error);
}
export declare class DatabaseQueryError extends DomainError {
    constructor(query: string, originalError?: Error);
}
export declare class TransactionError extends DomainError {
    constructor(operation: string, originalError?: Error);
}
//# sourceMappingURL=index.d.ts.map