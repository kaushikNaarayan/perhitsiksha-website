import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const parseRgb = (color: string) => {
  const normalized = color.trim();
  if (/^#[0-9a-f]{6}$/i.test(normalized)) {
    return [
      Number.parseInt(normalized.slice(1, 3), 16),
      Number.parseInt(normalized.slice(3, 5), 16),
      Number.parseInt(normalized.slice(5, 7), 16),
    ];
  }
  return (
    normalized
      .match(/\d+(?:\.\d+)?/g)
      ?.slice(0, 3)
      .map(Number) ?? []
  );
};

const channel = (value: number) => {
  const normalized = value / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
};

const contrastRatio = (foreground: string, background: string) => {
  const luminance = (color: string) => {
    const [red, green, blue] = parseRgb(color);
    return (
      0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue)
    );
  };
  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
};

const counterContrastSample = async (page: Page) =>
  page.locator('#mobile-menu-panel').evaluate(panel => {
    const counter = panel.querySelector('.mobile-nav-support-row .text-xs');
    if (!counter) throw new Error('mobile VisitorCounter was not rendered');
    const ancestors: string[] = [];
    for (let node: Element | null = counter; node; node = node.parentElement) {
      ancestors.push(getComputedStyle(node).opacity);
      if (node === panel) break;
    }
    const root = getComputedStyle(document.documentElement);
    return {
      foreground: getComputedStyle(counter).color,
      background: getComputedStyle(panel).backgroundColor,
      inkBody: root.getPropertyValue('--ink-body').trim(),
      surfacePage: root.getPropertyValue('--surface-page').trim(),
      ancestors,
      transform: getComputedStyle(
        panel.querySelector('.mobile-nav-support-row')!
      ).transform,
    };
  });

const navItemContrastSample = async (page: Page) =>
  page.locator('#mobile-menu-panel').evaluate(panel => {
    const item = panel.querySelector('a.mobile-nav-item');
    if (!item) throw new Error('mobile navigation link was not rendered');
    const ancestors: string[] = [];
    for (let node: Element | null = item; node; node = node.parentElement) {
      ancestors.push(getComputedStyle(node).opacity);
      if (node === panel) break;
    }
    return {
      foreground: getComputedStyle(item).color,
      background: getComputedStyle(panel).backgroundColor,
      ancestors,
      transform: getComputedStyle(item).transform,
    };
  });

const cases = [
  { locale: 'en', width: 320 },
  { locale: 'en', width: 360 },
  { locale: 'en', width: 390 },
  { locale: 'en', width: 412 },
  { locale: 'hi', width: 390 },
];

for (const { locale, width } of cases) {
  test(`mobile nav is a viewport portal (${locale}, ${width}px)`, async ({
    page,
  }) => {
    await page.addInitScript(
      language => localStorage.setItem('perhit-lang', language),
      locale
    );
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    // `perhit-lang` is the product detector key. Confirm the application has
    // resolved it, not merely that localStorage contains a test-only value.
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    const toggle = page.locator('button[aria-controls="mobile-menu-panel"]');
    await toggle.focus();
    await toggle.press('Enter');
    const panel = page.locator('#mobile-menu-panel');
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute('role', 'dialog');
    const geometry = await panel.evaluate(el => {
      const r = el.getBoundingClientRect();
      return {
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
        hit: document.elementFromPoint(100, 300)?.closest('#mobile-menu-panel')
          ?.id,
        body: document.body.style.overflow,
      };
    });
    expect(geometry).toMatchObject({
      x: 0,
      y: 0,
      width,
      height: 844,
      hit: 'mobile-menu-panel',
      body: 'hidden',
    });
    const close = panel.locator('button').first();
    await expect(close).toBeFocused();
    // The trap must wrap in both directions rather than letting focus reach
    // the hamburger that remains in the sticky header outside the portal.
    await page.keyboard.press('Shift+Tab');
    await expect(panel.locator(':focus')).toHaveCount(1);
    await page.keyboard.press('Tab');
    await expect(close).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(panel).toHaveCount(0);
    await expect(toggle).toBeFocused();
    await expect(page.locator('body')).not.toHaveAttribute(
      'style',
      /overflow:\s*hidden/
    );
  });
}

test('geometry and hit-test assertions reject the header-contained negative control', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('button[aria-controls="mobile-menu-panel"]').click();

  const panel = page.locator('#mobile-menu-panel');
  await expect(panel).toBeVisible();

  // Deliberately recreate the original failure shape. This proves the
  // viewport rectangle and hit-test assertions above can detect a panel
  // captured by its 64px sticky-header containing block.
  await page.addStyleTag({
    content:
      '#mobile-menu-panel { inset: 0 auto auto 0 !important; height: 64px !important; min-height: 0 !important; }',
  });
  const negativeControl = await panel.evaluate(el => {
    const r = el.getBoundingClientRect();
    return {
      height: r.height,
      hit: document.elementFromPoint(100, 300)?.closest('#mobile-menu-panel')
        ?.id,
    };
  });
  expect(negativeControl.height).toBeLessThan(844);
  expect(negativeControl.hit).toBeUndefined();
});

test('resizing an open mobile menu restores the desktop branch', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByLabel(/toggle menu/i).click();
  await expect(page.locator('#mobile-menu-panel')).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(page.locator('#mobile-menu-panel')).toHaveCount(0);
  await expect(page.getByLabel(/toggle menu/i)).toBeHidden();
  await expect(page.locator('body')).not.toHaveAttribute(
    'style',
    /overflow:\s*hidden/
  );
});

