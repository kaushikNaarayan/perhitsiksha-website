import React, { useState, useEffect, useRef } from 'react';
import type { HeroProps } from '../../types';
import Button from './Button';
import TypewriterText from './TypewriterText';
import logoImage from '../../assets/images/logo.jpg';

const Hero: React.FC<HeroProps> = ({
  title,
  subheadline,
  subtitle,
  showLogo = false,
  primaryCTA,
  secondaryCTA,
  stats,
  backgroundImage,
  overlay = true,
}) => {
  const [animatedStats, setAnimatedStats] = useState<Record<number, number>>(
    {}
  );
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
    <section className="relative min-h-[60vh] flex items-center justify-center pt-20 md:pt-24">
      {/* Background Image */}
      {backgroundImage && (
        <div
          className="absolute inset-0 z-0 hero-background-image"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center left',
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
        <div
          className={`${backgroundImage ? 'hero-content-box' : 'max-w-4xl mx-auto container-padding'}`}
        >
          {/* Logo Section */}
          {showLogo && (
            <div className="mb-6 flex justify-center">
              <img
                src={logoImage}
                alt="CLSI Perhitsiksha Logo"
                className="w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 rounded-2xl object-cover shadow-lg"
              />
            </div>
          )}

          <h1
            className={`${showLogo ? 'heading-2' : 'heading-1'} mb-4 ${backgroundImage ? 'text-white' : 'text-gray-900'}`}
          >
            <TypewriterText
              text={title}
              className={backgroundImage ? 'text-white' : 'text-gray-900'}
              speed={75}
            />
          </h1>

          {subheadline && (
            <p
              className={`text-lg md:text-xl font-semibold mb-6 ${backgroundImage ? 'text-white' : 'text-gray-900'}`}
            >
              {subheadline}
            </p>
          )}

          {subtitle && (
            <p
              className={`body-large mb-6 max-w-2xl mx-auto ${backgroundImage ? 'text-gray-100' : 'text-gray-600'}`}
            >
              {subtitle}
            </p>
          )}

          {(primaryCTA || secondaryCTA) && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              {primaryCTA && (
                <Button
                  href={primaryCTA.href}
                  variant="primary"
                  size="lg"
                  className="shimmer-btn"
                >
                  {primaryCTA.text}
                </Button>
              )}

              {secondaryCTA && (
                <Button
                  href={secondaryCTA.href}
                  variant={backgroundImage ? 'secondary' : 'outline'}
                  size="lg"
                >
                  {secondaryCTA.text}
                </Button>
              )}
            </div>
          )}

          {/* Social Icons */}
          {primaryCTA && (
            <div className="flex justify-center space-x-6 mt-4">
              <a
                href="https://www.facebook.com/share/19uSggzByG/"
                className={`${backgroundImage ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-primary-500'} transition-colors duration-200`}
                aria-label="Follow us on Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@clsi-perhitsiksha"
                className={`${backgroundImage ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-primary-500'} transition-colors duration-200`}
                aria-label="Subscribe to our YouTube channel"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          )}

          {/* Impact Stats */}
          {stats && (
            <div
              ref={statsRef}
              className={`grid grid-cols-1 ${stats.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-6 mt-8 pt-6`}
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div
                    className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-1 ${backgroundImage ? 'text-white' : 'text-primary-500'}`}
                  >
                    {stat.prefix || ''}
                    {(Number(animatedStats[index]) || 0).toLocaleString()}
                    {stat.suffix || ''}
                  </div>
                  <div
                    className={`text-sm md:text-base font-medium ${backgroundImage ? 'text-gray-200' : 'text-gray-600'}`}
                  >
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
