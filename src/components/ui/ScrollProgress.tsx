import { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/gsap';

/**
 * Fixed reading-progress bar pinned to the top of the viewport.
 * Scales from 0 to full width as the page scrolls top-to-bottom.
 * Under reduced-motion the bar still tracks progress, but snaps instantly
 * (no scrub smoothing).
 */
const ScrollProgress = () => {
  const barRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const bar = barRef.current;
      if (!bar) return;

      gsap.set(bar, { scaleX: 0, transformOrigin: 'left center' });

      gsap.to(bar, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: prefersReducedMotion() ? true : 0.5,
        },
      });
    },
    { scope: barRef }
  );

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className="fixed top-0 inset-x-0 h-1 bg-primary-500 z-[60]"
      style={{ transformOrigin: 'left center' }}
    />
  );
};

export default ScrollProgress;
