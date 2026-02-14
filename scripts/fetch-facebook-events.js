#!/usr/bin/env node

/**
 * Facebook Events Fetch Script
 *
 * Fetches posts from the Perhitsiksha Foundation Facebook page,
 * downloads and compresses images, and transforms them into Event format
 * with support for single images, videos, and album posts.
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

// Configuration
const CONFIG = {
  pageId: process.env.FACEBOOK_PAGE_ID,
  accessToken: process.env.FACEBOOK_ACCESS_TOKEN,
  graphApiVersion: 'v22.0',
  maxPosts: 15, // Fetch recent posts
  imageOutputDir: path.join(__dirname, '..', 'public', 'fb-events'),
  dataOutputFile: path.join(__dirname, '..', 'src', 'data', 'facebook-events.json'),
  imageMaxWidth: 1200,
  imageQuality: 80,
  imageTargetSizeKB: 200,
};

/**
 * Validates required environment variables
 */
function validateEnvironment() {
  if (!CONFIG.pageId) {
    throw new Error('Missing FACEBOOK_PAGE_ID environment variable');
  }
  if (!CONFIG.accessToken) {
    throw new Error('Missing FACEBOOK_ACCESS_TOKEN environment variable');
  }
  console.log('✓ Environment variables validated');
}

/**
 * Ensures output directories exist
 */
async function ensureDirectories() {
  await fs.mkdir(CONFIG.imageOutputDir, { recursive: true });
  await fs.mkdir(path.dirname(CONFIG.dataOutputFile), { recursive: true });
  console.log('✓ Output directories ready');
}

/**
 * Fetches posts from Facebook Graph API
 */
async function fetchFacebookPosts() {
  const url = `https://graph.facebook.com/${CONFIG.graphApiVersion}/${CONFIG.pageId}/posts`;

  const params = {
    access_token: CONFIG.accessToken,
    fields: 'id,message,created_time,permalink_url,attachments{type,media_type,media,subattachments{media,type,media_type,target{id,url}}}',
    limit: CONFIG.maxPosts,
  };

  console.log(`Fetching posts from Facebook page ${CONFIG.pageId}...`);

  try {
    const response = await axios.get(url, { params });
    console.log(`✓ Fetched ${response.data.data.length} posts`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch Facebook posts:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Downloads and compresses an image (with smart caching)
 * @param {string} imageUrl - Source image URL
 * @param {string} outputPath - Destination file path
 * @param {boolean} forceDownload - Force download even if file exists
 * @returns {Promise<string>} - The relative path to the saved image
 */
async function downloadAndCompressImage(imageUrl, outputPath, forceDownload = false) {
  try {
    // Smart caching: Check if file already exists
    if (!forceDownload) {
      try {
        await fs.access(outputPath);
        const stats = await fs.stat(outputPath);
        const sizeKB = Math.round(stats.size / 1024);
        console.log(`  Using cached: ${path.basename(outputPath)} (${sizeKB}KB)`);
        return `/fb-events/${path.basename(outputPath)}`;
      } catch {
        // File doesn't exist, proceed with download
      }
    }

    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data);

    await sharp(imageBuffer)
      .resize(CONFIG.imageMaxWidth, null, {
        withoutEnlargement: true,
        fit: 'inside',
      })
      .jpeg({ quality: CONFIG.imageQuality })
      .toFile(outputPath);

    // Check file size
    const stats = await fs.stat(outputPath);
    const sizeKB = Math.round(stats.size / 1024);
    console.log(`  Downloaded and compressed: ${path.basename(outputPath)} (${sizeKB}KB)`);

    return `/fb-events/${path.basename(outputPath)}`;
  } catch (error) {
    console.error(`  Failed to download image from ${imageUrl}:`, error.message);
    throw error;
  }
}

/**
 * Generates a filename-safe string from text
 * @param {string} text - Input text
 * @param {number} maxLength - Maximum length
 * @returns {string} - Sanitized filename
 */
function sanitizeFilename(text, maxLength = 50) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, maxLength);
}

/**
 * Extracts title from post message
 * @param {string} message - Post message/caption
 * @returns {string} - Extracted title (max 100 chars)
 */
function extractTitle(message) {
  if (!message) return 'Untitled Event';

  // Take first line or first 100 characters
  const firstLine = message.split('\n')[0];
  return firstLine.length > 100
    ? firstLine.substring(0, 97) + '...'
    : firstLine;
}

