import React from 'react';
import spriteSparkle from '../../assets/images/sprites/01-sprite-sparkle.png';
import spriteStar from '../../assets/images/sprites/02-sprite-smiling-star.png';

interface PhotoFrameProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * v3 "hero-frame" decoration: a hand-drawn-style rotated orange frame sitting
 * behind the wrapped media, plus two floating sparkle/star sprites at the
 * corners. Pure decoration (aria-hidden) — shared by any hero variant that
 * needs the v3 layered-photo treatment (home-v3.html `.hero-frame`).
 */
const PhotoFrame: React.FC<PhotoFrameProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`relative ${className}`}>
      <div
        aria-hidden="true"
        className="absolute -inset-3 sm:-inset-4 rounded-[var(--radius-2xl)] border-4 border-[var(--brand-signature)] -rotate-2 pointer-events-none"
      />
      <img
        src={spriteSparkle}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -top-6 -left-5 w-12 h-12 sm:w-16 sm:h-16 drop-shadow z-10"
      />
      <img
        src={spriteStar}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-5 -right-6 w-10 h-10 sm:w-14 sm:h-14 drop-shadow z-10"
      />
      <div className="relative z-0">{children}</div>
    </div>
  );
};

export default PhotoFrame;
