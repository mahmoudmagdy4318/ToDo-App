import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrismaTaskRepository } from '../../../src/infrastructure/repositories/PrismaTaskRepository.js';
import { Priority, Task } from '../../../src/domain/entities/Task.js';

function createMockPrisma() {
  return {
    task: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    }
  } as any;
}

describe('Infrastructure - PrismaTaskRepository', () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let repo: PrismaTaskRepository;

  beforeEach(() => {
    prisma = createMockPrisma();
    repo = new PrismaTaskRepository(prisma as any);
  });

  it('maps Prisma record to Task entity on findById', async () => {
    const now = new Date();
    prisma.task.findFirst.mockResolvedValue({
      id: '1', title: 't', description: null, priority: 'MEDIUM', completed: false,
      dueDate: null, tags: JSON.stringify(['a']), createdAt: now, updatedAt: now, deletedAt: null, version: 1
    });

    const task = await repo.findById('1');
    expect(task).toBeInstanceOf(Task);
    expect(task?.tags).toEqual(['a']);
  });

  it('returns null when not found', async () => {
    prisma.task.findFirst.mockResolvedValue(null);
    const task = await repo.findById('nope');
    expect(task).toBeNull();
  });

  it('creates and returns mapped Task', async () => {
    const now = new Date();
    prisma.task.create.mockResolvedValue({
      id: 'x', title: 't', description: null, priority: 'LOW', completed: false,
      dueDate: null, tags: JSON.stringify([]), createdAt: now, updatedAt: now, deletedAt: null, version: 1
    });

    const created = await repo.create(new Task('x', 't', null, Priority.LOW));
    expect(created).toBeInstanceOf(Task);
    expect(prisma.task.create).toHaveBeenCalled();
  });

  it('updates and returns mapped Task', async () => {
    const now = new Date();
    prisma.task.update.mockResolvedValue({
      id: 'x', title: 't2', description: 'd', priority: 'HIGH', completed: true,
      dueDate: null, tags: JSON.stringify(['a']), createdAt: now, updatedAt: now, deletedAt: null, version: 2
    });

    const updated = await repo.update('x', new Task('x', 't2', 'd', Priority.HIGH, true));
    expect(updated.completed).toBe(true);
    expect(updated.priority).toBe(Priority.HIGH);
  });

  it('applies filters and ordering in findMany/count', async () => {
    prisma.task.findMany.mockResolvedValue([]);
    prisma.task.count.mockResolvedValue(0);

    await repo.findMany({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc', status: 'completed' } as any);
    expect(prisma.task.findMany).toHaveBeenCalledWith(expect.objectContaining({
      skip: 0, take: 10, orderBy: { createdAt: 'desc' }
    }));

    await repo.count({ page: 1, limit: 10, sortBy: 'title', sortOrder: 'asc', priority: Priority.HIGH } as any);
    expect(prisma.task.count).toHaveBeenCalledWith(expect.any(Object));
  });

  it('soft deletes via delete and sets timestamps', async () => {
    prisma.task.update.mockResolvedValue({});
    await repo.delete('id-1');
    expect(prisma.task.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'id-1' },
      data: expect.objectContaining({ deletedAt: expect.any(Date), updatedAt: expect.any(Date) })
    }));
  });

  it('restores a soft deleted task', async () => {
    const now = new Date();
    prisma.task.update.mockResolvedValue({
      id: 'x', title: 't', description: null, priority: 'MEDIUM', completed: false,
      dueDate: null, tags: JSON.stringify([]), createdAt: now, updatedAt: now, deletedAt: null, version: 2
    });

    const restored = await repo.restore('x');
    expect(restored.deletedAt).toBeNull();
  });

  it('findDeleted returns only deleted items', async () => {
    const now = new Date();
    prisma.task.findMany.mockResolvedValue([
      { id: 'd1', title: 't', description: null, priority: 'MEDIUM', completed: false,
        dueDate: null, tags: '[]', createdAt: now, updatedAt: now, deletedAt: now, version: 1 }
    ]);

    const res = await repo.findDeleted({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' } as any);
    expect(res[0]).toBeInstanceOf(Task);
    expect(prisma.task.findMany).toHaveBeenCalledWith(expect.objectContaining({ orderBy: { deletedAt: 'desc' } }));
  });
});
