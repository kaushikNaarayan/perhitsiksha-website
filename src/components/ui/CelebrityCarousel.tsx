import React, { useState, useEffect } from 'react';

interface Celebrity {
  name: string;
  profession: string;
}

interface CelebrityCarouselProps {
  celebrities: Celebrity[];
  interval?: number;
  className?: string;
}

const CelebrityCarousel: React.FC<CelebrityCarouselProps> = ({
  celebrities,
  interval = 2000,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (celebrities.length === 0) return;

    const timer = setInterval(() => {
      setIsFlipping(true);

      setTimeout(() => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % celebrities.length);
        setIsFlipping(false);
      }, 150); // Half of flip duration
    }, interval);

    return () => clearInterval(timer);
  }, [celebrities.length, interval]);

  if (celebrities.length === 0) return null;

  const currentCelebrity = celebrities[currentIndex];

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <span
        className={`inline-block bg-primary-500 text-white font-bold px-3 py-1 rounded-md transition-transform duration-300 ${
          isFlipping ? 'transform rotateX-180' : ''
        }`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipping ? 'rotateX(90deg)' : 'rotateX(0deg)',
        }}
      >
        {currentCelebrity.name}
      </span>
      <span>supports our mission to democratise education.</span>
    </div>
  );
};

export default CelebrityCarousel;
