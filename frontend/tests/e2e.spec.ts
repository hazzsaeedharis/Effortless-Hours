import { test, expect } from '@playwright/test';

test('processes time log and displays table', async ({ page }) => {
  // Make sure your frontend dev server is running at this address
  await page.goto('http://localhost:5174');

  const testData = `
Employee 1: Markus Lange

1 April, 2025
9:00 – 12:00 → Frontend-Insider-Tool Abstimmung
12:30 – 17:30 → Integration Social Login bei Google

2 April, 2025
8:30 – 11:30 → TB-Anwendung: Meta-Pixel Integration für Kampagnentracking
12:00 – 16:00 → ÖTB-Anwendung: DSGVO-Update Task
16:00 – 17:30 → Cloud-Ablagestruktur Entwurf
  `;

  // Fill the textarea with the test data
  await page.fill('textarea', testData);

  // Click the process button
  await page.click('button:has-text("Process Text")');

  // Log the page content for debugging
  console.log(await page.content());

  // Wait for the results table to be visible and contain the expected data for Markus Lange
  await expect(page.getByText('Markus Lange')).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('1 April, 2025')).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('9:00')).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('12:00')).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('Frontend-Insider-Tool Abstimmung')).toBeVisible({ timeout: 15000 });

  // Check for a second entry for the same employee
  await expect(page.getByText('Integration Social Login bei Google')).toBeVisible({ timeout: 15000 });
});
