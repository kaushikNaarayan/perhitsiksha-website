import React, { useState, useRef, useEffect } from 'react';
import VideoModal from './VideoModal';

interface CelebrityEndorsement {
  id: string;
  name: string;
  videoId: string;
  profession: string;
}

interface EnhancedCarouselProps {
  endorsements: CelebrityEndorsement[];
}

const EnhancedCarousel: React.FC<EnhancedCarouselProps> = ({
  endorsements,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
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
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);

    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const handleVideoPlay = (celebrity: CelebrityEndorsement) => {
    setModalVideo({
      isOpen: true,
      videoId: celebrity.videoId,
      title: `${celebrity.name} supports Perhitsiksha`,
      celebrityName: celebrity.name,
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

  const getYouTubeShortThumbnail = (videoId: string) => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    if (carouselRef.current) {
      const slideWidth = carouselRef.current.scrollWidth / endorsements.length;
      carouselRef.current.scrollTo({
        left: slideWidth * index,
        behavior: 'smooth',
      });
    }
  };

  const nextSlide = () => {
    const newIndex =
      currentIndex === endorsements.length - 1 ? 0 : currentIndex + 1;
    goToSlide(newIndex);
  };

  const prevSlide = () => {
    const newIndex =
      currentIndex === 0 ? endorsements.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
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
          <div className="flex-none w-8"></div>

          {endorsements.map(celebrity => (
            <div key={celebrity.id} className="flex-none w-56 snap-center">
              {/* Celebrity Info */}
              <div className="pb-3 text-center">
                <h3 className="font-semibold text-gray-900 text-base mb-1">
                  {celebrity.name}
                </h3>
                <p className="text-xs text-gray-600">{celebrity.profession}</p>
              </div>

              {/* Video Container - Portrait aspect ratio */}
              <div
                className="relative w-full bg-gray-900 rounded-xl overflow-hidden shadow-lg"
                style={{ aspectRatio: '9/16' }}
              >
                <div
                  className="relative w-full h-full cursor-pointer group"
                  onClick={() => handleVideoPlay(celebrity)}
                >
                  {/* Thumbnail */}
                  <img
                    src={getYouTubeShortThumbnail(celebrity.videoId)}
                    alt={`${celebrity.name} endorsement`}
                    className="w-full h-full object-cover"
                    onError={e => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://img.youtube.com/vi/${celebrity.videoId}/hqdefault.jpg`;
                    }}
                  />

                  {/* Overlay with play button */}
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center group-hover:bg-opacity-40 transition-all duration-200">
                    <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <svg
                        className="w-6 h-6 text-gray-800 ml-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* YouTube Shorts indicator */}
                  <div className="absolute top-2 right-2">
                    <div className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      Shorts
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add peek space at end */}
          <div className="flex-none w-8"></div>
        </div>
      </div>

      {/* Desktop View - Static Grid with Dots */}
      <div className="hidden md:block">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {endorsements
            .slice(currentIndex, currentIndex + (isDesktop ? 4 : 2))
            .map(celebrity => (
              <div key={celebrity.id} className="flex-none">
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
                <div
                  className="relative w-full bg-gray-900 rounded-xl overflow-hidden shadow-lg"
                  style={{ aspectRatio: '9/16' }}
                >
                  <div
                    className="relative w-full h-full cursor-pointer group"
                    onClick={() => handleVideoPlay(celebrity)}
                  >
                    {/* Thumbnail */}
                    <img
                      src={getYouTubeShortThumbnail(celebrity.videoId)}
                      alt={`${celebrity.name} endorsement`}
                      className="w-full h-full object-cover"
                      onError={e => {
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
                          <path d="M8 5v14l11-7z" />
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
                </div>
              </div>
            ))}
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: Math.ceil(endorsements.length / 4) }).map(
            (_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index * 4)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  Math.floor(currentIndex / 4) === index
                    ? 'bg-primary-500 w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            )
          )}
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

export default EnhancedCarousel;