for (const locale of ['en', 'hi']) {
  test(`mobile menu hands its scroll lock to the donation drawer (${locale})`, async ({
    page,
  }) => {
    await page.addInitScript(
      language => localStorage.setItem('perhit-lang', language),
      locale
    );
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', locale);

    await page.locator('button[aria-controls="mobile-menu-panel"]').click();
    const menu = page.locator('#mobile-menu-panel');
    await expect(menu).toBeVisible();
    await menu.locator('button.shimmer-btn').click();

    // The menu must unmount before the drawer takes over. Both overlays own a
    // body lock, so handing off must not briefly expose the page to scroll.
    await expect(menu).toHaveCount(0);
    const drawer = page.locator('.donation-panel');
    await expect(drawer).toBeVisible();
    await expect(page.locator('body')).toHaveAttribute(
      'style',
      /overflow:\s*hidden/
    );

    await drawer.locator('button').first().click();
    await expect(drawer).toHaveCount(0);
    await expect(page.locator('body')).not.toHaveAttribute(
      'style',
      /overflow:\s*hidden/
    );
  });
}

for (const locale of ['en', 'hi']) {
  for (const theme of ['light', 'dark']) {
    test(`mobile menu preserves contrast throughout its ${locale} ${theme} reveal`, async ({
      page,
    }) => {
      await page.addInitScript(
        value => localStorage.setItem('perhit-theme', value),
        theme
      );
      await page.addInitScript(
        value => localStorage.setItem('perhit-lang', value),
        locale
      );
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await page.locator('button[aria-controls="mobile-menu-panel"]').click();

      const panel = page.locator('#mobile-menu-panel');
      await expect(panel).toBeVisible();
      await expect(panel).toHaveCSS('position', 'fixed');
      await expect(panel).toHaveCSS('z-index', /\d+/);

      const immediateResults = await new AxeBuilder({ page })
        .include('#mobile-menu-panel')
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      expect(immediateResults.violations).toEqual([]);

      const revealSample = await counterContrastSample(page);
      expect(revealSample.transform).not.toBe('none');
      const initialItemSample = await navItemContrastSample(page);
      expect(initialItemSample.transform).not.toBe('none');

      for (let elapsed = 0; elapsed <= 700; elapsed += 50) {
        const sample = await counterContrastSample(page);
        const itemSample = await navItemContrastSample(page);
        expect(parseRgb(sample.foreground)).toEqual(parseRgb(sample.inkBody));
        expect(parseRgb(sample.background)).toEqual(
          parseRgb(sample.surfacePage)
        );
        expect(sample.ancestors).toEqual(expect.arrayContaining(['1']));
        expect(sample.ancestors.every(opacity => opacity === '1')).toBe(true);
        expect(
          contrastRatio(sample.foreground, sample.background)
        ).toBeGreaterThanOrEqual(4.5);
        expect(itemSample.ancestors.every(opacity => opacity === '1')).toBe(
          true
        );
        expect(
          contrastRatio(itemSample.foreground, itemSample.background)
        ).toBeGreaterThanOrEqual(4.5);
        if (elapsed < 700) await page.waitForTimeout(50);
      }

      const settledResults = await new AxeBuilder({ page })
        .include('#mobile-menu-panel')
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      expect(settledResults.violations).toEqual([]);
    });
  }
}

test('partial-opacity support-row negative control fails the temporal contrast gate', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('button[aria-controls="mobile-menu-panel"]').click();
  await expect(page.locator('.mobile-nav-support-row')).toBeVisible();
  await page.addStyleTag({
    content: '.mobile-nav-support-row { opacity: 0.35 !important; }',
  });
  const sample = await counterContrastSample(page);
  expect(sample.ancestors).toContain('0.35');
  // Composite the foreground over the panel at the frozen ancestor opacity.
  const [fr, fg, fb] = parseRgb(sample.foreground);
  const [br, bg, bb] = parseRgb(sample.background);
  const composite = `rgb(${Math.round(fr * 0.35 + br * 0.65)}, ${Math.round(fg * 0.35 + bg * 0.65)}, ${Math.round(fb * 0.35 + bb * 0.65)})`;
  expect(contrastRatio(composite, sample.background)).toBeLessThan(4.5);
});

test('partial-opacity nav-item negative control fails the temporal contrast gate', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('button[aria-controls="mobile-menu-panel"]').click();
  await expect(page.locator('a.mobile-nav-item').first()).toBeVisible();
  await page.addStyleTag({
    content: 'a.mobile-nav-item { opacity: 0.35 !important; }',
  });
  const sample = await navItemContrastSample(page);
  expect(sample.ancestors).toContain('0.35');
  const [fr, fg, fb] = parseRgb(sample.foreground);
  const [br, bg, bb] = parseRgb(sample.background);
  const composite = `rgb(${Math.round(fr * 0.35 + br * 0.65)}, ${Math.round(fg * 0.35 + bg * 0.65)}, ${Math.round(fb * 0.35 + bb * 0.65)})`;
  expect(contrastRatio(composite, sample.background)).toBeLessThan(4.5);
});

test('reduced-motion mobile menu settles without a reveal transform', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('button[aria-controls="mobile-menu-panel"]').click();

  const firstItem = page.locator('#mobile-menu-panel .mobile-nav-item').first();
  await expect(firstItem).toBeVisible();
  await expect(firstItem).toHaveCSS('opacity', '1');
  await expect(firstItem).toHaveCSS('transform', 'none');
  const sample = await counterContrastSample(page);
  expect(sample.ancestors.every(opacity => opacity === '1')).toBe(true);
  expect(sample.transform).toBe('none');
  expect(
    contrastRatio(sample.foreground, sample.background)
  ).toBeGreaterThanOrEqual(4.5);
});
