import { test, expect } from '@playwright/test';

test.describe('Celebrity Endorsements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should display celebrity endorsements section', async ({ page }) => {
    // Check if the "Our Supporters" section exists
    const supportersSection = page.locator('text=Our Supporters');
    await expect(supportersSection).toBeVisible();
  });

  test('should display VVS Laxman in celebrity carousel', async ({ page }) => {
    // Wait for the celebrity carousel to load
    await page.waitForSelector('text=VVS Laxman', { timeout: 5000 });

    // Check if VVS Laxman is visible (use .first() because carousel duplicates elements)
    const vvsLaxman = page.locator('text=VVS Laxman').first();
    await expect(vvsLaxman).toBeVisible();

    // Check profession
    const profession = page.locator('text=Cricketer').first();
    await expect(profession).toBeVisible();
  });

  test('should display Kidambi Srikanth in celebrity carousel', async ({ page }) => {
    // Wait for carousel to load
    await page.waitForLoadState('networkidle');

    // Check if Kidambi Srikanth exists in the DOM (may not be in viewport due to carousel position)
    const kidambiSrikanth = page.locator('text=Kidambi Srikanth').first();
    await expect(kidambiSrikanth).toBeAttached();

    // Verify the profession
    const profession = page.locator('text=Badminton Star').first();
    await expect(profession).toBeAttached();
  });

  test('should display Mohammad Azharuddin in celebrity carousel', async ({ page }) => {
    // Wait for carousel to load
    await page.waitForLoadState('networkidle');

    // Check if Mohammad Azharuddin exists in the DOM (may not be in viewport due to carousel position)
    const azharuddin = page.locator('text=Mohammad Azharuddin').first();
    await expect(azharuddin).toBeAttached();

    // Verify it's a cricketer (there are multiple cricketers, so just check one exists)
    const profession = page.locator('text=Cricketer').first();
    await expect(profession).toBeAttached();
  });

  test('should have correct video thumbnails for new celebrities', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check that video thumbnails are loaded (use .first() because carousel duplicates)
    const vvsLaxmanThumbnail = page.locator(`img[alt*="VVS Laxman"]`).first();
    await expect(vvsLaxmanThumbnail).toHaveAttribute('src', /dEWv_0c-omo/);

    const kidambiThumbnail = page.locator(`img[alt*="Kidambi Srikanth"]`).first();
    await expect(kidambiThumbnail).toHaveAttribute('src', /Z3ps_cG0UjM/);

    const azharuddinThumbnail = page.locator(`img[alt*="Mohammad Azharuddin"]`).first();
    await expect(azharuddinThumbnail).toHaveAttribute('src', /RAxeVaOgKW0/);
  });

  test('should open video modal when clicking on celebrity video', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Wait for carousel animation to stabilize
    await page.waitForTimeout(1000);

    // Find and click VVS Laxman's video container (not the img which moves)
    const vvsLaxmanContainer = page.locator('text=VVS Laxman').first().locator('..').locator('..');
    await vvsLaxmanContainer.click({ force: true });

    // Check if modal opens with correct title
    const modalTitle = page.locator('text=VVS Laxman supports Perhitsiksha');
    await expect(modalTitle).toBeVisible({ timeout: 3000 });
  });

  test('should have all 12 celebrity endorsements in total', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Count total number of celebrity cards (duplicated for infinite scroll)
    // The carousel duplicates the array, so we should have 24 cards (12 * 2)
    const celebrityCards = page.locator('.flex-none.w-64');
    const count = await celebrityCards.count();

    // Should have 24 cards (12 celebrities * 2 for infinite scroll)
    expect(count).toBe(24);
  });

  test('should support drag-to-scroll interaction', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Get carousel container
    const carousel = page.locator('.flex.gap-4.pb-4').first();

    // Check cursor is grab by default
    const cursorStyle = await carousel.evaluate((el) => getComputedStyle(el).cursor);
    expect(cursorStyle).toBe('grab');

    // Perform drag gesture
    const carouselBox = await carousel.boundingBox();
    if (carouselBox) {
      // Start drag
      await page.mouse.move(carouselBox.x + 200, carouselBox.y + 100);
      await page.mouse.down();

      // Drag to the right
      await page.mouse.move(carouselBox.x + 400, carouselBox.y + 100);
      await page.mouse.up();

      // Wait a moment for animation
      await page.waitForTimeout(500);
    }
  });

  test('should prevent video modal opening when dragging', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const carousel = page.locator('.flex.gap-4.pb-4').first();
    const carouselBox = await carousel.boundingBox();

    if (carouselBox) {
      // Perform a drag gesture (> 5px movement)
      await page.mouse.move(carouselBox.x + 200, carouselBox.y + 100);
      await page.mouse.down();
      await page.mouse.move(carouselBox.x + 250, carouselBox.y + 100); // 50px drag
      await page.mouse.up();

      // Wait a moment
      await page.waitForTimeout(300);

      // Modal should NOT be visible
      const modalTitle = page.locator('text=supports Perhitsiksha');
      await expect(modalTitle).not.toBeVisible();
    }
  });
});
