import { test, expect } from '@playwright/test';

test.describe('Basic Page Rendering', () => {
  test('homepage should render correctly', async ({ page }) => {
    await page.goto('/');

    // Check key elements are visible
    await expect(page.locator('h1')).toContainText('スペクトル診断');
    await expect(page.getByText('学術的')).toBeVisible();
    await expect(page.getByText('診断を始める')).toBeVisible();
  });

  test('SCCS info page should render correctly', async ({ page }) => {
    await page.goto('/sccs');

    // Check key elements
    await expect(page.getByText('Self-Concept Clarity Scale')).toBeVisible();
    await expect(page.getByText('12問')).toBeVisible();
    await expect(page.getByText('診断を始める')).toBeVisible();
  });

  test('SCCS test page should render correctly', async ({ page }) => {
    await page.goto('/sccs/test');

    // Should show first question
    await expect(page.getByText('質問 1 / 12')).toBeVisible();

    // Should have answer options
    const buttons = page.getByRole('button');
    await expect(buttons.first()).toBeVisible();
  });

  test('navigation flow works', async ({ page }) => {
    // Start from homepage
    await page.goto('/');

    // Click start button
    await page.getByRole('link', { name: '診断を始める' }).click();

    // Should navigate to SCCS page
    await expect(page).toHaveURL('/sccs/');
    await expect(page.getByText('Self-Concept Clarity Scale')).toBeVisible();
  });
});
