import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test('processes time log and displays table', async ({ page }) => {
  // Make sure your frontend dev server is running at this address
  await page.goto('http://localhost:5174');

  // Read the content of appendix1.txt
  const appendix1Path = path.resolve(__dirname, '../../appendix1.txt');
  const appendix1Content = fs.readFileSync(appendix1Path, 'utf-8');

  // Fill the textarea with the content of appendix1.txt
  await page.fill('textarea', appendix1Content);

  // Click the process button
  await page.click('button:has-text("Process Text")');

  // Wait for the results table to be visible and contain the expected data for Markus Lange
  await expect(page.getByText('Markus Lange')).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('1 April, 2025')).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('9:00')).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('12:00')).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('Frontend-Insider-Tool Abstimmung')).toBeVisible({ timeout: 15000 });

  // Check for another employee to be sure
  await expect(page.getByText('Sabrina König')).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('GS-Kleinarbeiten')).toBeVisible({ timeout: 15000 });
});
