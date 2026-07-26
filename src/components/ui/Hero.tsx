import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { HeroProps } from '../../types';
import Button from './Button';
import Blob from './Blob';
import { gsap, useGSAP, SplitText, prefersReducedMotion } from '../../lib/gsap';
import logoImage from '../../assets/images/logo.jpg';
import spriteSparkle from '../../assets/images/sprites/01-sprite-sparkle.png';
import spriteStar from '../../assets/images/sprites/02-sprite-smiling-star.png';

const Hero: React.FC<HeroProps> = ({
  title,
  subheadline,
  subtitle,
  showLogo = false,
  primaryCTA,
  secondaryCTA,
  taxNote,
  stats,
  backgroundImage,
  overlay = true,
}) => {
  const { t } = useTranslation('header');
  const [animatedStats, setAnimatedStats] = useState<Record<number, number>>(
    {}
  );
  const [isVisible, setIsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  const rootRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const spritesRef = useRef<HTMLDivElement>(null);

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

  // Hero entrance: SplitText char reveal on the h1, then a fade-up cascade of
  // the subheadline / subtitle / CTA. Floating sprites loop forever. All gated
  // by matchMedia so reduced-motion gets instant, static end-states.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline();
        let split: SplitText | null = null;

        if (titleRef.current) {
          split = new SplitText(titleRef.current, { type: 'chars' });
          tl.from(split.chars, {
            yPercent: 40,
            rotationX: -90,
            autoAlpha: 0,
            stagger: 0.04,
            transformOrigin: '0% 50% -50',
            ease: 'back.out(1.7)',
          });
        }

        const cascade = [
          subheadRef.current,
          subtitleRef.current,
          ctaRef.current,
        ].filter((el): el is NonNullable<typeof el> => el !== null);

        if (cascade.length) {
          tl.from(
            cascade,
            {
              y: 20,
              autoAlpha: 0,
              stagger: 0.12,
              duration: 0.6,
              ease: 'power2.out',
            },
            '-=0.25'
          );
        }

        // Infinite floating sprites + interactive hover pop.
        const sprites = spritesRef.current
          ? gsap.utils.toArray<HTMLElement>(spritesRef.current.children)
          : [];
        const canHover = window.matchMedia('(hover: hover)').matches;
        const spriteCleanups: Array<() => void> = [];

        sprites.forEach((s, i) => {
          gsap.to(s, {
            y: '-=20',
            duration: 2 + i * 0.35,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
            delay: i * 0.2,
          });

          // Hover pop: spin a full turn + scale up, then settle back to 1.
          // (Only on hover-capable pointers; reduced-motion is already excluded
          // by the enclosing matchMedia query.)
          if (canHover) {
            const onEnter = () => {
              gsap
                .timeline()
                .to(s, {
                  rotation: '+=360',
                  scale: 1.5,
                  duration: 0.4,
                  ease: 'back.out(2)',
                  overwrite: 'auto',
                })
                .to(s, {
                  scale: 1,
                  duration: 0.3,
                  ease: 'power2.out',
                });
            };
            s.addEventListener('mouseenter', onEnter);
            spriteCleanups.push(() =>
              s.removeEventListener('mouseenter', onEnter)
            );
          }
        });

        return () => {
          spriteCleanups.forEach(fn => fn());
          split?.revert();
        };
      });
    },
    { scope: rootRef, dependencies: [title] }
  );

  return (
    <section
      ref={rootRef}
      className="relative min-h-[60vh] flex items-center justify-center pt-20 md:pt-24 overflow-hidden"
    >
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

      {/* Overlay — dark scrim, above the bg image, below the sparkles/text. */}
      {overlay && (
        <div className="absolute inset-0 bg-black bg-opacity-40 z-base" />
      )}

      {/* Organic blob decor — soft, off-round colour washes anchored to the
          corners, well off the focal area. z-bg keeps them behind the bg
          image/overlay and every foreground layer (text, sprites). Purely
          decorative and non-interactive (Blob is aria-hidden + .blob-decor). */}
      <Blob
        variant={0}
        color="var(--brand-primary)"
        size="42vmax"
        className="absolute -top-[12%] -left-[14%] z-bg"
      />
      <Blob
        variant={2}
        color="var(--brand-signature)"
        size="34vmax"
        className="absolute -bottom-[16%] -right-[12%] z-bg"
      />

      {/* Floating decorative sprites (purely decorative). z-float sits above
          the bg image + overlay but below the hero text (z-20). */}
      {!prefersReducedMotion() && (
        <div
          ref={spritesRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-float"
        >
          <img
            src={spriteSparkle}
            alt=""
            className="pointer-events-auto cursor-pointer absolute w-10 h-10 md:w-14 md:h-14 top-[14%] left-[8%] drop-shadow"
          />
          <img
            src={spriteStar}
            alt=""
            className="pointer-events-auto cursor-pointer absolute w-12 h-12 md:w-16 md:h-16 top-[22%] right-[9%] drop-shadow"
          />
          <img
            src={spriteSparkle}
            alt=""
            className="pointer-events-auto cursor-pointer absolute w-8 h-8 md:w-12 md:h-12 bottom-[18%] left-[14%] drop-shadow"
          />
          <img
            src={spriteStar}
            alt=""
            className="pointer-events-auto cursor-pointer absolute w-9 h-9 md:w-12 md:h-12 bottom-[22%] right-[13%] drop-shadow"
          />
          <img
            src={spriteSparkle}
            alt=""
            className="pointer-events-auto cursor-pointer hidden md:block absolute w-8 h-8 top-[46%] left-[46%] drop-shadow"
          />
        </div>
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
                alt="Perhitsiksha Logo"
                className="w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 rounded-2xl object-cover shadow-lg"
              />
            </div>
          )}

          <h1
            ref={titleRef}
            aria-label={title}
            className={`${showLogo ? 'heading-2' : 'heading-1'} mb-4 ${backgroundImage ? 'text-white' : 'text-gray-900'}`}
          >
            {title}
          </h1>

          {subheadline && (
            <p
              ref={subheadRef}
              className={`text-lg md:text-xl font-semibold mb-6 ${backgroundImage ? 'text-white' : 'text-gray-900'}`}
            >
              {subheadline}
            </p>
          )}

          {subtitle && (
            <p
              ref={subtitleRef}
              className={`body-large font-normal opacity-80 mb-6 prose-measure mx-auto ${backgroundImage ? 'text-gray-100' : 'text-gray-600'}`}
            >
              {subtitle}
            </p>
          )}

          {(primaryCTA || secondaryCTA) && (
            <div
              ref={ctaRef}
              className="flex flex-col sm:flex-row gap-4 justify-center mt-6"
            >
              {primaryCTA && (
                <Button
                  href={primaryCTA.href}
                  variant="primary"
                  size="lg"
                  className="shimmer-btn"
                  magnetic
                  attention
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

          {/* 80G tax-exempt micro-copy directly under the primary CTA. */}
          {primaryCTA && taxNote && (
            <p
              className={`mt-3 text-xs ${backgroundImage ? 'text-white/70' : 'text-gray-500'}`}
            >
              {taxNote}
            </p>
          )}

          {/* Social Icons */}
          {primaryCTA && (
            <div className="flex justify-center space-x-6 mt-4">
              <a
                href="https://www.facebook.com/share/19uSggzByG/"
                className={`${backgroundImage ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-primary-500'} transition-colors duration-200`}
                aria-label={t('social.facebook')}
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
                href="https://www.youtube.com/@PerhitSikshaFoundation"
                className={`${backgroundImage ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-primary-500'} transition-colors duration-200`}
                aria-label={t('social.youtube')}
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
              <a
                href="https://www.instagram.com/perhit.siksha/"
                className={`${backgroundImage ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-primary-500'} transition-colors duration-200`}
                aria-label={t('social.instagram')}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          )}

          {/* Impact Stats */}
          {stats && stats.length > 0 && (
            <div
              ref={statsRef}
              className={`grid grid-cols-1 ${stats.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-6 mt-8 pt-6`}
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div
                    className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-1 tabular-nums ${backgroundImage ? 'text-white' : 'text-primary-500'}`}
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
