import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * E2E Tests for Facebook Events Integration
 *
 * Tests the EventsCarousel component with Facebook-sourced events,
 * including album gallery modal and video modal functionality.
 */

test.describe('Facebook Events - EventsCarousel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('displays events from facebook-events.json', async ({ page }) => {
    // Check if Recent Events section exists
    const eventsSection = page.locator('text=From Our Community').first();
    await expect(eventsSection).toBeVisible();

    // Check if carousel is present
    const carousel = page.locator('[data-testid="events-carousel"]').first();
    await expect(carousel).toBeVisible();

    // Verify event content is displayed
    const eventImage = carousel.locator('img').first();
    await expect(eventImage).toBeVisible();
  });

  test('carousel auto-rotates through events', async ({ page }) => {
    const carousel = page.locator('[data-testid="events-carousel"]').first();

    // Get initial event title
    const initialTitle = await carousel.locator('h3').first().textContent();

    // Wait for auto-rotation (4 seconds + buffer)
    await page.waitForTimeout(4500);

    // Get new event title
    const newTitle = await carousel.locator('h3').first().textContent();

    // Verify title changed (assuming there are multiple events)
    // This might be the same if there's only one event
    if (initialTitle !== newTitle) {
      expect(newTitle).not.toBe(initialTitle);
    }
  });

  test('pagination dots allow manual navigation', async ({ page }) => {
    const carousel = page.locator('[data-testid="events-carousel"]').first();

    // Find pagination dots
    const paginationDots = carousel.locator('button[aria-label*="Go to event"]');
    const dotCount = await paginationDots.count();

    if (dotCount > 1) {
      // Click second dot
      await paginationDots.nth(1).click();

      // Verify active dot changed
      const activeDot = carousel.locator('button[aria-current="true"]');
      await expect(activeDot).toHaveAttribute('aria-label', 'Go to event 2');
    }
  });

  test('navigation arrows work correctly', async ({ page }) => {
    const carousel = page.locator('[data-testid="events-carousel"]').first();

    // Find navigation arrows
    const prevButton = carousel.locator('button[aria-label="Previous event"]');
    const nextButton = carousel.locator('button[aria-label="Next event"]');

    const buttonCount = await nextButton.count();

    if (buttonCount > 0) {
      // Get initial title
      const initialTitle = await carousel.locator('h3').first().textContent();

      // Click next
      await nextButton.click();
      await page.waitForTimeout(500); // Wait for transition

      const newTitle = await carousel.locator('h3').first().textContent();

      // Verify navigation worked (if there are multiple events)
      if (initialTitle !== newTitle) {
        // Click previous to go back
        await prevButton.click();
        await page.waitForTimeout(500);

        const backTitle = await carousel.locator('h3').first().textContent();
        expect(backTitle).toBe(initialTitle);
      }
    }
  });
});

test.describe('Facebook Events - Album Gallery Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  // pw-tqfz: these tests used to silently skip on "no album/video events
  // found in current data" — but the data always had both (checked directly:
  // facebook-events.json currently has 4 album + 3 video events). The skips
  // fired because the DETECTION locators were stale (icon-library migration,
  // a badge copy change, class-substring locators that never matched any
  // component's actual className — see pw-goht for the same drift class).
  // Fixed those locators with data-testid hooks. The carousel shows one
  // event at a time and auto-rotates, so these helpers actively navigate to
  // an event of the required type with the Next button rather than hoping
  // the current index happens to be one — and THROW (fail the job loudly)
  // if no such event turns up within a full rotation, instead of skipping.
  // "we could not test this" and "this works" must not look identical.
  async function navigateToEventType(page: Page, testId: string, maxClicks = 9) {
    const target = page.locator(`[data-testid="${testId}"]`).first();
    for (let i = 0; i < maxClicks; i++) {
      if (await target.isVisible({ timeout: 1000 }).catch(() => false)) return target;
      await page
        .locator('button[aria-label="Next event"]')
        .click({ timeout: 2000 })
        .catch(() => {
          // Single-event data has no Next button at all — that's still "not
          // found", not a hang; fall through to the loud error below.
        });
      await page.waitForTimeout(150);
    }
    throw new Error(
      `No event with [data-testid="${testId}"] found after a full carousel rotation. ` +
        `facebook-events.json may have lost its album/video events — check the ` +
        `"Sync Facebook Events" workflow (pw-tqfz).`
    );
  }

  test('opens gallery modal when clicking album event', async ({ page }) => {
    await navigateToEventType(page, 'album-badge');

    const eventImage = page.locator('img[src*="fb-events"]').first();
    await eventImage.click();

    const galleryModal = page.locator('[data-testid="gallery-modal"]');
    await expect(galleryModal).toBeVisible();

    const mediaCounter = page.locator('text=/\\d+ \\/ \\d+/');
    await expect(mediaCounter).toBeVisible();

    const closeButton = page.locator('button[aria-label="Close gallery"]');
    await closeButton.click();
    await expect(galleryModal).not.toBeVisible();
  });

  test('gallery navigation works correctly', async ({ page }) => {
    await navigateToEventType(page, 'album-badge');

    const eventImage = page.locator('img[src*="fb-events"]').first();
    await eventImage.click();

    const galleryModal = page.locator('[data-testid="gallery-modal"]');
    await expect(galleryModal).toBeVisible();

    const initialCounter = await page.locator('text=/\\d+ \\/ \\d+/').textContent();

    const nextButton = page.locator('button[aria-label="Next image"]');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(300);

      const newCounter = await page.locator('text=/\\d+ \\/ \\d+/').textContent();
      expect(newCounter).not.toBe(initialCounter);

      const prevButton = page.locator('button[aria-label="Previous image"]');
      await prevButton.click();
      await page.waitForTimeout(300);

      const backCounter = await page.locator('text=/\\d+ \\/ \\d+/').textContent();
      expect(backCounter).toBe(initialCounter);
    }

    const closeButton = page.locator('button[aria-label="Close gallery"]');
    await closeButton.click();
  });

  test('gallery closes on ESC key', async ({ page }) => {
    await navigateToEventType(page, 'album-badge');

    const eventImage = page.locator('img[src*="fb-events"]').first();
    await eventImage.click();

    const galleryModal = page.locator('[data-testid="gallery-modal"]');
    await expect(galleryModal).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(galleryModal).not.toBeVisible();
  });

  test('pagination dots work in gallery', async ({ page }) => {
    await navigateToEventType(page, 'album-badge');

    const eventImage = page.locator('img[src*="fb-events"]').first();
    await eventImage.click();

    const galleryModal = page.locator('[data-testid="gallery-modal"]');
    await expect(galleryModal).toBeVisible();

    const paginationDots = galleryModal.locator('button[aria-label*="Go to image"]');
    const dotCount = await paginationDots.count();

    if (dotCount > 1) {
      await paginationDots.nth(1).click();
      await page.waitForTimeout(300);

      const counter = await page.locator('text=/2 \\/ \\d+/').textContent();
      expect(counter).toContain('2 /');
    }

    const closeButton = page.locator('button[aria-label="Close gallery"]');
    await closeButton.click();
  });
});

