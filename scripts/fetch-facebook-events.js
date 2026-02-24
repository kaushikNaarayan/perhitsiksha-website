#!/usr/bin/env node

/**
 * Facebook Events Fetch Script — v2 HARDENED
 *
 * Downloads ALL album images locally to avoid Facebook CDN URL expiry (~7 days).
 * Uses concurrency, retry logic, and a lock file to prevent overlapping runs.
 *
 * Environment Variables Required:
 * - FACEBOOK_PAGE_ID: The numeric Facebook Page ID
 * - FACEBOOK_ACCESS_TOKEN: Long-lived Page Access Token
 *
 * Usage:
 *   npm run fetch:facebook
 */

import axios from 'axios';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ================= CONFIG ================= */

const CONFIG = {
  pageId: process.env.FACEBOOK_PAGE_ID,
  accessToken: process.env.FACEBOOK_ACCESS_TOKEN,
  graphApiVersion: 'v22.0',
  maxPosts: 15,
  maxEvents: 10,
  maxAlbumItems: 12,
  concurrency: 4,

  imageOutputDir: path.join(__dirname, '..', 'public', 'fb-events'),
  dataOutputFile: path.join(__dirname, '..', 'src', 'data', 'facebook-events.json'),
  lockFile: path.join(__dirname, '.facebook-fetch.lock'),

  imageMaxWidth: 1200,
  imageQuality: 80,
};

/* ================= UTIL ================= */

function validateEnvironment() {
  if (!CONFIG.pageId) throw new Error('Missing FACEBOOK_PAGE_ID');
  if (!CONFIG.accessToken) throw new Error('Missing FACEBOOK_ACCESS_TOKEN');
  console.log('✓ Environment validated');
}

async function ensureDirectories() {
  await fs.mkdir(CONFIG.imageOutputDir, { recursive: true });
  await fs.mkdir(path.dirname(CONFIG.dataOutputFile), { recursive: true });
  console.log('✓ Output directories ready');
}

/* ================= LOCK (STALE SAFE) ================= */

async function acquireLock() {
  try {
    const stat = await fs.stat(CONFIG.lockFile);
    const ageMinutes = (Date.now() - stat.mtimeMs) / 60000;
    if (ageMinutes > 30) {
      console.log('⚠ Stale lock found, removing...');
      await fs.unlink(CONFIG.lockFile);
    }
  } catch {}

  try {
    await fs.writeFile(CONFIG.lockFile, String(Date.now()), { flag: 'wx' });
    console.log('✓ Lock acquired');
  } catch {
    console.log('⚠ Another fetch is already running — exiting');
    process.exit(0);
  }
}

async function releaseLock() {
  try {
    await fs.unlink(CONFIG.lockFile);
  } catch {}
}

/* ================= FACEBOOK API ================= */

async function fetchFacebookPosts() {
  const url = `https://graph.facebook.com/${CONFIG.graphApiVersion}/${CONFIG.pageId}/posts`;

  const params = {
    access_token: CONFIG.accessToken,
    fields:
      'id,message,created_time,permalink_url,attachments{type,media_type,media,target{id,url},subattachments{media,type,media_type,target{id,url}}}',
    limit: CONFIG.maxPosts,
  };

  console.log(`Fetching posts from Facebook page ${CONFIG.pageId}...`);

  try {
    const res = await axios.get(url, { params });
    console.log(`✓ Fetched ${res.data.data.length} posts`);
    return res.data.data || [];
  } catch (error) {
    console.error('Failed to fetch Facebook posts:', error.response?.data || error.message);
    throw error;
  }
}

/* ================= IMAGE DOWNLOAD ================= */

async function downloadAndCompressImage(imageUrl, outputPath) {
  try {
    // Smart cache: skip re-downloading existing files
    try {
      await fs.access(outputPath);
      const sizeKB = Math.round((await fs.stat(outputPath)).size / 1024);
      console.log(`  Using cached: ${path.basename(outputPath)} (${sizeKB}KB)`);
      return `/fb-events/${path.basename(outputPath)}`;
    } catch {}

    // 2-attempt retry
    let res;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        res = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 20000 });
        break;
      } catch (err) {
        if (attempt === 2) throw err;
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    await sharp(Buffer.from(res.data))
      .resize(CONFIG.imageMaxWidth, null, { withoutEnlargement: true, fit: 'inside' })
      .jpeg({ quality: CONFIG.imageQuality })
      .toFile(outputPath);

    const sizeKB = Math.round((await fs.stat(outputPath)).size / 1024);
    console.log(`  ✓ Saved ${path.basename(outputPath)} (${sizeKB}KB)`);
    return `/fb-events/${path.basename(outputPath)}`;
  } catch (err) {
    console.warn(`  ⚠ Image failed: ${err.message}`);
    return null;
  }
}

