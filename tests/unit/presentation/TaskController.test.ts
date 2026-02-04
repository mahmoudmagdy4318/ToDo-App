import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaskController } from '../../../src/presentation/controllers/TaskController.js';
import { Priority, Task, ValidationError } from '../../../src/domain/entities/Task.js';

function mockReqRes(init?: Partial<any>) {
  const req: any = { params: {}, query: {}, body: {}, ...init };
  const res: any = {
    statusCode: 200,
    json: vi.fn(function (this: any, v: any) { this.body = v; return this; }),
    status: vi.fn(function (this: any, c: number) { this.statusCode = c; return this; }),
    render: vi.fn(),
    send: vi.fn(function (this: any, v?: any) { this.body = v; return this; })
  };
  return { req, res };
}

describe('Presentation - TaskController', () => {
  let controller: TaskController;
  let service: any;

  beforeEach(() => {
    service = {
      getTasks: vi.fn(),
      getTaskById: vi.fn(),
      createTask: vi.fn(),
      updateTask: vi.fn(),
      toggleTaskComplete: vi.fn(),
      deleteTask: vi.fn(),
      restoreTask: vi.fn(),
      getDeletedTasks: vi.fn()
    };
    controller = new TaskController(service);
  });

  it('getTasks returns paginated list', async () => {
    service.getTasks.mockResolvedValue({ data: [], pagination: { page: 1, limit: 25, total: 0, pages: 0 } });
    const { req, res } = mockReqRes({ query: { page: '1', limit: '25' } });
    await controller.getTasks(req, res);
    expect(res.json).toHaveBeenCalledWith({ data: [], pagination: { page: 1, limit: 25, total: 0, pages: 0 } });
  });

  it('getTasks validation error maps to ValidationError', async () => {
    const { req, res } = mockReqRes({ query: { page: '0' } }); // invalid min
    await expect(controller.getTasks(req, res)).rejects.toBeInstanceOf(ValidationError);
  });

  it('createTask validates input and returns 201', async () => {
    const task = new Task('1', 'title');
    service.createTask.mockResolvedValue(task);
    const { req, res } = mockReqRes({ body: { title: 'title', priority: Priority.MEDIUM } });
    await controller.createTask(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(task.toJSON());
  });

  it('createTask throws ValidationError on invalid payload', async () => {
    const { req, res } = mockReqRes({ body: { title: '' } });
    await expect(controller.createTask(req, res)).rejects.toBeInstanceOf(ValidationError);
  });

  it('updateTask validates and returns updated task', async () => {
    const task = new Task('1', 'updated');
    service.updateTask.mockResolvedValue(task);
    const { req, res } = mockReqRes({ params: { id: '1' }, body: { title: 'updated' } });
    await controller.updateTask(req, res);
    expect(res.json).toHaveBeenCalledWith(task.toJSON());
  });

  it('toggleComplete toggles completion', async () => {
    const task = new Task('1', 't');
    task.toggleComplete();
    service.toggleTaskComplete.mockResolvedValue(task);
    const { req, res } = mockReqRes({ params: { id: '1' }, body: { version: task.version } });
    await controller.toggleComplete(req, res);
    expect(res.json).toHaveBeenCalledWith(task.toJSON());
  });

  it('deleteTask responds 204', async () => {
    const { req, res } = mockReqRes({ params: { id: '1' } });
    await controller.deleteTask(req, res);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.json).not.toHaveBeenCalled();
  });

  it('restoreTask returns restored entity', async () => {
    const task = new Task('1', 't');
    service.restoreTask.mockResolvedValue(task);
    const { req, res } = mockReqRes({ params: { id: '1' } });
    await controller.restoreTask(req, res);
    expect(res.json).toHaveBeenCalledWith(task.toJSON());
  });

  it('getDeletedTasks validates filters', async () => {
    service.getDeletedTasks.mockResolvedValue([]);
    const { req, res } = mockReqRes({ query: { page: '1', limit: '5' } });
    await controller.getDeletedTasks(req, res);
    expect(res.json).toHaveBeenCalledWith([]);
  });
});
