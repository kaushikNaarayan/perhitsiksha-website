# `pw-037i` — viewport-safe mobile navigation

Implementation brief for the Perhitsiksha public website. This is a design/interaction decision, not product code and not a local design-system fork.

Audited against `origin/main` commit `4d455c2d8f8e7ee69e019bf57496bca20b3de806` and live production asset `index-BErRAnjT.js` on 2026-09-29.

## Decision

Render the existing mobile navigation dialog through a React portal attached directly to `document.body`. Keep the sticky, backdrop-filtered header exactly where it is; move only the open dialog's rendered DOM out of that header's containing block.

This is an architectural placement correction, not a visual redesign:

- reuse the current menu markup, `useFocusTrap`, route/anchor data, `ThemeToggle`, `LanguageToggle`, `VisitorCounter`, and donation action;
- keep Anek for English and Hindi, with non-negative Hindi tracking;
- keep `#F9F4F2` / `--surface-page` as the light dialog ground;
- keep `#0061EF` / `--brand-primary` for active navigation, CTA, hover, and focus;
- keep `#FF7300` / `--brand-signature` confined to the logo or already-approved illustration detail—do not introduce orange controls or menu text;
- do not add, alter, or infer any `accentWord` here. The header has no hero signature binding; all existing per-route `accentWord` values remain verbatim substrings of their localized titles.

No new token or parallel navigation component is needed.

## Proven root cause

`Header.tsx` currently nests `.mobile-menu-panel` inside the sticky `<header>`. The header has `backdrop-blur-md`, which computes to `backdrop-filter: blur(12px)`. A backdrop filter establishes a containing block for fixed-position descendants. Consequently, `.mobile-menu-panel { position: fixed; inset: 0 }` resolves against the 64px header rather than the viewport.

Live evidence in [`live-before/geometry.json`](./live-before/geometry.json):

| viewport | locale/theme | panel rectangle          | header rectangle         | hit at (100,300) |
| -------- | ------------ | ------------------------ | ------------------------ | ---------------- |
| 320×844  | EN/light     | `x=0 y=41.59 w=320 h=64` | `x=0 y=41.59 w=320 h=65` | underlying page  |
| 360×844  | EN/light     | `x=0 y=41.59 w=360 h=64` | `x=0 y=41.59 w=360 h=65` | underlying page  |
| 390×844  | EN/light     | `x=0 y=41.59 w=390 h=64` | `x=0 y=41.59 w=390 h=65` | underlying page  |
| 390×844  | HI/light     | `x=0 y=44.80 w=390 h=64` | `x=0 y=44.80 w=390 h=65` | underlying page  |
| 390×844  | HI/dark      | `x=0 y=44.80 w=390 h=64` | `x=0 y=44.80 w=390 h=65` | underlying page  |
| 412×844  | EN/light     | `x=0 y=41.59 w=412 h=64` | `x=0 y=41.59 w=412 h=65` | underlying page  |

The body is locked (`overflow:hidden`) and focus moves to Close, so the DOM modal mechanics activate while almost all dialog content is visually clipped. Raising `z-index` cannot repair a wrong containing block. Removing the header blur would repair the symptom but regress the sticky-header treatment. The portal is the narrow fix.

At 1280×800, the mobile trigger is correctly absent and desktop navigation is visible. That responsive branch must remain unchanged.

## Binding implementation contract

### 1. Portal placement

In the existing shared `Header` implementation, portal only the `isMenuOpen` dialog subtree to `document.body` using `createPortal`. The trigger stays in the sticky header. `aria-controls="mobile-menu-panel"` remains valid across the portal.

Do not place the dialog under any ancestor with `transform`, `filter`, `backdrop-filter`, `perspective`, `contain`, or a similar fixed-position containing-block trigger. Do not remove header blur or sticky positioning.

The portalized root retains:

- `id="mobile-menu-panel"`;
- `role="dialog"`;
- `aria-modal="true"`;
- the localized accessible label;
- `ref={panelRef}` from the existing `useFocusTrap`.

### 2. Viewport geometry and scrolling

The dialog root is the viewport-covering surface:

```css
position: fixed;
inset: 0;
z-index: var(--z-modal);
width: 100%;
min-height: 100dvh;
overflow-y: auto;
overscroll-behavior: contain;
background: var(--surface-page);
```

Do not use `100vw`; `width:100%` plus `inset:0` avoids scrollbar-width overflow. The internal content keeps the current 24px spacing and adds safe-area protection:

```css
padding-block-start: max(1.5rem, env(safe-area-inset-top));
padding-block-end: max(1.5rem, env(safe-area-inset-bottom));
padding-inline: max(1.5rem, env(safe-area-inset-left));
```

At 320, 360, 390, and 412px widths, the required open rectangle is `x=0`, `y=0`, `width=window.innerWidth`, `height=window.innerHeight`, each within 1px. If content exceeds a short viewport, the dialog itself scrolls; the page behind it does not.

No translucent backdrop is needed because this is a fully opaque, full-screen navigation surface. If the existing unused backdrop class is activated later, it must live in the same body portal below the panel and must not create a second visual surface for this bead.

### 3. Responsive branch

- Below 1024px: show the hamburger; an open dialog covers the visual viewport.
- At 1024px and above: show the current desktop navigation, theme/language controls, and blue CTA; no mobile dialog or hamburger is rendered.
- If the viewport crosses from mobile to `min-width:1024px` while the dialog is open, close it, remove modal isolation, restore the original scroll position/style, and leave the desktop header usable. Do not leave `body` locked merely because `lg:hidden` hid the panel.

