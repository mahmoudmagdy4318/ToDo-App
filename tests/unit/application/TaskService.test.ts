import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaskService } from '../../../src/application/services/TaskService.js';
import { Priority, Task } from '../../../src/domain/entities/Task.js';

function createMockRepository() {
  return {
    findById: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findDeleted: vi.fn(),
    restore: vi.fn(),
  } as any;
}

describe('TaskService', () => {
  let service: TaskService;
  let repo: ReturnType<typeof createMockRepository>;

  beforeEach(() => {
    repo = createMockRepository();
    service = new TaskService(repo as any);
  });

  describe('getTasks', () => {
    it('returns paginated tasks', async () => {
      const filters = {
        page: 1, limit: 25, sortBy: 'createdAt' as const, sortOrder: 'desc' as const
      };
      const tasks: Task[] = [];
      repo.findMany.mockResolvedValue(tasks);
      repo.count.mockResolvedValue(0);

      const result = await service.getTasks(filters as any);
      expect(result).toEqual({ data: tasks, pagination: { page: 1, limit: 25, total: 0, pages: 0 } });
    });
  });

  describe('createTask', () => {
    it('creates a task with defaults', async () => {
      // Use fake timers so setSystemTime works reliably
      vi.useFakeTimers();
      try {
        const now = new Date();
        vi.setSystemTime(now);
        repo.create.mockImplementation(async (t: Task) => t);

        const result = await service.createTask({ title: 'Test Task', priority: Priority.MEDIUM, tags: ['testing'] });

        expect(result).toBeInstanceOf(Task);
        expect(result.title).toBe('Test Task');
        expect(result.priority).toBe(Priority.MEDIUM);
        expect(result.completed).toBe(false);
        expect(repo.create).toHaveBeenCalled();
      } finally {
        vi.useRealTimers();
      }
    });

    it('parses dueDate yyyy-mm-dd to midnight UTC', async () => {
      repo.create.mockImplementation(async (t: Task) => t);
      const result = await service.createTask({ title: 'Task', dueDate: '2024-12-31' } as any);
      expect(result.dueDate?.toISOString().startsWith('2024-12-31T00:00:00.000Z')).toBe(true);
    });
  });

  describe('updateTask', () => {
    it('enforces optimistic concurrency', async () => {
      const existing = new Task('id', 'Title');
      repo.findById.mockResolvedValue(existing);

      await expect(service.updateTask('id', { version: existing.version + 1 })).rejects.toThrow('modified by another user');
    });

    it('updates provided fields', async () => {
      const existing = new Task('id', 'Title');
      repo.findById.mockResolvedValue(existing);
      repo.update.mockImplementation(async (_id: string, t: Task) => t);

      const updated = await service.updateTask('id', { title: 'New', completed: true } as any);
      expect(updated.title).toBe('New');
      expect(updated.completed).toBe(true);
    });
  });

  describe('toggleTaskComplete', () => {
    it('toggles completion and respects version', async () => {
      const existing = new Task('id', 'Title');
      repo.findById.mockResolvedValue(existing);
      repo.update.mockImplementation(async (_id: string, t: Task) => t);

      const toggled = await service.toggleTaskComplete('id', existing.version);
      expect(toggled.completed).toBe(true);
    });
  });

  describe('delete/restore', () => {
    it('soft deletes a task', async () => {
      const existing = new Task('id', 'Title');
      repo.findById.mockResolvedValue(existing);
      repo.update.mockResolvedValue(existing);
      await service.deleteTask('id');
      expect(repo.update).toHaveBeenCalled();
    });

    it('restores a soft-deleted task', async () => {
      const deleted = new Task('id', 'Title');
      deleted.softDelete();
      repo.findById.mockResolvedValue(deleted);
      repo.update.mockImplementation(async (_id: string, t: Task) => t);

      const restored = await service.restoreTask('id');
      expect(restored.deletedAt).toBe(null);
    });
  });
});
