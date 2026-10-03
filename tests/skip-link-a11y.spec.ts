import { expect, test, type Page } from '@playwright/test';

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

const COPY: Record<Locale, string> = {
  en: 'Skip to content',
  hi: 'मुख्य सामग्री पर जाएँ',
};

const ratio = (foreground: string, background: string) => {
  const luminance = (color: string) => {
    const hex = color.trim().replace('#', '');
    const channels = /^([\da-f]{3}|[\da-f]{6})$/i.test(hex)
      ? (hex.length === 3
          ? hex.split('').map(channel => channel + channel)
          : hex.match(/../g)!
        ).map(channel => parseInt(channel, 16))
      : color
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
};

async function seedHomeBeforeBoot(page: Page, locale: Locale, theme: Theme) {
  await page.addInitScript(
    ({ nextLocale, nextTheme }) => {
      localStorage.setItem('perhit-lang', nextLocale);
      localStorage.setItem('perhit-theme', nextTheme);
    },
    { nextLocale: locale, nextTheme: theme }
  );
  await page.goto('/');
}

async function expectHomeBootState(page: Page, locale: Locale, theme: Theme) {
  const html = page.locator('html');
  await expect(html, `Skip-link boot locale mismatch: expected ${locale}`).toHaveAttribute(
    'lang',
    locale
  );
  await expect(html, `Skip-link boot theme mismatch: expected ${theme}`).toHaveAttribute(
    'data-theme',
    theme
  );
}

async function openHome(page: Page, locale: Locale, theme: Theme) {
  await seedHomeBeforeBoot(page, locale, theme);
  await expectHomeBootState(page, locale, theme);
}

test.describe('Skip-link accessibility contract', () => {
  test('negative control: a wrong pre-boot theme is rejected by the boot contract', async ({
    page,
  }) => {
    await seedHomeBeforeBoot(page, 'en', 'light');
    await expectHomeBootState(page, 'en', 'light');
    await expect(expectHomeBootState(page, 'en', 'dark')).rejects.toThrow(
      'Skip-link boot theme mismatch: expected dark'
    );
  });

  for (const cell of CELLS) {
    test(`${cell.locale}/${cell.theme}/${cell.viewport.width} preserves keyboard access and contrast`, async ({
      page,
    }) => {
      await page.setViewportSize(cell.viewport);
      await openHome(page, cell.locale, cell.theme);

      const skipLink = page.locator('.skip-link');
      await expect(skipLink).toHaveText(COPY[cell.locale]);
      await expect(skipLink).toHaveCSS('font-family', /Anek/);
      await expect(skipLink).toHaveCSS('top', '-40px');
      await expect(skipLink).toHaveCSS('background-color', 'rgb(0, 97, 239)');
      await expect(skipLink).toHaveCSS('color', 'rgb(255, 255, 255)');

      const colors = await skipLink.evaluate(element => {
        const style = getComputedStyle(element);
        const root = getComputedStyle(document.documentElement);
        return {
          background: style.backgroundColor,
          foreground: style.color,
          page: root.getPropertyValue('--surface-page').trim(),
          ink: root.getPropertyValue('--ink-strong').trim(),
        };
      });
      expect(
        ratio(colors.foreground, colors.background)
      ).toBeGreaterThanOrEqual(4.5);

      await page.keyboard.press('Tab');
      await expect(skipLink).toBeFocused();
      await expect(skipLink).toHaveCSS('top', '6px');
      await expect(skipLink).toHaveCSS('outline-style', 'solid');
      const focused = await skipLink.evaluate(element => {
        const style = getComputedStyle(element);
        const box = element.getBoundingClientRect();
        return { box, shadow: style.boxShadow };
      });
      expect(focused.box.x).toBeGreaterThanOrEqual(0);
      expect(focused.box.y).toBe(6);
      expect(focused.box.right).toBeLessThanOrEqual(cell.viewport.width);
      expect(focused.box.bottom).toBeLessThanOrEqual(cell.viewport.height);
      expect(focused.shadow).toContain('0px 0px 0px 2px');
      expect(focused.shadow).toContain('0px 0px 0px 4px');

      // The inner ring is surface-page against canonical blue; the outer ring
      // is ink-strong against surface-page. Both adjacent boundaries are 3:1+.
      expect(ratio(colors.background, colors.page)).toBeGreaterThanOrEqual(3);
      expect(ratio(colors.ink, colors.page)).toBeGreaterThanOrEqual(3);

      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/#main-content$/);
      await expect(page.locator('#main-content')).toBeVisible();
    });
  }

  test('negative control: white on dark brand-primary fails normal-text contrast', async ({
    page,
  }) => {
    await openHome(page, 'en', 'dark');
    const skipLink = page.locator('.skip-link');
    await skipLink.evaluate(element => {
      (element as HTMLElement).style.background = 'var(--brand-primary)';
    });
    const colors = await skipLink.evaluate(element => {
      const style = getComputedStyle(element);
      return { foreground: style.color, background: style.backgroundColor };
    });
    expect(ratio(colors.foreground, colors.background)).toBeCloseTo(2.54, 1);
    expect(ratio(colors.foreground, colors.background)).toBeLessThan(4.5);
  });

  test('negative control: a surface-page outer ring has 1:1 adjacent contrast', async ({
    page,
  }) => {
    await openHome(page, 'en', 'dark');
    const skipLink = page.locator('.skip-link');
    await skipLink.evaluate(element => {
      (element as HTMLElement).style.boxShadow =
        '0 0 0 2px var(--surface-page), 0 0 0 4px var(--surface-page)';
    });
    const root = await page.locator('html').evaluate(element => {
      const style = getComputedStyle(element);
      return style.getPropertyValue('--surface-page').trim();
    });
    expect(ratio(root, root)).toBe(1);
  });
});
