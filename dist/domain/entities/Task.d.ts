export declare enum Priority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH"
}
export declare class ValidationError extends Error {
    field?: string | undefined;
    constructor(message: string, field?: string | undefined);
}
export declare class NotFoundError extends Error {
    constructor(resource: string, id: string);
}
export declare class ConflictError extends Error {
    constructor(message: string);
}
export declare class Task {
    id: string;
    title: string;
    description: string | null;
    priority: Priority;
    completed: boolean;
    dueDate: Date | null;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    version: number;
    constructor(id: string, title: string, description?: string | null, priority?: Priority, completed?: boolean, dueDate?: Date | null, tags?: string[], createdAt?: Date, updatedAt?: Date, deletedAt?: Date | null, version?: number);
    private validate;
    markCompleted(): void;
    markIncomplete(): void;
    toggleComplete(): void;
    isOverdue(): boolean;
    softDelete(): void;
    restore(): void;
    update(data: Partial<Omit<Task, 'id' | 'createdAt' | 'deletedAt' | 'version'>>): void;
    toJSON(): {
        id: string;
        title: string;
        description: string | null;
        priority: Priority;
        completed: boolean;
        dueDate: string | null;
        tags: string[];
        createdAt: string;
        updatedAt: string;
        deletedAt: string | null;
        isOverdue: boolean;
        version: number;
    };
}
//# sourceMappingURL=Task.d.ts.map