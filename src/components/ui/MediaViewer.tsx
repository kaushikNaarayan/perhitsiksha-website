import type { MediaItem } from '../../types';

interface MediaViewerProps {
  mediaItem: MediaItem;
  index: number;
  isActive: boolean;
}

/**
 * MediaViewer Component
 *
 * Renders individual media items (images or Facebook videos) with lazy loading.
 * Used within GalleryModal for album posts.
 */
export function MediaViewer({ mediaItem, isActive }: MediaViewerProps) {
  if (!mediaItem) return null;

  if (mediaItem.type === 'image') {
    return (
      <img
        src={mediaItem.url}
        alt={mediaItem.alt}
        className="max-w-full max-h-[80vh] object-contain mx-auto"
        loading={isActive ? 'eager' : 'lazy'}
        draggable={false}
      />
    );
  }

  if (mediaItem.type === 'video') {
    // Detect mobile device
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    // On mobile, show button to open in Facebook instead of iframe
    if (isMobile) {
      return (
        <div className="w-full max-w-3xl mx-auto aspect-video flex items-center justify-center bg-gray-900 rounded-lg p-8">
          <div className="text-center">
            <svg
              className="w-20 h-20 mx-auto mb-4 text-blue-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <p className="text-white text-sm mb-4">
              Facebook videos work best in the Facebook app
            </p>
            <a
              href={mediaItem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
              </svg>
              Watch on Facebook
            </a>
          </div>
        </div>
      );
    }

    // Desktop: Show iframe embed
    const embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
      mediaItem.url
    )}&show_text=false&width=560&height=315`;

    return (
      <div className="w-full max-w-3xl mx-auto aspect-video">
        <iframe
          src={embedUrl}
          width="560"
          height="315"
          className="w-full h-full border-0 rounded-lg"
          scrolling="no"
          frameBorder="0"
          allowFullScreen={true}
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          title={mediaItem.alt}
        />
      </div>
    );
  }

  return null;
}
