import AxeBuilder from '@axe-core/playwright';
import { chromium } from '@playwright/test';

const args = new Set(process.argv.slice(2));
const seededViolation = args.has('--seed-violation');
const expectFailure = args.has('--expect-failure');
const neverSettles = args.has('--never-settles');
const urls = process.argv.slice(2).filter(arg => !arg.startsWith('--'));
const targets =
  urls.length > 0
    ? urls
    : [process.env.ACCESSIBILITY_URL ?? 'http://localhost:3000'];
const heroSettleTimeout = Number.parseInt(
  process.env.ACCESSIBILITY_HERO_SETTLE_TIMEOUT_MS ?? '10000',
  10
);

async function waitForAccessiblePageState(page, target) {
  await page.waitForLoadState('load');
  await page.evaluate(async () => {
    if ('fonts' in document) await document.fonts.ready;
  });

  const hasHeroLifecycleMarker = await page
    .locator('[data-hero-settled]')
    .count();
  if (!hasHeroLifecycleMarker) return;

  await page.waitForFunction(
    () =>
      [...document.querySelectorAll('[data-hero-settled]')].every(
        marker => marker.getAttribute('data-hero-settled') === 'true'
      ),
    undefined,
    { timeout: heroSettleTimeout }
  );
  console.log(`Accessibility readiness settled: ${target}`);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();

try {
  const violations = [];

  for (const target of targets) {
    const page = await context.newPage();
    if (seededViolation) {
      await page.setContent(
        '<main><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="></main>'
      );
    } else {
      await page.goto(target, { waitUntil: 'networkidle' });
      if (neverSettles) {
        await page
          .locator('[data-hero-settled]')
          .first()
          .evaluate(element => {
            const readAttribute = element.getAttribute.bind(element);
            element.getAttribute = name =>
              name === 'data-hero-settled' ? 'false' : readAttribute(name);
          });
      }
      await waitForAccessiblePageState(page, target);
    }

    const results = await new AxeBuilder({ page }).analyze();
    violations.push(
      ...results.violations.map(violation => ({ target, ...violation }))
    );
    await page.close();
  }

  const found = violations.length > 0;
  console.log(
    JSON.stringify(
      { seededViolation, neverSettles, targets, violations },
      null,
      2
    )
  );
  if (expectFailure ? !found : found) process.exitCode = 1;
} finally {
  await context.close();
  await browser.close();
}
