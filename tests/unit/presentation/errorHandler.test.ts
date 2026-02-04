import { describe, it, expect } from 'vitest';
import { errorHandler, notFoundHandler } from '../../../src/presentation/middleware/errorHandler.js';
import { ValidationError, NotFoundError, ConflictError } from '../../../src/domain/entities/Task.js';

function mockReqRes(path = '/x') {
  const req: any = { path, method: 'GET', url: path, headers: {} };
  const res: any = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: undefined as any,
    status(code: number) { this.statusCode = code; return this; },
    json(payload: any) { this.body = payload; return this; },
    setHeader(k: string, v: string) { this.headers[k] = v; }
  };
  return { req, res };
}

describe('Presentation - errorHandler middleware', () => {
  it('handles ValidationError with 400', async () => {
    const { req, res } = mockReqRes('/api');
    errorHandler(new ValidationError('bad'), req, res, () => {});
    expect(res.statusCode).toBe(400);
    expect(res.body.title).toBe('Validation Failed');
    expect(res.body.detail).toContain('bad');
    expect(res.body.traceId).toBeDefined();
  });

  it('handles NotFoundError with 404', async () => {
    const { req, res } = mockReqRes('/api/xyz');
    errorHandler(new NotFoundError('Task', 'id1'), req, res, () => {});
    expect(res.statusCode).toBe(404);
    expect(res.body.title).toBe('Resource Not Found');
  });

  it('handles ConflictError with 409', async () => {
    const { req, res } = mockReqRes('/api/xyz');
    errorHandler(new ConflictError('conflict'), req, res, () => {});
    expect(res.statusCode).toBe(409);
    expect(res.body.title).toBe('Conflict');
  });

  it('handles generic errors with 500 and hides detail in production', async () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const { req, res } = mockReqRes('/api/xyz');
    errorHandler(new Error('secret'), req, res, () => {});
    expect(res.statusCode).toBe(500);
    expect(res.body.title).toBe('Internal Server Error');
    expect(res.body.detail).not.toContain('secret');
    process.env.NODE_ENV = prev;
  });

  it('notFoundHandler returns 404 ProblemDetails', () => {
    const { req, res } = mockReqRes('/missing');
    notFoundHandler(req, res);
    expect(res.statusCode).toBe(404);
    expect(res.body.title).toBe('Not Found');
    expect(res.body.detail).toContain('/missing');
  });
});
