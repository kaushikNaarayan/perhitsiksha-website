import { test, expect } from '@playwright/test';
import { waitForHeroSettle, findMidWordBreaks } from './utils/hero';

/**
 * pw-h5gz: guards HeroEditorial's h1 against mid-word wraps, and against the
 * false-positive/false-negative timing trap of asserting mid-GSAP-SplitText-
 * animation (pw-4s38). See tests/utils/hero.ts for the mechanism.
 */

const PAGES = ['/', '/about'];

test.describe('HeroEditorial h1 — settled state never breaks mid-word', () => {
  for (const path of PAGES) {
    // AC1 is exercised three times by the validation command recorded on the
    // bead. One passing run is never accepted as proof of a timing fix.
    test(`${path} hero wraps at word boundaries after settle`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(path);
      await waitForHeroSettle(page);

      const result = await findMidWordBreaks(page);
      expect(
        result.ok,
        `mid-word break detected: rendered "${result.rejoined}" != expected "${result.expected}"`
      ).toBe(true);
    });
  }

  test('reduced motion reports the hero settled without SplitText markup', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    await waitForHeroSettle(page);

    await expect(page.locator('h1.heading-1')).toHaveAttribute(
      'data-hero-settled',
      'true'
    );
    await expect(page.locator('h1.heading-1 [aria-hidden="true"]')).toHaveCount(
      0
    );
  });

  // AC2 — the half that answers the false-negative question: prove the same
  // check FAILS when a real defect is present. Forces the h1's column to a
  // width no reasonable word can fit in, guaranteeing a genuine mid-word
  // break, then asserts findMidWordBreaks actually reports it.
  test('gate catches a deliberately introduced real mid-word break', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    await waitForHeroSettle(page);

    await page.addStyleTag({
      content: `
        h1.heading-1 {
          width: 40px !important;
          max-width: 40px !important;
          overflow-wrap: break-word !important;
        }
      `,
    });

    const result = await findMidWordBreaks(page);
    expect(
      result.ok,
      'expected the deliberately-narrowed h1 to show a mid-word break, but the gate reported clean — it has no teeth'
    ).toBe(false);
  });
});
