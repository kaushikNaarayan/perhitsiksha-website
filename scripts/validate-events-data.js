#!/usr/bin/env node

/**
 * Facebook Events Data Validation Script
 *
 * Validates the facebook-events.json file using Zod schema
 * to ensure all events have the correct structure and required fields.
 *
 * Usage:
 *   npm run validate:events
 */

import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DATA_FILE = path.join(__dirname, '..', 'src', 'data', 'facebook-events.json');
const IMAGE_DIR = path.join(__dirname, '..', 'public', 'fb-events');

// Accepts both full https:// URLs (video permalinks) and local /fb-events/ paths (downloaded images)
const localOrUrl = z
  .string()
  .refine(v => v.startsWith('/fb-events/') || v.startsWith('http'), {
    message: 'Must be a local /fb-events/ path or a full http(s) URL',
  });

// Zod schemas matching the TypeScript interfaces
const MediaItemSchema = z.object({
  type: z.enum(['image', 'video']),
  url: localOrUrl,
  thumbnail: localOrUrl.optional(),
  alt: z.string(),
});

const EventSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  date: z.string().regex(/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/), // e.g., "Jan 26, 2026"

  // Single media fields
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  videoUrl: z.string().url().optional(),

  // Album support fields
  mediaType: z.enum(['image', 'video', 'text', 'album']).optional(),
  thumbnailImage: z.string().optional(),
  thumbnailAlt: z.string().optional(),
  mediaCount: z.number().int().positive().optional(),
  media: z.array(MediaItemSchema).optional(),

  // CTA fields
  ctaText: z.string().min(1),
  ctaLink: z.string().url(),
});

const EventsArraySchema = z.array(EventSchema);

/**
 * Reads and parses the events JSON file
 */
async function readEventsData() {
  try {
    const content = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Events data file not found: ${DATA_FILE}\nRun: npm run fetch:facebook`);
    }
    throw new Error(`Failed to read events data: ${error.message}`);
  }
}

/**
 * Validates event structure using Zod
 */
function validateEventsStructure(events) {
  console.log('Validating events structure...');

  try {
    EventsArraySchema.parse(events);
    console.log(`✓ Structure validation passed for ${events.length} events`);
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Structure validation failed:\n');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    } else {
      console.error('❌ Validation error:', error.message);
    }
    return false;
  }
}

/**
 * Validates event data consistency
 */
async function validateDataConsistency(events) {
  console.log('\nValidating data consistency...');
  let hasErrors = false;

  for (const event of events) {
    const errors = [];

    // Check mediaType consistency
    if (event.mediaType === 'album') {
      if (!event.media || event.media.length === 0) {
        errors.push('Album event must have media array with items');
      }
      if (!event.thumbnailImage) {
        errors.push('Album event must have thumbnailImage');
      }
      if (event.mediaCount !== event.media?.length) {
        errors.push(`mediaCount (${event.mediaCount}) doesn't match media array length (${event.media?.length})`);
      }
    } else if (event.mediaType === 'image') {
      if (!event.image) {
        errors.push('Image event must have image field');
      }
      if (!event.imageAlt) {
        errors.push('Image event should have imageAlt for accessibility');
      }
    } else if (event.mediaType === 'video') {
      if (!event.videoUrl) {
        errors.push('Video event must have videoUrl field');
      }
    }

    // Check all local /fb-events/ paths exist on disk
    const localPaths = [
      event.image,
      event.thumbnailImage,
      ...(event.media?.map(m => m.url).filter(u => u?.startsWith('/fb-events/')) ?? []),
      ...(event.media?.map(m => m.thumbnail).filter(t => t?.startsWith('/fb-events/')) ?? []),
    ].filter(Boolean);

    for (const imgPath of localPaths) {
      const filename = imgPath.replace('/fb-events/', '');
      const fullPath = path.join(IMAGE_DIR, filename);
      try {
        await fs.access(fullPath);
      } catch {
        errors.push(`Image file not found on disk: ${imgPath}`);
      }
    }

    if (errors.length > 0) {
      hasErrors = true;
      console.error(`\n❌ Event "${event.title}" (${event.id}):`);
      errors.forEach((err) => console.error(`  - ${err}`));
    }
  }

  if (!hasErrors) {
    console.log('✓ Data consistency validation passed');
  }

  return !hasErrors;
}

/**
 * Validates URL accessibility (basic format check)
 */
function validateUrls(events) {
  console.log('\nValidating URLs...');
  let hasErrors = false;

  for (const event of events) {
    const errors = [];

    // Check CTA link
    if (!event.ctaLink.startsWith('http')) {
      errors.push(`Invalid CTA link format: ${event.ctaLink}`);
    }

    // Check video URL
    if (event.videoUrl && !event.videoUrl.startsWith('http')) {
      errors.push(`Invalid video URL format: ${event.videoUrl}`);
    }

    // Check media URLs (for albums) — allow local /fb-events/ paths for images, http for videos
    if (event.media) {
      event.media.forEach((item, index) => {
        const isLocal = item.url.startsWith('/fb-events/');
        const isHttp = item.url.startsWith('http');
        if (!isLocal && !isHttp) {
          errors.push(`Invalid media URL at index ${index}: ${item.url}`);
        }
      });
    }

    if (errors.length > 0) {
      hasErrors = true;
      console.error(`\n❌ Event "${event.title}" (${event.id}):`);
      errors.forEach((err) => console.error(`  - ${err}`));
    }
  }

  if (!hasErrors) {
    console.log('✓ URL validation passed');
  }

  return !hasErrors;
}

