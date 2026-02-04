import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import createApp from '../../src/app.js';
import { PrismaClient } from '@prisma/client';

const app = createApp();
const prisma = new PrismaClient();

describe('Task API Integration Tests', () => {
  beforeAll(async () => {
    // Setup test database
    await prisma.$connect();
  });

  afterAll(async () => {
    // Cleanup test database
    await prisma.task.deleteMany();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up tasks before each test
    await prisma.task.deleteMany();
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test description',
        priority: 'HIGH',
        dueDate: '2024-12-31',
        tags: ['work', 'important']
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(201);

      // Controller returns plain task JSON, not a { success, data } wrapper
      expect(response.body).toMatchObject({
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        completed: false,
        tags: taskData.tags
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
    });

    it('should create a task with minimal data', async () => {
      const taskData = { title: 'Minimal Task' };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(201);

      expect(response.body).toMatchObject({
        title: taskData.title,
        priority: 'MEDIUM',
        completed: false,
        tags: []
      });
    });

    it('should return 400 for invalid task data', async () => {
      const taskData = { title: '', priority: 'INVALID_PRIORITY' };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(400);

      // errorHandler returns ProblemDetails format
      expect(response.body).toMatchObject({ status: 400, title: 'Validation Failed' });
    });

    it('should return 400 for title too long', async () => {
      const taskData = { title: 'a'.repeat(201) };

      await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(400);
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      // Create some test tasks (tags must be stored as JSON string in SQLite)
      await prisma.task.createMany({
        data: [
          {
            id: '1',
            title: 'High Priority Task',
            priority: 'HIGH',
            completed: false,
            tags: JSON.stringify(['work']),
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1
          },
          {
            id: '2',
            title: 'Completed Task',
            priority: 'MEDIUM',
            completed: true,
            tags: JSON.stringify(['personal']),
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1
          },
          {
            id: '3',
            title: 'Low Priority Task',
            priority: 'LOW',
            completed: false,
            tags: JSON.stringify([]),
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1
          }
        ]
      });
    });

    it('should get all tasks', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      // Service returns { data, pagination }
      expect(response.body.data).toHaveLength(3);
      expect(response.body.pagination).toMatchObject({ page: 1, limit: 25, total: 3 });
    });

    it('should filter tasks by priority', async () => {
      const response = await request(app)
        .get('/api/tasks?priority=HIGH')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].priority).toBe('HIGH');
    });

    it('should filter tasks by completion status', async () => {
      const response = await request(app)
        .get('/api/tasks?status=completed')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].completed).toBe(true);
    });

    it('should search tasks by title', async () => {
      const response = await request(app)
        .get('/api/tasks?search=High')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toContain('High');
    });

    it('should paginate tasks', async () => {
      const response = await request(app)
        .get('/api/tasks?page=1&limit=2')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toMatchObject({ page: 1, limit: 2, total: 3, pages: 2 });
    });

    it('should sort tasks', async () => {
      const response = await request(app)
        .get('/api/tasks?sortBy=priority&sortOrder=asc')
        .expect(200);

      expect(response.body.data[0].priority).toBe('LOW');
      expect(response.body.data[2].priority).toBe('HIGH');
    });
  });

  describe('GET /api/tasks/:id', () => {
    let taskId: string;

    beforeEach(async () => {
      const task = await prisma.task.create({
        data: {
          id: '1',
          title: 'Test Task',
          description: 'Test description',
          priority: 'MEDIUM',
          completed: false,
          tags: JSON.stringify(['test']),
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1
        }
      });
      taskId = task.id;
    });

    it('should get a task by id', async () => {
      const response = await request(app)
        .get(`/api/tasks/${taskId}`)
        .expect(200);

      expect(response.body).toMatchObject({ id: taskId, title: 'Test Task', description: 'Test description' });
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .get('/api/tasks/non-existent-id')
        .expect(404);

      expect(response.body).toMatchObject({ status: 404, title: 'Resource Not Found' });
    });
  });

  describe('PATCH /api/tasks/:id', () => {
    let taskId: string;

    beforeEach(async () => {
      const task = await prisma.task.create({
        data: {
          id: '1',
          title: 'Test Task',
          priority: 'MEDIUM',
          completed: false,
          tags: JSON.stringify([]),
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1
        }
      });
      taskId = task.id;
    });

    it('should update a task', async () => {
      const updateData = { title: 'Updated Task', description: 'Updated description', priority: 'HIGH', completed: true, version: 1 };

      const response = await request(app)
        .patch(`/api/tasks/${taskId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({ id: taskId, title: updateData.title, description: updateData.description, priority: updateData.priority, completed: updateData.completed, version: 2 });
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .patch('/api/tasks/non-existent-id')
        .send({ title: 'Updated' })
        .expect(404);

      expect(response.body.status).toBe(404);
    });

    it('should return 409 for version conflict', async () => {
      const updateData = { title: 'Updated Task', version: 999 };

      const response = await request(app)
        .patch(`/api/tasks/${taskId}`)
        .send(updateData)
        .expect(409);

      expect(response.body.status).toBe(409);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let taskId: string;

    beforeEach(async () => {
      const task = await prisma.task.create({
        data: {
          id: '1',
          title: 'Test Task',
          priority: 'MEDIUM',
          completed: false,
          tags: JSON.stringify([]),
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1
        }
      });
      taskId = task.id;
    });

    it('should delete a task', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .expect(204);

      // Verify task is soft deleted
      const deletedTask = await prisma.task.findUnique({ where: { id: taskId } });
      expect(deletedTask?.deletedAt).toBeDefined();
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .delete('/api/tasks/non-existent-id')
        .expect(404);

      expect(response.body.status).toBe(404);
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({ status: 'healthy', timestamp: expect.any(String), version: expect.any(String) });
    });
  });
});
