import React, { useState, useRef } from 'react';
import YouTubeEmbed from './YouTubeEmbed';
import type { Testimonial } from '../../types';

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
}

const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({ testimonials }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Handle touch/swipe for mobile
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    if (carouselRef.current) {
      const slideWidth = carouselRef.current.scrollWidth / testimonials.length;
      carouselRef.current.scrollTo({
        left: slideWidth * index,
        behavior: 'smooth'
      });
    }
  };

  const nextSlide = () => {
    const newIndex = currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1;
    goToSlide(newIndex);
  };

  const prevSlide = () => {
    const newIndex = currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  return (
    <div className="relative">
      {/* Mobile View - Peek Carousel */}
      <div className="md:hidden">
        <div 
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {/* Add peek space at start */}
          <div className="flex-none w-6"></div>
          
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="flex-none w-80 snap-center"
            >
              {/* Video Container */}
              <div className="mb-4">
                <YouTubeEmbed
                  videoId={testimonial.youtubeId!}
                  title={`${testimonial.name} - ${testimonial.role}`}
                  lazyLoad={true}
                />
              </div>
              
              {/* Testimonial Info */}
              <div className="text-center">
                <blockquote className="text-base italic text-gray-700 mb-3">
                  "{testimonial.quote}"
                </blockquote>
                <div className="text-sm text-gray-600">
                  <strong>{testimonial.name}</strong> • {testimonial.role} • {testimonial.location}
                </div>
              </div>
            </div>
          ))}
          
          {/* Add peek space at end */}
          <div className="flex-none w-6"></div>
        </div>
      </div>

      {/* Desktop View - Single Video with Navigation */}
      <div className="hidden md:block">
        <div className="max-w-2xl mx-auto mb-6">
          <YouTubeEmbed
            videoId={testimonials[currentIndex].youtubeId!}
            title={`${testimonials[currentIndex].name} - ${testimonials[currentIndex].role}`}
            lazyLoad={true}
          />
        </div>
        
        <div className="text-center mb-6">
          <blockquote className="text-lg italic text-gray-700 mb-4">
            "{testimonials[currentIndex].quote}"
          </blockquote>
          <div className="text-sm text-gray-600">
            <strong>{testimonials[currentIndex].name}</strong> • {testimonials[currentIndex].role} • {testimonials[currentIndex].location}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-center items-center space-x-4">
          <button
            onClick={prevSlide}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
            aria-label="Previous testimonial"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="flex space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? 'bg-primary-500 w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
          
          <button
            onClick={nextSlide}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
            aria-label="Next testimonial"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCarousel;