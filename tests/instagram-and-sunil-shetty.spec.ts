import { test, expect } from '@playwright/test';

test.describe('Instagram social links', () => {
  test('Footer has Instagram link with correct href', async ({ page }) => {
    await page.goto('/');
    const link = page.locator('footer a[aria-label="Follow us on Instagram"]');
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', 'https://www.instagram.com/perhit.siksha/');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(link).toHaveAttribute('target', '_blank');
  });

  test('Footer Instagram icon renders SVG', async ({ page }) => {
    await page.goto('/');
    const svg = page.locator('footer a[aria-label="Follow us on Instagram"] svg');
    await expect(svg).toBeVisible();
    await expect(svg).toHaveClass(/w-6 h-6/);
  });

  test('Hero section has Instagram link with correct href', async ({ page }) => {
    await page.goto('/');
    // Hero social icons are only rendered when primaryCTA is present
    const link = page.locator(
      'section.relative a[aria-label="Follow us on Instagram"]'
    );
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', 'https://www.instagram.com/perhit.siksha/');
  });

  test('Hero Instagram icon renders SVG', async ({ page }) => {
    await page.goto('/');
    const link = page.locator('section.relative a[aria-label="Follow us on Instagram"]');
    const svg = link.locator('svg');
    await expect(svg).toBeVisible();
  });

  test('Mobile menu has Instagram link', async ({ page }) => {
    await page.goto('/');
    // Resize to mobile viewport to trigger burger menu
    await page.setViewportSize({ width: 375, height: 812 });

    // Open burger menu
    const menuButton = page.locator('button[aria-label="Toggle menu"]');
    await menuButton.click();

    // Instagram link should be visible in the slide-in panel
    const link = page.locator('.mobile-menu-panel a[aria-label="Follow us on Instagram"]');
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', 'https://www.instagram.com/perhit.siksha/');
  });

  test('Mobile menu Instagram icon renders SVG', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 375, height: 812 });

    const menuButton = page.locator('button[aria-label="Toggle menu"]');
    await menuButton.click();

    const svg = page.locator('.mobile-menu-panel a[aria-label="Follow us on Instagram"] svg');
    await expect(svg).toBeVisible();
  });

  test('All three social platforms present in footer (FB, YT, Instagram)', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('footer a[aria-label="Follow us on Facebook"]')).toBeVisible();
    await expect(page.locator('footer a[aria-label="Subscribe to our YouTube channel"]')).toBeVisible();
    await expect(page.locator('footer a[aria-label="Follow us on Instagram"]')).toBeVisible();
  });
});

test.describe('Celebrity endorsements order', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Sunil Shetty appears first in the carousel', async ({ page }) => {
    // The first card in the DOM should be Sunil Shetty
    const firstCard = page.locator('.flex-none.w-64').first();
    await expect(firstCard.locator('text=Sunil Shetty')).toBeVisible();
    await expect(firstCard.locator('text=Actor & Film Producer')).toBeVisible();
  });

  test('Sunil Shetty thumbnail uses correct video ID', async ({ page }) => {
    const thumbnail = page.locator('img[alt*="Sunil Shetty"]').first();
    await expect(thumbnail).toHaveAttribute('src', /ctqDft-Xrb0/);
  });

  test('Satwiksairaj Rankireddy appears second in the carousel', async ({ page }) => {
    const secondCard = page.locator('.flex-none.w-64').nth(1);
    await expect(secondCard.locator('text=Satwiksairaj Rankireddy')).toBeVisible();
  });

  test('Priyamani appears last (16th) in the carousel', async ({ page }) => {
    const lastCard = page.locator('.flex-none.w-64').nth(15);
    await expect(lastCard.locator('text=Priyamani')).toBeAttached();
  });

  test('Carousel contains all 16 celebrities (32 cards with duplication)', async ({ page }) => {
    // The carousel duplicates the array for infinite scroll: 16 * 2 = 32
    const cards = page.locator('.flex-none.w-64');
    const count = await cards.count();
    expect(count).toBe(32);
  });
});
