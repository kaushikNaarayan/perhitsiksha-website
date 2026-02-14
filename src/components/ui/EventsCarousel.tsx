import React, { useState, useEffect, useCallback } from 'react';
import {
  FaChevronLeft,
  FaChevronRight,
  FaImages,
  FaPlay,
} from 'react-icons/fa';
import type { Event } from '../../types';
import { GalleryModal } from './GalleryModal';
import VideoModal from './VideoModal';

interface EventsCarouselProps {
  events: Event[];
  autoRotateInterval?: number; // in milliseconds, default 4000
}

const EventsCarousel: React.FC<EventsCarouselProps> = ({
  events,
  autoRotateInterval = 4000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const goToNext = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % events.length);
  }, [events.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex(
      prevIndex => (prevIndex - 1 + events.length) % events.length
    );
  }, [events.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const handleEventClick = useCallback((event: Event) => {
    if (event.mediaType === 'album' && event.media && event.media.length > 0) {
      setSelectedEvent(event);
      setGalleryOpen(true);
    } else if (event.mediaType === 'video' && event.videoUrl) {
      setSelectedEvent(event);
      setVideoModalOpen(true);
    }
  }, []);

  // Auto-rotate functionality
  useEffect(() => {
    if (!isHovered && events.length > 1) {
      const interval = setInterval(goToNext, autoRotateInterval);
      return () => clearInterval(interval);
    }
  }, [isHovered, goToNext, autoRotateInterval, events.length]);

  if (events.length === 0) {
    return null;
  }

  const currentEvent = events[currentIndex];

  // Determine image source and alt text
  const imageSrc =
    currentEvent.mediaType === 'album'
      ? currentEvent.thumbnailImage
      : currentEvent.image;
  const imageAlt =
    currentEvent.mediaType === 'album'
      ? currentEvent.thumbnailAlt
      : currentEvent.imageAlt;

  // Determine if event is clickable (album or video)
  const isClickable =
    (currentEvent.mediaType === 'album' && currentEvent.media?.length) ||
    (currentEvent.mediaType === 'video' && currentEvent.videoUrl);

  return (
    <div
      className="relative max-w-7xl mx-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main carousel content */}
      <div className="relative bg-white rounded-2xl overflow-hidden shadow-xl">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-0">
          {/* Image Section */}
          {imageSrc ? (
            <div
              className={`relative aspect-[4/3] xl:h-[400px] bg-gray-100 ${isClickable ? 'cursor-pointer group' : ''}`}
              onClick={() => isClickable && handleEventClick(currentEvent)}
            >
              <img
                src={imageSrc}
                alt={imageAlt || currentEvent.title}
                className="w-full h-full object-contain"
              />

              {/* Media Count Badge (for albums) */}
              {currentEvent.mediaType === 'album' &&
                currentEvent.mediaCount && (
                  <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm font-semibold shadow-lg flex items-center gap-2 group-hover:bg-black/80 transition-colors">
                    <FaImages className="w-4 h-4" />+{currentEvent.mediaCount}{' '}
                    more
                  </div>
                )}

              {/* Play Button Overlay (for videos) */}
              {currentEvent.mediaType === 'video' && currentEvent.videoUrl && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                  <div className="bg-white/90 group-hover:bg-white rounded-full p-6 shadow-2xl transform group-hover:scale-110 transition-all duration-200">
                    <FaPlay className="w-8 h-8 text-primary-600 ml-1" />
                  </div>
                </div>
              )}

              {/* Date Badge */}
              <div className="absolute top-4 right-4 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg">
                {currentEvent.date}
              </div>

              {/* Navigation Arrows on Image */}
              {events.length > 1 && (
                <>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      goToPrevious();
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 z-10"
                    aria-label="Previous event"
                  >
                    <FaChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      goToNext();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 z-10"
                    aria-label="Next event"
                  >
                    <FaChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          ) : (
            // Fallback for text-only posts - show Perhitsiksha logo
            <div className="relative aspect-[4/3] xl:h-[400px] bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-12">
              <img
                src="/logo.jpg"
                alt="Perhitsiksha Foundation Logo"
                className="max-w-full max-h-full object-contain opacity-90"
              />
            </div>
          )}

          {/* Content Section */}
          <div className="flex flex-col p-8 xl:p-12 xl:h-[400px]">
            {/* Title - Fixed height */}
            <h3 className="text-2xl xl:text-3xl font-bold text-gray-900 mb-3 leading-tight line-clamp-2">
              {currentEvent.title}
            </h3>

            {/* Description - Truncated to fit container */}
            <p className="text-gray-600 text-base leading-relaxed mb-6 line-clamp-5">
              {currentEvent.description}
            </p>

            {/* CTA Button - Always visible for all events */}
            <div className="mt-auto">
              <a
                href={currentEvent.ctaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors duration-200 w-fit"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                {currentEvent.ctaText}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination Dots */}
      {events.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {events.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                index === currentIndex
                  ? 'bg-primary-600 w-8 h-3'
                  : 'bg-gray-300 w-3 h-3 hover:bg-gray-400'
              }`}
              aria-label={`Go to event ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : 'false'}
            />
          ))}
        </div>
      )}

      {/* Gallery Modal for Albums */}
      {selectedEvent?.mediaType === 'album' && selectedEvent.media && (
        <GalleryModal
          isOpen={galleryOpen}
          onClose={() => setGalleryOpen(false)}
          media={selectedEvent.media}
          eventTitle={selectedEvent.title}
        />
      )}

      {/* Video Modal for Videos */}
      {selectedEvent?.mediaType === 'video' && selectedEvent.videoUrl && (
        <VideoModal
          isOpen={videoModalOpen}
          onClose={() => setVideoModalOpen(false)}
          platform="facebook"
          videoUrl={selectedEvent.videoUrl}
          title={selectedEvent.title}
        />
      )}
    </div>
  );
};

export default EventsCarousel;
