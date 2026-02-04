import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

async function saveScreenshot(page, name: string) {
  await page.screenshot({ path: `docs/${name}.png`, fullPage: true });
}

test.describe('App screenshots', () => {
  test('home and health', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await saveScreenshot(page, 'home');

    const res = await page.goto(`${BASE_URL}/health`);
    expect(res?.status()).toBe(200);
    await saveScreenshot(page, 'health');
  });

  test('tasks list', async ({ page }) => {
    await page.goto(`${BASE_URL}/tasks`);
    await saveScreenshot(page, 'tasks-list');
  });

  test('create task flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/tasks`);
    // Example: if there's a form, fill and submit; otherwise just capture endpoint JSON
    // Adjust selectors as needed for your EJS view
    await saveScreenshot(page, 'tasks-create-form');
  });

  test('deleted tasks', async ({ page }) => {
    await page.goto(`${BASE_URL}/tasks/deleted`);
    await saveScreenshot(page, 'tasks-deleted');
  });

  test('import endpoint', async ({ page }) => {
    // Capture a screenshot of a JSON response via /tasks (simulating import preview)
    await page.goto(`${BASE_URL}/tasks`);
    await saveScreenshot(page, 'tasks-before-import');
  });
});
