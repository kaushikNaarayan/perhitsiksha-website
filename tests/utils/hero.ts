import type { Page } from '@playwright/test';

/**
 * HeroEditorial's GSAP SplitText entrance animation replaces the h1 with
 * per-character `[aria-hidden="true"]` spans while it cascades in, then
 * reverts to plain text on completion. That split markup reflows differently
 * than the settled text and can wrap mid-word where the settled version does
 * not (pw-h5gz) — any visual assertion on a HeroEditorial h1 must wait for
 * the revert, not a fixed sleep, since the animation duration isn't a
 * contract.
 *
 * Under `prefers-reduced-motion: reduce` the split branch never runs at all
 * (see HeroEditorial's `gsap.matchMedia` guard), so this resolves
 * immediately for a reduced-motion context — prefer that context for visual
 * QA when animation itself isn't what's under test.
 */
export async function waitForHeroSettle(page: Page, timeout = 3000): Promise<void> {
  await page.waitForFunction(
    () => {
      const h1 = document.querySelector('h1.heading-1');
      if (!h1) return true;
      return h1.querySelector('[aria-hidden="true"]') === null;
    },
    undefined,
    { timeout }
  );
}

/**
 * Reconstructs the h1's rendered text line-by-line using the browser's own
 * layout (per-character Range rects bucketed by their line's y-position),
 * then rejoins the lines with a single space and compares against the
 * known-good text. A normal word wrap never inserts characters, so the
 * rejoined text always equals the original; a mid-word break drops the
 * line-wrap exactly where a character (not a space) sat, so rejoining
 * inserts an extra space inside what was one word — which fails the
 * comparison. This is layout-derived ground truth, not a font-metric
 * estimate, so it needs no per-font/per-breakpoint tuning.
 */
export async function findMidWordBreaks(
  page: Page,
  selector = 'h1.heading-1'
): Promise<{ ok: boolean; renderedLines: string[]; rejoined: string; expected: string }> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return { ok: false, renderedLines: [], rejoined: '', expected: '' };

    const expected = (el.textContent || '').replace(/\s+/g, ' ').trim();

    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const chars: { ch: string; top: number }[] = [];
    let node: Text | null = walker.nextNode() as Text | null;
    while (node) {
      const data = node.data;
      for (let i = 0; i < data.length; i++) {
        const range = document.createRange();
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        const rect = range.getBoundingClientRect();
        chars.push({ ch: data[i], top: Math.round(rect.top) });
      }
      node = walker.nextNode() as Text | null;
    }

    const lines: string[] = [];
    let curTop: number | null = null;
    let curText = '';
    for (const { ch, top } of chars) {
      if (curTop === null || Math.abs(top - curTop) > 3) {
        if (curText.trim()) lines.push(curText.trim());
        curText = ch;
        curTop = top;
      } else {
        curText += ch;
      }
    }
    if (curText.trim()) lines.push(curText.trim());

    const rejoined = lines.join(' ').replace(/\s+/g, ' ').trim();
    return { ok: rejoined === expected, renderedLines: lines, rejoined, expected };
  }, selector);
}
