import { test, expect } from '@playwright/test';

test.describe('SCCS Diagnostic Flow', () => {
  test('should complete full diagnostic flow', async ({ page }) => {
    // 1. Start from homepage
    await page.goto('/');
    await page.getByRole('link', { name: '診断を始める' }).click();

    // 2. SCCS info page
    await expect(page).toHaveURL('/sccs/');
    await expect(page.getByText('Self-Concept Clarity Scale')).toBeVisible();
    await expect(page.getByText('12問')).toBeVisible();
    await expect(page.getByText('約5分')).toBeVisible();

    // Start test
    await page.getByRole('link', { name: '診断を始める' }).click();

    // 3. Test page - answer all questions
    await expect(page).toHaveURL('/sccs/test/');

    // Answer all 12 questions
    for (let i = 0; i < 12; i++) {
      // Wait for question to be visible
      await page.waitForSelector('h2', { state: 'visible' });

      // Click first available option
      const buttons = page.getByRole('button');
      const firstButton = buttons.first();
      await firstButton.waitFor({ state: 'visible' });
      await firstButton.click();

      // Wait for auto-advance
      await page.waitForTimeout(500);
    }

    // On last question, click "結果を見る" button
    const submitButton = page.getByRole('button', { name: '結果を見る' });
    await submitButton.waitFor({ state: 'visible', timeout: 10000 });
    await submitButton.click();

    // 4. Results page
    await expect(page).toHaveURL('/results/sccs/');
    await expect(page.getByText('診断結果')).toBeVisible();
  });

  test('should display progress bar on test page', async ({ page }) => {
    await page.goto('/sccs/test/');

    // Progress bar should show "質問 1 / 12"
    await expect(page.getByText('質問 1 / 12')).toBeVisible();
  });

  test('should allow going back to previous question', async ({ page }) => {
    await page.goto('/sccs/test/');

    // Answer first question
    const option = page.getByRole('button').filter({ hasText: '全く当てはまらない' });
    await option.click();

    // Wait for auto-advance
    await page.waitForTimeout(300);

    // Should now be on question 2
    await expect(page.getByText('質問 2 / 12')).toBeVisible();

    // Click back button
    await page.getByRole('button', { name: '← 前の質問' }).click();

    // Should be back on question 1
    await expect(page.getByText('質問 1 / 12')).toBeVisible();
  });
});
