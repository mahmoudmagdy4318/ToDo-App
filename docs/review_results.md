# Code Review: import_tasks vs Main

This review compares changes on branch `import_tasks` against `Main` and provides feedback with diff snippets.

## Summary
- Feature added: JSON import of tasks via service method and HTTP endpoint.
- Files changed:
  - `src/application/services/TaskService.ts`
  - `src/presentation/controllers/TaskController.ts`
  - `src/presentation/routes/taskRoutes.ts`

## Diff Highlights and Feedback

### 1) Service: importTasksFromJson added

Snippet:
```
+  async importTasksFromJson(payload: unknown): Promise<{ imported: number; errors: Array<{ index: number; message: string }> }> {
+    if (!Array.isArray(payload)) {
+      throw new ValidationError('Invalid import payload: expected an array');
+    }
+
+    const errors: Array<{ index: number; message: string }> = [];
+    let imported = 0;
+
+    for (let i = 0; i < payload.length; i++) {
+      const item = payload[i] as Partial<CreateTaskDto>;
+      try {
+        if (!item || typeof item !== 'object') throw new ValidationError('Invalid item');
+        if (!item.title || typeof item.title !== 'string') throw new ValidationError('Title is required');
+
+        const createDto: CreateTaskDto = {
+          title: item.title,
+          description: item.description ?? null,
+          priority: item.priority ?? Priority.MEDIUM,
+          completed: item.completed ?? false,
+          // normalize dueDate to midnight UTC if yyyy-mm-dd
+          dueDate: item.dueDate
+            ? typeof item.dueDate === 'string' && !item.dueDate.includes('T')
+              ? (item.dueDate + 'T00:00:00.000Z') as any
+              : (item.dueDate as any)
+            : undefined,
+          tags: item.tags ?? []
+        } as any;
+
+        const task = await this.createTask(createDto);
+        if (task) imported++;
+      } catch (e: any) {
+        const message = e?.message ?? 'Unknown error';
+        errors.push({ index: i, message });
+      }
+    }
+
+    return { imported, errors };
+  }
```

Feedback:
- Good: Validates payload type and minimal required fields.
- Concern: `as any` casts on `createDto` allow bypassing type safety. Prefer aligning `CreateTaskDto` shape or using a schema validator.
- Concern: `dueDate` normalization relies on string checks; consider centralizing date parsing (reuse logic in `createTask`) to avoid duplication.
- Improvement: Consider batching repository writes or wrapping in a transaction when backed by a DB.
- Improvement: Return details of created task IDs optionally.

### 2) Controller: importTasks endpoint

Snippet:
```
+  async importTasks(req: Request, res: Response): Promise<void> {
+    try {
+      const result = await this.taskService.importTasksFromJson(req.body);
+      res.status(201).json(result);
+    } catch (error) {
+      if (error instanceof ValidationError) {
+        res.status(400).json({ error: error.message });
+        return;
+      }
+      throw error;
+    }
+  }
```

Feedback:
- Good: Maps service ValidationError to 400.
- Concern: No JSON schema validation on the request body; importing invalid fields may pass to service. Consider a Zod schema for array of CreateTaskDto.
- Note: File shows existing strict type errors related to `exactOptionalPropertyTypes` for filters and `req.params.id`. Ensure `id` is defined or cast (`req.params.id!`) and filters include undefined for optional fields.

Example problematic lines:
```
- const result = await this.taskService.getTasks(filters);
+ // filters.search may be undefined. Ensure TaskFilters types include undefined or cast here.
```

### 3) Routes: wire import endpoint

Snippet:
```
+  router.post('/tasks/import', (req, res) => taskController.importTasks(req, res));
```

Feedback:
- Good: Minimal and consistent with existing route style.
- Consider rate limiting or auth on bulk import endpoint.

## Testing & Coverage
- No tests added for import feature. Add unit tests for `TaskService.importTasksFromJson` and integration test for POST `/api/tasks/import`.
- Ensure Vitest config includes new tests and they don’t hit external systems.

## Security & Performance
- Bulk import can create many tasks quickly. Consider size limits on payload, per-user quotas, and input validation.
- Error aggregation reveals messages; ensure they’re safe to expose.

## Suggested Changes
- Replace `as any` in `createDto` and remove non-typed fields.
- Extract date normalization into a helper reused by both import and create/update.
- Add Zod schema: `z.array(CreateTaskSchema)` for request body in controller.
- Fix controller type issues by narrowing `req.params.id` (`const id = String(req.params.id)` or `req.params.id!`) and ensuring `TaskFiltersSchema` output matches `TaskFilters` optional types.
- Add tests covering success and failure cases of import.

## Conclusion
Feature is a useful addition. Address type-safety, validation, and tests before merge.