/* ================= HELPERS ================= */

function sanitizeFilename(text, maxLength = 80) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, maxLength);
}

function extractTitle(message) {
  if (!message) return 'Untitled Event';
  const firstLine = message.split('\n')[0];
  return firstLine.length > 100 ? firstLine.substring(0, 97) + '...' : firstLine;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function generateAltText(message, title) {
  if (!message) return title;
  return message.substring(0, 140);
}

/* ================= PARALLEL MAP ================= */

async function mapWithConcurrency(items, limit, mapper) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await mapper(items[i], i);
    }
  }

  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

/* ================= ATTACHMENT PROCESSING ================= */

async function processAttachment(post, eventId) {
  const attachment = post.attachments?.data?.[0];
  if (!attachment) return { mediaType: 'text', media: [] };

  const { type, media_type, media, subattachments } = attachment;

  /* ---------- ALBUM ---------- */
  if (type === 'album' && subattachments?.data) {
    const items = subattachments.data.slice(0, CONFIG.maxAlbumItems);
    console.log(`  Album with ${items.length} items`);

    let thumbnailImage = null;

    const mediaItems = await mapWithConcurrency(items, CONFIG.concurrency, async (item, i) => {
      const mediaId = item.target?.id || `${i}`;
      const alt = generateAltText(post.message, extractTitle(post.message));

      // Photo: download locally
      if (item.media_type === 'photo' && item.media?.image?.src) {
        const filename = `${eventId}-${mediaId}.jpg`;
        const outputPath = path.join(CONFIG.imageOutputDir, filename);
        const localPath = await downloadAndCompressImage(item.media.image.src, outputPath);

        // Skip items where download failed — don't emit {url: null}
        if (!localPath) return null;

        if (!thumbnailImage) thumbnailImage = localPath;
        return { type: 'image', url: localPath, alt };
      }

      // Video: download thumbnail locally, use individual video URL for playback
      if (item.media_type === 'video') {
        let thumbLocal = null;
        if (item.media?.image?.src) {
          const filename = `${eventId}-${mediaId}-thumb.jpg`;
          const outputPath = path.join(CONFIG.imageOutputDir, filename);
          thumbLocal = await downloadAndCompressImage(item.media.image.src, outputPath);
        }
        // item.target?.url is the individual reel/video permalink; fall back to post url
        const videoUrl = item.target?.url || post.permalink_url;
        return {
          type: 'video',
          url: videoUrl,
          thumbnail: thumbLocal || undefined,
          alt,
        };
      }

      return null;
    });

    const filteredMedia = mediaItems.filter(Boolean);

    // No valid media items at all — treat as text-only
    if (filteredMedia.length === 0) {
      return { mediaType: 'text', media: [] };
    }

    // thumbnailImage still null (e.g. video-only album) — use first video thumbnail
    if (!thumbnailImage) {
      const firstVideoWithThumb = filteredMedia.find(m => m.type === 'video' && m.thumbnail);
      if (firstVideoWithThumb) thumbnailImage = firstVideoWithThumb.thumbnail;
    }

    // Still no thumbnail — can't render a preview card, skip
    if (!thumbnailImage) {
      console.warn('  ⚠ Album has no usable thumbnail, treating as text');
      return { mediaType: 'text', media: [] };
    }

    return {
      mediaType: 'album',
      thumbnailImage,
      thumbnailAlt: generateAltText(post.message, extractTitle(post.message)),
      media: filteredMedia,
      mediaCount: filteredMedia.length,
    };
  }

  /* ---------- SINGLE PHOTO ---------- */
  if (media_type === 'photo' && media?.image?.src) {
    const filename = `${eventId}.jpg`;
    const outputPath = path.join(CONFIG.imageOutputDir, filename);
    const imagePath = await downloadAndCompressImage(media.image.src, outputPath);

    return {
      mediaType: 'image',
      image: imagePath,
      imageAlt: generateAltText(post.message, extractTitle(post.message)),
    };
  }

  /* ---------- SINGLE VIDEO ---------- */
  if (media_type === 'video') {
    let thumbnail = null;
    if (media?.image?.src) {
      const filename = `${eventId}-thumb.jpg`;
      const outputPath = path.join(CONFIG.imageOutputDir, filename);
      thumbnail = await downloadAndCompressImage(media.image.src, outputPath);
    }
    return {
      mediaType: 'video',
      image: thumbnail,
      imageAlt: generateAltText(post.message, extractTitle(post.message)),
      videoUrl: post.permalink_url,
    };
  }

  /* ---------- REELS / INLINE VIDEO ---------- */
  if (type === 'video_inline' && media_type === 'video') {
    let thumbnail = null;
    if (media?.image?.src) {
      const filename = `${eventId}-thumb.jpg`;
      const outputPath = path.join(CONFIG.imageOutputDir, filename);
      thumbnail = await downloadAndCompressImage(media.image.src, outputPath);
    }
    return {
      mediaType: 'video',
      image: thumbnail,
      imageAlt: generateAltText(post.message, extractTitle(post.message)),
      videoUrl: post.permalink_url,
    };
  }

  console.warn(`  Unknown attachment type: ${type}/${media_type}`);
  return { mediaType: 'text', media: [] };
}

