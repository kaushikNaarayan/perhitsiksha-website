# B7 duotone icon set + brand sprite replacements (pe-zo0 / pw-3zy)

DS canon: duotone, orange `#FF7300` (primary linework, full opacity) over blue
`#0061EF` (secondary fill shape, 35% opacity) on warm-white `#F9F4F2`. No yellow,
no off-palette hues. Base shapes are Phosphor Icons "duotone" weight (MIT
licensed, thick-stroke by design — matches the "thick-stroke duotone" AC),
downloaded and recolored to brand tokens rather than hand-drawn.

## Icons — `src/assets/images/icons/duotone/` (replaces lucide-react on Home.tsx)

| File                  | Replaces (lucide-react) | Used for                | Call site                                               |
| --------------------- | ----------------------- | ----------------------- | ------------------------------------------------------- |
| `financial-aid.svg`   | `HeartHandshake`        | `financialAid` pillar   | `Home.tsx` solution pillars, `id: 'financialAid'`       |
| `mentorship.svg`      | `Users`                 | `mentorship` pillar     | `Home.tsx`, `id: 'mentorship'`, was `tint: 'blue'`      |
| `career-guidance.svg` | `Briefcase`             | `careerGuidance` pillar | `Home.tsx`, `id: 'careerGuidance'`, was `tint: 'green'` |

Note: the current lucide call site tints these icons via a `tint` prop
(`orange`/`blue`/`green` — see `Home.tsx` line ~96-99). These new SVGs are
already duotone orange+blue internally, so the wiring polecat should drop the
per-icon `tint` prop pass-through for these three and render the SVG's own
fill colors directly (an `<img>`/inline-SVG swap, not a recolorable icon
component). The existing `tint: 'green'` on `careerGuidance` was itself
off-canon (no green in DS palette) — this replacement resolves that too.

Only `HeartHandshake`/`Users`/`Briefcase` are the icons actually imported on
Home.tsx (verified via `grep lucide-react src/pages/Home.tsx` against
origin/main). If other pages still import lucide-react elsewhere, that's a
separate follow-up — not scoped here.

## Sprites — `src/assets/images/sprites/brand/` (resolves pw-3zy)

| File                       | Replaces                              | Palette                                             |
| -------------------------- | ------------------------------------- | --------------------------------------------------- |
| `sprite-sparkle-brand.svg` | `01-sprite-sparkle.png` (yellow)      | orange `#FF7300` linework / blue `#0061EF` 35% fill |
| `sprite-star-brand.svg`    | `02-sprite-smiling-star.png` (yellow) | orange `#FF7300` linework / blue `#0061EF` 35% fill |

`03-sprite-burst.png` is already on-palette (orange) — keep as-is, no
replacement needed. `13-sprite-grad-cap.png` (blue-dominant, yellow tassel) is
acceptable as-is per the earlier canon-review; not replaced here.

**Site-wide fix, not piecemeal:** both `Home.tsx`'s `HomeHeroSprites` (added in
PR#31/pw-c1g) and `About.tsx`'s `AboutHeroSprites` (live via pw-vma) import the
same three PNG filenames (`01-sprite-sparkle`, `02-sprite-smiling-star`,
`03-sprite-burst`). Swap the sparkle/star imports on BOTH components to these
two new SVGs (keep burst on both). That closes pw-3zy on Home and the same
latent issue on About in one pass.

## What's NOT included

- No new component code / wiring — SVGs + mapping only, per instruction. A
  polecat should do the import swap and any `<img>` vs inline-SVG plumbing.
- No screenshot/visual-gate proof yet — that's owed once wired live (Home +
  About, EN/HI/dark/mobile), per the standing quality gate. A static
  `preview.html` (warm-white background, both icons+sprites rendered) is in
  the design session's scratchpad for a quick visual sanity check before
  wiring, not a substitute for the live gate.
- `tint: 'green'` cleanup on `careerGuidance` is a byproduct of this swap, not
  independently verified elsewhere in the codebase — flag if lucide + `tint`
  green appears on other pages.
