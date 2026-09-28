// pw-x74x — measure every About.tsx card-chip: icon foreground vs RENDERED chip ground
// (chip bg alpha-composited over the nearest opaque ancestor), light mode.
// Usage: node measure-chips.mjs <baseUrl> <label> <outDir>
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const [base, label, outDir] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });

const lum = ([r, g, b]) => {
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const comp = (fg, a, bg) => fg.map((c, i) => Math.round(c * a + bg[i] * (1 - a)));
const hex = (c) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const out = [];
for (const width of [1280, 390]) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: 'light' });
  const page = await ctx.newPage();
  await page.goto(`${base}/about`, { waitUntil: 'networkidle' });
  await page.evaluate(() => { document.documentElement.setAttribute('data-theme', 'light'); });
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo(0, 0); });
  await page.waitForTimeout(800);
  const chips = await page.evaluate(() => {
    const parse = (s) => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { rgb: p.slice(0, 3), a: p.length > 3 ? p[3] : 1 }; };
    const res = [];
    document.querySelectorAll('span[class*="justify-center"]').forEach((el, i) => {
      const svg = el.querySelector('svg'); if (!svg) return;
      const cls = el.className;
      const hue = /primary-500\/10/.test(cls) ? 'blue' : /brand-signature|255,115,0/.test(cls) ? 'orange' : /1,166,82/.test(cls) ? 'green' : /255,206,0/.test(cls) ? 'yellow' : null;
      if (!hue) return;
      el.setAttribute('data-chip-idx', String(i));
      const bg = parse(getComputedStyle(el).backgroundColor);
      let anc = el.parentElement, ground = null, groundTag = '';
      while (anc) { const b = parse(getComputedStyle(anc).backgroundColor); if (b && b.a === 1) { ground = b.rgb; groundTag = anc.tagName.toLowerCase() + '.' + String(anc.className).split(' ').slice(0, 3).join('.'); break; } anc = anc.parentElement; }
      if (!ground) ground = [255, 255, 255];
      res.push({ idx: i, hue, cls, iconColor: parse(getComputedStyle(svg).color).rgb, svgStroke: svg.getAttribute('stroke'), chipBg: bg, ground, groundTag });
    });
    return res;
  });
  for (const c of chips) {
    const rendered = comp(c.chipBg.rgb, c.chipBg.a, c.ground);
    const r = ratio(c.iconColor, rendered);
    const onWhite = ratio(c.iconColor, comp(c.chipBg.rgb, c.chipBg.a, [255, 255, 255]));
    const onWarm = ratio(c.iconColor, comp(c.chipBg.rgb, c.chipBg.a, [0xf9, 0xf4, 0xf2]));
    out.push({ build: label, width, idx: c.idx, hue: c.hue, icon: hex(c.iconColor), svgStroke: c.svgStroke, chipBg: `rgba(${c.chipBg.rgb},${c.chipBg.a})`, ground: hex(c.ground), groundTag: c.groundTag, renderedChip: hex(rendered), ratioRendered: +r.toFixed(2), ratioIfWhiteGround: +onWhite.toFixed(2), ratioIfWarmGround: +onWarm.toFixed(2), pass: Math.min(r, onWhite, onWarm) >= 3 });
  }
  // Coverage guard: 12 chipTint call sites + 2 inline blue-tint contact-row chips (same classes, not via chipTint) = 14.
  if (chips.length !== 14) { console.error(`EXPECTED 14 chips, found ${chips.length} at ${width}`); process.exitCode = 2; }
  // One crop per chip: its immediate container.
  for (const c of chips) {
    const card = page.locator(`[data-chip-idx="${c.idx}"]`).locator('xpath=..');
    // Centre it in the viewport (an element screenshot parks it at the edge, under the sticky
    // mobile "Contribute now" bar at 390), then clip the real viewport — no DOM hiding.
    await card.evaluate((el) => el.scrollIntoView({ block: 'center' })); await page.waitForTimeout(400);
    const bb = await card.boundingBox();
    const png = `${outDir}/${label}-${width}-chip${String(c.idx).padStart(2,'0')}-${c.hue}.png`;
    const x = Math.max(0, bb.x - 8), y = Math.max(0, bb.y - 8);
    try { await page.screenshot({ path: png, clip: { x, y, width: Math.min(width - x, bb.width + 16), height: Math.min(900 - y, bb.height + 16) } }); }
    catch (e) { console.error(`clip fallback #${c.idx}@${width}: bb=${JSON.stringify(bb)}`); await card.screenshot({ path: png }); }
  }
  await page.screenshot({ path: `${outDir}/${label}-${width}-about-full.png`, fullPage: true });
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${outDir}/${label}-measurements.json`, JSON.stringify(out, null, 2));
for (const o of out) console.log(`${o.build} ${o.width} #${o.idx} ${o.hue.padEnd(6)} icon ${o.icon} on ${o.renderedChip} (ground ${o.ground}) = ${o.ratioRendered} | white ${o.ratioIfWhiteGround} warm ${o.ratioIfWarmGround} ${o.pass ? 'PASS' : 'FAIL'} stroke=${o.svgStroke}`);
