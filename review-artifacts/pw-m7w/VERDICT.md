# pw-m7w — verify-on-live evidence (AC1–AC4, replacement criteria)

Bead: pw-m7w — hover-lift consumed a hand-picked box-shadow instead of the DS token.
Source fix: origin/main `1ad61f3`.

## IMPORTANT — the bead's ORIGINAL premise and AC were WRONG
The description asserted "canon is hard block, 0 blur" (inherited from pe-vax line 4).
Canon (`rigs/perhitsocial/design_system/ds/tokens/effects.css`) says otherwise: only
`--shadow-sm`/`--shadow-md` are 0-blur underlines; `--shadow-lg/-xl/-overlay/-drawer`
carry blur BY DESIGN, and that file's own header marks the neobrutalist framing SUPERSEDED.
The original AC ("no box-shadow with a non-zero blur radius remains in the served
stylesheet") was therefore **unpassable by a correct fix**. Verified against the
replacement AC1–AC4 (PM comment, 2026-07-30 06:25 CEST).

## The vacuous-green trap this evidence avoids
`--shadow-xl`'s value `0 12px 28px -10px rgba(20,19,19,.28)` was ALREADY in the served CSS
before this fix, as the token *declaration*. So `grep '0 12px 28px -10px'` returns a HIT
even when the fix is NOT deployed — it measures the definition, not the consumption.
A sound check needs BOTH halves; the **disappearance of the old value** is what proves the
bytes moved.

## Results — measured on the SERVED bundle, never the CI run badge (pw-v6k = permanent false red)

| AC | Check | Result |
|----|-------|--------|
| AC1 | `origin/main:src/index.css` .hover-lift:hover consumes the token | PASS — `box-shadow: var(--shadow-xl)` |
| AC2 | zero raw non-token box-shadow in `origin/main -- src/` | PASS — sweep empty on the LANDED tree |
| AC3a | served CSS hash CHANGED | PASS — `index-DxlA_oPS.css` → `index-DXnOyrAf.css` |
| AC3b | old hand-picked value gone | PASS — `0 8px 25px -8px` count 1 → **0** |
| AC3c | rule as served | PASS — `.hover-lift:hover{transform:translateY(-2px);box-shadow:var(--shadow-xl)}` |
| AC4 | no visual regression to HOME v3 hero / photo-frame / stat band | PASS — screenshots below |

AC2 reproduction (run against origin/main, NOT a local checkout):

    git grep -n 'box-shadow' origin/main -- src/ \
      | grep -v 'var(--shadow' \
      | grep -vE 'box-shadow:\s*(none|0 0 0)' \
      | grep -v 'box-shadow 0\.'

## Artefacts
- `served-index-DXnOyrAf.css` — the served stylesheet the AC3 assertions were made against.
- `home-desktop-fold.png`, `home-desktop-full.png` (1440px), `home-mobile-full.png` (390px).
  Hero, orange photo-frame (border + star/sparkle decor), stat band (450+/700+) and the
  orange `funds.` accentWord all render cleanly; mobile reflow intact. No regression vs the
  pw-oql baseline.

QA verdict PASS (2026-07-30 04:50Z). PM corroborated every AC independently — re-fetched the
served CSS, re-ran both grep halves, and LOOKED at the screenshots — before closing.
