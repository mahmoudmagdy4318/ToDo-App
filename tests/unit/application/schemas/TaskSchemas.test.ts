import { describe, it, expect } from 'vitest';
import { CreateTaskSchema, UpdateTaskSchema, TaskFiltersSchema } from '../../../../src/application/schemas/TaskSchemas.js';
import { Priority } from '../../../../src/domain/entities/Task.js';

describe('Application Schemas - TaskSchemas', () => {
  describe('CreateTaskSchema', () => {
    it('validates minimal payload and applies defaults', () => {
      const parsed = CreateTaskSchema.parse({ title: 'New task' });
      expect(parsed).toEqual({
        title: 'New task',
        priority: Priority.MEDIUM,
        tags: []
      });
    });

    it('accepts ISO and yyyy-mm-dd dueDate formats', () => {
      const iso = CreateTaskSchema.parse({ title: 't', dueDate: '2024-12-31T10:15:00.000Z' });
      expect(iso.dueDate).toBe('2024-12-31T10:15:00.000Z');

      const dateOnly = CreateTaskSchema.parse({ title: 't', dueDate: '2024-12-31' });
      expect(dateOnly.dueDate).toBe('2024-12-31');
    });

    it('rejects invalid data (empty title, too many/long tags)', () => {
      expect(() => CreateTaskSchema.parse({ title: '' })).toThrowError();
      expect(() => CreateTaskSchema.parse({ title: 't', tags: new Array(11).fill('a') })).toThrowError();
      expect(() => CreateTaskSchema.parse({ title: 't', tags: ['a'.repeat(31)] })).toThrowError();
    });
  });

  describe('UpdateTaskSchema', () => {
    it('allows partial updates', () => {
      const parsed = UpdateTaskSchema.parse({ title: 'Updated', completed: true, priority: Priority.HIGH });
      expect(parsed).toMatchObject({ title: 'Updated', completed: true, priority: Priority.HIGH });
    });

    it('validates version as positive integer', () => {
      expect(() => UpdateTaskSchema.parse({ version: 0 })).toThrowError();
      expect(() => UpdateTaskSchema.parse({ version: -1 })).toThrowError();
      const ok = UpdateTaskSchema.parse({ version: 1 });
      expect(ok.version).toBe(1);
    });

    it('validates title/description constraints', () => {
      expect(() => UpdateTaskSchema.parse({ title: '' })).toThrowError();
      expect(() => UpdateTaskSchema.parse({ description: 'a'.repeat(1001) })).toThrowError();
    });

    it('accepts dueDate in supported formats', () => {
      expect(UpdateTaskSchema.parse({ dueDate: '2024-12-31' }).dueDate).toBe('2024-12-31');
      expect(UpdateTaskSchema.parse({ dueDate: '2024-12-31T00:00:00.000Z' }).dueDate).toBe('2024-12-31T00:00:00.000Z');
    });
  });

  describe('TaskFiltersSchema', () => {
    it('coerces pagination and applies defaults', () => {
      const parsed = TaskFiltersSchema.parse({ page: '2', limit: '10' });
      expect(parsed).toMatchObject({ page: 2, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' });
    });

    it('validates enums and optional fields', () => {
      const parsed = TaskFiltersSchema.parse({ status: 'completed', priority: Priority.LOW, dueDate: 'today' });
      expect(parsed.status).toBe('completed');
      expect(parsed.priority).toBe(Priority.LOW);
      expect(parsed.dueDate).toBe('today');

      expect(() => TaskFiltersSchema.parse({ status: 'done' })).toThrowError();
      expect(() => TaskFiltersSchema.parse({ sortBy: 'unknown' })).toThrowError();
    });
  });
});
