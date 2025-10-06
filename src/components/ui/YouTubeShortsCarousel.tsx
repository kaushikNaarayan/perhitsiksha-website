import React, { useState, useRef, useEffect } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const targetVelocityRef = useRef(-1);
  const velocityRef = useRef(-1);
  const positionRef = useRef(0);
  const lastTimeRef = useRef<number>(Date.now());
  const halfWidthRef = useRef(0);

  // Drag state refs
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartPositionRef = useRef(0);
  const dragVelocityRef = useRef(0);
  const lastDragXRef = useRef(0);
  const lastDragTimeRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const momentumRef = useRef(0);

  const [cursorState, setCursorState] = useState<'grab' | 'grabbing'>('grab');

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

  // Manual animation loop with smooth velocity changes
  useEffect(() => {
    let animationFrameId: number;

    // Calculate container width with retry logic
    const calculateWidth = () => {
      const containerWidth = containerRef.current?.scrollWidth || 0;
      if (containerWidth === 0) {
        // Retry after a frame if width is 0
        requestAnimationFrame(calculateWidth);
        return;
      }
      halfWidthRef.current = containerWidth / 2;
      // Start animation once we have width
      animationFrameId = requestAnimationFrame(animate);
    };

    const animate = () => {
      const now = Date.now();
      const deltaTime = Math.min(now - lastTimeRef.current, 33.33) / 16.67; // Cap at 2 frames
      lastTimeRef.current = now;

      // Apply momentum deceleration if not dragging
      if (!isDraggingRef.current && Math.abs(momentumRef.current) > 0.01) {
        momentumRef.current *= 0.95; // Decay factor for smooth deceleration
        positionRef.current += momentumRef.current * deltaTime;
      } else if (!isDraggingRef.current) {
        momentumRef.current = 0;

        // Smooth velocity transition for auto-scroll (using refs to avoid re-renders)
        const velocityDiff = targetVelocityRef.current - velocityRef.current;
        if (Math.abs(velocityDiff) >= 0.01) {
          velocityRef.current += velocityDiff * 0.08;
        } else {
          velocityRef.current = targetVelocityRef.current;
        }

        // Update position with auto-scroll velocity
        positionRef.current += velocityRef.current * deltaTime;
      }

      // Loop when we've scrolled 50% (seamless infinite scroll)
      if (positionRef.current <= -halfWidthRef.current) {
        positionRef.current = 0;
      } else if (positionRef.current > 0) {
        positionRef.current = -halfWidthRef.current;
      }

      // Direct DOM manipulation for better performance
      if (containerRef.current) {
        containerRef.current.style.transform = `translateX(${positionRef.current}px)`;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    calculateWidth();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []); // Empty deps - only run once

  const handleMouseEnter = () => {
    targetVelocityRef.current = 0; // Slow to complete halt
  };

  const handleMouseLeave = () => {
    targetVelocityRef.current = -1; // Back to normal speed
  };

  // Drag handlers
  const handleDragStart = (clientX: number) => {
    isDraggingRef.current = true;
    dragStartXRef.current = clientX;
    dragStartPositionRef.current = positionRef.current;
    lastDragXRef.current = clientX;
    lastDragTimeRef.current = Date.now();
    dragDistanceRef.current = 0;
    momentumRef.current = 0;
    setCursorState('grabbing');
    // Pause auto-scroll
    targetVelocityRef.current = 0;
  };

  const handleDragMove = (clientX: number) => {
    if (!isDraggingRef.current) return;

    const now = Date.now();
    const deltaX = clientX - lastDragXRef.current;
    const deltaTime = now - lastDragTimeRef.current;

    // Update position directly during drag
    const totalDragDistance = clientX - dragStartXRef.current;
    positionRef.current = dragStartPositionRef.current + totalDragDistance;

    // Calculate velocity for momentum
    if (deltaTime > 0) {
      dragVelocityRef.current = deltaX / (deltaTime / 16.67); // Normalize to 60fps
    }

    lastDragXRef.current = clientX;
    lastDragTimeRef.current = now;
    dragDistanceRef.current = Math.abs(totalDragDistance);
  };

  const handleDragEnd = () => {
    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;
    setCursorState('grab');

    // Apply momentum based on drag velocity
    const velocityMagnitude = Math.abs(dragVelocityRef.current);
    if (velocityMagnitude > 0.5) {
      // Apply momentum with capping to prevent too fast scrolling
      momentumRef.current = Math.max(
        Math.min(dragVelocityRef.current, 10),
        -10
      );
    } else {
      // Resume auto-scroll if no significant momentum
      targetVelocityRef.current = -1;
    }

    dragVelocityRef.current = 0;
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleDragStart(e.touches[0].clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleDragMove(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Global mouse handlers (for when mouse leaves carousel)
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        handleDragMove(e.clientX);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDraggingRef.current) {
        handleDragEnd();
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  const handleVideoPlay = (celebrity: CelebrityEndorsement) => {
    // Prevent video modal from opening if user was dragging
    if (dragDistanceRef.current > 5) {
      dragDistanceRef.current = 0;
      return;
    }

    setModalVideo({
      isOpen: true,
      videoId: celebrity.videoId,
      title: `${celebrity.name} supports PerhitSiksha`,
      celebrityName: celebrity.name,
    });
    // Pause carousel when modal opens
    targetVelocityRef.current = 0;
  };

  const handleModalClose = () => {
    setModalVideo({
      isOpen: false,
      videoId: '',
      title: '',
      celebrityName: '',
    });
    // Resume carousel when modal closes
    targetVelocityRef.current = -1;
  };

  const getYouTubeShortThumbnail = (videoId: string) => {
    // YouTube Shorts thumbnails - use sddefault for better Shorts compatibility
    return `https://img.youtube.com/vi/${videoId}/sddefault.jpg`;
  };

  return (
    <div className="relative overflow-hidden select-none">
      {/* Carousel Container */}
      <div
        className="flex gap-4 pb-4"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: cursorState }}
      >
        <div
          ref={containerRef}
          className="flex gap-4"
          style={{
            willChange: 'transform',
            userSelect: 'none',
          }}
        >
          {duplicatedEndorsements.map((celebrity, index) => (
            <div key={`${celebrity.id}-${index}`} className="flex-none w-64">
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
                      // Fallback to hqdefault if sddefault fails
                      const target = e.target as HTMLImageElement;
                      if (target.src.includes('sddefault')) {
                        target.src = `https://img.youtube.com/vi/${celebrity.videoId}/hqdefault.jpg`;
                      } else if (target.src.includes('hqdefault')) {
                        // Final fallback
                        target.src = `https://img.youtube.com/vi/${celebrity.videoId}/default.jpg`;
                      }
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
