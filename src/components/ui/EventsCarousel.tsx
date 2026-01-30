import React, { useState, useEffect, useCallback } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  image: string;
  imageAlt: string;
  ctaText: string;
  ctaLink: string;
}

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
          <div className="relative aspect-[4/3] xl:h-[400px]">
            <img
              src={currentEvent.image}
              alt={currentEvent.imageAlt}
              className="w-full h-full object-cover"
            />
            {/* Date Badge */}
            <div className="absolute top-4 right-4 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg">
              {currentEvent.date}
            </div>

            {/* Navigation Arrows on Image */}
            {events.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 z-10"
                  aria-label="Previous event"
                >
                  <FaChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 z-10"
                  aria-label="Next event"
                >
                  <FaChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Content Section */}
          <div className="flex flex-col justify-center p-8 xl:p-12 xl:h-[400px]">
            <h3 className="text-2xl xl:text-3xl font-bold text-gray-900 mb-4 leading-tight">
              {currentEvent.title}
            </h3>
            <p className="text-gray-600 text-base leading-relaxed mb-6">
              {currentEvent.description}
            </p>

            {/* CTA Button */}
            <a
              href={currentEvent.ctaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors duration-200 w-fit"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              {currentEvent.ctaText}
            </a>
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
    </div>
  );
};

export default EventsCarousel;
