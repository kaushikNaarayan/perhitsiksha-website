import React from 'react';
import type { HeroProps } from '../../types';
import Button from './Button';

const Hero: React.FC<HeroProps> = ({
  title,
  subtitle,
  primaryCTA,
  secondaryCTA,
  stats,
  backgroundImage,
  overlay = true,
}) => {
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
      <div className="relative z-20 max-w-4xl mx-auto text-center container-padding">
        {/* Semi-transparent text background for readability */}
        <div className={`${backgroundImage ? 'hero-content-box rounded-2xl p-8 shadow-2xl' : ''}`}>
          <h1 className={`heading-1 mb-6 ${backgroundImage ? 'text-white' : 'text-gray-900'}`}>
            {title}
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
            <div className={`grid grid-cols-1 ${stats.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-6 mt-8 pt-6 border-t border-gray-300 border-opacity-50`}>
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-1 ${backgroundImage ? 'text-white' : 'text-primary-500'}`}>
                    {stat.prefix || ''}{stat.value.toLocaleString()}{stat.suffix || ''}
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