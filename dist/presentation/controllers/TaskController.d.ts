import { Request, Response } from 'express';
import { TaskService } from '../../application/services/TaskService.js';
export declare class TaskController {
    private taskService;
    constructor(taskService: TaskService);
    getTasks(req: Request, res: Response): Promise<void>;
    getTaskById(req: Request, res: Response): Promise<void>;
    createTask(req: Request, res: Response): Promise<void>;
    updateTask(req: Request, res: Response): Promise<void>;
    toggleComplete(req: Request, res: Response): Promise<void>;
    deleteTask(req: Request, res: Response): Promise<void>;
    restoreTask(req: Request, res: Response): Promise<void>;
    getDeletedTasks(req: Request, res: Response): Promise<void>;
    renderTasksPage(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=TaskController.d.ts.map