/* ================= TRANSFORM ================= */

async function transformPostsToEvents(posts) {
  const events = [];

  for (const post of posts) {
    try {
      const hasAttachment = post.attachments?.data?.[0];
      const hasText = (post.message || '').trim().length >= 20;

      if (!hasAttachment || !hasText) {
        console.log(
          `\n⊘ Skipped: ${hasAttachment ? 'message too short' : 'no media'} (${(post.message || '').trim().length} chars)`
        );
        continue;
      }

      const eventId = sanitizeFilename(post.id);
      console.log(`\nProcessing: ${extractTitle(post.message)}`);

      const mediaData = await processAttachment(post, eventId);

      events.push({
        id: eventId,
        title: extractTitle(post.message),
        description: post.message || '',
        date: formatDate(post.created_time),
        ...mediaData,
        ctaText: 'View on Facebook',
        ctaLink: post.permalink_url,
      });

      console.log(`✓ Event created: ${extractTitle(post.message)}`);

      if (events.length >= CONFIG.maxEvents) {
        console.log(`\n✓ Reached ${CONFIG.maxEvents} events, stopping`);
        break;
      }
    } catch (error) {
      console.error(`Failed to process post ${post.id}:`, error.message);
      // Continue with remaining posts
    }
  }

  return events;
}

/* ================= CLEANUP ================= */

async function cleanupOrphanedImages(events) {
  console.log('\nCleaning orphaned images...');

  try {
    const existingFiles = (await fs.readdir(CONFIG.imageOutputDir)).filter(
      f => f.endsWith('.jpg') || f.endsWith('.webp')
    );

    const activeImages = new Set();
    for (const event of events) {
      if (event.image) activeImages.add(path.basename(event.image));
      if (event.thumbnailImage) activeImages.add(path.basename(event.thumbnailImage));
      if (event.media?.length) {
        for (const item of event.media) {
          if (item.type === 'image' && item.url) activeImages.add(path.basename(item.url));
          if (item.type === 'video' && item.thumbnail) activeImages.add(path.basename(item.thumbnail));
        }
      }
    }

    let deleted = 0;
    for (const file of existingFiles) {
      if (!activeImages.has(file)) {
        await fs.unlink(path.join(CONFIG.imageOutputDir, file));
        console.log(`  Deleted orphaned: ${file}`);
        deleted++;
      }
    }

    console.log(`✓ Cleanup complete (${deleted} removed)`);
  } catch (error) {
    console.warn(`  Warning: Cleanup failed: ${error.message}`);
  }
}

/* ================= MAIN ================= */

async function main() {
  console.log('🚀 Facebook Events Fetch Script (v2 Hardened)\n');

  await acquireLock();

  try {
    validateEnvironment();
    await ensureDirectories();

    const posts = await fetchFacebookPosts();
    const events = await transformPostsToEvents(posts);

    await fs.writeFile(CONFIG.dataOutputFile, JSON.stringify(events, null, 2), 'utf8');
    console.log(`\n✓ Saved ${events.length} events to ${CONFIG.dataOutputFile}`);

    await cleanupOrphanedImages(events);

    console.log('\n✅ Success! Facebook events fetched and saved.');
    console.log('\nNext steps:');
    console.log('   1. Run: npm run validate:events');
    console.log('   2. Review: cat src/data/facebook-events.json');
    console.log('   3. Test: npm run dev');
  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
    process.exitCode = 1;
  } finally {
    await releaseLock();
  }
}

main();
