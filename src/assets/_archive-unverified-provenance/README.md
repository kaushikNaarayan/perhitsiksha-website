# Archive: unverified provenance

Files here are **quarantined, not deleted**. They are kept in the repository on
purpose — a licensing question is open on each, and preservation matters while
that is true.

## Rules

1. **Do not import or reference anything in this folder** from `src/`. Nothing
   here is cleared for publication.
2. **Do not delete anything in this folder.** If you believe a file should go,
   raise it rather than removing it.
3. To take a file _out_ of here, you need positive provenance — a licence, an
   invoice, a release, or a named person who can say where it came from.
   "We could not find evidence against it" is not clearance.

## Why this folder exists

Perhitsiksha is an NGO and much of its imagery is of identifiable minors. Two
separate rules apply and they are easy to confuse:

- **IP / ownership** — whether we have the right to publish the image at all.
- **Safeguarding consent** — whether _these particular_ children may be shown.

An ownership ruling does not grant consent, and consent does not grant ownership.
Neither one alone clears a file.

## Contents

### `stories-hero-bg.jpg`

Wide-angle photograph of roughly twenty uniformed schoolboys crowded around the
camera. 5013x3342, JPEG. Tracked as `pw-uvr`.

Suspected unlicensed stock. It has **never been published** — nothing referenced
it, it was absent from the production bundle, and it 404'd at every public path.
Vite only emits assets that something imports, so it never reached production.
Archiving it changes zero live surfaces.

It was moved here because it was sitting in `src/assets/images/` with an inviting
name while the About and Testimonials rebuilds (`pw-vma`, `pw-bsh`) were about to
be built and both want hero imagery. The risk was never exposure — it was that
someone would wire it in.

Evidence considered:

- Its dimensions are an uncropped full-resolution 3:2 original. The site's three
  real heroes are all PNG at exactly 1992x900, the site's hero crop. This file
  never went through the site's art direction.
- The uniform matches no Perhitsiksha school observed so far.
- MD5 against the 18-file `_archive-unlicensed` seed set: no match. This is a
  **weak negative** and does not clear it — that set is 2048x2048 PNG social
  tiles, a different corpus and pipeline, so a byte match was never likely.
- **JPEG segment scan: no EXIF, no XMP, no IPTC.** Only JFIF plus a generic sRGB
  ICC profile. Every segment that could name a camera, author, or rights holder
  is absent, and the file is progressive-encoded. A camera original would carry
  EXIF; a photographer delivering to a client normally retains IPTC credit. This
  does not prove the file is stock, but it does rule out "an original shot for
  us" and means **the artifact itself carries no evidence of provenance**.

That last point is why it is archived rather than left pending. Provenance cannot
be established from the file, so it can only come from outside it — a reverse
image search, or someone who knows where it came from. Until that exists, it is
treated as unlicensed.
