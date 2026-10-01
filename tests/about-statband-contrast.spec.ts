import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { waitForHeroSettle } from './utils/hero';

type Locale = 'en' | 'hi';
type Theme = 'light' | 'dark';

const CELLS: ReadonlyArray<{
  locale: Locale;
  theme: Theme;
  viewport: { width: number; height: number };
}> = [
  { locale: 'en', theme: 'light', viewport: { width: 390, height: 844 } },
  { locale: 'en', theme: 'light', viewport: { width: 1280, height: 800 } },
  { locale: 'en', theme: 'dark', viewport: { width: 390, height: 844 } },
  { locale: 'en', theme: 'dark', viewport: { width: 1280, height: 800 } },
  { locale: 'hi', theme: 'light', viewport: { width: 390, height: 844 } },
  { locale: 'hi', theme: 'light', viewport: { width: 1280, height: 800 } },
  { locale: 'hi', theme: 'dark', viewport: { width: 390, height: 844 } },
  { locale: 'hi', theme: 'dark', viewport: { width: 1280, height: 800 } },
];

const APPROVED_COLORS: Record<Theme, { heading: string; body: string }> = {
  light: { heading: 'rgb(20, 19, 19)', body: 'rgb(68, 66, 63)' },
  dark: { heading: 'rgb(242, 238, 236)', body: 'rgb(216, 211, 208)' },
};

// The card tint is translucent, so computed style exposes its source rgba()
// rather than the final painted color. These are the design-reviewed rendered
// backgrounds after that tint is composited in each theme.
const CALLOUT_BACKGROUNDS: Record<Theme, string> = {
  light: 'rgb(234, 235, 242)',
  dark: 'rgb(39, 42, 51)',
};

function contrastRatio(foreground: string, background: string) {
  const luminance = (color: string) => {
    const channels = color
      .match(/\d+(?:\.\d+)?/g)
      ?.slice(0, 3)
      .map(Number);
    if (!channels || channels.length !== 3)
      throw new Error(`Unexpected color: ${color}`);
    const linear = channels.map(channel => {
      const value = channel / 255;
      return value <= 0.04045
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  };

  const [a, b] = [luminance(foreground), luminance(background)];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

async function seedAboutBeforeBoot(page: Page, locale: Locale, theme: Theme) {
  await page.addInitScript(
    ({ nextLocale, nextTheme }) => {
      localStorage.setItem('perhit-lang', nextLocale);
      localStorage.setItem('perhit-theme', nextTheme);
    },
    { nextLocale: locale, nextTheme: theme }
  );
  await page.goto('/about');
}

async function expectAboutBootState(
  page: Page,
  locale: Locale,
  theme: Theme
) {
  const html = page.locator('html');
  await expect(html, `About boot locale mismatch: expected ${locale}`).toHaveAttribute(
    'lang',
    locale
  );
  await expect(html, `About boot theme mismatch: expected ${theme}`).toHaveAttribute(
    'data-theme',
    theme
  );
}

async function openAbout(page: Page, locale: Locale, theme: Theme) {
  await seedAboutBeforeBoot(page, locale, theme);
  await expectAboutBootState(page, locale, theme);
  await waitForHeroSettle(page);
}

function callout(page: Page): { heading: Locator; body: Locator } {
  const heading = page.locator(
    'h4.text-lg.font-bold.text-gray-900.mb-3.flex.items-center'
  );
  return { heading, body: heading.locator('xpath=following-sibling::p[1]') };
}

async function colorsFor(page: Page, theme: Theme) {
  const { heading, body } = callout(page);
  await expect(heading).toBeVisible();
  await expect(body).toBeVisible();
  const computed = await heading.evaluate(
    (element, bodyElement) => {
      const card = element.parentElement;
      if (!card || !(bodyElement instanceof HTMLElement))
        throw new Error('About callout targets are missing');
      return {
        cardBackground: getComputedStyle(card).backgroundColor,
        heading: getComputedStyle(element).color,
        body: getComputedStyle(bodyElement).color,
      };
    },
    await body.elementHandle()
  );
  return { ...computed, background: CALLOUT_BACKGROUNDS[theme] };
}

test.describe('About callout contrast contract', () => {
  test('negative control: a wrong pre-boot theme is rejected by the boot contract', async ({
    page,
  }) => {
    await seedAboutBeforeBoot(page, 'en', 'light');
    await expectAboutBootState(page, 'en', 'light');
    await expect(expectAboutBootState(page, 'en', 'dark')).rejects.toThrow(
      'About boot theme mismatch: expected dark'
    );
  });

  for (const cell of CELLS) {
    test(`${cell.locale}/${cell.theme}/${cell.viewport.width} uses the approved local ink mapping`, async ({
      page,
    }) => {
      await page.setViewportSize(cell.viewport);
      await openAbout(page, cell.locale, cell.theme);

      const colors = await colorsFor(page, cell.theme);
      expect(colors.cardBackground).toBe('rgba(0, 97, 239, 0.06)');
      expect(colors.heading).toBe(APPROVED_COLORS[cell.theme].heading);
      expect(colors.body).toBe(APPROVED_COLORS[cell.theme].body);
      expect(
        contrastRatio(colors.heading, colors.background)
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(colors.body, colors.background)
      ).toBeGreaterThanOrEqual(4.5);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      expect(
        results.violations.filter(
          violation => violation.id === 'color-contrast'
        )
      ).toEqual([]);
    });
  }

  test('negative control: legacy primary-900 heading fails in dark mode', async ({
    page,
  }) => {
    await openAbout(page, 'en', 'dark');
    const { heading } = callout(page);
    await heading.evaluate(element => {
      (element as HTMLElement).style.color = '#00008A';
    });
    const colors = await colorsFor(page, 'dark');
    expect(contrastRatio(colors.heading, colors.background)).toBeLessThan(4.5);
  });

  test('negative control: legacy primary-800 body fails in dark mode', async ({
    page,
  }) => {
    await openAbout(page, 'en', 'dark');
    const { body } = callout(page);
    await body.evaluate(element => {
      (element as HTMLElement).style.color = '#0000B0';
    });
    const colors = await colorsFor(page, 'dark');
    expect(contrastRatio(colors.body, colors.background)).toBeLessThan(4.5);
  });
});
