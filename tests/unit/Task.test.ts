import { describe, it, expect, beforeEach } from 'vitest';
import { Task, Priority, ValidationError } from '../../src/domain/entities/Task.js';

describe('Task Entity', () => {
  describe('Task Creation', () => {
    it('should create a task with required properties', () => {
      const task = new Task(
        'test-id',
        'Test Task',
        null,
        Priority.MEDIUM,
        false,
        null,
        [],
        new Date(),
        new Date(),
        null,
        1
      );

      expect(task.id).toBe('test-id');
      expect(task.title).toBe('Test Task');
      expect(task.priority).toBe(Priority.MEDIUM);
      expect(task.completed).toBe(false);
      expect(task.tags).toEqual([]);
      expect(task.version).toBe(1);
    });

    it('should create a task with optional properties', () => {
      const dueDate = new Date('2024-12-31');
      const task = new Task(
        'test-id',
        'Test Task',
        'Test description',
        Priority.HIGH,
        true,
        dueDate,
        ['work', 'urgent'],
        new Date(),
        new Date(),
        null,
        1
      );

      expect(task.description).toBe('Test description');
      expect(task.dueDate).toEqual(dueDate);
      expect(task.tags).toEqual(['work', 'urgent']);
      expect(task.completed).toBe(true);
    });

    it('should throw error for invalid title', () => {
      expect(() => new Task(
        'test-id',
        '', // Invalid empty title
        null,
        Priority.MEDIUM,
        false,
        null,
        [],
        new Date(),
        new Date(),
        null,
        1
      )).toThrow(ValidationError);
    });

    it('should throw error for title too long', () => {
      expect(() => new Task(
        'test-id',
        'a'.repeat(201), // Too long
        null,
        Priority.MEDIUM,
        false,
        null,
        [],
        new Date(),
        new Date(),
        null,
        1
      )).toThrow(ValidationError);
    });

    it('should throw error for description too long', () => {
      expect(() => new Task(
        'test-id',
        'Test Task',
        'a'.repeat(1001), // Too long
        Priority.MEDIUM,
        false,
        null,
        [],
        new Date(),
        new Date(),
        null,
        1
      )).toThrow(ValidationError);
    });
  });

  describe('Task Updates', () => {
    let task: Task;

    beforeEach(() => {
      task = new Task(
        'test-id',
        'Test Task',
        null,
        Priority.MEDIUM,
        false,
        null,
        [],
        new Date(),
        new Date(),
        null,
        1
      );
    });

    it('should update task properties', () => {
      const updates = {
        title: 'Updated Task',
        description: 'Updated description',
        priority: Priority.HIGH,
        completed: true
      };

      task.update(updates);

      expect(task.title).toBe('Updated Task');
      expect(task.description).toBe('Updated description');
      expect(task.priority).toBe(Priority.HIGH);
      expect(task.completed).toBe(true);
      expect(task.version).toBe(2); // Version should increment
    });

    it('should validate updates', () => {
      expect(() => {
        task.update({ title: '' });
      }).toThrow(ValidationError);

      expect(() => {
        task.update({ description: 'a'.repeat(1001) });
      }).toThrow(ValidationError);
    });

    it('should increment version on update', () => {
      const initialVersion = task.version;
      task.update({ title: 'Updated Title' });
      expect(task.version).toBe(initialVersion + 1);
    });
  });

  describe('Task Completion', () => {
    let task: Task;

    beforeEach(() => {
      task = new Task(
        'test-id',
        'Test Task',
        null,
        Priority.MEDIUM,
        false,
        null,
        [],
        new Date(),
        new Date(),
        null,
        1
      );
    });

    it('should mark task as completed', () => {
      task.markCompleted();

      expect(task.completed).toBe(true);
      expect(task.version).toBe(2);
    });

    it('should mark task as incomplete', () => {
      task.markCompleted();
      task.markIncomplete();

      expect(task.completed).toBe(false);
      expect(task.version).toBe(3);
    });

    it('should toggle completion status', () => {
      expect(task.completed).toBe(false);
      
      task.toggleComplete();
      expect(task.completed).toBe(true);
      
      task.toggleComplete();
      expect(task.completed).toBe(false);
    });
  });

  describe('Task Due Date Logic', () => {
    it('should identify overdue tasks', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const task = new Task(
        'test-id',
        'Test Task',
        null,
        Priority.MEDIUM,
        false,
        yesterday,
        [],
        new Date(),
        new Date(),
        null,
        1
      );

      expect(task.isOverdue()).toBe(true);
    });

    it('should not consider completed tasks as overdue', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const task = new Task(
        'test-id',
        'Test Task',
        null,
        Priority.MEDIUM,
        true, // completed
        yesterday,
        [],
        new Date(),
        new Date(),
        null,
        1
      );

      expect(task.isOverdue()).toBe(false);
    });

    it('should not consider tasks without due date as overdue', () => {
      const task = new Task(
        'test-id',
        'Test Task',
        null,
        Priority.MEDIUM,
        false,
        null, // no due date
        [],
        new Date(),
        new Date(),
        null,
        1
      );

      expect(task.isOverdue()).toBe(false);
    });
  });

  describe('Task Soft Delete', () => {
    let task: Task;

    beforeEach(() => {
      task = new Task(
        'test-id',
        'Test Task',
        null,
        Priority.MEDIUM,
        false,
        null,
        [],
        new Date(),
        new Date(),
        null,
        1
      );
    });

    it('should soft delete a task', () => {
      task.softDelete();

      expect(task.deletedAt).toBeInstanceOf(Date);
      expect(task.version).toBe(2);
    });

    it('should restore a soft deleted task', () => {
      task.softDelete();
      task.restore();

      expect(task.deletedAt).toBe(null);
      expect(task.version).toBe(3);
    });
  });
});
