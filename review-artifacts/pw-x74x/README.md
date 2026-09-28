# pw-x74x: About card-chip contrast, designer eyes-on (2026-09-18)

- **PR:** #40, branch `pw-x74x-fenced`, head **39f1c93** (rebased onto origin/main 9709c78; was 4e85b06)
- **Diff vs origin/main:** `src/index.css` and `src/pages/About.tsx` only. `git diff origin/main -- src/pages/Testimonials.tsx src/pages/Home.tsx` is empty.
- **Method:** both refs built with `vite build` and served with `vite preview`. Chromium in light mode, at 1280 and 390 wide. `measure-chips.mjs` reads the computed icon `color` (the svg stroke is `currentColor`) and the chip `background-color`, then alpha-composites the chip over its nearest opaque ancestor. It also reports the ratio as if the chip sat on a white ground and on a warm-white `#F9F4F2` ground. A coverage guard expects 14 chips: the 12 chipTint sites plus 2 inline blue contact-row chips.

## Contrast (WCAG 1.4.11, need ≥ 3:1). The same on both widths.

| hue | before main@9709c78 (white / warm) | after 39f1c93 (white / warm) |
|---|---|---|
| orange ×3 | #FF7300 on 12% tint: **2.41 / 2.24 FAIL** | #141313 on solid #FF7300: **6.80 / 6.80** |
| green ×2 | #01A652 on tint: **2.79 / 2.58 FAIL** | #02873E: **4.04 / 3.74** |
| yellow ×1 | #B88A00 on tint: **2.93 / 2.72 FAIL** | #2D2C2B (gray-800 = DS --grey-700): **12.96 / 12.05** |
| blue ×6 (+2 contact) | 6.21 / 5.70 | unchanged, 6.21 / 5.70 |

The positive control is main: it FAILs 12 rows (6 chips × 2 widths) and the PR FAILs 0. Raw data: `*-measurements.json` and `*-stdout.txt`.

## Visual judgment (`gallery-{1280,390}-before-after.png`, per-chip crops)

- **The solid orange reads as the DS signature, not as a button.** It sits in the icon slot with the same size and radius as its sibling chips, has no label, and has no hover or cursor affordance. Every real CTA on the page stays blue (`Contribute now`). Each group (pillars, values, vision/mission) gets exactly one orange pop.
- **Non-blocking note for pw-ajo (the multi-hue pass):** the solid chip is now the heaviest element in each row, while its siblings are pale tints. The Vision/Mission pair is the most visibly lopsided. That matches the v3 "orange pop" intent, so it isn't a defect here. If a later pass wants the tints to carry equal weight, the alternative that stays within the rule is dark ink on the orange tint, the same way yellow is handled.
- Capture note: 390 crops are taken with the chip centred in the viewport. An element screenshot parks the chip under the sticky mobile CTA bar, which hid chip 08.
