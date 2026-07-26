import React, { useState, useRef } from 'react';
import VideoModal from './VideoModal';
import PlayButton from './PlayButton';
import { useLanguage } from '../../i18n/useLanguage';
import { gsap, useGSAP, Observer, prefersReducedMotion } from '../../lib/gsap';
import type { Testimonial } from '../../types';

interface PeekCarouselProps {
  testimonials: Testimonial[];
}

const PeekCarousel: React.FC<PeekCarouselProps> = ({ testimonials }) => {
  const { lang } = useLanguage();
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

  // Observer-driven snap: a wheel/touch flick snaps to the next/prev card.
  // Native overflow scroll still works for fine control; manual touch handlers
  // are intentionally gone to avoid double-binding.
  useGSAP(
    () => {
      const el = carouselRef.current;
      if (!el) return;
      if (prefersReducedMotion()) return;

      const cardStep = () => {
        const first = el.querySelector<HTMLElement>('[data-peek-card]');
        const gap = 32; // matches the gap-8 gutter below (DS --layout-gutter)
        return first ? first.offsetWidth + gap : el.clientWidth * 0.8;
      };

      let animating = false;
      const snap = (dir: number) => {
        if (animating) return;
        const max = el.scrollWidth - el.clientWidth;
        const target = gsap.utils.clamp(
          0,
          max,
          el.scrollLeft + dir * cardStep()
        );
        animating = true;
        gsap.to(el, {
          scrollTo: { x: target },
          duration: 0.6,
          ease: 'spring',
          onComplete: () => {
            animating = false;
          },
        });
      };

      const observer = Observer.create({
        target: el,
        type: 'wheel,touch',
        // Drag/scroll left → advance; right → go back.
        onLeft: () => snap(1),
        onRight: () => snap(-1),
        tolerance: 20,
        preventDefault: false,
      });

      return () => observer.kill();
    },
    { scope: carouselRef, dependencies: [testimonials.length] }
  );

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

  return (
    <div className="relative">
      {/* Mobile & Desktop - Peek Carousel */}
      <div className="relative">
        <div
          ref={carouselRef}
          className="flex gap-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 px-4"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            scrollPaddingLeft: '1rem',
            scrollPaddingRight: '1rem',
          }}
        >
          {testimonials.map(testimonial => (
            <article
              key={testimonial.id}
              data-peek-card
              className="flex-none w-[80%] sm:w-72 md:w-80 snap-start"
            >
              {/* Video Container */}
              <div
                className="relative mb-4 bg-gray-900 rounded-2xl overflow-hidden shadow-lg"
                style={{ aspectRatio: '16/9' }}
              >
                <div
                  className="relative w-full h-full cursor-pointer group"
                  onClick={() => handleVideoPlay(testimonial)}
                >
                  {/* Thumbnail */}
                  <img
                    src={getYouTubeThumbnail(testimonial.youtubeId!)}
                    alt={`${testimonial.name} testimonial`}
                    className="w-full h-full object-cover photo-grade"
                    onError={e => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://img.youtube.com/vi/${testimonial.youtubeId}/hqdefault.jpg`;
                    }}
                  />

                  {/* Overlay with play button */}
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center group-hover:bg-opacity-40 transition-all duration-200">
                    <PlayButton
                      size={64}
                      ariaLabel={`Play ${testimonial.name} testimonial`}
                    />
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
                  {/* One consistent accent per surface, not a role-keyed
                      rainbow (audit pe-702 gap #10 — DS never mixes hues
                      in one frame). */}
                  <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary-50 text-primary-600">
                    {testimonial.role}
                  </span>
                  <span className="text-sm text-gray-600">
                    {testimonial.location}
                  </span>
                </div>
                <blockquote className="text-sm text-gray-600 italic leading-relaxed line-clamp-3">
                  "{testimonial.quote[lang] ?? testimonial.quote.en}"
                </blockquote>
              </div>
            </article>
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
        <div className="glass-chip flex items-center text-sm text-gray-700 px-3 py-1 rounded-full shadow-sm">
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
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
