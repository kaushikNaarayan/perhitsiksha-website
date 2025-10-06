import React, { useEffect } from 'react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  title: string;
  celebrityName?: string;
}

const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  videoId,
  title,
  celebrityName,
}) => {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // YouTube embed URL with autoplay and related video controls
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-80 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content - Flexible container for any video aspect ratio */}
      <div className="relative w-full max-w-md mx-4 bg-black rounded-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between bg-gray-900 px-4 py-3">
          <div>
            {celebrityName && (
              <h3 className="text-white text-lg font-semibold">
                {celebrityName}
              </h3>
            )}
            <p className="text-gray-300 text-sm">{title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded"
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

        {/* Video Container - Flexible height with 9:16 portrait aspect ratio */}
        {/* paddingTop: 177.78% = (16/9) * 100% - maintains 9:16 ratio for YouTube Shorts */}
        <div className="relative bg-black" style={{ paddingTop: '177.78%' }}>
          <iframe
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
            style={{ border: 0 }}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
