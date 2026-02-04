import { Task } from '../../domain/entities/Task.js';
import { TaskRepository, TaskFilters, PaginatedResult } from '../../domain/interfaces/TaskRepository.js';
import { CreateTaskDto, UpdateTaskDto } from '../schemas/TaskSchemas.js';
export declare class TaskService {
    private taskRepository;
    constructor(taskRepository: TaskRepository);
    getTasks(filters: TaskFilters): Promise<PaginatedResult<Task>>;
    getTaskById(id: string): Promise<Task>;
    createTask(data: CreateTaskDto): Promise<Task>;
    updateTask(id: string, data: UpdateTaskDto): Promise<Task>;
    toggleTaskComplete(id: string, version?: number): Promise<Task>;
    deleteTask(id: string): Promise<void>;
    restoreTask(id: string): Promise<Task>;
    getDeletedTasks(filters: Omit<TaskFilters, 'status'>): Promise<Task[]>;
    private generateId;
}
//# sourceMappingURL=TaskService.d.ts.map