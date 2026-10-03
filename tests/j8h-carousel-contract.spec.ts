import { expect, test, type Locator, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

type Locale = 'en' | 'hi';

const cases: ReadonlyArray<{ locale: Locale; width: number }> = [
  { locale: 'en', width: 390 },
  { locale: 'en', width: 1280 },
  { locale: 'hi', width: 390 },
  { locale: 'hi', width: 1280 },
];

const reviewArtifactDir =
  process.env.PW_J8H_REVIEW_DIR ??
  '/home/kanaba/gascity-pilot/rigs/perhitweb/review-artifacts/pw-j8h/current-main-refresh';

const writeSha256 = async (path: string) => {
  const hash = createHash('sha256')
    .update(await readFile(path))
    .digest('hex');
  await writeFile(
    join(reviewArtifactDir, `${basename(path)}.sha256`),
    `${hash}  ${basename(path)}\n`
  );
  return hash;
};

const captureReviewArtifact = async (
  page: Page,
  locale: Locale,
  width: number
) => {
  if (process.env.PW_J8H_CAPTURE !== '1') return;
  await mkdir(reviewArtifactDir, { recursive: true });
  const events = page.locator('[data-testid="events-carousel"]');
  const pagination = events.getByRole('group');
  const controls: Array<{
    name: string;
    rectangle: { x: number; y: number; width: number; height: number };
    atLeast44: boolean;
    horizontallyContained: boolean;
  }> = [];
  const record = async (name: string, target: Locator) => {
    await assertCompleteTarget(target);
    const rectangle = await target.boundingBox();
    expect(rectangle, `${name} has a rectangle`).not.toBeNull();
    controls.push({
      name,
      rectangle: rectangle!,
      atLeast44: rectangle!.width >= 44 && rectangle!.height >= 44,
      horizontallyContained:
        rectangle!.x >= 0 && rectangle!.x + rectangle!.width <= width,
    });
  };
  await record(
    'events-previous',
    events
      .locator('button')
      .filter({ has: page.locator('svg.lucide-chevron-left') })
      .first()
  );
  await record(
    'events-next',
    events
      .locator('button')
      .filter({ has: page.locator('svg.lucide-chevron-right') })
      .first()
  );
  for (
    let index = 0;
    index < (await pagination.locator('button').count());
    index++
  ) {
    await record(
      `events-dot-${index + 1}`,
      pagination.locator('button').nth(index)
    );
  }
  await record(
    'youtube-previous',
    page.getByLabel(
      locale === 'en' ? 'Show previous endorsement' : 'पिछला समर्थन दिखाएँ'
    )
  );
  await record(
    'youtube-next',
    page.getByLabel(
      locale === 'en' ? 'Show next endorsement' : 'अगला समर्थन दिखाएँ'
    )
  );
  const screenshotPath = join(reviewArtifactDir, `home-${locale}-${width}.png`);
  const rectanglesPath = join(
    reviewArtifactDir,
    `rectangles-${locale}-${width}.json`
  );
  await page.screenshot({ path: screenshotPath, fullPage: true });
  await writeFile(
    rectanglesPath,
    `${JSON.stringify({ locale, width, controls }, null, 2)}\n`
  );
  await writeSha256(screenshotPath);
  await writeSha256(rectanglesPath);
};

async function openHome(page: Page, locale: Locale, reducedMotion = false) {
  await page.addInitScript(
    value => localStorage.setItem('perhit-lang', value),
    locale
  );
  if (reducedMotion) await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', locale);
  await expect(page.locator('[data-events-ready="true"]')).toBeVisible();
}

async function assertCompleteTarget(target: ReturnType<Page['locator']>) {
  const box = await target.boundingBox();
  expect(box, 'carousel control must have a layout box').not.toBeNull();
  expect(box!.width, 'carousel control width').toBeGreaterThanOrEqual(44);
  expect(box!.height, 'carousel control height').toBeGreaterThanOrEqual(44);
  const viewport = target.page().viewportSize()!;
  expect(
    box!.x,
    'carousel control must not be clipped left'
  ).toBeGreaterThanOrEqual(0);
  expect(
    box!.y,
    'carousel control must not be clipped above'
  ).toBeGreaterThanOrEqual(0);
  expect(
    box!.x + box!.width,
    'carousel control must not be clipped right'
  ).toBeLessThanOrEqual(viewport.width);
}

for (const { locale, width } of cases) {
  test(`renders complete localized 44px carousel controls (${locale}, ${width})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await openHome(page, locale);
    const events = page.locator('[data-testid="events-carousel"]');
    const pagination = events.getByRole('group');
    const dots = pagination.locator('button');
    const previous = events
      .locator('button')
      .filter({ has: page.locator('svg.lucide-chevron-left') })
      .first();
    const next = events
      .locator('button')
      .filter({ has: page.locator('svg.lucide-chevron-right') })
      .first();
    await assertCompleteTarget(previous);
    await assertCompleteTarget(next);
    for (let index = 0; index < (await dots.count()); index++)
      await assertCompleteTarget(dots.nth(index));
    expect(
      await dots.count(),
      '390 renders a bounded window; desktop renders all ten'
    ).toBe(width === 390 ? 7 : 10);
    await expect(pagination).toHaveAttribute(
      'aria-label',
      locale === 'en' ? 'Event pagination' : 'आयोजन पेजिनेशन'
    );
    await expect(events.locator('[aria-live="polite"]')).toContainText(
      locale === 'en' ? 'Event 1 of 10' : 'आयोजन 1 / 10'
    );
    await expect(
      page
        .getByText(
          locale === 'en'
            ? 'All donations are 80G tax-exempt'
            : 'सभी दान 80G कर-मुक्त हैं',
          { exact: true }
        )
        .last()
    ).toBeVisible();
    await captureReviewArtifact(page, locale, width);
  });
}

test('pagination roves through first, middle, last and preserves hidden-slide arrow reachability', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openHome(page, 'en');
  const events = page.locator('[data-testid="events-carousel"]');
  await events.hover();
  const active = events.locator('button[aria-current="true"]');
  await active.focus();
  await page.keyboard.press('End');
  await expect(events.locator('[aria-live="polite"]')).toContainText(
    'Event 10 of 10'
  );
  await expect(events.locator('button[aria-current="true"]')).toBeFocused();
  await page.keyboard.press('Home');
  await expect(events.locator('[aria-live="polite"]')).toContainText(
    'Event 1 of 10'
  );
  await page.keyboard.press('ArrowRight');
  await expect(events.locator('[aria-live="polite"]')).toContainText(
    'Event 2 of 10'
  );
  await events
    .locator('button')
    .filter({ has: page.locator('svg.lucide-chevron-right') })
    .first()
    .click();
  await expect(events.locator('[aria-live="polite"]')).toContainText(
    'Event 3 of 10'
  );
});

test('YouTube arrows move exactly one pitch without opening a modal, including reduced motion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openHome(page, 'hi', true);
  const previous = page.getByLabel('पिछला समर्थन दिखाएँ');
  const next = page.getByLabel('अगला समर्थन दिखाएँ');
  await assertCompleteTarget(previous);
  await assertCompleteTarget(next);
  const rail = page.getByRole('region', { name: /समर्थन/ });
  const track = rail.locator(':scope > div');
  const firstCard = track.locator(':scope > div').first();
  const translateX = () =>
    track.evaluate(
      element => new DOMMatrixReadOnly(getComputedStyle(element).transform).m41
    );
  const before = await translateX();
  const firstCardWidth = (await firstCard.boundingBox())!.width;
  const gap = Number.parseFloat(
    await track.evaluate(element => getComputedStyle(element).columnGap)
  );
  await next.click();
  await expect(page.locator('[role="dialog"]')).toHaveCount(0);
  const after = await translateX();
  expect(
    Math.abs(after - before),
    'next arrow moves one rendered card plus its column gap'
  ).toBeCloseTo(firstCardWidth + gap, 5);
});

test('negative controls reject undersized and clipped rectangles through the same geometry contract', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openHome(page, 'en');
  const target = page
    .locator('[data-testid="events-carousel"]')
    .getByRole('group')
    .locator('button')
    .first();
  await target.evaluate(element => {
    const style = (element as HTMLElement).style;
    style.setProperty('width', '4px', 'important');
    style.setProperty('height', '4px', 'important');
    style.setProperty('min-width', '4px', 'important');
    style.setProperty('min-height', '4px', 'important');
  });
  await page.evaluate(
    () =>
      new Promise<void>(resolve =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      )
  );
  await expect(assertCompleteTarget(target)).rejects.toThrow(
    'carousel control width'
  );
  const clippedTarget = page
    .locator('[data-testid="events-carousel"]')
    .getByRole('group')
    .locator('button')
    .nth(1);
  await clippedTarget.evaluate(element => {
    const style = (element as HTMLElement).style;
    style.setProperty('position', 'fixed', 'important');
    style.setProperty('left', '-1000px', 'important');
    style.setProperty('top', '0', 'important');
    style.setProperty('transform', 'none', 'important');
  });
  await page.evaluate(
    () =>
      new Promise<void>(resolve =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      )
  );
  await expect(assertCompleteTarget(clippedTarget)).rejects.toThrow(
    'carousel control must not be clipped left'
  );
});
