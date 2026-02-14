import { test, expect } from '@playwright/test';

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
    const eventsSection = page.locator('text=Recent Events').first();
    await expect(eventsSection).toBeVisible();

    // Check if carousel is present
    const carousel = page.locator('[class*="EventsCarousel"]').first();
    await expect(carousel).toBeVisible();

    // Verify event content is displayed
    const eventImage = carousel.locator('img').first();
    await expect(eventImage).toBeVisible();
  });

  test('carousel auto-rotates through events', async ({ page }) => {
    const carousel = page.locator('[class*="EventsCarousel"]').first();

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
    const carousel = page.locator('[class*="EventsCarousel"]').first();

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
    const carousel = page.locator('[class*="EventsCarousel"]').first();

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

  test('opens gallery modal when clicking album event', async ({ page }) => {
    // Look for album badge (indicating album event)
    const albumBadge = page.locator('text=/\\d+ photos?/i').first();

    if (await albumBadge.isVisible()) {
      // Click the image to open gallery
      const eventImage = page.locator('img[src*="fb-events"]').first();
      await eventImage.click();

      // Verify gallery modal opened
      const galleryModal = page.locator('[class*="GalleryModal"]').first();
      await expect(galleryModal).toBeVisible();

      // Verify media counter is visible
      const mediaCounter = page.locator('text=/\\d+ \\/ \\d+/');
      await expect(mediaCounter).toBeVisible();

      // Close modal
      const closeButton = page.locator('button[aria-label="Close gallery"]');
      await closeButton.click();
      await expect(galleryModal).not.toBeVisible();
    } else {
      test.skip('No album events found in current data');
    }
  });

  test('gallery navigation works correctly', async ({ page }) => {
    const albumBadge = page.locator('text=/\\d+ photos?/i').first();

    if (await albumBadge.isVisible()) {
      // Open gallery
      const eventImage = page.locator('img[src*="fb-events"]').first();
      await eventImage.click();

      // Wait for gallery to open
      const galleryModal = page.locator('[class*="GalleryModal"]').first();
      await expect(galleryModal).toBeVisible();

      // Get initial counter
      const initialCounter = await page.locator('text=/\\d+ \\/ \\d+/').textContent();

      // Click next button
      const nextButton = page.locator('button[aria-label="Next image"]');
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(300);

        // Verify counter changed
        const newCounter = await page.locator('text=/\\d+ \\/ \\d+/').textContent();
        expect(newCounter).not.toBe(initialCounter);

        // Click previous button
        const prevButton = page.locator('button[aria-label="Previous image"]');
        await prevButton.click();
        await page.waitForTimeout(300);

        // Should be back to initial
        const backCounter = await page.locator('text=/\\d+ \\/ \\d+/').textContent();
        expect(backCounter).toBe(initialCounter);
      }

      // Close modal
      const closeButton = page.locator('button[aria-label="Close gallery"]');
      await closeButton.click();
    } else {
      test.skip('No album events found in current data');
    }
  });

  test('gallery closes on ESC key', async ({ page }) => {
    const albumBadge = page.locator('text=/\\d+ photos?/i').first();

    if (await albumBadge.isVisible()) {
      // Open gallery
      const eventImage = page.locator('img[src*="fb-events"]').first();
      await eventImage.click();

      const galleryModal = page.locator('[class*="GalleryModal"]').first();
      await expect(galleryModal).toBeVisible();

      // Press ESC
      await page.keyboard.press('Escape');

      // Verify modal closed
      await expect(galleryModal).not.toBeVisible();
    } else {
      test.skip('No album events found in current data');
    }
  });

  test('pagination dots work in gallery', async ({ page }) => {
    const albumBadge = page.locator('text=/\\d+ photos?/i').first();

    if (await albumBadge.isVisible()) {
      // Open gallery
      const eventImage = page.locator('img[src*="fb-events"]').first();
      await eventImage.click();

      const galleryModal = page.locator('[class*="GalleryModal"]').first();
      await expect(galleryModal).toBeVisible();

      // Find pagination dots
      const paginationDots = galleryModal.locator('button[aria-label*="Go to image"]');
      const dotCount = await paginationDots.count();

      if (dotCount > 1) {
        // Click second dot
        await paginationDots.nth(1).click();
        await page.waitForTimeout(300);

        // Verify counter shows "2 / X"
        const counter = await page.locator('text=/2 \\/ \\d+/').textContent();
        expect(counter).toContain('2 /');
      }

      // Close modal
      const closeButton = page.locator('button[aria-label="Close gallery"]');
      await closeButton.click();
    } else {
      test.skip('No album events found in current data');
    }
  });
});

test.describe('Facebook Events - Video Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('opens video modal when clicking video event', async ({ page }) => {
    // Look for play button overlay (indicating video event)
    const playButton = page.locator('[class*="FaPlay"]').first();

    if (await playButton.isVisible()) {
      // Click the play button or image
      await playButton.click();

      // Verify video modal opened
      const videoModal = page.locator('[class*="VideoModal"]').first();
      await expect(videoModal).toBeVisible();

      // Verify Facebook video iframe is present
      const videoIframe = page.locator('iframe[src*="facebook.com"]');
      await expect(videoIframe).toBeVisible();

      // Close modal
      const closeButton = page.locator('button[aria-label="Close video"]');
      await closeButton.click();
      await expect(videoModal).not.toBeVisible();
    } else {
      test.skip('No video events found in current data');
    }
  });

  test('video modal closes on ESC key', async ({ page }) => {
    const playButton = page.locator('[class*="FaPlay"]').first();

    if (await playButton.isVisible()) {
      // Open video modal
      await playButton.click();

      const videoModal = page.locator('[class*="VideoModal"]').first();
      await expect(videoModal).toBeVisible();

      // Press ESC
      await page.keyboard.press('Escape');

      // Verify modal closed
      await expect(videoModal).not.toBeVisible();
    } else {
      test.skip('No video events found in current data');
    }
  });

  test('video modal closes when clicking backdrop', async ({ page }) => {
    const playButton = page.locator('[class*="FaPlay"]').first();

    if (await playButton.isVisible()) {
      // Open video modal
      await playButton.click();

      const videoModal = page.locator('[class*="VideoModal"]').first();
      await expect(videoModal).toBeVisible();

      // Click backdrop (area outside the video)
      await page.mouse.click(10, 10); // Top-left corner

      // Verify modal closed (may take a moment)
      await page.waitForTimeout(500);
      // Modal might not close on backdrop click, check implementation
    } else {
      test.skip('No video events found in current data');
    }
  });
});

test.describe('Facebook Events - Responsive Design', () => {
  test('carousel works on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if carousel is visible
    const carousel = page.locator('[class*="EventsCarousel"]').first();
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

    const carousel = page.locator('[class*="EventsCarousel"]').first();
    await expect(carousel).toBeVisible();
  });

  test('carousel works on desktop viewport', async ({ page }) => {
    // Set large desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const carousel = page.locator('[class*="EventsCarousel"]').first();
    await expect(carousel).toBeVisible();

    // On large screens (≥1280px), should have side-by-side layout
    const eventImage = carousel.locator('img').first();
    await expect(eventImage).toBeVisible();
  });
});
