import React, { useEffect, useRef, useState } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/gsap';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId?: string; // For YouTube videos
  videoUrl?: string; // For Facebook videos
  title: string;
  celebrityName?: string;
  platform?: 'youtube' | 'facebook'; // Defaults to 'youtube' for backward compatibility
}

const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  videoId,
  videoUrl,
  title,
  celebrityName,
  platform = 'youtube',
}) => {
  // Keep the modal mounted through its GSAP exit animation.
  const [mounted, setMounted] = useState(isOpen);

  const rootRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Cache the last valid content so the panel keeps rendering while it animates
  // out (callers often clear videoId at the same moment they set isOpen=false).
  const contentRef = useRef({
    videoId,
    videoUrl,
    title,
    celebrityName,
    platform,
  });
  if (isOpen && (videoId || videoUrl)) {
    contentRef.current = { videoId, videoUrl, title, celebrityName, platform };
  }
  const content = contentRef.current;

  // Detect if user is on mobile device
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  // Mount as soon as we're asked to open.
  useEffect(() => {
    if (isOpen) setMounted(true);
  }, [isOpen]);

  // Escape key + body scroll-lock while open.
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // GSAP lightbox in/out: scale 0.9 -> 1 + fade on open, reverse on close.
  // Reduced-motion => instant (no-op tween), then unmount.
  useGSAP(
    () => {
      if (!mounted) return;
      const backdrop = backdropRef.current;
      const panel = panelRef.current;
      if (!backdrop || !panel) return;

      const reduce = prefersReducedMotion();

      if (isOpen) {
        if (reduce) {
          gsap.set(backdrop, { opacity: 1 });
          gsap.set(panel, { opacity: 1, scale: 1 });
          return;
        }
        gsap.to(backdrop, { opacity: 1, duration: 0.25, ease: 'power2.out' });
        gsap.fromTo(
          panel,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.35, ease: 'spring' }
        );
        return;
      }

      // Closing.
      if (reduce) {
        setMounted(false);
        return;
      }
      const tl = gsap.timeline({ onComplete: () => setMounted(false) });
      tl.to(
        panel,
        { opacity: 0, scale: 0.9, duration: 0.25, ease: 'power2.in' },
        0
      ).to(backdrop, { opacity: 0, duration: 0.25, ease: 'power2.in' }, 0);
    },
    { scope: rootRef, dependencies: [isOpen, mounted] }
  );

  if (!mounted) return null;

  // Generate embed URL based on platform.
  let embedUrl = '';
  let aspectRatioStyle = {};

  if (content.platform === 'facebook' && content.videoUrl) {
    // Facebook video embed
    embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
      content.videoUrl
    )}&show_text=false&width=560&height=315`;
    // Facebook videos use 16:9 aspect ratio (56.25% = 9/16 * 100%)
    aspectRatioStyle = { paddingTop: '56.25%' };
  } else if (content.platform === 'youtube' && content.videoId) {
    // YouTube embed URL. autoplay=0 so the user initiates playback.
    embedUrl = `https://www.youtube-nocookie.com/embed/${content.videoId}?autoplay=0&rel=0&modestbranding=1`;
    // YouTube Shorts use 9:16 aspect ratio (177.78% = 16/9 * 100%)
    aspectRatioStyle = { paddingTop: '177.78%' };
  } else {
    return null;
  }

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-modal flex items-center justify-center"
    >
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black bg-opacity-80"
        style={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal Content - Flexible container for any video aspect ratio */}
      <div
        ref={panelRef}
        className="relative w-full max-w-md mx-4 bg-black rounded-lg overflow-hidden shadow-2xl"
        style={{ opacity: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gray-900 px-4 py-3">
          <div>
            {content.celebrityName && (
              <h3 className="text-white text-lg font-semibold">
                {content.celebrityName}
              </h3>
            )}
            <p className="text-gray-300 text-sm">{content.title}</p>
          </div>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-white transition-colors rounded"
            aria-label="Close video"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Video Container - Aspect ratio adapts based on platform */}
        {/* YouTube Shorts: 9:16 (177.78%) | Facebook: 16:9 (56.25%) */}
        <div className="relative bg-black" style={aspectRatioStyle}>
          {content.platform === 'facebook' && isMobile ? (
            // Mobile: Show button to open Facebook video in new tab
            <div className="absolute inset-0 flex items-center justify-center p-8">
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
                  href={content.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  onClick={onClose}
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                  </svg>
                  Watch on Facebook
                </a>
              </div>
            </div>
          ) : (
            // Desktop: Show iframe embed
            <iframe
              src={embedUrl}
              title={content.title}
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
              style={{ border: 0 }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
