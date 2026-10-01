# `pw-037i` — VisitorCounter contrast amendment

Design amendment for the portalled mobile navigation at frontend baseline
`36e89e5f7e2024b08e6035c668afe5ef20846704`. This supplements the viewport-safe
navigation contract in [`README.md`](./README.md); it does not replace that contract.

This is a website application decision using the shared Perhitsiksha design system.
It adds no token and makes no cross-rig design-system change.

## Finding

The `VisitorCounter` already resolves to the correct canonical muted-ink colors at
rest:

| state                       |               foreground |                   background | WCAG contrast |
| --------------------------- | -----------------------: | ---------------------------: | ------------: |
| explicit light              | `--ink-body` = `#63605D` | `--surface-page` = `#F9F4F2` |   **5.726:1** |
| explicit dark               | `--ink-body` = `#BDB7B4` | `--surface-page` = `#141314` |   **9.352:1** |
| OS dark, no explicit choice |     same dark token pair |         same dark token pair |   **9.352:1** |

Both settled pairs clear the 4.5:1 WCAG AA threshold for the counter's 12px normal
text. A darker raw color or a new token is not justified.

The failing state is temporal. `Header.tsx` places the social/counter wrapper in the
`.mobile-nav-item` stagger, and GSAP animates that ancestor from `opacity: 0` to `1`.
The counter therefore composites through the page surface even though its own computed
color is correct. The fast axe arm observed effective contrast of **1.76:1 in light**
and **2.00:1 in dark** before the last staggered item settled. Browser sampling also
confirmed the wrapper moving through partial opacity while the child retained the
right token. Scan timing can make this appear or disappear; that race is the bug.

## Binding design decision

Keep `VisitorCounter` on the existing semantic `--ink-body` foreground over the
mobile panel's existing `--surface-page` ground, and keep the counter fully opaque for
every rendered frame.

- The mobile social/counter support row may retain the current 30px upward reveal and
  `power3.out` timing, but **must not tween opacity**. Its opacity and every ancestor's
  opacity through `#mobile-menu-panel` remain `1` whenever the row is rendered.
- Prefer a narrow motion-target split: mark the support row separately, exclude it from
  the opacity-stagger selector, and apply transform-only motion to it. Do not add a
  general CSS `!important` opacity override.
- Keep the navigation-link and CTA reveal unchanged unless testing proves their own
  normal text drops below 4.5:1. This amendment does not authorize a broad motion
  redesign.
- Keep the shared `VisitorCounter` component's visual role and typography unchanged:
  Anek, `text-xs`/12px, medium count label, current icon size, spacing, and alignment.
  It may bind directly to `color: var(--ink-body)` or retain an existing utility only
  if computed output is exactly the token value in every theme.
- Do not use `--ink-soft` or `--brand-ink` merely to mask animation transparency.
  Although those tokens have higher settled contrast, they would raise the counter's
  hierarchy and still cannot guarantee contrast as opacity approaches zero.
- Do not use orange. `#FF7300` remains the signature accent, not metadata text. Keep
  `#0061EF`/`--brand-link` for existing functional hover/focus states. There is no
  `accentWord` binding in this surface and none may be introduced.

## Narrow frontend contract

1. In the existing `Header` mobile-menu subtree, separate the social/counter support
   row from the opacity-stagger targets. Reuse the existing row and `VisitorCounter`;
   do not create another counter or navigation component.
2. Preserve the current layout: social icons, 16px top separation before the centered
   counter, border, spacing, scrollability, and EN/HI wrapping.
3. Preserve the portal, focus trap, Escape/return-focus behavior, scroll-lock and
   Donation Drawer handoff from the parent specification.
4. Preserve desktop behavior. The header's `hidden sm:flex` counter remains visually
   and behaviorally unchanged; the amendment applies to the mobile-menu reveal target.
5. Under `prefers-reduced-motion: reduce`, keep the existing immediate settled state:
   opacity `1`, transform `none`.
6. Make no token-file, locale, title, or `accentWord` changes.

## Verification contract

Run against the exact amended PR head in EN and HI at 390x844, explicit light and
explicit dark, plus OS-dark with no explicit theme choice.

### Positive arms

- Immediately after opening, then on every animation frame or at intervals no wider
  than 50ms through 700ms, assert:
  - counter foreground equals the applicable `--ink-body` computed value;
  - panel background equals the applicable `--surface-page` computed value;
  - the counter and all ancestors through `#mobile-menu-panel` have computed opacity
    `1`;
  - calculated contrast remains at least 4.5:1.
- Run axe once immediately after the dialog becomes visible and again after all GSAP
  motion settles. Neither scan may report `color-contrast` for the counter.
- Assert the support row still has the approved transform-only reveal under
  no-preference motion; do not accept a test that silently removes all motion.
- Under reduced motion, assert `opacity: 1`, `transform: none`, and both contrast pairs.
- Re-run the existing portal geometry, hit-test, focus, resize, Donation Drawer,
  overflow, EN/HI, theme, build and lint checks unchanged.

### Required negative control

In a test-only page mutation, freeze the mobile support row at partial opacity (for
example `opacity: 0.35`) while leaving the canonical foreground/background tokens in
place. The temporal contrast assertion or axe arm must fail. Remove the mutation and
prove the positive arm passes. This demonstrates the gate detects composited contrast,
not only nominal child colors.

### Evidence and close gate

Record computed colors, ancestor opacities and ratios for immediate and settled states
in the implementation evidence under `review-artifacts/pw-037i/`. Static screenshots
alone cannot prove this temporal fix. QA still owns the post-deploy live close gate and
must verify the real production dialog; this amendment is a spec handoff, not a claim
that the user-facing blocker is fixed.
