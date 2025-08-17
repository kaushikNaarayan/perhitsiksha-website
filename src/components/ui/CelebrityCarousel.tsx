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
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (celebrities.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        (prevIndex + 1) % celebrities.length
      );
    }, interval);

    return () => clearInterval(timer);
  }, [celebrities.length, interval]);

  if (celebrities.length === 0) return null;

  const currentCelebrity = celebrities[currentIndex];

  return (
    <div className={`transition-all duration-500 ease-in-out ${className}`}>
      <span className="font-bold text-primary-500">{currentCelebrity.name}</span>
      <span>, </span>
      <span className="font-bold text-primary-500">{currentCelebrity.profession}</span>
      <span> supports our mission to democratise education.</span>
    </div>
  );
};

export default CelebrityCarousel;