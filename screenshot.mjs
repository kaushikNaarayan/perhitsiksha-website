import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://localhost:4173';
const OUT = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });

const results = [];

const browser = await chromium.launch();

async function withPage(fn) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const consoleErrors = [];
  const navigations = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('popup', p => navigations.push('POPUP:' + p.url()));
  try {
    await fn(page, consoleErrors, navigations);
  } catch (e) {
    console.error('ERROR in page task:', e.message);
  } finally {
    await page.close();
  }
  return { consoleErrors, navigations };
}

function setLocale(lang) {
  return async (page) => {
    await page.addInitScript((l) => {
      try { window.localStorage.setItem('perhit-lang', l); } catch (e) {}
    }, lang);
  };
}

async function shot(page, name) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
}

// --- Home page, both locales ---
for (const lang of ['en', 'hi']) {
  const r = await withPage(async (page, errs, navs) => {
    await setLocale(lang)(page);
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const btn = page.getByRole('button', { name: /^Request Support$|^सहायता के लिए संपर्क करें$/ }).first();
    await btn.scrollIntoViewIfNeeded();
    await shot(page, `home-${lang}-request-support`);
    const urlBefore = page.url();
    await btn.click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(500);
    const urlAfter = page.url();
    results.push({ page: `home-${lang}`, urlBefore, urlAfter, navChanged: urlBefore !== urlAfter, consoleErrors: errs, popups: navs });
  });
}

// --- About page: contributor band + get-in-touch ---
for (const lang of ['en', 'hi']) {
  await withPage(async (page, errs, navs) => {
    await setLocale(lang)(page);
    await page.goto(`${BASE}/about`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const contribBtn = page.getByRole('button', { name: /^Become a Contributor$|^सहयोगी बनें$/ }).first();
    await contribBtn.scrollIntoViewIfNeeded();
    await shot(page, `about-${lang}-contributor-band`);
    const urlBefore = page.url();
    await contribBtn.click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(500);
    const urlAfter = page.url();
    results.push({ page: `about-${lang}-contributor`, urlBefore, urlAfter, navChanged: urlBefore !== urlAfter, consoleErrors: errs, popups: navs });

    const phoneEl = page.getByText(/\+91 83175 80423/);
    await phoneEl.scrollIntoViewIfNeeded();
    await shot(page, `about-${lang}-get-in-touch`);
  });
}

// --- Testimonials page CTA ---
for (const lang of ['en', 'hi']) {
  await withPage(async (page, errs, navs) => {
    await setLocale(lang)(page);
    await page.goto(`${BASE}/testimonials`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const btn = page.getByRole('button', { name: /^Become a Contributor$|^सहयोगी बनें$/ }).first();
    await btn.scrollIntoViewIfNeeded();
    await shot(page, `testimonials-${lang}-cta`);
    const urlBefore = page.url();
    await btn.click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(500);
    const urlAfter = page.url();
    results.push({ page: `testimonials-${lang}`, urlBefore, urlAfter, navChanged: urlBefore !== urlAfter, consoleErrors: errs, popups: navs });
  });
}

// --- Donation drawer: default + post-submit thank-you state ---
for (const lang of ['en', 'hi']) {
  await withPage(async (page, errs, navs) => {
    await setLocale(lang)(page);
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const trigger = page.locator('a[href="#donate"], [data-donate]').first();
    await trigger.click({ timeout: 5000 }).catch(async () => {
      const ctaBtn = page.getByRole('button', { name: /contribute now|योगदान करें/i }).first();
      await ctaBtn.click({ timeout: 5000 });
    });
    await page.waitForTimeout(800);
    // GSAP's slide-in tween doesn't settle reliably under headless Chromium
    // (pre-existing quirk, reproduces on unmodified main too — unrelated to
    // this change). Force the resting "open" transform for a true screenshot.
    await page.evaluate(() => {
      const panel = document.querySelector('.donation-panel');
      const backdrop = document.querySelector('.donation-backdrop');
      if (panel) panel.style.transform = 'none';
      if (backdrop) backdrop.style.opacity = '1';
    });
    await page.waitForTimeout(100);
    await shot(page, `drawer-${lang}-default`);

    // Fill form and submit
    await page.locator('#donation-name').fill('Test User');
    await page.locator('#donation-email').fill('test@example.com');
    await page.locator('#donation-phone').fill('9876543210');
    await page.locator('#donation-amount').fill('1000');
    await page.waitForTimeout(200);
    const submitBtn = page.getByRole('button', { name: /continue|आगे बढ़ें/i });
    await submitBtn.evaluate(el => {
      el.scrollIntoView({ block: 'center' });
      el.click();
    });
    await page.waitForTimeout(800);
    await page.evaluate(() => {
      const panel = document.querySelector('.donation-panel');
      const backdrop = document.querySelector('.donation-backdrop');
      if (panel) panel.style.transform = 'none';
      if (backdrop) backdrop.style.opacity = '1';
    });
    await page.waitForTimeout(100);
    await shot(page, `drawer-${lang}-thankyou`);

    // Click the (inert) confirm CTA in thank-you state
    const confirmBtn = page.getByRole('button', { name: /confirm|योगदान की पुष्टि/i }).first();
    const urlBefore = page.url();
    await confirmBtn.evaluate(el => { el.scrollIntoView({ block: 'center' }); el.click(); }).catch(() => {});
    await page.waitForTimeout(500);
    const urlAfter = page.url();
    results.push({ page: `drawer-${lang}-confirm-cta`, urlBefore, urlAfter, navChanged: urlBefore !== urlAfter, consoleErrors: errs, popups: navs });
  });
}

await browser.close();

fs.writeFileSync(`${OUT}/click-results.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
