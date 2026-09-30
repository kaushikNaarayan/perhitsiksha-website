# pw-y0u implementation evidence

Local implementation evidence for the B4-D1/B4-D3 handoff. This is not a
production verification: PM owns merge/deploy and QA must repeat the canonical
matrix against the newly served bundle.

## Browser checks (2026-09-30)

- Fine desktop pointer (1280): the decorative `Play` cursor becomes visible
  over the media button; see `desktop-fine-pointer.png`.
- Coarse/touch pointer (390): `(hover: hover)` and `(pointer: fine)` are both
  false, native `pointer` remains, and the decorative cursor stays hidden; see
  `mobile-coarse-pointer.png`.
- Reduced motion: `prefers-reduced-motion: reduce` leaves the native pointer
  in place and the decorative cursor hidden.
- Keyboard: the first logical button has the accessible name
  `Play Video — Sunil Shetty`; Enter opens the existing `VideoModal`.
- Loop clones: 17 logical media buttons and 17 `aria-hidden` clone buttons
  with `tabindex=-1` were observed.
- Axe 4.13.0, scoped to `.play-cursor-target`, WCAG 2 A/AA: **0 violations**
  (10 passing checks).

## Build checks

- `npm run build`: passes (`tsc -b` + Vite production build).
- `npx prettier --check` on edited files: passes.
- `git diff --check`: passes.

`npm run lint` exits zero with two pre-existing hook-dependency warnings:
`GalleryModal.tsx` and the carousel's existing global mouse-up effect.
