/**
 * Base domain error class
 */
export abstract class DomainError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number = 500) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Task not found error
 */
export class TaskNotFoundError extends DomainError {
  constructor(taskId: string) {
    super(`Task with ID ${taskId} not found`, 'TASK_NOT_FOUND', 404);
  }
}

/**
 * Task validation error
 */
export class TaskValidationError extends DomainError {
  constructor(message: string, field?: string) {
    super(
      field ? `Validation error for ${field}: ${message}` : `Validation error: ${message}`,
      'TASK_VALIDATION_ERROR',
      400
    );
  }
}

/**
 * Task already completed error
 */
export class TaskAlreadyCompletedError extends DomainError {
  constructor(taskId: string) {
    super(`Task ${taskId} is already completed`, 'TASK_ALREADY_COMPLETED', 409);
  }
}

/**
 * Task version conflict error (optimistic locking)
 */
export class TaskVersionConflictError extends DomainError {
  constructor(taskId: string, expectedVersion: number, actualVersion: number) {
    super(
      `Task ${taskId} version conflict. Expected: ${expectedVersion}, Actual: ${actualVersion}`,
      'TASK_VERSION_CONFLICT',
      409
    );
  }
}

/**
 * Task deletion error
 */
export class TaskDeletionError extends DomainError {
  constructor(taskId: string, reason?: string) {
    super(
      reason ? `Cannot delete task ${taskId}: ${reason}` : `Cannot delete task ${taskId}`,
      'TASK_DELETION_ERROR',
      409
    );
  }
}

/**
 * Invalid task operation error
 */
export class InvalidTaskOperationError extends DomainError {
  constructor(operation: string, taskId?: string) {
    super(
      taskId 
        ? `Invalid operation '${operation}' for task ${taskId}` 
        : `Invalid task operation: ${operation}`,
      'INVALID_TASK_OPERATION',
      400
    );
  }
}

/**
 * Task limit exceeded error
 */
export class TaskLimitExceededError extends DomainError {
  constructor(limit: number) {
    super(`Task limit of ${limit} exceeded`, 'TASK_LIMIT_EXCEEDED', 409);
  }
}

/**
 * Repository error
 */
export class RepositoryError extends DomainError {
  constructor(message: string, originalError?: Error) {
    super(`Repository error: ${message}`, 'REPOSITORY_ERROR', 500);
    
    if (originalError) {
      this.stack = `${this.stack}\nCaused by: ${originalError.stack}`;
    }
  }
}

/**
 * Database connection error
 */
export class DatabaseConnectionError extends DomainError {
  constructor(originalError?: Error) {
    super('Database connection failed', 'DATABASE_CONNECTION_ERROR', 500);
    
    if (originalError) {
      this.stack = `${this.stack}\nCaused by: ${originalError.stack}`;
    }
  }
}

/**
 * Database query error
 */
export class DatabaseQueryError extends DomainError {
  constructor(query: string, originalError?: Error) {
    super(`Database query failed: ${query}`, 'DATABASE_QUERY_ERROR', 500);
    
    if (originalError) {
      this.stack = `${this.stack}\nCaused by: ${originalError.stack}`;
    }
  }
}

/**
 * Transaction error
 */
export class TransactionError extends DomainError {
  constructor(operation: string, originalError?: Error) {
    super(`Transaction failed during ${operation}`, 'TRANSACTION_ERROR', 500);
    
    if (originalError) {
      this.stack = `${this.stack}\nCaused by: ${originalError.stack}`;
    }
  }
}
