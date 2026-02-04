import { test, expect } from '@playwright/test';

// Basic E2E covering the EJS Todo UI
// Assumes the server runs on baseURL and renders views from /views

test.describe('Todo UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for app JS to initialize
    await page.waitForFunction(() => (window as any).todoApp?.initialized === true, undefined, { timeout: 5000 });
  });

  test('loads home page and shows title', async ({ page }) => {
    // Navbar brand contains the app title
    await expect(page.locator('.navbar-brand')).toContainText(/Todo App/i);
  });

  test('can create a new task via UI', async ({ page }) => {
    // Fill form using element ids
    await page.locator('#title').fill('UI Task');
    await page.locator('#priority').selectOption('MEDIUM');
    await page.locator('#tags').fill('ui');

    const postPromise = page.waitForResponse(resp => resp.url().includes('/api/tasks') && resp.request().method() === 'POST' && resp.status() === 201);
    await page.locator('#task-form button[type="submit"]').click();
    await postPromise;

    // Then wait for tasks reload GET
    await page.waitForResponse(resp => resp.url().includes('/api/tasks?page=') && resp.request().method() === 'GET' && resp.status() === 200);

    // Verify task appears in list
    const list = page.locator('#task-list .task-item');
    await expect(list.first()).toContainText('UI Task');
  });

  test('can toggle completion', async ({ page }) => {
    // Create task first
    await page.locator('#title').fill('Toggle Task');
    const postPromise = page.waitForResponse(resp => resp.url().includes('/api/tasks') && resp.request().method() === 'POST' && resp.status() === 201);
    await page.locator('#task-form button[type="submit"]').click();
    await postPromise;
    await page.waitForResponse(resp => resp.url().includes('/api/tasks?page=') && resp.request().method() === 'GET' && resp.status() === 200);

    const item = page.locator('#task-list .task-item', { hasText: 'Toggle Task' });
    await expect(item).toHaveCount(1);
    const checkbox = item.locator('.task-completed');

    const patchPromise = page.waitForResponse(resp => resp.url().includes('/api/tasks/') && resp.request().method() === 'PATCH' && resp.status() === 200);
    await checkbox.check();
    await patchPromise;

    await expect(item).toHaveClass(/completed/);
  });

  test('search filters tasks', async ({ page }) => {
    // Create two tasks
    await page.locator('#title').fill('Alpha');
    const postAlpha = page.waitForResponse(resp => resp.url().includes('/api/tasks') && resp.request().method() === 'POST' && resp.status() === 201);
    await page.locator('#task-form button[type="submit"]').click();
    await postAlpha;
    await page.waitForResponse(resp => resp.url().includes('/api/tasks?page=') && resp.request().method() === 'GET' && resp.status() === 200);

    await page.locator('#title').fill('Beta');
    const postBeta = page.waitForResponse(resp => resp.url().includes('/api/tasks') && resp.request().method() === 'POST' && resp.status() === 201);
    await page.locator('#task-form button[type="submit"]').click();
    await postBeta;
    await page.waitForResponse(resp => resp.url().includes('/api/tasks?page=') && resp.request().method() === 'GET' && resp.status() === 200);

    // Use search input with id
    await page.locator('#search').fill('Alpha');
    // Debounce wait and data reload
    await page.waitForTimeout(350);
    await page.waitForResponse(resp => resp.url().includes('/api/tasks?') && resp.request().method() === 'GET' && resp.status() === 200);

    const items = page.locator('#task-list .task-item');
    await expect(items).toHaveCount(1);
    await expect(items.first()).toContainText('Alpha');
  });
});
