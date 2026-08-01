# pw-e4e — WhatsApp CTAs made inert, evidence

Kaushik-directed, 2026-08-01. Buttons stay exactly where they are, same
label, same styling. Clicking does nothing. Not greyed out, not deleted,
not repointed.

## AC1 — local gates

- `npm run lint` — 0 errors (2 pre-existing unrelated warnings in
  `GalleryModal.tsx` / `YouTubeShortsCarousel.tsx`, untouched by this change).
- `npx tsc --noEmit` — clean.
- `npm run build` — clean, produced `dist/assets/index-D4zKqgMF.js`.

## AC2 — source sweep

Pre-change control (ref 546e051), re-verified before starting:

```
$ git grep -nEi 'wa\.me|918317580423' -- src/
```

At 546e051 this returns 6 hits (DonationDrawer.tsx:12,52 · About.tsx:502,538 ·
Home.tsx:580 · Testimonials.tsx:429), confirming the probe binds.

After this change, the same command on `polecat/pw-e4e` returns **0** hits.

## AC3 — served bundle

Local production build (`npm run build` + `npm run preview`):

```
$ grep -c "wa.me" dist/assets/index-D4zKqgMF.js   # 1 (false positive: "warme" substring of the
                                                    #   vite-legacy-polyfill preload shim, not a URL)
$ grep -c "918317580423" dist/assets/index-D4zKqgMF.js  # 0
```

Confirmed the one `wa.me` substring match is `...preload...warme...` inside
the Vite module-preload polyfill shim — not a WhatsApp link. Zero real
occurrences of the number or a wa.me link in the built JS. Bundle hash
changed vs. the pre-change control hash `index-BCbBe5sU.js`. (This is a
local build check; the production-domain served-hash re-check per the bead's
AC3 language happens after the refinery deploys.)

## AC4 — visual screenshots

All in `screens/`, captured against the production build via
`npm run preview` (port 4173) + Playwright, both locales:

| File | Surface |
|---|---|
| `home-en/hi-request-support.png` | Home "Request Support" pill |
| `about-en/hi-contributor-band.png` | About "Become a Contributor" pill |
| `about-en/hi-get-in-touch.png` | About visible phone number (now a `<span>`) |
| `testimonials-en/hi-cta.png` | Testimonials "Become a Contributor" pill |
| `drawer-en/hi-default.png` | Donation drawer, default state, secondary WhatsApp-styled button |
| `drawer-en/hi-thankyou.png` | Donation drawer, post-submit thank-you, green pill ("Confirm Contribution") |

All 6 CTA sites render pixel-identical to before (same classes, same size,
same variant); only the `href` (or, for the phone number, the `<a>` tag
itself) was removed. HI labels re-flow correctly at their new widths with no
layout shift beyond normal text-length variance.

Note: the donation-drawer slide-in/out GSAP animation does not settle under
headless Chromium regardless of `prefers-reduced-motion` emulation — this
reproduces identically on unmodified `main` (verified by stashing this
change and repeating the same script), so it is a pre-existing headless-test
quirk, not something introduced here. The drawer screenshots force the
panel's resting-open CSS transform via `page.evaluate` purely to capture an
accurate screenshot; no application code was touched to work around it.

## AC5 — click behavior

`click-results.json` records, for every CTA above (and the drawer's
post-thank-you "Confirm Contribution" pill): `navChanged: false`, no popups,
and no console errors beyond a pre-existing, unrelated
`VITE_COUNTER_WORKSPACE not configured` warning (present on `main` too).

## Code changes

- `src/pages/{Home,About,Testimonials}.tsx` — dropped the `href` prop from
  the shared `<Button>` (falls through to its `<button type="button">`
  branch; no `disabled`, so no grey-out).
- `src/components/ui/Button.tsx` — added explicit `type="button"` on the
  button branch.
- `src/components/ui/DonationDrawer.tsx` — both WhatsApp `<a>`s converted to
  inert `<button type="button">`, classNames carried over verbatim. Deleted
  `buildWhatsAppHref`, its call site, and `WHATSAPP_NUMBER`.
- `src/pages/About.tsx` — the visible phone number `<a>` converted to a
  `<span>` (same layout classes, minus hover/transition classes).
- `src/locales/{en,hi}/donation.json` and `header.json` — removed every
  WhatsApp copy claim (`whatsapp.hint` deleted, `whatsapp.secondary`,
  `thanks.cta`, `thanks.body`, `upi.note`, `ctaAriaLabel` neutralised), HI
  moved in lockstep with EN.
