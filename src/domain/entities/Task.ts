export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class Task {
  constructor(
    public id: string,
    public title: string,
    public description: string | null = null,
    public priority: Priority = Priority.MEDIUM,
    public completed: boolean = false,
    public dueDate: Date | null = null,
    public tags: string[] = [],
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public deletedAt: Date | null = null,
    public version: number = 1
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.title?.trim()) {
      throw new ValidationError('Task title is required', 'title');
    }
    if (this.title.length > 200) {
      throw new ValidationError('Task title must be 200 characters or less', 'title');
    }
    if (this.description && this.description.length > 1000) {
      throw new ValidationError('Task description must be 1000 characters or less', 'description');
    }
    if (this.tags.length > 10) {
      throw new ValidationError('Task cannot have more than 10 tags', 'tags');
    }
    for (const tag of this.tags) {
      if (tag.length > 30) {
        throw new ValidationError('Tag must be 30 characters or less', 'tags');
      }
    }
  }

  markCompleted(): void {
    this.completed = true;
    this.updatedAt = new Date();
    this.version++;
  }

  markIncomplete(): void {
    this.completed = false;
    this.updatedAt = new Date();
    this.version++;
  }

  toggleComplete(): void {
    if (this.completed) {
      this.markIncomplete();
    } else {
      this.markCompleted();
    }
  }

  isOverdue(): boolean {
    if (!this.dueDate || this.completed) {
      return false;
    }
    return this.dueDate < new Date();
  }

  softDelete(): void {
    this.deletedAt = new Date();
    this.updatedAt = new Date();
    this.version++;
  }

  restore(): void {
    this.deletedAt = null;
    this.updatedAt = new Date();
    this.version++;
  }

  update(data: Partial<Omit<Task, 'id' | 'createdAt' | 'deletedAt' | 'version'>>): void {
    if (data.title !== undefined) this.title = data.title;
    if (data.description !== undefined) this.description = data.description;
    if (data.priority !== undefined) this.priority = data.priority;
    if (data.completed !== undefined) this.completed = data.completed;
    if (data.dueDate !== undefined) this.dueDate = data.dueDate;
    if (data.tags !== undefined) this.tags = data.tags;

    this.updatedAt = new Date();
    this.version++;
    this.validate();
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      priority: this.priority,
      completed: this.completed,
      dueDate: this.dueDate?.toISOString() || null,
      tags: this.tags,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      deletedAt: this.deletedAt?.toISOString() || null,
      isOverdue: this.isOverdue(),
      version: this.version
    };
  }
}
