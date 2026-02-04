# Project Source Documentation

This document provides comprehensive documentation for the source code under `src/` and the related behavior covered by tests.

## Architecture Overview
- Layered structure:
  - Domain: entities, errors, interfaces.
  - Application: services, DTOs/schemas.
  - Infrastructure: database (Prisma), repositories, logging, DI container, bootstrap.
  - Presentation: Express controllers, routes, middleware, views integration.
  - App/Server: Express app setup and server entry point.

- Data flow:
  - HTTP Request -> Route -> Controller -> Service -> Repository -> Database.
  - Errors bubble up to error middleware and are translated to HTTP responses.

## Domain
### `src/domain/entities/Task.ts`
- Represents a Task aggregate with properties:
  - id: string
  - title: string
  - description: string | null
  - priority: enum Priority { LOW, MEDIUM, HIGH }
  - completed: boolean
  - dueDate: Date | null
  - tags: string[]
  - createdAt: Date
  - updatedAt: Date
  - deletedAt?: Date | null
  - version: number
- Methods:
  - update(partial): updates mutable fields and increments version.
  - toggleComplete(): toggles completed and increments version.
  - softDelete(): sets deletedAt and increments version.
  - restore(): clears deletedAt and increments version.
  - toJSON(): serializes to plain object for API.
- Errors: ValidationError exported via `src/domain/errors/index.ts`.

### `src/domain/interfaces/TaskRepository.ts`
- Contract for persistence.
- Methods:
  - findById(id): Task | null
  - findMany(filters): Task[]
  - count(filters): number
  - create(task): Task
  - update(id, task): Task
  - delete(id): void
  - findDeleted(filtersWithoutStatus): Task[]
  - restore(id): Task
- Types:
  - TaskFilters: filtering and pagination (page, limit, sortBy, sortOrder, search?, priority?, status?, dueDate?, tags?).
  - PaginatedResult<T>: { data: T[]; pagination: { page, limit, total, pages } }.

## Application
### `src/application/schemas/TaskSchemas.ts`
- Zod schemas for validation:
  - CreateTaskSchema: title, description?, priority?, completed?, dueDate?, tags?
  - UpdateTaskSchema: same fields optional + version for optimistic concurrency.
  - TaskFiltersSchema: query filters for list endpoints.
- DTOs:
  - CreateTaskDto, UpdateTaskDto: types inferred from schemas.

### `src/application/services/TaskService.ts`
- Business logic for tasks.
- Methods:
  - getTasks(filters: TaskFilters): Paginated list.
    - Combines repository `findMany` and `count`.
  - getTaskById(id): throws NotFoundError if missing.
  - createTask(dto: CreateTaskDto):
    - Generates id, sets defaults (Priority.MEDIUM, completed=false).
    - Normalizes `dueDate`: strings without `T` are set to midnight UTC.
    - Persists via repository.
  - updateTask(id, dto: UpdateTaskDto):
    - Enforces optimistic concurrency (version conflict -> ConflictError).
    - Normalizes `dueDate` similarly.
    - Applies updates via entity `update` then repository `update`.
  - toggleTaskComplete(id, version?):
    - Optional version check then toggles and updates.
  - deleteTask(id): soft delete and persist.
  - restoreTask(id): require `deletedAt` set, then restore.
  - getDeletedTasks(filtersWithoutStatus): list soft deleted tasks.
  - importTasksFromJson(payload: unknown):
    - Accepts an array of objects; validates minimal shape and defaults.
    - Normalizes `dueDate` as above.
    - Creates tasks individually; returns `{ imported, errors }`.

- Errors:
  - ValidationError for invalid inputs.
  - NotFoundError for missing resources.
  - ConflictError for version conflicts.

- Design notes:
  - Date normalization logic duplicated; candidates for refactor into helper.
  - ID generation uses crypto random bytes to produce base64url prefixed with `task_`.

## Infrastructure
### `src/infrastructure/database/prisma.ts`
- Prisma client initialization and datasource configuration.

### `src/infrastructure/repositories/PrismaTaskRepository.ts`
- Implements TaskRepository using Prisma.
- Maps between Prisma records and domain `Task` entity.
- Supports filtering by search/priority/status/dueDate/tags and pagination/sorting.

### `src/infrastructure/logging/logger.ts`
- Winston-based logger configured with service name and request metadata.
- Provides info/error logging used across controllers and tests.

### `src/infrastructure/container/Container.ts`
- Basic DI container wiring repository and services.

### `src/infrastructure/bootstrap/bootstrap.ts`
- App bootstrapping helpers, environment loading.

## Presentation
### `src/presentation/controllers/TaskController.ts`
- Express controller translating HTTP to service calls.
- Validates body and query via zod schemas.
- Methods:
  - getTasks(req, res): parses `TaskFiltersSchema`, returns paginated result.
  - getTaskById(req, res): fetches and returns task JSON.
  - createTask(req, res): validates `CreateTaskSchema`, creates, returns 201.
  - updateTask(req, res): validates `UpdateTaskSchema`, updates.
  - toggleComplete(req, res): toggles completion, optional version.
  - deleteTask(req, res): soft deletes.
  - restoreTask(req, res): restores soft deleted.
  - getDeletedTasks(req, res): lists soft deleted.
  - importTasks(req, res): new import endpoint; maps ValidationError to HTTP 400.

### `src/presentation/routes/taskRoutes.ts`
- Registers routes:
  - GET `/tasks`
  - POST `/tasks`
  - POST `/tasks/import` (new)
  - GET `/tasks/deleted`
  - GET `/tasks/:id`
  - PATCH `/tasks/:id`
  - PATCH `/tasks/:id/toggle`
  - DELETE `/tasks/:id`
  - POST `/tasks/:id/restore`

### `src/presentation/middleware/errorHandler.ts`
- Central error handling middleware mapping domain errors to HTTP status codes.

### `src/app.ts` and `src/server.ts`
- App setup includes:
  - Express configuration, JSON parsing, layouts.
  - Routes registration, error handler.
- Server starts HTTP listener and logs health.

## Behavior Validated by Tests
- Unit tests cover:
  - Task entity behaviors: versioning, toggle, delete/restore.
  - Service methods: pagination, create defaults, dueDate parsing, update with version conflict, toggleComplete, delete/restore.
  - Controller error handling: ValidationError, NotFoundError, ConflictError, generic errors.
  - Repository behaviors via Prisma (unit oriented), logger output.
  - Schemas validation for DTOs.
- Integration tests cover:
  - Endpoints for tasks CRUD, filters, sorting, pagination, health.
  - Proper status codes and responses.

## Usage Examples
- Create Task:
```ts
const task = await taskService.createTask({ title: 'My Task', priority: Priority.HIGH, tags: ['work'] });
```
- List Tasks:
```ts
const result = await taskService.getTasks({ page: 1, limit: 25, sortBy: 'createdAt', sortOrder: 'desc' });
```
- Import Tasks:
```ts
const payload = [
  { title: 'A', priority: 'LOW', dueDate: '2025-01-01' },
  { title: 'B', completed: true }
];
const summary = await taskService.importTasksFromJson(payload);
// { imported: 2, errors: [] }
```

## Known Limitations & Future Work
- Improve type safety by removing `as any` casts in import path.
- Extract common date normalization function.
- Add request schema validation for import endpoint with Zod.
- Consider rate limiting and authentication guards for bulk operations.
- Enhance tests with import feature unit/integration cases.
