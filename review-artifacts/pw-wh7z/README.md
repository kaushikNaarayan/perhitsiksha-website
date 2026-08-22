# pw-wh7z — burst sprite off the "80G tax-exempt" line

Standalone fix against `origin/main @ 37d43d7` (= what production serves).
**One file changed: `src/pages/Home.tsx`.** No composition change is carried —
this is independent of which hero composition wins in pw-3dv2.

## The change

The burst sprite's hardcoded `style={{bottom:'8%',left:'10%'}}` becomes Tailwind
classes with an `lg`-only override:

    bottom-[8%] left-[10%]  lg:bottom-[4%] lg:left-[46%]

The sprite is **repositioned, not deleted** — the burst sprites are pe-3j4 B8
"texture + organic decor". Below `lg` the original placement already measures
clear of the taxNote, so only the `lg` case is overridden.

## Exercised BOTH ways

A check that cannot fail proves nothing, so the discriminator was run against
the unfixed tree first and had to fail:

| run | result | exit |
|---|---|---|
| BEFORE — unfixed `origin/main`, local build | **FAIL 2/6** (1280 EN + HI) | 2 |
| BEFORE — **live** `www.perhitsiksha.org` | **FAIL 2/6** (1280 EN + HI) | 2 |
| AFTER — fixed build | **PASS 0/6** | 0 |

Live production and the local unfixed build produce **identical** numbers
(sprite x `128..184`, taxNote ink x `76.8..248.8` at 1280), so the local build
faithfully reproduces prod and the AFTER result is a valid prediction for it.

At 1280 the sprite moves `x=128..184` → `x=588.8..644.8`; the 80G text inks
`x=76.8..248.8`. At 390 and 768 the sprite box is **byte-identical** before and
after (`39..83` and `76.8..132.8`), confirming the override is `lg`-only and
disturbs nothing on small screens.

## Acceptance

* **AC1** 1280, no sprite over any glyph — PASS, EN and HI.
* **AC2** verified at 390 / 768 / 1280 in **both** locales — the HI string is
  shorter here (`सभी दान 80G कर-मुक्त हैं`, inks to x=188.8 vs EN's 248.8), so
  EN is the binding case; both pass.
* **AC3** screenshots in `after-fixed/` and `before-live-production/`.
* **AC4** decor stays decorative — the sprite is inside the
  `aria-hidden="true"` `pointer-events-none` decor layer (asserted per cell,
  `ariaHidden: true` in every row). No focusable or hit-testable element is
  placed over the text.

## Two method notes

1. **The overlap test must be GLYPH-level** (`Range.getClientRects()` on the
   text node), not the element box. The taxNote `<p>` is a ~543px-wide block
   whose text only inks ~172px, so a bounding-box test reports a **false**
   overlap and fails even a correct fix.
2. **The settle gate is a condition, not a timeout** (pw-h5gz). A 2.6s fixed
   wait still captured a headline broken mid-word with a partially-faded lede.
   `verify-80g.mjs` blocks until SplitText has reverted **and** the lede is at
   full opacity.

`verify-80g.mjs` is committed — re-runnable against any base URL, including
production after deploy:

    BASE=https://www.perhitsiksha.org LABEL=post-deploy node verify-80g.mjs
