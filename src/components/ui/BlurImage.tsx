import React, { useEffect, useRef, useState } from 'react';

type BlurImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt: string;
};

/**
 * Drop-in <img> replacement with a lightweight blur-up load-in: the image
 * starts blurred + transparent and transitions to sharp/opaque once it has
 * loaded (CSS blur -> sharp + opacity). No external blurhash lib — the host
 * container's background acts as the placeholder while the bitmap decodes.
 *
 * Reduced-motion users simply get the sharp image with no transition (the
 * global reduced-motion CSS neutralises the transition duration).
 */
const BlurImage: React.FC<BlurImageProps> = ({
  className = '',
  onLoad,
  onError,
  ...rest
}) => {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  // Cached images may have already fired `load` before React attached the
  // handler — reconcile from `complete` on mount so they don't stay hidden.
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, []);

  return (
    <img
      ref={ref}
      {...rest}
      loading="lazy"
      decoding="async"
      className={`${className} motion-safe:transition-[filter,opacity] motion-safe:duration-700 motion-safe:ease-out ${
        loaded ? 'blur-0 opacity-100' : 'blur-md opacity-0'
      }`}
      onLoad={e => {
        setLoaded(true);
        onLoad?.(e);
      }}
      onError={e => {
        // Let the caller's fallback swap src; keep hidden until it loads.
        onError?.(e);
      }}
    />
  );
};

export default BlurImage;
