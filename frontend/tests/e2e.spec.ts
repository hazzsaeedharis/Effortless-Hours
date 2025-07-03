import { test, expect } from '@playwright/test';

test('processes time log and displays table', async ({ page }) => {
  // Make sure your frontend dev server is running at this address
  await page.goto('http://localhost:5173');

  // Fill the textarea with a sample time log
  await page.fill('textarea', 'John Doe\n1 April, 2025\n9:00 – 12:00 → Test Task');

  // Click the Process Text button
  await page.click('text=Process Text');

  // Wait for the table to appear and check for expected content
  await expect(page.getByText('John Doe')).toBeVisible();
  await expect(page.getByText('Test Task')).toBeVisible();
  await expect(page.getByText('Unverified')).toBeVisible();
}); 