import React from 'react';

export interface BlobProps {
  /** Fill colour. Any CSS colour or var(); defaults to the brand primary. */
  color?: string;
  /** Extra classes for positioning (absolute/inset), z-index, opacity, etc. */
  className?: string;
  /** Rendered width/height. Number -> px, or any CSS size string. */
  size?: number | string;
  /** Which of the built-in organic silhouettes to render (0-based). */
  variant?: 0 | 1 | 2;
}

/**
 * Blob — a soft, organic, decorative background shape (pe-1a4 B8).
 *
 * Renders a single rounded, youthful blob silhouette as an inline SVG fill.
 * Purely decorative: `aria-hidden` and non-interactive (via the `.blob-decor`
 * utility in index.css, which also softens/blurs it and dials it back in dark
 * mode). Colour defaults to the brand primary token so it stays on-palette.
 *
 * Positioning is the caller's job — pass `absolute`, inset offsets and a
 * z-index (e.g. `z-bg`/`z-base`) via `className`.
 */
const BLOB_PATHS: Record<0 | 1 | 2, string> = {
  // Rounded, gently lobed — reads friendly/youthful, no sharp corners.
  0: 'M46.1,-58.3C58.9,-49.2,68.1,-34.4,71.6,-18.3C75.1,-2.2,72.9,15.2,64.8,29.4C56.7,43.6,42.7,54.6,27.2,61.6C11.7,68.6,-5.3,71.6,-21.3,67.7C-37.3,63.8,-52.3,53,-61.7,38.6C-71.1,24.2,-74.9,6.2,-71.8,-10.3C-68.7,-26.8,-58.7,-41.8,-45.6,-51C-32.5,-60.2,-16.3,-63.6,0.4,-64.1C17,-64.6,34.1,-62.2,46.1,-58.3Z',
  1: 'M39.7,-52.6C50.9,-44.3,59.2,-31.9,63.8,-17.8C68.4,-3.7,69.3,12.1,63.7,25.2C58.1,38.3,46,48.7,32.4,55.9C18.8,63.1,3.7,67.1,-11.9,66.1C-27.5,65.1,-43.6,59.1,-54.6,47.7C-65.6,36.3,-71.5,19.5,-72,2.3C-72.5,-14.9,-67.6,-32.5,-56.7,-41.9C-45.8,-51.3,-28.9,-52.5,-13.6,-55.3C1.7,-58.1,15.4,-62.5,28.5,-60.6C41.6,-58.7,28.5,-60.9,39.7,-52.6Z',
  2: 'M43.5,-56.4C55.9,-47.7,64.4,-33.6,68.2,-18.3C72,-3,71.1,13.5,64.3,27.1C57.5,40.7,44.8,51.4,30.6,58.4C16.4,65.4,0.7,68.7,-15.6,66.5C-31.9,64.3,-48.8,56.6,-58.6,43.6C-68.4,30.6,-71.1,12.3,-68.6,-4.8C-66.1,-21.9,-58.4,-37.8,-46.4,-46.9C-34.4,-56,-17.2,-58.3,0.4,-58.8C18,-59.3,36,-65.1,43.5,-56.4Z',
};

const Blob: React.FC<BlobProps> = ({
  color = 'var(--brand-primary)',
  className = '',
  size = 320,
  variant = 0,
}) => {
  const dim = typeof size === 'number' ? `${size}px` : size;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="-80 -80 160 160"
      width={dim}
      height={dim}
      className={`blob-decor ${className}`.trim()}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={BLOB_PATHS[variant]} fill={color} />
    </svg>
  );
};

export default Blob;
