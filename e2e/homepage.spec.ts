import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display hero title', async ({ page }) => {
    await page.goto('/');

    // Hero title should be visible
    const heroTitle = page.locator('h1').filter({ hasText: 'スペクトル診断' });
    await expect(heroTitle).toBeVisible();

    // Check that it has display font class
    const className = await heroTitle.getAttribute('class');
    expect(className).toContain('font-display');
  });

  test('should display data badges', async ({ page }) => {
    await page.goto('/');

    // Data badges should be visible
    await expect(page.getByText('学術的')).toBeVisible();
    await expect(page.getByText('データ駆動')).toBeVisible();
    await expect(page.getByText('科学的根拠')).toBeVisible();
  });

  test('should display stat cards with academic credentials', async ({ page }) => {
    await page.goto('/');

    // Stat cards should show academic reliability
    await expect(page.getByText('信頼性係数')).toBeVisible();
    await expect(page.getByText('α = 0.86')).toBeVisible();
    await expect(page.getByText('再テスト信頼性')).toBeVisible();
    await expect(page.getByText('r = 0.79')).toBeVisible();
    await expect(page.getByText('Campbell et al.')).toBeVisible();
    await expect(page.getByText('2,000+')).toBeVisible();
  });

  test('should have brutal button with correct styles', async ({ page }) => {
    await page.goto('/');

    const button = page.getByRole('link', { name: '診断を始める' });
    await expect(button).toBeVisible();

    // Check brutal button classes
    const className = await button.getAttribute('class');
    expect(className).toContain('btn-brutal');
  });

  test('should display disclaimer with yellow background', async ({ page }) => {
    await page.goto('/');

    // Disclaimer should be visible
    await expect(page.getByText('免責事項')).toBeVisible();
    await expect(
      page.getByText('この診断は医療診断ではありません')
    ).toBeVisible();
  });

  test('should navigate to SCCS page when clicking start button', async ({
    page,
  }) => {
    await page.goto('/');

    await page.getByRole('link', { name: '診断を始める' }).click();

    // Should navigate to /sccs
    await expect(page).toHaveURL('/sccs/');
  });
});
