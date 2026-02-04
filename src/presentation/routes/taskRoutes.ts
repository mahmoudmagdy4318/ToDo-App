import { Router } from 'express';
import { TaskController } from '../controllers/TaskController.js';

export function createTaskRoutes(taskController: TaskController): Router {
  const router = Router();

  // API Routes for tasks
  router.get('/tasks', (req, res) => taskController.getTasks(req, res));
  router.post('/tasks', (req, res) => taskController.createTask(req, res));
  router.post('/tasks/import', (req, res) => taskController.importTasks(req, res));
  router.get('/tasks/deleted', (req, res) => taskController.getDeletedTasks(req, res));
  router.get('/tasks/:id', (req, res) => taskController.getTaskById(req, res));
  router.patch('/tasks/:id', (req, res) => taskController.updateTask(req, res));
  router.patch('/tasks/:id/toggle', (req, res) => taskController.toggleComplete(req, res));
  router.delete('/tasks/:id', (req, res) => taskController.deleteTask(req, res));
  router.post('/tasks/:id/restore', (req, res) => taskController.restoreTask(req, res));

  return router;
}