/**
 * PII DENYLIST — safety gate, do not remove without reading pw-ky2.
 *
 * The Facebook sync (.github/workflows/sync-facebook-events.yml, cron '0 8 * * *')
 * re-imports whatever is on the source Facebook post, every day, with no
 * document-type filtering. On 2026-04-19 it imported two scanned CBSE Class X
 * result documents for named minors — photo, roll number, candidate name, both
 * parents' names, date of birth, school and marks — and wired one as an event
 * thumbnail. They were live on the public site for roughly three months.
 *
 * They were removed by hand. Without this gate the very next scheduled sync
 * would silently restore them, because the source post is unchanged.
 *
 * This deliberately FAILS the validation step, which stops the workflow from
 * committing anything at all — including otherwise-legitimate new events. That
 * is intentional and fail-closed: while the source post still carries a child's
 * identity documents, continuing to auto-ingest from it is worse than pausing
 * the sync. The real fix is removing the images at the Facebook source; this
 * gate is the seatbelt, not the fix.
 */
const BLOCKED_EVENT_IDS = new Set([
  '103024869002738-936085909054447', // CBSE result documents for two named minors
]);

const BLOCKED_IMAGE_FILES = new Set([
  '103024869002738-936085909054447-936093189053719.jpg',
  '103024869002738-936085909054447-936093172387054.jpg',
]);

function validatePiiDenylist(events) {
  console.log('\nChecking PII denylist...');
  const violations = [];

  for (const event of events) {
    if (BLOCKED_EVENT_IDS.has(event.id)) {
      violations.push(`Event "${event.id}" is on the PII denylist and must not be published.`);
    }

    const paths = [
      event.image,
      event.thumbnailImage,
      ...(event.media?.map((m) => m.url) ?? []),
      ...(event.media?.map((m) => m.thumbnail) ?? []),
    ].filter(Boolean);

    for (const p of paths) {
      const filename = String(p).split('/').pop();
      if (BLOCKED_IMAGE_FILES.has(filename)) {
        violations.push(`Event "${event.id}" references denylisted image ${filename}.`);
      }
    }
  }

  if (violations.length > 0) {
    console.error('\n\u274c PII DENYLIST VIOLATION \u2014 refusing to publish.');
    violations.forEach((v) => console.error(`  - ${v}`));
    console.error('\nThese items contain a minor\'s identity documents. The sync has been');
    console.error('stopped on purpose. Remove them at the Facebook source, then update the');
    console.error('denylist in this file. See bead pw-ky2 before changing anything here.');
    return false;
  }

  console.log('\u2713 PII denylist check passed');
  return true;
}

/**
 * Prints validation summary
 */
function printSummary(events) {
  console.log('\n' + '='.repeat(60));
  console.log('Validation Summary');
  console.log('='.repeat(60));

  const stats = {
    total: events.length,
    albums: events.filter((e) => e.mediaType === 'album').length,
    images: events.filter((e) => e.mediaType === 'image').length,
    videos: events.filter((e) => e.mediaType === 'video').length,
    text: events.filter((e) => e.mediaType === 'text').length,
  };

  console.log(`Total events: ${stats.total}`);
  console.log(`  Albums: ${stats.albums}`);
  console.log(`  Images: ${stats.images}`);
  console.log(`  Videos: ${stats.videos}`);
  console.log(`  Text-only: ${stats.text}`);
  console.log('='.repeat(60));
}

/**
 * Main execution function
 */
async function main() {
  console.log('🔍 Facebook Events Data Validation\n');

  try {
    const events = await readEventsData();

    if (!Array.isArray(events) || events.length === 0) {
      throw new Error('Events data is empty or not an array');
    }

    const structureValid = validateEventsStructure(events);
    const consistencyValid = await validateDataConsistency(events);
    const urlsValid = validateUrls(events);
    const piiClean = validatePiiDenylist(events);

    printSummary(events);

    if (structureValid && consistencyValid && urlsValid && piiClean) {
      console.log('\n✅ All validations passed!');
      console.log('   Events data is ready to use.');
      return;
    }

    console.log('\n❌ Validation failed. Please fix the errors above.');
    // Exit code 2 marks a PII denylist trip specifically — the sync workflow
    // uses this to distinguish "a child's identity documents are back on the
    // source post" (must alert loudly) from routine validation failures
    // (structure/consistency/URL errors, exit 1, stays quiet as before).
    process.exit(piiClean ? 1 : 2);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
