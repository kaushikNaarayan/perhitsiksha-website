import React, { useState, useRef, useEffect } from 'react';

interface CelebrityEndorsement {
  id: string;
  name: string;
  videoId: string;
  profession: string;
}

interface YouTubeShortsCarouselProps {
  endorsements: CelebrityEndorsement[];
}

const YouTubeShortsCarousel: React.FC<YouTubeShortsCarouselProps> = ({ endorsements }) => {
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  // Continuous smooth auto-scroll effect
  useEffect(() => {
    if (!isAutoScrolling || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    let scrollPosition = 0;
    const scrollSpeed = 0.5; // pixels per frame
    
    const smoothScroll = () => {
      if (container) {
        const maxScroll = container.scrollWidth - container.clientWidth;
        
        scrollPosition += scrollSpeed;
        
        if (scrollPosition >= maxScroll) {
          scrollPosition = 0; // Reset to beginning
        }
        
        container.scrollLeft = scrollPosition;
      }
    };

    const animationFrame = setInterval(smoothScroll, 16); // 60fps

    return () => clearInterval(animationFrame);
  }, [isAutoScrolling]);

  const scrollLeft = () => {
    setIsAutoScrolling(false); // Stop auto-scroll on manual interaction
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    setIsAutoScrolling(false); // Stop auto-scroll on manual interaction
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  const handleVideoPlay = (videoId: string) => {
    setPlayingVideo(videoId);
  };

  const getYouTubeShortThumbnail = (videoId: string) => {
    // YouTube Shorts thumbnails - try maxresdefault first, fallback to hqdefault
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const getEmbedUrl = (videoId: string) => {
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&start=0`;
  };

  return (
    <div className="relative">
      {/* Navigation Arrows - Hidden on mobile */}
      <button
        onClick={scrollLeft}
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full items-center justify-center hover:bg-gray-50 transition-colors"
        aria-label="Previous videos"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={scrollRight}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full items-center justify-center hover:bg-gray-50 transition-colors"
        aria-label="Next videos"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Carousel Container */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory md:px-12 hide-scrollbar"
      >
        {endorsements.map((celebrity) => (
          <div
            key={celebrity.id}
            className="flex-none w-64 snap-center"
          >
            {/* Celebrity Info */}
            <div className="pb-3 text-center">
              <h3 className="font-semibold text-gray-900 text-lg mb-1">
                {celebrity.name}
              </h3>
              <p className="text-sm text-gray-600">
                {celebrity.profession}
              </p>
            </div>

            {/* Video Container - Portrait aspect ratio */}
            <div className="relative w-full bg-gray-900 rounded-xl overflow-hidden shadow-lg" style={{ aspectRatio: '9/16' }}>
              {playingVideo === celebrity.videoId ? (
                // Playing video
                <iframe
                  src={getEmbedUrl(celebrity.videoId)}
                  title={`${celebrity.name} endorsement`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              ) : (
                // Video thumbnail with play button
                <div 
                  className="relative w-full h-full cursor-pointer group"
                  onClick={() => handleVideoPlay(celebrity.videoId)}
                >
                  {/* Thumbnail */}
                  <img
                    src={getYouTubeShortThumbnail(celebrity.videoId)}
                    alt={`${celebrity.name} endorsement`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to hqdefault if maxresdefault fails
                      const target = e.target as HTMLImageElement;
                      target.src = `https://img.youtube.com/vi/${celebrity.videoId}/hqdefault.jpg`;
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

                  {/* YouTube Shorts indicator */}
                  <div className="absolute top-3 right-3">
                    <div className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      Shorts
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YouTubeShortsCarousel;