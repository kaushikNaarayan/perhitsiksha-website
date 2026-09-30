import { expect, test, type Page } from '@playwright/test';
import { waitForHeroSettle } from './utils/hero';

type Locale = 'en' | 'hi';
type Theme = 'light' | 'dark';
type AnimationState = 'mid-SplitText' | 'settled';

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

const ACCENTS: Record<Locale, string> = {
  en: 'funds.',
  hi: 'धन की कमी',
};

const TAX_NOTES: Record<Locale, string> = {
  en: 'All donations are 80G tax-exempt',
  hi: 'सभी दान 80G कर-मुक्त हैं',
};

const INK_STRONG: Record<Theme, string> = {
  light: 'rgb(45, 44, 43)',
  dark: 'rgb(242, 238, 236)',
};

const INK_BODY: Record<Theme, string> = {
  light: 'rgb(99, 96, 93)',
  dark: 'rgb(189, 183, 180)',
};

const ORANGE = 'rgb(255, 115, 0)';

async function openHome(page: Page, locale: Locale, theme: Theme) {
  // Seed storage in the real app origin, then reload so i18next and the theme
  // component both take their normal initial-load paths.
  await page.goto('/');
  await page.evaluate(
    ({ nextLocale, nextTheme }) => {
      window.localStorage.setItem('perhit-lang', nextLocale);
      window.localStorage.setItem('perhit-theme', nextTheme);
    },
    { nextLocale: locale, nextTheme: theme }
  );
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', locale);
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
}

async function inspectHero(page: Page, state: AnimationState) {
  if (state === 'settled') {
    await waitForHeroSettle(page);
  } else {
    await expect(
      page.locator('h1.heading-1 [aria-hidden="true"]').first()
    ).toBeVisible();
  }

  return page.evaluate(() => {
    const accent = document.querySelector<HTMLElement>('.hero-signature-mark');
    const taxNote = document.querySelector<HTMLElement>('.hero-tax-note');
    if (!accent || !taxNote)
      throw new Error('Hero contrast targets are missing');

    const accentStyle = getComputedStyle(accent);
    const taxStyle = getComputedStyle(taxNote);
    return {
      accentColor: accentStyle.color,
      accentUnderlineColor: accentStyle.textDecorationColor,
      accentUnderlineLine: accentStyle.textDecorationLine,
      accentText: accent.textContent?.trim(),
      headingText: accent
        .closest('h1')
        ?.textContent?.replace(/\s+/g, ' ')
        .trim(),
      taxColor: taxStyle.color,
      taxText: taxNote.textContent?.trim(),
    };
  });
}

test.describe('HeroEditorial contrast contract', () => {
  for (const cell of CELLS) {
    for (const state of ['mid-SplitText', 'settled'] as const) {
      test(`${cell.locale}/${cell.theme}/${cell.viewport.width} ${state} uses semantic ink with an orange signature underline`, async ({
        page,
      }) => {
        await page.setViewportSize(cell.viewport);
        await openHome(page, cell.locale, cell.theme);

        const hero = await inspectHero(page, state);
        expect(hero.accentText).toBe(ACCENTS[cell.locale]);
        expect(hero.headingText).toContain(ACCENTS[cell.locale]);
        expect(hero.accentColor).toBe(INK_STRONG[cell.theme]);
        expect(hero.accentUnderlineColor).toBe(ORANGE);
        expect(hero.accentUnderlineLine).toContain('underline');
        expect(hero.taxText).toBe(TAX_NOTES[cell.locale]);
        expect(hero.taxColor).toBe(INK_BODY[cell.theme]);
      });
    }
  }

  test('negative control A: orange accent glyphs fail the 3:1 large-text floor', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openHome(page, 'hi', 'light');
    await waitForHeroSettle(page);
    await page.locator('.hero-signature-mark').evaluate(el => {
      (el as HTMLElement).style.color = '#FF7300';
    });

    const ratio = await page.locator('.hero-signature-mark').evaluate(el => {
      const luminance = (hex: string) => {
        const channels = hex
          .match(/\w\w/g)!
          .map(value => parseInt(value, 16) / 255);
        const linear = channels.map(value =>
          value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
        );
        return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
      };
      const foreground = getComputedStyle(el).color;
      const values = foreground.match(/\d+/g)!.map(Number);
      const toHex = values
        .map(value => value.toString(16).padStart(2, '0'))
        .join('');
      const light = luminance('f9f4f2');
      const dark = luminance(toHex);
      return (Math.max(light, dark) + 0.05) / (Math.min(light, dark) + 0.05);
    });

    // The design handoff measures this exact fixture as 2.49:1; retain a
    // range assertion here to avoid false precision from browser RGB math.
    expect(ratio).toBeGreaterThan(2);
    expect(ratio).toBeLessThan(3);
  });

  test('negative control B: legacy tax gray fails the 4.5:1 normal-text floor', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openHome(page, 'hi', 'light');
    await waitForHeroSettle(page);
    await page.locator('.hero-tax-note').evaluate(el => {
      (el as HTMLElement).style.color = '#8B8783';
    });

    const ratio = await page.locator('.hero-tax-note').evaluate(el => {
      const luminance = (hex: string) => {
        const channels = hex
          .match(/\w\w/g)!
          .map(value => parseInt(value, 16) / 255);
        const linear = channels.map(value =>
          value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
        );
        return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
      };
      const foreground = getComputedStyle(el).color;
      const values = foreground.match(/\d+/g)!.map(Number);
      const toHex = values
        .map(value => value.toString(16).padStart(2, '0'))
        .join('');
      const light = luminance('f9f4f2');
      const dark = luminance(toHex);
      return (Math.max(light, dark) + 0.05) / (Math.min(light, dark) + 0.05);
    });

    // The design handoff measures this exact fixture as 3.26:1.
    expect(ratio).toBeGreaterThan(3);
    expect(ratio).toBeLessThan(4.5);
  });
});
