import { useId, useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/gsap';

export interface PlayButtonProps {
  className?: string;
  size?: number;
  ariaLabel?: string;
}

/**
 * Circular white play button, drop-in as an overlay on a video thumbnail.
 * On hover the play triangle morphs into a soft blob (and back on leave).
 * Under reduced-motion the triangle stays static.
 */
const PlayButton = ({
  className = '',
  size = 64,
  ariaLabel = 'Play video',
}: PlayButtonProps) => {
  const groupRef = useRef<HTMLButtonElement>(null);
  const triangleRef = useRef<SVGPathElement>(null);
  const uid = useId().replace(/:/g, '');
  const blobId = `play-blob-${uid}`;

  useGSAP(
    () => {
      const group = groupRef.current;
      const triangle = triangleRef.current;
      if (!group || !triangle) return;
      if (prefersReducedMotion()) return;

      const mm = gsap.matchMedia();
      mm.add('(hover: hover)', () => {
        const enter = () =>
          gsap.to(triangle, {
            morphSVG: `#${blobId}`,
            duration: 0.4,
            ease: 'spring',
          });
        const leave = () =>
          gsap.to(triangle, {
            morphSVG: triangle,
            duration: 0.4,
            ease: 'spring',
          });

        group.addEventListener('mouseenter', enter);
        group.addEventListener('mouseleave', leave);

        return () => {
          group.removeEventListener('mouseenter', enter);
          group.removeEventListener('mouseleave', leave);
        };
      });
    },
    { scope: groupRef }
  );

  return (
    <button
      ref={groupRef}
      type="button"
      aria-label={ariaLabel}
      style={{ width: size, height: size }}
      className={`inline-flex items-center justify-center rounded-full bg-white text-primary-500 shadow-lg transition-shadow hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        width="45%"
        height="45%"
        aria-hidden="true"
        focusable="false"
      >
        {/* Hidden morph target: a soft blob. */}
        <path
          id={blobId}
          d="M12 4 C16 4 20 6 20 12 C20 18 16 20 12 20 C8 20 4 18 4 12 C4 6 8 4 12 4 Z"
          fill="currentColor"
          style={{ visibility: 'hidden' }}
        />
        {/* Visible, morphable play triangle. */}
        <path ref={triangleRef} d="M8 5 L8 19 L19 12 Z" fill="currentColor" />
      </svg>
    </button>
  );
};

export default PlayButton;
