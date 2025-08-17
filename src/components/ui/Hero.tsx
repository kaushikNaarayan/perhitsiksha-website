import React, { useState, useEffect, useRef } from 'react';
import type { HeroProps } from '../../types';
import Button from './Button';
import TypewriterText from './TypewriterText';

const Hero: React.FC<HeroProps> = ({
  title,
  subtitle,
  primaryCTA,
  secondaryCTA,
  stats,
  backgroundImage,
  overlay = true,
}) => {
  const [animatedStats, setAnimatedStats] = useState<Record<number, number>>({});
  const [isVisible, setIsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!stats) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible, stats]);

  useEffect(() => {
    if (!isVisible || !stats) return;

    stats.forEach((stat, index) => {
      let current = 0;
      const increment = stat.value / (2000 / 16); // 2 second duration, 60fps

      const timer = setInterval(() => {
        current += increment;
        if (current >= stat.value) {
          setAnimatedStats(prev => ({ ...prev, [index]: stat.value }));
          clearInterval(timer);
        } else {
          setAnimatedStats(prev => ({ ...prev, [index]: Math.floor(current) }));
        }
      }, 16);
    });
  }, [isVisible, stats]);
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center">
      {/* Background Image */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}
      
      {/* Overlay */}
      {overlay && (
        <div className="absolute inset-0 bg-black bg-opacity-40 z-10" />
      )}
      
      {/* Content */}
      <div className="relative z-20 text-center">
        {/* Semi-transparent text background for readability */}
        <div className={`${backgroundImage ? 'hero-content-box' : 'max-w-4xl mx-auto container-padding'}`}>
          <h1 className={`heading-1 mb-6 ${backgroundImage ? 'text-white' : 'text-gray-900'}`}>
            <TypewriterText 
              text={title} 
              className={backgroundImage ? 'text-white' : 'text-gray-900'}
              speed={75}
            />
          </h1>
          
          {subtitle && (
            <p className={`body-large mb-8 max-w-2xl mx-auto ${backgroundImage ? 'text-gray-100' : 'text-gray-600'}`}>
              {subtitle}
            </p>
          )}
          
          {(primaryCTA || secondaryCTA) && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {primaryCTA && (
                <Button
                  href={primaryCTA.href}
                  variant="primary"
                  size="lg"
                >
                  {primaryCTA.text}
                </Button>
              )}
              
              {secondaryCTA && (
                <Button
                  href={secondaryCTA.href}
                  variant={backgroundImage ? "secondary" : "outline"}
                  size="lg"
                >
                  {secondaryCTA.text}
                </Button>
              )}
            </div>
          )}

          {/* Impact Stats */}
          {stats && (
            <div ref={statsRef} className={`grid grid-cols-1 ${stats.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-6 mt-8 pt-6`}>
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-1 ${backgroundImage ? 'text-white' : 'text-primary-500'}`}>
                    {stat.prefix || ''}{(animatedStats[index] || 0).toLocaleString()}{stat.suffix || ''}
                  </div>
                  <div className={`text-sm md:text-base font-medium ${backgroundImage ? 'text-gray-200' : 'text-gray-600'}`}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;