import React, { useState, useRef } from 'react';
import VideoModal from './VideoModal';
import type { Testimonial } from '../../types';

interface PeekCarouselProps {
  testimonials: Testimonial[];
}

const PeekCarousel: React.FC<PeekCarouselProps> = ({ testimonials }) => {
  const [modalVideo, setModalVideo] = useState<{
    isOpen: boolean;
    videoId: string;
    title: string;
    celebrityName: string;
  }>({
    isOpen: false,
    videoId: '',
    title: '',
    celebrityName: '',
  });

  const carouselRef = useRef<HTMLDivElement>(null);

  const handleVideoPlay = (testimonial: Testimonial) => {
    setModalVideo({
      isOpen: true,
      videoId: testimonial.youtubeId!,
      title: `${testimonial.name} - ${testimonial.role}`,
      celebrityName: testimonial.name,
    });
  };

  const handleModalClose = () => {
    setModalVideo({
      isOpen: false,
      videoId: '',
      title: '',
      celebrityName: '',
    });
  };

  const getYouTubeThumbnail = (videoId: string) => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  // Handle touch/swipe for mobile
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

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

    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth * 0.8; // Scroll by 80% of container width
      
      if (isLeftSwipe) {
        carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      } else if (isRightSwipe) {
        carouselRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="relative">
      {/* Mobile & Desktop - Peek Carousel */}
      <div className="relative">
        <div 
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 px-4"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            scrollPaddingLeft: '1rem',
            scrollPaddingRight: '1rem',
          }}
        >
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="flex-none w-72 md:w-80 snap-start"
            >
              {/* Video Container */}
              <div className="relative mb-4 bg-gray-900 rounded-xl overflow-hidden shadow-lg" style={{ aspectRatio: '16/9' }}>
                <div 
                  className="relative w-full h-full cursor-pointer group"
                  onClick={() => handleVideoPlay(testimonial)}
                >
                  {/* Thumbnail */}
                  <img
                    src={getYouTubeThumbnail(testimonial.youtubeId!)}
                    alt={`${testimonial.name} testimonial`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://img.youtube.com/vi/${testimonial.youtubeId}/hqdefault.jpg`;
                    }}
                  />
                  
                  {/* Overlay with play button */}
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center group-hover:bg-opacity-40 transition-all duration-200">
                    <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <svg 
                        className="w-8 h-8 text-gray-800 ml-1" 
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>

                  {/* Featured badge for featured testimonials */}
                  {testimonial.featured && (
                    <div className="absolute top-3 left-3">
                      <div className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Featured
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Testimonial Info */}
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {testimonial.name}
                </h3>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                    testimonial.role === 'Student' ? 'bg-blue-100 text-blue-800' :
                    testimonial.role === 'Parent' ? 'bg-green-100 text-green-800' :
                    testimonial.role === 'Mentor' ? 'bg-purple-100 text-purple-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {testimonial.role}
                  </span>
                  <span className="text-sm text-gray-500">
                    {testimonial.location}
                  </span>
                </div>
                <blockquote className="text-sm text-gray-600 italic leading-relaxed line-clamp-3">
                  "{testimonial.quote}"
                </blockquote>
              </div>
            </div>
          ))}
          
          {/* Add a spacer at the end for better scroll experience */}
          <div className="flex-none w-4"></div>
        </div>

        {/* Fade out effect on edges to show peek */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-primary-50 to-transparent pointer-events-none z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-primary-50 to-transparent pointer-events-none z-10"></div>
      </div>

      {/* Scroll Hint for Mobile */}
      <div className="flex justify-center mt-4 md:hidden">
        <div className="flex items-center text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Swipe to see more
        </div>
      </div>

      {/* Video Modal */}
      <VideoModal
        isOpen={modalVideo.isOpen}
        onClose={handleModalClose}
        videoId={modalVideo.videoId}
        title={modalVideo.title}
        celebrityName={modalVideo.celebrityName}
      />
    </div>
  );
};

export default PeekCarousel;