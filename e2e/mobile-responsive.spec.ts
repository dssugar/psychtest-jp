import { test, expect, devices } from '@playwright/test';

test.describe('Mobile Responsive Design', () => {
  test.use({ ...devices['iPhone SE'] });

  test('homepage hero should fit on mobile', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('h1').filter({ hasText: 'スペクトル診断' });
    const box = await hero.boundingBox();
    expect(box!.width).toBeLessThanOrEqual(320);
  });

  test('result page score should be readable on mobile', async ({ page }) => {
    await page.goto('/sccs/test');
    for (let i = 0; i < 12; i++) {
      await page.locator('button').filter({ hasText: 'どちらとも' }).click();
    }
    await page.getByRole('button', { name: '結果を見る' }).click();

    const scoreNumber = page.locator('.data-number').filter({ hasText: /^\d+$/ }).first();
    const fontSize = await scoreNumber.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).fontSize)
    );
    expect(fontSize).toBeLessThanOrEqual(40); // text-4xl以下
  });

  test('brutal shadows should be subtle on mobile', async ({ page }) => {
    await page.goto('/');
    const card = page.locator('.card-brutal').first();
    const boxShadow = await card.evaluate((el) =>
      window.getComputedStyle(el).boxShadow
    );
    expect(boxShadow).toContain('4px 4px');
  });
});
