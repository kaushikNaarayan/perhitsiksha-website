# pe-vax — designer A4 re-audit, 2026-07-30 08:26 CEST

Epic: pe-vax — Website DS conformance. Exit gate (PM comment 2026-07-28): closes when
all 7 divergence lines hold on the LIVE served site. This re-audit re-checks all 7,
plus the `accentWord` binding gotcha specifically, against the currently-served bundle.

Served bundle at audit time: `index-DXnOyrAf.css` / `index-BCbBe5sU.js`
(`DXnOyrAf` matches pw-m7w's post-fix hash — confirms the shadow-token deploy is live,
not just landed on main).

## Divergence lines (byte-level checks on the served CSS/JS, not source)

| # | Divergence | Result | Evidence |
|---|------------|--------|----------|
| 1 | blue `#0068B3` → `#0061EF` | **PASS** | `0068b3`: 0 hits; `0061ef`: 7 hits |
| 2 | Inter → Anek Latin+Devanagari | **PASS** | only non-mono/non-inherit `font-family` is `Anek Latin,Anek Devanagari,system-ui,...` |
| 3 | cool Material greys → warm ramp | **PASS** | Material greys (`f8f9fa/202124/3c4043/5f6368/dadce0`): 0 hits each; warm ramp (`F9F4F2/E2DED9/A8A5A0/63605D/44423F/2D2C2B`): all present |
| 4 | soft shadows → canon shadow tokens | **PASS** | only `box-shadow` values left are `var(--shadow-xl)`, Tailwind ring/none plumbing, and prose-kbd; no hand-picked shadow. Canon correction from pw-m7w applies: `--shadow-xl` carrying blur is BY DESIGN, not a violation — see pw-m7w VERDICT.md |
| 5 | warm-white `#F9F4F2` ground | **PASS** | 1 hit |
| 6 | orange `#FF7300` signature | **PASS** | 7 hits |
| 7 | Devanagari / EN-HI | **PASS** | `Anek Devanagari` loaded; `document.documentElement.lang=` assignment present in bundle (pw-ary runtime fix); HI hero/about strings render in Devanagari |

## `accentWord` binding gotcha (flagged separately — this is the thing that silently
## vanishes the orange signature with no error if it breaks)

Checked every `accentWord:` literal pairing in the served JS against its `title:`:

| Locale | title | accentWord | verbatim substring? |
|--------|-------|------------|----------------------|
| EN hero | "No student should drop out because of a lack of funds." | "funds." | **PASS** |
| EN about | "Transforming Lives Through Education" | "Education" | **PASS** |
| HI hero | "कोई भी छात्र धन की कमी से पढ़ाई न छोड़े।" | "धन की कमी" | **PASS** |
| HI about | "शिक्षा के ज़रिए जीवन बदलना" | "शिक्षा" | **PASS** |

All 4 pairings bind correctly — the orange signature word renders in both locales on
both sections currently shipping this component (Hero, About intro). No silent-vanish
case found on the live site today.

## Verdict

**DESIGNER A4 PASS — all 7 canon divergence lines hold on the live served bundle,
plus the accentWord binding is intact in both locales.** This corroborates the earlier
07-26 15:00 A4 PASS and additionally confirms the two items that were still open at
that time (line 4 shadows via pw-m7w, line 7 lang-attribute via pw-ary) now also hold
post-deploy.

**Not in scope of this sign-off** (separate open children, not part of the 7-line
acceptance test): pw-7s9 (component-level stray Tailwind hues off the token layer —
these don't show up in a token-value grep) and pw-4tc (audit of which pe-5mo phases
reached main). Recommend PM close pe-vax on this A4 PASS and track pw-7s9/pw-4tc as
independent P2 follow-ups.

## Reproduction

    curl -s https://www.perhitsiksha.org/ | grep -oE '(src|href)="[^"]*\.(js|css)"'
    curl -s https://www.perhitsiksha.org/assets/index-<hash>.css -o served.css
    curl -s https://www.perhitsiksha.org/assets/index-<hash>.js  -o served.js
    grep -oE 'font-family:[^;}]+' served.css | sort -u
    grep -o '0068b3\|0061ef\|ff7300\|f9f4f2' -i served.css | sort | uniq -c
    grep -oE '.{80}accentWord.{200}' served.js