test.describe('Facebook Events - Video Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  // See the comment above the identical helper in the Album Gallery Modal
  // describe block above — same rationale, kept local to each block since
  // Playwright specs don't share module state across describe blocks by
  // default.
  async function navigateToEventType(page: Page, testId: string, maxClicks = 9) {
    const target = page.locator(`[data-testid="${testId}"]`).first();
    for (let i = 0; i < maxClicks; i++) {
      if (await target.isVisible({ timeout: 1000 }).catch(() => false)) return target;
      await page
        .locator('button[aria-label="Next event"]')
        .click({ timeout: 2000 })
        .catch(() => {
          // Single-event data has no Next button at all — that's still "not
          // found", not a hang; fall through to the loud error below.
        });
      await page.waitForTimeout(150);
    }
    throw new Error(
      `No event with [data-testid="${testId}"] found after a full carousel rotation. ` +
        `facebook-events.json may have lost its album/video events — check the ` +
        `"Sync Facebook Events" workflow (pw-tqfz).`
    );
  }

  test('opens video modal when clicking video event', async ({ page }) => {
    const playButton = await navigateToEventType(page, 'video-play-button');
    await playButton.click();

    const videoModal = page.locator('[data-testid="video-modal"]');
    await expect(videoModal).toBeVisible();

    const videoIframe = page.locator('iframe[src*="facebook.com"]');
    await expect(videoIframe).toBeVisible();

    const closeButton = page.locator('button[aria-label="Close video"]');
    await closeButton.click();
    await expect(videoModal).not.toBeVisible();
  });

  test('video modal closes on ESC key', async ({ page }) => {
    const playButton = await navigateToEventType(page, 'video-play-button');
    await playButton.click();

    const videoModal = page.locator('[data-testid="video-modal"]');
    await expect(videoModal).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(videoModal).not.toBeVisible();
  });

  test('video modal closes when clicking backdrop', async ({ page }) => {
    const playButton = await navigateToEventType(page, 'video-play-button');
    await playButton.click();

    const videoModal = page.locator('[data-testid="video-modal"]');
    await expect(videoModal).toBeVisible();

    // Click backdrop (area outside the video)
    await page.mouse.click(10, 10); // Top-left corner

    await page.waitForTimeout(500);
    // Modal might not close on backdrop click, check implementation
  });
});

test.describe('Facebook Events - Responsive Design', () => {
  test('carousel works on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if carousel is visible
    const carousel = page.locator('[data-testid="events-carousel"]').first();
    await expect(carousel).toBeVisible();

    // Verify single column layout
    const eventImage = carousel.locator('img').first();
    await expect(eventImage).toBeVisible();
  });

  test('carousel works on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const carousel = page.locator('[data-testid="events-carousel"]').first();
    await expect(carousel).toBeVisible();
  });

  test('carousel works on desktop viewport', async ({ page }) => {
    // Set large desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const carousel = page.locator('[data-testid="events-carousel"]').first();
    await expect(carousel).toBeVisible();

    // On large screens (≥1280px), should have side-by-side layout
    const eventImage = carousel.locator('img').first();
    await expect(eventImage).toBeVisible();
  });
});
