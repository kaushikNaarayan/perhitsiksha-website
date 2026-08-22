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

  // pw-ies7: the v3 hero (HeroEditorial, pw-oql) never had an embedded
  // social-icon row — checked the canonical spec (home-v3.html, and
  // about-v3.html / testimonials-v3.html for consistency): `.socials`
  // appears exactly once per page, in the footer, never in any hero.
  // Dropping the hero-embedded Instagram link was correct per design, not a
  // migration gap, so the two tests that used to assert it are removed
  // rather than left fixme forever — a permanently-quarantined test for
  // behavior the product will never have again is the same "we could not
  // test this" vs "this works" confusion pw-tqfz fixed one level up.

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
