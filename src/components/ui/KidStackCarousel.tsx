import React, { useRef, useState } from 'react';

interface KidStackCarouselProps {
  /** Anonymous/generic stock portraits only — no real student photos here.
   * Real students are gated behind pe-tsu until the ingested-application
   * pipeline (pe-dfm) lands. */
  images: string[];
  /** Accessible label for the whole region, e.g. "Students Perhitsiksha supports". */
  ariaLabel: string;
  className?: string;
}

/**
 * v3 "kid-stack" hero-media carousel: a swipeable stacked deck of generic
 * student portraits (drag / wheel / keyboard / dot-nav), modeled on
 * home-v3.html's `.kid-stack`. No names or per-slide copy — portraits are
 * interchangeable placeholders per the PM's no-fabrication gate.
 */
const KidStackCarousel: React.FC<KidStackCarouselProps> = ({
  images,
  ariaLabel,
  className = '',
}) => {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const count = images.length;
  const go = (delta: number) => {
    setIndex(prev => (prev + delta + count) % count);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(1);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 40) {
      go(deltaX < 0 ? 1 : -1);
    }
    touchStartX.current = null;
  };

  return (
    <div className={className}>
      <div
        id="kid-stack"
        role="region"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-media)] shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        {images.map((src, i) => {
          const offset = i - index;
          const isActive = offset === 0;
          return (
            <img
              key={src}
              src={src}
              alt={`Student ${i + 1} of ${count}`}
              aria-hidden={!isActive}
              className="absolute inset-0 h-full w-full object-cover transition-all duration-500 ease-out"
              style={{
                opacity: isActive ? 1 : 0,
                transform: isActive
                  ? 'scale(1) rotate(0deg)'
                  : `scale(0.92) translateX(${offset > 0 ? 6 : -6}%) rotate(${offset > 0 ? 2 : -2}deg)`,
                zIndex: isActive ? 2 : 1,
              }}
            />
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous student"
          aria-controls="kid-stack"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full border border-gray-200 text-gray-700 transition-colors hover:border-[var(--brand-signature)] hover:text-[var(--brand-signature)]"
        >
          <span aria-hidden="true">&lsaquo;</span>
        </button>

        <div
          role="tablist"
          aria-label="Choose a student"
          className="flex items-center gap-2"
        >
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show student ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === index
                  ? 'w-5 bg-[var(--brand-signature)]'
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next student"
          aria-controls="kid-stack"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full border border-gray-200 text-gray-700 transition-colors hover:border-[var(--brand-signature)] hover:text-[var(--brand-signature)]"
        >
          <span aria-hidden="true">&rsaquo;</span>
        </button>
      </div>
    </div>
  );
};

export default KidStackCarousel;
