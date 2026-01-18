import { test, expect } from '@playwright/test';

test.describe('Results Page', () => {
  // Helper function to complete test and reach results
  async function completeTest(page: any) {
    await page.goto('/sccs/test/');

    // Answer all 12 questions
    for (let i = 0; i < 12; i++) {
      // Wait for question to be visible
      await page.waitForSelector('h2', { state: 'visible' });

      // Find any visible button (select first available option)
      const buttons = page.getByRole('button');
      const firstButton = buttons.first();
      await firstButton.waitFor({ state: 'visible' });
      await firstButton.click();

      // Wait for auto-advance
      await page.waitForTimeout(500);
    }

    // Wait for submit button and click
    const submitButton = page.getByRole('button', { name: '結果を見る' });
    await submitButton.waitFor({ state: 'visible', timeout: 10000 });
    await submitButton.click();

    // Wait for results page
    await page.waitForURL('/results/sccs/', { timeout: 10000 });
  }

  test('should display score circle', async ({ page }) => {
    await completeTest(page);

    // Score circle should be visible
    await expect(page.getByText('自己概念の明確さ')).toBeVisible();

    // SVG circle should be present
    const svg = page.locator('svg').first();
    await expect(svg).toBeVisible();
  });

  test('should display score with data-number class', async ({ page }) => {
    await completeTest(page);

    // Should have .data-number class elements
    const dataNumbers = page.locator('.data-number');
    await expect(dataNumbers.first()).toBeVisible();

    // Check has mono font class
    const className = await dataNumbers.first().getAttribute('class');
    expect(className).toContain('font-mono');
  });

  test('should display level badge', async ({ page }) => {
    await completeTest(page);

    // Level text should be visible (one of: かなり低い, やや低い, 平均的, 高い, 非常に高い)
    const levelBadge = page.locator('text=/かなり低い|やや低い|平均的|高い|非常に高い/').first();
    await expect(levelBadge).toBeVisible();
  });

  test('should display raw score and percentile cards', async ({ page }) => {
    await completeTest(page);

    // Raw Score card
    await expect(page.getByText('Raw Score')).toBeVisible();
    await expect(page.getByText('/ 60点')).toBeVisible();

    // Percentile card
    await expect(page.getByText('Percentile')).toBeVisible();
  });

  test('should display academic credibility stats', async ({ page }) => {
    await completeTest(page);

    // Stat cards should be visible
    await expect(page.getByText('信頼性係数')).toBeVisible();
    await expect(page.getByText('α = 0.86')).toBeVisible();
    await expect(page.getByText('再テスト信頼性')).toBeVisible();
    await expect(page.getByText('r = 0.79')).toBeVisible();
  });

  test('should display disclaimer', async ({ page }) => {
    await completeTest(page);

    await expect(page.getByText('免責事項')).toBeVisible();
    await expect(
      page.getByText('この診断は医療診断ではありません')
    ).toBeVisible();
  });

  test('should have action buttons', async ({ page }) => {
    await completeTest(page);

    // Action buttons should be visible
    await expect(
      page.getByRole('link', { name: 'もう一度診断する' })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'トップページへ' })
    ).toBeVisible();
  });

  test('should navigate back to test page when clicking retry', async ({
    page,
  }) => {
    await completeTest(page);

    await page.getByRole('link', { name: 'もう一度診断する' }).click();
    await expect(page).toHaveURL('/sccs/test/');
  });

  test('should navigate to homepage when clicking home button', async ({
    page,
  }) => {
    await completeTest(page);

    await page.getByRole('link', { name: 'トップページへ' }).click();
    await expect(page).toHaveURL('/');
  });
});
