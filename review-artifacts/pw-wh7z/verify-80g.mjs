import { chromium } from '@playwright/test';
import fs from 'node:fs';

// pw-wh7z acceptance: "at 1280 the 80G line is fully legible with no sprite
// over any glyph", verified at 390/768/1280 in BOTH EN and HI.
// The test is GLYPH-level on purpose: the taxNote <p> is a ~543px block whose
// text only inks ~172px, so an element-box test reports a FALSE overlap and
// would fail even a correct fix.
const BASE = process.env.BASE || 'http://127.0.0.1:4174';
const LABEL = process.env.LABEL || 'run';
const OUT = process.env.OUT || null;

const SIZES = [{ w: 390, h: 844 }, { w: 768, h: 1024 }, { w: 1280, h: 800 }];
const LOCALES = ['en', 'hi'];

const browser = await chromium.launch();
const rows = [];

for (const { w, h } of SIZES) {
  for (const lang of LOCALES) {
    const ctx = await browser.newContext({
      viewport: { width: w, height: h },
      deviceScaleFactor: 2,
    });
    await ctx.addInitScript((l) => localStorage.setItem('perhit-lang', l), lang);
    const page = await ctx.newPage();
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });

    // pw-h5gz: settle on the observable end-state, never a fixed duration.
    await page.waitForFunction(() => {
      const h1 = document.querySelector('h1');
      if (!h1) return false;
      if (h1.querySelectorAll('span').length > 1) return false;
      if ([...h1.querySelectorAll('*')].some((e) => e.tagName !== 'SPAN')) return false;
      const lede = h1.parentElement?.querySelector('div > p');
      return !!lede && parseFloat(getComputedStyle(lede).opacity) > 0.99;
    }, { timeout: 15000 });
    await page.waitForTimeout(400);

    const m = await page.evaluate(() => {
      const hero = document.querySelector('h1')?.closest('section');
      const tax = [...(hero?.querySelectorAll('p') ?? [])].find((p) => /80G/i.test(p.textContent || ''));
      const burst = [...(hero?.querySelectorAll('img') ?? [])].find((i) => /burst/i.test(i.getAttribute('src') || ''));
      const b = (el) => { if (!el) return null; const r = el.getBoundingClientRect();
        return { x:+r.x.toFixed(1), y:+r.y.toFixed(1), w:+r.width.toFixed(1), h:+r.height.toFixed(1) }; };
      const ink = (el) => { if (!el) return null; const r = document.createRange(); r.selectNodeContents(el);
        const q = [...r.getClientRects()]; if (!q.length) return null;
        const x = Math.min(...q.map(k=>k.left)), y = Math.min(...q.map(k=>k.top));
        return { x:+x.toFixed(1), y:+y.toFixed(1),
                 w:+(Math.max(...q.map(k=>k.right))-x).toFixed(1),
                 h:+(Math.max(...q.map(k=>k.bottom))-y).toFixed(1) }; };
      return { burst: b(burst), taxInk: ink(tax), taxText: tax?.textContent ?? null,
               ariaHidden: burst?.closest('[aria-hidden="true"]') !== null,
               pointerNone: burst ? getComputedStyle(burst).pointerEvents === 'none'
                                  || getComputedStyle(burst.parentElement).pointerEvents === 'none' : null };
    });

    const hit = (a, b) => !!a && !!b && a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
    const overlap = hit(m.burst, m.taxInk);
    rows.push({ w, lang, overlap, burst: m.burst, taxInk: m.taxInk,
                ariaHidden: m.ariaHidden, pointerNone: m.pointerNone, taxText: m.taxText });
    if (OUT) { fs.mkdirSync(OUT, { recursive: true }); await page.screenshot({ path: `${OUT}/80g-${w}-${lang}.png` }); }
    await ctx.close();
  }
}
await browser.close();

console.log(`--- ${LABEL} ---`);
console.log('w     lang  spriteX          taxInkX          OVER-GLYPH  ariaHidden');
for (const r of rows) {
  console.log(
    `${String(r.w).padEnd(5)} ${r.lang.padEnd(5)} ` +
    `${(r.burst ? `${r.burst.x}..${(r.burst.x+r.burst.w).toFixed(1)}` : 'n/a').padEnd(16)} ` +
    `${(r.taxInk ? `${r.taxInk.x}..${(r.taxInk.x+r.taxInk.w).toFixed(1)}` : 'n/a').padEnd(16)} ` +
    `${(r.overlap ? '*** YES ***' : 'no').padEnd(11)} ${r.ariaHidden}`
  );
}
const bad = rows.filter((r) => r.overlap);
console.log(bad.length ? `RESULT: FAIL — ${bad.length}/${rows.length} cells have the sprite over the 80G glyphs`
                       : `RESULT: PASS — 0/${rows.length} cells overlap`);
if (OUT) fs.writeFileSync(`${OUT}/verify-${LABEL}.json`, JSON.stringify(rows, null, 2));
process.exit(bad.length ? 2 : 0);
