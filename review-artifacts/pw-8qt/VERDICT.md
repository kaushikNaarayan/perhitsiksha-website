# pw-8qt — designer live VISUAL verification, 2026-08-11 18:14 CEST

Assigned by PM (pw-8qt comment 2026-08-11 16:03): string checks against the served
bundle cannot prove the drawer actually opens. AC10 first — if it fails, stop and
report, nothing else matters. It failed. Everything below is that evidence.

Served bundle at test time: `index-B9Nfqa51.js` / `index-BOWfV98N.css`
(matches the hash the PM's 2026-08-11 11:27 comment already confirmed as the live
post-merge deploy — this session did not need to re-verify the hash).

Tooling: Playwright (Python) driving headless Chromium against
`https://www.perhitsiksha.org/` directly — a real browser, not curl/string checks.

## AC10 — FAIL (the real risk the PM flagged; confirmed)

Clicking the header "Contribute now" button (the global trigger):
- The backdrop DOES fade in correctly (`opacity: 0 -> 1`, confirmed via
  `getComputedStyle` AND by sampling rendered pixel colour before/after —
  a hero-section pixel goes from `rgb(249,244,242)` to `rgb(100,98,97)`, which is
  exactly `(1-0.6)*orig` — the 60%-black overlay math checks out. The dimming is
  real but visually subtle at a glance; do not trust a screenshot thumbnail alone,
  sample pixels.)
- The **panel never slides into view**. `getComputedStyle(panel).transform` stays
  at `matrix(1, 0, 0, 1, 448, 0)` (desktop, 1280px viewport, 448px-wide panel) —
  i.e. parked exactly at its GSAP `xPercent: 100` START state — indefinitely
  (checked out to 3s+, not a timing race).
- **Reproduces identically via every trigger tested**: header CTA (desktop),
  hero `a[href="#donate"]` anchor, mobile viewport (390px — panel stuck at
  `translateX(390px)`, i.e. still fully off the 390px-wide mobile screen).
- **Reproduces identically in HI locale** (triggered via the `योगदान` header CTA
  after switching `button[lang="hi"]`) — same stuck-transform signature.
- **`prefers-reduced-motion: reduce` does NOT route around it** — that code path
  uses `gsap.set(panel, {opacity:1, xPercent:0})` (immediate, no tween) instead of
  `gsap.fromTo(...)`, and it is ALSO stuck at `translateX(448px)`. This rules out
  "the tween just hasn't finished" and points at `xPercent` itself not applying —
  a GSAP-CSS-property-plugin-level failure, not an animation-timing issue.
- Closing DOES work: clicking anywhere on the (invisible-looking but real)
  backdrop calls `close()` and the panel unmounts correctly (`.donation-panel`
  count goes to 0 after the close tween). The drawer is enterable-but-not-visible,
  not fully wedged.

**Likely cause, not fixed here (root-cause is not my scope, PM said gather not
decide):** the console logs `Invalid property force3D set to true Missing
plugin? gsap.registerPlugin()` on EVERY page load — before the drawer is ever
opened, and unconditionally. This points at a site-wide GSAP CSS-plugin
registration issue, not something the pw-8qt panel rewrite introduced from
scratch — but the *donation panel* is the concrete place it currently produces a
user-visible broken flow (a dimmed page with no visible way to donate).

**User-facing impact:** the primary conversion path — "Contribute now" from any
page — currently dims the page and shows nothing. A real visitor has no
indication the drawer opened at all; the only way out is guessing that clicking
the dimmed area closes it.

Screenshots (drawer "open" state, panel permanently off-canvas):
- `AC10-en-desktop-drawer-open-state.png` (1280x900, 2s after click)
- `AC10-en-mobile-drawer-open-state.png` (390x844, 2s after click)
- `AC10-hi-desktop-drawer-open-state.png` (1280x900, HI locale, 2s after click)

## AC4/5/6/7/8/9 — NOT EXERCISED

Per the PM's explicit instruction ("If this fails, stop and report — nothing else
matters"), these were not driven further once AC10 failed. Note for whoever picks
this up: the panel DOM does exist off-screen (confirmed via locator queries), so
AC4/5/6/7/8 could technically still be checked against the DOM even with AC10
broken — but that would be verifying values a real user can never see, which
doesn't satisfy what those ACs are actually for. Fix AC10 first, then re-run all
of AC4-AC9 for real.

## pw-dhd (Lucide icon swap) spot-check — PASS, independent of the above

Checked Home / About / Testimonials on the live site (full-page screenshots).
All icons render as clean Lucide-style outline glyphs — checkmarks, dots, a
home/graduation-cap mark, social icons in the footer. No missing/box glyphs, no
leftover react-icons/FA artifacts, nothing visually broken by the swap.
- `pw-dhd-spotcheck-about.png`
- `pw-dhd-spotcheck-testimonials.png`

Side observation (NOT scored, not this bead's scope, flagging so it isn't lost):
on `/testimonials`, the "All Testimonials" filtered grid area renders as a large
empty warm-white gap in a full-page screenshot even though "Showing 14
testimonials" is present in the copy above it. This is plausibly a
scroll-triggered reveal animation that doesn't fire under a full-page-screenshot
capture (viewport-resize, not real scroll) rather than a real bug — did not
chase further, out of scope for pw-8qt. Worth a follow-up bead if anyone hits it
live.

## Reproduction

    # Python + Playwright, headless chromium
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch()
        page = b.new_page(viewport={"width": 1280, "height": 900})
        page.goto("https://www.perhitsiksha.org/", wait_until="networkidle")
        page.locator("header button", has_text="Contribute now").first.click()
        page.wait_for_timeout(2000)
        panel = page.locator(".donation-panel")
        print(panel.evaluate("el => getComputedStyle(el).transform"))
        # -> "matrix(1, 0, 0, 1, 448, 0)" — stuck off-canvas, expect "matrix(1, 0, 0, 1, 0, 0)"

## Verdict

**AC10 FAIL — confirmed, reproducible across desktop/mobile/EN/HI/reduced-motion.**
This is the thing blocking pw-8qt (and by extension pw-dhd, pw-q3l) from closing.
pw-dhd's own icon swap is independently fine. Close decision stays with PM per
standing instruction; this bead should NOT close until the panel actually becomes
visible on open.
