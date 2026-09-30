import { expect, test } from '@playwright/test';

const viewports = [320, 360, 390, 412, 1280];

async function assertDocumentFitsViewport(
  page: import('@playwright/test').Page
) {
  const geometry = await page.evaluate(() => ({
    body: document.body.scrollWidth,
    root: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  expect(geometry.root).toBeLessThanOrEqual(geometry.viewport);
  expect(geometry.body).toBeLessThanOrEqual(geometry.viewport);
}

test.describe('Tooltip viewport containment', () => {
  for (const width of viewports) {
    test(`does not widen the ${width}px page while closed or open`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/');

      await expect(page.locator('[role="tooltip"]')).toHaveCount(0);
      await assertDocumentFitsViewport(page);

      const trigger = page.getByLabel('What counts as a contributor?');
      await trigger.focus();
      const tooltip = page.locator('[role="tooltip"]');
      await expect(tooltip).toHaveCount(1);
      await expect(trigger).toHaveAttribute('aria-describedby', /^tt-/);

      const box = await tooltip.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(16);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width - 16);
      expect(box!.y).toBeGreaterThanOrEqual(16);
      expect(box!.y + box!.height).toBeLessThanOrEqual(844 - 16);
      await assertDocumentFitsViewport(page);

      await page.keyboard.press('Escape');
      await expect(tooltip).toHaveCount(0);
      await expect(trigger).not.toHaveAttribute('aria-describedby');
      await assertDocumentFitsViewport(page);
    });
  }
});

test('a real touch tap opens and closes the contributor tooltip', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto('/');
  const trigger = page.getByLabel('What counts as a contributor?');
  await trigger.scrollIntoViewIfNeeded();
  await trigger.tap();
  await expect(page.locator('[role="tooltip"]')).toHaveCount(1);
  await expect(trigger).toHaveAttribute('aria-describedby', /^tt-/);
  await page.mouse.click(8, 8);
  await expect(page.locator('[role="tooltip"]')).toHaveCount(0);
  await expect(trigger).not.toHaveAttribute('aria-describedby');
  await context.close();
});
