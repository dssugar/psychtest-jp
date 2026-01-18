import { chromium, devices } from '@playwright/test';
import { mkdirSync } from 'fs';
import { join } from 'path';

const SCREENSHOTS_DIR = join(process.cwd(), 'screenshots');

const pages = [
  { url: '/', name: 'home' },
  { url: '/sccs', name: 'sccs-info' },
  { url: '/sccs/test', name: 'sccs-test' },
];

const viewports = [
  { name: 'mobile', width: 375, height: 667, device: 'iPhone SE' },
  { name: 'tablet', width: 768, height: 1024, device: 'iPad' },
  { name: 'desktop', width: 1440, height: 900, device: 'Desktop' },
];

async function captureScreenshots() {
  mkdirSync(SCREENSHOTS_DIR, { recursive: true });

  const browser = await chromium.launch();

  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
    });
    const page = await context.newPage();

    for (const pageInfo of pages) {
      const url = `http://localhost:3000${pageInfo.url}`;
      console.log(`Capturing ${pageInfo.name} on ${viewport.name} (${viewport.width}x${viewport.height})...`);

      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500); // Wait for animations

      const filename = `${pageInfo.name}-${viewport.name}.png`;
      await page.screenshot({
        path: join(SCREENSHOTS_DIR, filename),
        fullPage: true,
      });

      console.log(`✓ Saved ${filename}`);
    }

    await context.close();
  }

  // Capture result page (need to complete test first)
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },
  });
  const page = await context.newPage();

  console.log('Completing test to capture result page...');
  await page.goto('http://localhost:3000/sccs/test', { waitUntil: 'networkidle' });

  // Answer all questions with middle option
  for (let i = 0; i < 12; i++) {
    await page.locator('button').filter({ hasText: 'どちらとも' }).click();
    await page.waitForTimeout(300);
  }

  await page.getByRole('button', { name: '結果を見る' }).click();
  await page.waitForURL('**/results/sccs');
  await page.waitForTimeout(500);

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(300);

    const filename = `results-${viewport.name}.png`;
    console.log(`Capturing results on ${viewport.name}...`);
    await page.screenshot({
      path: join(SCREENSHOTS_DIR, filename),
      fullPage: true,
    });
    console.log(`✓ Saved ${filename}`);
  }

  await context.close();
  await browser.close();

  console.log('\n✅ All screenshots captured successfully!');
  console.log(`📁 Location: ${SCREENSHOTS_DIR}`);
}

captureScreenshots().catch(console.error);
