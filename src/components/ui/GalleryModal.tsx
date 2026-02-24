import React, { useEffect, useState, useCallback } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import type { MediaItem } from '../../types';
import { MediaViewer } from './MediaViewer';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem[];
  initialIndex?: number;
  eventTitle?: string;
}

/**
 * GalleryModal Component
 *
 * Full-screen lightbox for viewing album posts with multiple images/videos.
 * Features:
 * - Navigation arrows (prev/next)
 * - Swipe gestures for mobile
 * - Pagination dots
 * - Image counter
 * - Keyboard navigation (arrows, ESC)
 * - Click backdrop to close
 */
export function GalleryModal({
  isOpen,
  onClose,
  media,
  initialIndex = 0,
  eventTitle,
}: GalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, media.length]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex(prev => (prev === 0 ? media.length - 1 : prev - 1));
  }, [media.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev === media.length - 1 ? 0 : prev + 1));
  }, [media.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrevious();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !media || media.length === 0) return null;

  // Clamp currentIndex in case stale state from a previous album exceeds new media length
  const safeIndex = currentIndex >= media.length ? 0 : currentIndex;

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
      onClick={handleBackdropClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close button */}
      <button
        onClick={e => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-4 right-4 z-[60] text-white hover:text-gray-300 transition-colors p-3 rounded-full bg-black bg-opacity-70 hover:bg-opacity-90 shadow-lg"
        aria-label="Close gallery"
      >
        <FaTimes className="text-3xl" />
      </button>

      {/* Media counter and title */}
      <div className="absolute top-4 left-4 z-50 text-white">
        <div className="text-sm font-medium bg-black bg-opacity-50 px-3 py-1 rounded-full">
          {safeIndex + 1} / {media.length}
        </div>
        {eventTitle && (
          <div className="mt-2 text-lg font-semibold max-w-md">
            {eventTitle}
          </div>
        )}
      </div>

      {/* Previous button */}
      {media.length > 1 && (
        <button
          onClick={e => {
            e.stopPropagation();
            handlePrevious();
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:text-gray-300 transition-colors p-3 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70"
          aria-label="Previous image"
        >
          <FaChevronLeft className="text-2xl" />
        </button>
      )}

      {/* Media viewer */}
      <div className="w-full h-full flex items-center justify-center p-4">
        <MediaViewer
          mediaItem={media[safeIndex]}
          index={safeIndex}
          isActive={true}
        />
      </div>

      {/* Next button */}
      {media.length > 1 && (
        <button
          onClick={e => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:text-gray-300 transition-colors p-3 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70"
          aria-label="Next image"
        >
          <FaChevronRight className="text-2xl" />
        </button>
      )}

      {/* Pagination dots */}
      {media.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex gap-2">
          {media.map((_, index) => (
            <button
              key={index}
              onClick={e => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === safeIndex
                  ? 'bg-white w-8'
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