At 1280×800 acceptance is therefore the desktop state—not a forced mobile dialog: mobile trigger absent, dialog absent, desktop navigation visible, body scroll restored.

### 4. Information hierarchy

Preserve the current route-specific menu content:

- Home: Impact, Stories, Contribute anchors.
- Other routes: Home, Testimonials, About routes.
- Then existing theme and language controls, the blue Contribute CTA, social links, and Visitor Counter.

The top row remains brand at left and Close at right. Keep the close glyph and other icons at their current visual sizes. The panel uses one warm-white/dark page surface, warm ink hierarchy, blue active/focus/CTA states, and no orange functional state.

English and Hindi labels may wrap naturally without clipping. All text inherits the shared Anek stack. Hindi keeps `letter-spacing >= 0` and the existing script-routed leading.

### 5. Modal and focus behavior

Reuse and preserve the existing `useFocusTrap` behavior:

1. Opening remembers the hamburger trigger and focuses the Close button.
2. Tab and Shift+Tab remain inside the dialog and wrap at the ends.
3. Escape and Close dismiss the dialog.
4. Dismissal restores focus to the hamburger when that trigger still exists.
5. Route/anchor activation closes the dialog; the destination action still occurs once.
6. The menu CTA closes the menu and opens the Donation Drawer exactly once. Focus must land in the drawer, not bounce back to the now-hidden hamburger, and page scroll must remain locked during the modal-to-modal handoff.

While open, background application content must not receive pointer or keyboard interaction. Because the dialog is portaled outside `#root`, implementation may temporarily make `#root` inert and hidden from the accessibility tree, provided it snapshots and restores the exact previous attributes before focus restoration. The dialog itself must never be placed inside the inert subtree.

### 6. Scroll-lock ownership

Keep the current page position stable across open/close. Snapshot the pre-open body/root inline styles and scroll position; restore those exact values rather than blindly assigning `overflow: unset`. Opening the menu must not jump to the top. Closing, route selection, Escape, resize-to-desktop, and transition to the Donation Drawer must each release or transfer the lock once.

This bead does not authorize a broad overlay-system refactor. A small shared lock helper is acceptable only if required to prevent the existing menu and Donation Drawer from unlocking each other during handoff.

### 7. Motion and theme

- Keep the existing link stagger only under `prefers-reduced-motion: no-preference`.
- Under reduced motion, the complete dialog appears immediately; no translated off-screen intermediate frame may receive focus.
- Explicit light, explicit dark, and OS-dark-without-explicit-choice all use semantic tokens and remain legible.
- Do not add raw light-only colors. Existing dark utility bridges remain authoritative.

## Frontend verification matrix

### Automated geometry and behavior

Run EN and HI in explicit light and explicit dark modes at 320×844, 360×844, 390×844, and 412×844. For every open mobile case assert:

- dialog rectangle matches the viewport within 1px;
- `elementFromPoint` at center and near the bottom belongs to the dialog;
- `document.body` does not scroll and the saved page position is restored on close;
- no document horizontal overflow;
- Close receives initial focus, Tab/Shift+Tab wrap, Escape closes, and focus returns;
- every nav, language/theme, CTA, social, and visitor-control element is visible or reachable by dialog scrolling;
- computed body and control font families contain Anek; Hindi tracking is non-negative;
- warm surface/ink and blue functional states resolve from semantic roles, with no orange button/link/focus state;
- axe completes with no modal, focus, name, contrast, or `aria-hidden-focus` violation.

Add a resize test: open at 390px, resize to 1280px, then assert dialog absent, desktop navigation visible, body unlocked, and background controls usable.

Add a Donation Drawer handoff test: open menu → activate Contribute → assert one drawer, one active focus trap, drawer-first focus, and continuous background scroll lock.

### Geometric review artifacts

Capture viewport crops—not element-only screenshots—after the open state settles:

- EN and HI at 390×844 in light and dark;
- EN and HI at 320×844 to prove the narrow edge;
- EN and HI at 1280×800 to prove the desktop branch is unchanged.

Save the implementation gallery and computed rectangles under `review-artifacts/<implementation-bead>/`. The open mobile screenshot must show the complete top row, navigation, controls/CTA, and the first lower-content cue; scrolling screenshots may prove the remaining social/counter content.

Run reduced-motion, keyboard/focus, responsive overflow, lint, typecheck, production build, existing tests, and the project's honest Playwright/axe gate.

### Live close gate

Do not call this done at PR, merge, bundle, or deployment. QA must open the real production URL and attach live EN/HI mobile screenshots plus computed dialog rectangles and a completed live axe result. At 390×844, a hit test at `(100,300)` must be inside `#mobile-menu-panel`; the underlying Home hero must not win.

## Evidence index

- [`live-before/geometry.json`](./live-before/geometry.json) — computed live rectangles, hit tests, focus, and scroll state.
- `live-before/en-light-{320,360,390,412}x844.png` — live clipped state across mobile widths.
- `live-before/hi-light-390x844.png` and `hi-dark-390x844.png` — locale/theme reproduction.
- `live-before/en-light-1280x800.png` — unaffected desktop branch.
- [`target-geometry.svg`](./target-geometry.svg) — intended portal geometry and responsive behavior.
- [`CONTRAST-AMENDMENT.md`](./CONTRAST-AMENDMENT.md) — binding VisitorCounter
  opacity/contrast contract for the portalled mobile menu.
- [`contrast-measurements.json`](./contrast-measurements.json) — audited token
  pairs, temporal failure samples, and passing target ratios.
