import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import VideoModal from './VideoModal';
import BlurImage from './BlurImage';
import { gsap, prefersReducedMotion, useGSAP } from '../../lib/gsap';

interface CelebrityEndorsement {
  id: string;
  name: string;
  videoId: string;
  profession: string;
}

interface YouTubeShortsCarouselProps {
  endorsements: CelebrityEndorsement[];
}

// Carousel interaction constants
const MAX_MOMENTUM_VELOCITY = 10; // Maximum velocity for momentum scrolling
const GHOST_CLICK_THRESHOLD = 5; // Minimum drag distance (px) to prevent click
const MOMENTUM_DECAY_RATE = 0.95; // Decay factor for smooth deceleration
const AUTO_SCROLL_VELOCITY = -1; // Default auto-scroll speed
const VELOCITY_THRESHOLD = 0.5; // Minimum velocity to apply momentum

const getYouTubeShortThumbnail = (
  videoId: string,
  quality: 'sddefault' | 'hqdefault' | 'default' = 'sddefault'
) => `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;

interface CelebrityVideoCardProps {
  celebrity: CelebrityEndorsement;
  isClone: boolean;
  isDragging: boolean;
  modalIsOpen: boolean;
  onPlay: (celebrity: CelebrityEndorsement) => void;
}

const CelebrityVideoCard: React.FC<CelebrityVideoCardProps> = ({
  celebrity,
  isClone,
  isDragging,
  modalIsOpen,
  onPlay,
}) => {
  const { t: tCelebrity } = useTranslation('celebrity');
  const { t: tCommon } = useTranslation('common');
  const mediaButtonRef = useRef<HTMLButtonElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const [thumbnailQuality, setThumbnailQuality] = useState<
    'sddefault' | 'hqdefault' | 'default' | 'unavailable'
  >('sddefault');
  const endorsementAlt = tCelebrity('endorsementAlt', { name: celebrity.name });

  useGSAP(
    () => {
      const mediaButton = mediaButtonRef.current;
      const cursor = cursorRef.current;
      if (!mediaButton || !cursor) return;

      const media = gsap.matchMedia();
      media.add(
        '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
        () => {
          const xTo = gsap.quickTo(cursor, 'x', {
            duration: 0.18,
            ease: 'power3.out',
          });
          const yTo = gsap.quickTo(cursor, 'y', {
            duration: 0.18,
            ease: 'power3.out',
          });
          const hide = () => {
            gsap.to(cursor, {
              autoAlpha: 0,
              scale: 0.86,
              duration: 0.16,
              ease: 'power3.out',
              overwrite: true,
            });
          };
          const show = () => {
            if (isDragging || modalIsOpen) return;
            gsap.to(cursor, {
              autoAlpha: 1,
              scale: 1,
              duration: 0.16,
              ease: 'power3.out',
              overwrite: true,
            });
          };
          const move = (event: PointerEvent) => {
            const bounds = mediaButton.getBoundingClientRect();
            xTo(event.clientX - bounds.left - 38);
            yTo(event.clientY - bounds.top - 38);
          };

          gsap.set(cursor, { autoAlpha: 0, scale: 0.86 });
          mediaButton.addEventListener('pointerenter', show);
          mediaButton.addEventListener('pointermove', move);
          mediaButton.addEventListener('pointerleave', hide);
          mediaButton.addEventListener('pointerdown', hide);
          mediaButton.addEventListener('pointercancel', hide);
          mediaButton.addEventListener('focus', hide);

          return () => {
            mediaButton.removeEventListener('pointerenter', show);
            mediaButton.removeEventListener('pointermove', move);
            mediaButton.removeEventListener('pointerleave', hide);
            mediaButton.removeEventListener('pointerdown', hide);
            mediaButton.removeEventListener('pointercancel', hide);
            mediaButton.removeEventListener('focus', hide);
          };
        }
      );

      return () => media.revert();
    },
    { dependencies: [isDragging, modalIsOpen], scope: mediaButtonRef }
  );

  const handleImageError = () => {
    setThumbnailQuality(current => {
      if (current === 'sddefault') return 'hqdefault';
      if (current === 'hqdefault') return 'default';
      return 'unavailable';
    });
  };

  return (
    <div className="flex-none w-64" aria-hidden={isClone || undefined}>
      <div className="pb-1.5 text-center">
        <h3 className="mb-0.5 text-base font-semibold text-[color:var(--ink-strong)] sm:text-lg">
          {celebrity.name}
        </h3>
        <p className="text-xs text-[color:var(--ink-body)] sm:text-sm">
          {celebrity.profession}
        </p>
      </div>

      <div
        className="relative w-full overflow-hidden rounded-xl bg-[color:var(--surface-muted)] shadow-lg"
        style={{ aspectRatio: '9 / 16' }}
      >
        <button
          ref={mediaButtonRef}
          type="button"
          tabIndex={isClone ? -1 : 0}
          aria-label={`${tCommon('carousel.playVideo')} — ${celebrity.name}`}
          className="play-cursor-target group relative h-full w-full cursor-pointer touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface-page)]"
          onClick={() => onPlay(celebrity)}
        >
          {thumbnailQuality === 'unavailable' ? (
            <span
              role="img"
              aria-label={endorsementAlt}
              className="absolute inset-0 bg-[color:var(--surface-muted)]"
            />
          ) : (
            <BlurImage
              src={getYouTubeShortThumbnail(
                celebrity.videoId,
                thumbnailQuality
              )}
              alt={endorsementAlt}
              width={256}
              height={455}
              className="h-full w-full object-cover"
              onError={handleImageError}
            />
          )}

          <span
            aria-hidden="true"
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 transition-all duration-200 group-hover:bg-black/40"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--surface-page)]/90 transition-transform duration-200 group-hover:scale-110">
              <svg
                className="ml-1 h-8 w-8 text-[color:var(--brand-ink)]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>

          <span className="absolute right-3 top-3 z-20 rounded bg-black/70 px-2 py-1 text-xs text-white">
            {tCelebrity('shortsLabel')}
          </span>

          <span
            ref={cursorRef}
            aria-hidden="true"
            role="presentation"
            className="pointer-events-none invisible absolute left-0 top-0 z-30 flex h-[76px] w-[76px] scale-[0.86] items-center justify-center rounded-[var(--radius-pill)] border-2 border-[color:var(--surface-page-light)] bg-[color:var(--brand-signature)] text-base font-bold leading-none text-[color:var(--on-orange)] opacity-0 shadow-lg"
          >
            {tCommon('carousel.play')}
          </span>
        </button>
      </div>
    </div>
  );
};

const YouTubeShortsCarousel: React.FC<YouTubeShortsCarouselProps> = ({
  endorsements,
}) => {
  const { t } = useTranslation('celebrity');
  const containerRef = useRef<HTMLDivElement>(null);
  // Gate the auto-scroll marquee on prefers-reduced-motion (audit pe-702 gap
  // #9) — this loop is a manual rAF/transform animation, not CSS, so the
  // global @media rule in index.css can't stop it; it needs its own check.
  const reducedMotionRef = useRef(prefersReducedMotion());
  const restVelocity = reducedMotionRef.current ? 0 : AUTO_SCROLL_VELOCITY;
  const targetVelocityRef = useRef(restVelocity);
  const velocityRef = useRef(restVelocity);
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
        momentumRef.current *= MOMENTUM_DECAY_RATE;
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
    targetVelocityRef.current = restVelocity;
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
    if (velocityMagnitude > VELOCITY_THRESHOLD) {
      // Apply momentum with capping to prevent too fast scrolling
      momentumRef.current = Math.max(
        Math.min(dragVelocityRef.current, MAX_MOMENTUM_VELOCITY),
        -MAX_MOMENTUM_VELOCITY
      );
    } else {
      // Resume auto-scroll if no significant momentum
      targetVelocityRef.current = restVelocity;
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

  // Keyboard navigation support
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      // Scroll right (opposite of visual direction)
      positionRef.current += 100;
      momentumRef.current = 5;
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      // Scroll left
      positionRef.current -= 100;
      momentumRef.current = -5;
    }
  };

  const handleVideoPlay = (celebrity: CelebrityEndorsement) => {
    // Prevent video modal from opening if user was dragging
    if (dragDistanceRef.current > GHOST_CLICK_THRESHOLD) {
      dragDistanceRef.current = 0;
      return;
    }

    setModalVideo({
      isOpen: true,
      videoId: celebrity.videoId,
      title: t('supportsMessage', { name: celebrity.name }),
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
    targetVelocityRef.current = restVelocity;
  };

  return (
    <div className="relative overflow-hidden select-none">
      {/* Carousel Container */}
      <div
        role="region"
        aria-label={t('carouselRegionAria')}
        aria-roledescription="carousel"
        tabIndex={0}
        className="flex gap-8 pb-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        style={{ cursor: cursorState }}
      >
        <div
          ref={containerRef}
          className="flex gap-8"
          style={{
            willChange: 'transform',
            userSelect: 'none',
          }}
        >
          {duplicatedEndorsements.map((celebrity, index) => (
            <CelebrityVideoCard
              key={`${celebrity.id}-${index}`}
              celebrity={celebrity}
              isClone={index >= endorsements.length}
              isDragging={cursorState === 'grabbing'}
              modalIsOpen={modalVideo.isOpen}
              onPlay={handleVideoPlay}
            />
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
