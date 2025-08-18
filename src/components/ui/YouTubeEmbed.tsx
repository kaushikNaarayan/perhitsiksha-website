import React, { useState } from 'react';
import type { YouTubeEmbedProps } from '../../types';
import { trackVideoPlay } from '../../utils/analytics';

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({
  videoId,
  title,
  thumbnail,
  lazyLoad = true,
  autoPlay = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(!lazyLoad);
  const [currentThumbnailIndex, setCurrentThumbnailIndex] = useState(0);
  
  // Use video ID directly without encoding for YouTube embeds
  // Fallback thumbnails in order of preference - try both YouTube thumbnail domains
  const thumbnailUrls = thumbnail ? [thumbnail] : [
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/default.jpg`
  ];
  
  const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1${autoPlay ? '&autoplay=1' : ''}`;
  
  const handlePlay = () => {
    // Track video play event
    trackVideoPlay(title, videoId);
    setIsLoaded(true);
  };
  
  const handleImageError = () => {
    if (currentThumbnailIndex < thumbnailUrls.length - 1) {
      console.warn(`YouTube thumbnail failed for video ${videoId}, trying fallback ${currentThumbnailIndex + 1}`);
      setCurrentThumbnailIndex(currentThumbnailIndex + 1);
    } else {
      console.error(`All YouTube thumbnails failed for video ${videoId} - showing generic fallback`);
      // For videos where thumbnails consistently fail, we'll show a generic placeholder
    }
  };
  
  if (isLoaded) {
    return (
      <div className="youtube-embed">
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          width="560"
          height="315"
        />
      </div>
    );
  }
  
  return (
    <div className="youtube-embed cursor-pointer group" onClick={handlePlay}>
      <div className="absolute inset-0">
        {currentThumbnailIndex < thumbnailUrls.length ? (
          <img
            src={thumbnailUrls[currentThumbnailIndex]}
            alt={title}
            className="w-full h-full object-cover rounded-lg"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              <p className="text-sm text-white font-medium">{title || 'Video Preview'}</p>
              <p className="text-xs text-white text-opacity-80 mt-1">Click to Play</p>
            </div>
          </div>
        )}
        
        {/* Overlay with play button */}
        <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center group-hover:bg-opacity-20 transition-all duration-200">
          <div className="w-16 h-16 bg-white bg-opacity-95 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-lg">
            <svg 
              className="w-8 h-8 text-gray-800 ml-1" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeEmbed;