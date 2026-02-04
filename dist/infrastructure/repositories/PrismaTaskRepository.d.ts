import { Task } from '../../domain/entities/Task.js';
import { TaskRepository, TaskFilters } from '../../domain/interfaces/TaskRepository.js';
import prisma from '../database/prisma.js';
export declare class PrismaTaskRepository implements TaskRepository {
    private db;
    constructor(db: typeof prisma);
    findById(id: string): Promise<Task | null>;
    findMany(filters: TaskFilters): Promise<Task[]>;
    count(filters: TaskFilters): Promise<number>;
    create(task: Task): Promise<Task>;
    update(id: string, task: Task): Promise<Task>;
    delete(id: string): Promise<void>;
    findDeleted(filters: Omit<TaskFilters, 'status'>): Promise<Task[]>;
    restore(id: string): Promise<Task>;
    private buildWhereClause;
    private buildOrderBy;
    private mapPrismaToEntity;
    private mapEntityToPrisma;
}
//# sourceMappingURL=PrismaTaskRepository.d.ts.map