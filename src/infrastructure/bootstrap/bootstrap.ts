import { Container } from '../container/Container.js';
import { TaskService } from '../../application/services/TaskService.js';
import { TaskController } from '../../presentation/controllers/TaskController.js';
import { PrismaTaskRepository } from '../repositories/PrismaTaskRepository.js';
import prisma from '../database/prisma.js';

export function bootstrap(): Container {
  const container = new Container();

  // Register repositories
  container.register('prismaClient', () => prisma, true);
  container.register('taskRepository', () => new PrismaTaskRepository(container.resolve('prismaClient')), true);

  // Register services
  container.register('taskService', () => new TaskService(container.resolve('taskRepository')), true);

  // Register controllers
  container.register('taskController', () => new TaskController(container.resolve('taskService')), true);

  return container;
}
