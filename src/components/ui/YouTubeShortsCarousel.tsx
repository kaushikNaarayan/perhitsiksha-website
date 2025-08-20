import React, { useState } from 'react';
import VideoModal from './VideoModal';

interface CelebrityEndorsement {
  id: string;
  name: string;
  videoId: string;
  profession: string;
}

interface YouTubeShortsCarouselProps {
  endorsements: CelebrityEndorsement[];
}

const YouTubeShortsCarousel: React.FC<YouTubeShortsCarouselProps> = ({
  endorsements,
}) => {
  const [isPaused, setIsPaused] = useState(false);
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

  // Duplicate endorsements array for seamless infinite scrolling
  const duplicatedEndorsements = [...endorsements, ...endorsements];

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const handleVideoPlay = (celebrity: CelebrityEndorsement) => {
    setModalVideo({
      isOpen: true,
      videoId: celebrity.videoId,
      title: `${celebrity.name} supports PerhitSiksha`,
      celebrityName: celebrity.name,
    });
    // Pause carousel when modal opens
    setIsPaused(true);
  };

  const handleModalClose = () => {
    setModalVideo({
      isOpen: false,
      videoId: '',
      title: '',
      celebrityName: '',
    });
    // Resume carousel when modal closes
    setIsPaused(false);
  };

  const getYouTubeShortThumbnail = (videoId: string) => {
    // YouTube Shorts thumbnails - try maxresdefault first, fallback to hqdefault
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  return (
    <div className="relative overflow-hidden">
      {/* Carousel Container */}
      <div
        className="flex gap-4 pb-4"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className={`flex gap-4 ${isPaused ? '' : 'marquee-container'}`}
          style={{
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        >
          {duplicatedEndorsements.map((celebrity, index) => (
            <div
              key={`${celebrity.id}-${index}`}
              className="flex-none w-64 snap-center"
            >
              {/* Celebrity Info */}
              <div className="pb-3 text-center">
                <h3 className="font-semibold text-gray-900 text-lg mb-1">
                  {celebrity.name}
                </h3>
                <p className="text-sm text-gray-600">{celebrity.profession}</p>
              </div>

              {/* Video Container - Portrait aspect ratio */}
              <div
                className="relative w-full bg-gray-900 rounded-xl overflow-hidden shadow-lg"
                style={{ aspectRatio: '9/16' }}
              >
                {/* Video thumbnail with play button */}
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

export default YouTubeShortsCarousel;
