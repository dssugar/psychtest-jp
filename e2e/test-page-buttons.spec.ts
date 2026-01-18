import { test, expect } from '@playwright/test';

test.describe('SCCS Test Page - Button Visibility and Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sccs/test');
    // Wait for page to be fully loaded
    await expect(page.getByText('質問 1 / 12')).toBeVisible();
  });

  test('answer buttons should be visible', async ({ page }) => {
    // Should have 5 answer buttons (the scale labels)
    const buttons = await page.getByRole('button').all();

    // Filter to answer buttons only (exclude navigation buttons)
    // Actual scale labels from data/sccs-questions.ts
    const scaleLabels = [
      "全く当てはまらない",
      "あまり当てはまらない",
      "どちらとも言えない",
      "やや当てはまる",
      "非常に当てはまる",
    ];

    let visibleAnswerButtons = 0;
    for (const button of buttons) {
      const text = await button.textContent();
      if (text && scaleLabels.some(label => text.includes(label))) {
        await expect(button).toBeVisible();
        visibleAnswerButtons++;
      }
    }

    expect(visibleAnswerButtons).toBe(5);
  });

  test('answer buttons should have proper styling', async ({ page }) => {
    // Get the first answer button
    const firstButton = page.getByRole('button').filter({
      hasText: '全く当てはまらない'
    });

    await expect(firstButton).toBeVisible();

    // Check that button has border
    const borderWidth = await firstButton.evaluate((el) => {
      return window.getComputedStyle(el).borderWidth;
    });

    // Should have a border (brutal design)
    expect(borderWidth).not.toBe('0px');

    // Check button has background color
    const bgColor = await firstButton.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Should not be transparent
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('answer buttons should be clickable and change state', async ({ page }) => {
    const firstButton = page.getByRole('button').filter({
      hasText: '全く当てはまらない'
    });

    // Get initial background color
    const initialBgColor = await firstButton.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Click the button
    await firstButton.click();

    // Wait for state change
    await page.waitForTimeout(300);

    // Background color should change after selection
    const selectedBgColor = await firstButton.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    expect(selectedBgColor).not.toBe(initialBgColor);
  });

  test('clicking answer button should advance to next question automatically', async ({ page }) => {
    // Should be on question 1
    await expect(page.getByText('質問 1 / 12')).toBeVisible();

    // Click first answer
    const firstButton = page.getByRole('button').filter({
      hasText: '全く当てはまらない'
    });
    await firstButton.click();

    // Should automatically advance to question 2 after short delay
    await expect(page.getByText('質問 2 / 12')).toBeVisible({ timeout: 1000 });
  });

  test('radio indicator should be visible in answer buttons', async ({ page }) => {
    // Check that radio indicator div exists and is visible
    const firstButton = page.getByRole('button').filter({
      hasText: '全く当てはまらない'
    });

    await expect(firstButton).toBeVisible();

    // The button should contain a radio indicator (a small square/circle)
    // Check for the inner div structure
    const hasRadioIndicator = await firstButton.evaluate((el) => {
      // Look for the radio indicator div
      const indicator = el.querySelector('div.w-6.h-6');
      return indicator !== null;
    });

    expect(hasRadioIndicator).toBe(true);
  });

  test('all scale labels should be present', async ({ page }) => {
    // Check all 5 scale options are present
    await expect(page.getByText('全く当てはまらない')).toBeVisible();
    await expect(page.getByText('あまり当てはまらない')).toBeVisible();
    await expect(page.getByText('どちらとも言えない')).toBeVisible();
    await expect(page.getByText('やや当てはまる')).toBeVisible();
    await expect(page.getByText('非常に当てはまる')).toBeVisible();
  });

  test('buttons should have hover effect', async ({ page }) => {
    const firstButton = page.getByRole('button').filter({
      hasText: '全く当てはまらない'
    });

    // Hover over button
    await firstButton.hover();

    // Check for shadow (brutal design should add shadow on hover)
    const boxShadow = await firstButton.evaluate((el) => {
      return window.getComputedStyle(el).boxShadow;
    });

    // Should have some shadow
    expect(boxShadow).not.toBe('none');
  });
});