/**
 * Formats Facebook date to readable format
 * @param {string} isoDate - ISO 8601 date string
 * @returns {string} - Formatted date (e.g., "Jan 26, 2026")
 */
function formatDate(isoDate) {
  const date = new Date(isoDate);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Generates alt text from post content
 * @param {string} message - Post message
 * @param {string} title - Event title
 * @returns {string} - Alt text for accessibility
 */
function generateAltText(message, title) {
  if (message && message.length > title.length + 20) {
    // Use first sentence after title
    const afterTitle = message.substring(title.length).trim();
    const firstSentence = afterTitle.split(/[.!?]/)[0];
    return firstSentence.substring(0, 150);
  }
  return title;
}

/**
 * Processes a single attachment (image, video, or album)
 * @param {object} post - Facebook post object
 * @param {string} eventId - Event identifier
 * @returns {Promise<object>} - Processed media data
 */
async function processAttachment(post, eventId) {
  const attachment = post.attachments?.data?.[0];

  if (!attachment) {
    // Text-only post
    return {
      mediaType: 'text',
      image: null,
      videoUrl: null,
      media: [],
    };
  }

  const { type, media_type, media, subattachments } = attachment;

  // Album (multiple photos/videos)
  if (type === 'album' && subattachments?.data) {
    console.log(`  Processing album with ${subattachments.data.length} items...`);

    const mediaItems = [];
    let thumbnailPath = null;

    for (let i = 0; i < subattachments.data.length; i++) {
      const item = subattachments.data[i];

      if (item.media_type === 'photo' && item.media?.image?.src) {
        const mediaUrl = item.media.image.src;

        // Download first photo as thumbnail (if not already downloaded)
        if (!thumbnailPath) {
          const filename = `${eventId}-thumbnail.jpg`;
          const outputPath = path.join(CONFIG.imageOutputDir, filename);
          thumbnailPath = await downloadAndCompressImage(mediaUrl, outputPath);
        }

        // Store all images as CDN URLs for gallery
        mediaItems.push({
          type: 'image',
          url: mediaUrl,
          alt: generateAltText(post.message, extractTitle(post.message)),
        });
      } else if (item.media_type === 'video' && item.target?.url) {
        mediaItems.push({
          type: 'video',
          url: item.target.url,
          thumbnail: item.media?.image?.src || null,
          alt: generateAltText(post.message, extractTitle(post.message)),
        });
      }
    }

    // Fallback: If no photos, download first video thumbnail
    if (!thumbnailPath && mediaItems.length > 0) {
      const firstVideo = mediaItems.find(item => item.type === 'video' && item.thumbnail);
      if (firstVideo?.thumbnail) {
        console.log(`  No photos in album, using video thumbnail as fallback`);
        const filename = `${eventId}-thumbnail.jpg`;
        const outputPath = path.join(CONFIG.imageOutputDir, filename);
        try {
          thumbnailPath = await downloadAndCompressImage(firstVideo.thumbnail, outputPath);
        } catch (error) {
          console.warn(`  Failed to download video thumbnail: ${error.message}`);
        }
      }
    }

    return {
      mediaType: 'album',
      thumbnailImage: thumbnailPath,
      thumbnailAlt: generateAltText(post.message, extractTitle(post.message)),
      mediaCount: mediaItems.length,
      media: mediaItems,
    };
  }

  // Single photo
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

  // Single video
  if (media_type === 'video' && attachment.target?.url) {
    let thumbnailPath = null;

    // Download video thumbnail if available
    if (media?.image?.src) {
      const filename = `${eventId}-thumb.jpg`;
      const outputPath = path.join(CONFIG.imageOutputDir, filename);
      thumbnailPath = await downloadAndCompressImage(media.image.src, outputPath);
    }

    return {
      mediaType: 'video',
      image: thumbnailPath,
      imageAlt: generateAltText(post.message, extractTitle(post.message)),
      videoUrl: attachment.target.url,
    };
  }

  // Inline video (video_inline type from Facebook Reels)
  if (type === 'video_inline' && media_type === 'video') {
    let thumbnailPath = null;
    let videoUrl = attachment.url || post.permalink_url;

    // Download video thumbnail if available
    if (media?.image?.src) {
      const filename = `${eventId}-thumb.jpg`;
      const outputPath = path.join(CONFIG.imageOutputDir, filename);
      try {
        thumbnailPath = await downloadAndCompressImage(media.image.src, outputPath);
      } catch (error) {
        console.warn(`  Failed to download thumbnail: ${error.message}`);
      }
    }

    console.log(`  Inline video processed: ${videoUrl}`);
    return {
      mediaType: 'video',
      image: thumbnailPath,
      imageAlt: generateAltText(post.message, extractTitle(post.message)),
      videoUrl: videoUrl,
    };
  }

  // Fallback for unknown types
  console.warn(`  Unknown attachment type: ${type}/${media_type}`);
  return {
    mediaType: 'text',
    image: null,
    videoUrl: null,
    media: [],
  };
}

/**
 * Transforms Facebook posts into Event objects
 * @param {Array} posts - Facebook post objects
 * @returns {Promise<Array>} - Array of Event objects
 */
async function transformPostsToEvents(posts) {
  const events = [];

  for (const post of posts) {
    try {
      const eventId = sanitizeFilename(post.id);
      const title = extractTitle(post.message);
      const description = post.message || 'No description available';
      const date = formatDate(post.created_time);

      console.log(`\nProcessing: ${title}`);

      // Filter BEFORE downloading: Check for media and meaningful message
      const hasAttachment = post.attachments?.data?.[0];
      const hasMeaningfulMessage = (post.message || '').trim().length >= 20;

      if (!hasAttachment || !hasMeaningfulMessage) {
        console.log(`  ⊘ Skipped: ${hasAttachment ? 'message too short' : 'no media'} (${(post.message || '').trim().length} chars)`);
        continue;
      }

      // Only download images for posts that pass the filter
      const mediaData = await processAttachment(post, eventId);

      const event = {
        id: eventId,
        title,
        description,
        date,
        ...mediaData,
        ctaText: 'View on Facebook',
        ctaLink: post.permalink_url,
      };

      events.push(event);
      console.log(`✓ Event created: ${title}`);

      // Stop after collecting 10 valid events
      if (events.length >= 10) {
        console.log(`\n✓ Reached 10 events, stopping...`);
        break;
      }
    } catch (error) {
      console.error(`Failed to process post ${post.id}:`, error.message);
      // Continue with other posts
    }
  }

  return events;
}

/**
 * Saves events data to JSON file
 * @param {Array} events - Array of Event objects
 */
async function saveEventsData(events) {
  const json = JSON.stringify(events, null, 2);
  await fs.writeFile(CONFIG.dataOutputFile, json, 'utf8');
  console.log(`\n✓ Saved ${events.length} events to ${CONFIG.dataOutputFile}`);
}

/**
 * Cleans up orphaned images (images no longer in current events)
 * @param {Array} events - Array of Event objects
 */
async function cleanupOrphanedImages(events) {
  console.log('\nCleaning up orphaned images...');

  try {
    // Get all current image files in the directory
    const existingFiles = await fs.readdir(CONFIG.imageOutputDir);
    const imageFiles = existingFiles.filter(file => file.endsWith('.jpg'));

    if (imageFiles.length === 0) {
      console.log('  No images to clean up');
      return;
    }

    // Collect all image filenames that should be kept
    const activeImages = new Set();
    for (const event of events) {
      if (event.image) {
        activeImages.add(path.basename(event.image));
      }
      if (event.thumbnailImage) {
        activeImages.add(path.basename(event.thumbnailImage));
      }
    }

    // Delete orphaned images
    let deletedCount = 0;
    for (const file of imageFiles) {
      if (!activeImages.has(file)) {
        const filePath = path.join(CONFIG.imageOutputDir, file);
        await fs.unlink(filePath);
        console.log(`  Deleted orphaned: ${file}`);
        deletedCount++;
      }
    }

    if (deletedCount === 0) {
      console.log('  No orphaned images found');
    } else {
      console.log(`✓ Cleaned up ${deletedCount} orphaned image(s)`);
    }
  } catch (error) {
    console.warn(`  Warning: Failed to cleanup orphaned images: ${error.message}`);
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Facebook Events Fetch Script\n');

  try {
    validateEnvironment();
    await ensureDirectories();

    const posts = await fetchFacebookPosts();
    const events = await transformPostsToEvents(posts);
    await saveEventsData(events);
    await cleanupOrphanedImages(events);

    console.log('\n✅ Success! Facebook events have been fetched and saved.');
    console.log(`   Data file: ${CONFIG.dataOutputFile}`);
    console.log(`   Images: ${CONFIG.imageOutputDir}`);
    console.log('\nNext steps:');
    console.log('   1. Run: npm run validate:events');
    console.log('   2. Review: cat src/data/facebook-events.json');
    console.log('   3. Test: npm run dev');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
