# pw-q3l.1 — honest donation drawer, re-landed WITH the visibility fix

Integrates two changesets that each regressed alone:

- pw-2ka / PR#24 (commit `3fe2cef`): honest mailto composer, kills 5
  false-promise sites (fake thank-you screen, inert WhatsApp CTA, discarded
  email/phone fields).
- pw-hgy / PR#26 (`366b14e`): removes the inline
  `style={{ transform: 'translateX(100%) }}` on `.donation-panel` that fought
  the GSAP open animation and kept the panel permanently off-screen.

Both patches shared the same base blob (`4d11833`, current `main` post-revert
state), so pw-2ka's commit was cherry-picked directly onto a fresh branch off
`origin/main`, then pw-hgy's one-line fix was reapplied on top.

## Build

`npm run build` — exits 0, `tsc -b && vite build` clean.

## Source sweep — false-promise strings gone

```
$ git grep -n "team will reach out\|Confirm Contribution" -- src/
none found
```

No `#25D366` (WhatsApp brand color) references remain in
`DonationDrawer.tsx`. Email/phone fields are gone; the two remaining fields
(name, amount) are optional and only prefill the `mailto:` body — they do not
imply any follow-up.

## Visual gate — drawer OPEN, EN/HI × light/dark × desktop/mobile

All 8 combinations, plus one full-panel scroll shot showing the bottom of
the contact card (mailto CTA + direct email fallback):

- `screens/donation-desktop-en-light.png`
- `screens/donation-desktop-en-dark.png`
- `screens/donation-desktop-hi-light.png`
- `screens/donation-desktop-hi-dark.png`
- `screens/donation-mobile-en-light.png`
- `screens/donation-mobile-en-dark.png`
- `screens/donation-mobile-hi-light.png`
- `screens/donation-mobile-hi-dark.png`
- `screens/donation-full-panel.png` — full contact card incl. "Email us to
  contribute" mailto CTA and "Or email us directly at
  clsi.perhitsiksha@gmail.com" fallback

Each confirms:
- (a) the panel is VISIBLE (slides in from the right, fully on-screen) —
  the pw-hgy regression is gone.
- (b) the honest mailto/contact path to clsi.perhitsiksha@gmail.com is shown.
- (c) no "Confirm Contribution" inert WhatsApp button.
- (d) email/phone fields are gone; only optional name/amount remain,
  captioned "Opens your email app. Nothing is sent automatically."
- (e) no "team will reach out" text in either locale.

Captured against a local `npm run preview` build (port 4173) via Playwright,
`localStorage` seeded for locale (`perhit-lang`) and theme (`perhit-theme`).
