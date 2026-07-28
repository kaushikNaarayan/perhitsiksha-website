import React, { useRef } from 'react';
import type { HeroEditorialProps } from '../../types';
import Button from './Button';
import { gsap, useGSAP, SplitText } from '../../lib/gsap';

/**
 * v3 "editorial hero": warm-white (--surface-page) ground, left-aligned copy
 * grid (eyebrow -> h1 w/ one orange-signature word -> lede -> CTA row ->
 * inline stats) with the hero media (photo-frame + kid-stack, or any other
 * node) as a right-hand grid column instead of a full-bleed background photo.
 * Shared so About/Testimonials can adopt the same warm-ground layout later.
 */
const HeroEditorial: React.FC<HeroEditorialProps> = ({
  eyebrow,
  title,
  accentWord,
  lede,
  primaryCTA,
  secondaryCTA,
  taxNote,
  stats,
  media,
}) => {
  const rootRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cascadeRef = useRef<HTMLDivElement>(null);

  const accentIndex = accentWord ? title.indexOf(accentWord) : -1;
  const titlePrefix = accentIndex >= 0 ? title.slice(0, accentIndex) : title;
  const titleSuffix =
    accentIndex >= 0 ? title.slice(accentIndex + accentWord.length) : '';
  const titleAccent = accentIndex >= 0 ? accentWord : '';

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
            autoAlpha: 0,
            stagger: 0.03,
            ease: 'back.out(1.7)',
          });
        }

        if (cascadeRef.current) {
          tl.from(
            cascadeRef.current.children,
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

        return () => split?.revert();
      });
    },
    { scope: rootRef, dependencies: [title, accentWord] }
  );

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden pt-24 pb-12 md:pt-32 md:pb-16"
      style={{ background: 'var(--surface-page)' }}
    >
      <div className="max-w-7xl mx-auto container-padding grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="text-left">
          <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide mb-3">
            {eyebrow}
          </p>
          <h1
            key={`${title}::${accentWord ?? ''}`}
            ref={titleRef}
            className="heading-1 text-gray-900 mb-4"
          >
            {titlePrefix}
            <span style={{ color: 'var(--brand-signature)' }}>
              {titleAccent}
            </span>
            {titleSuffix}
          </h1>

          <div ref={cascadeRef}>
            <p className="body-large text-gray-600 mb-6 max-w-xl">{lede}</p>

            {(primaryCTA || secondaryCTA) && (
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
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
                  <Button href={secondaryCTA.href} variant="outline" size="lg">
                    {secondaryCTA.text}
                  </Button>
                )}
              </div>
            )}

            {primaryCTA && taxNote && (
              <p className="text-xs text-gray-500 mb-6">{taxNote}</p>
            )}

            {stats && stats.length > 0 && (
              <div className="flex flex-wrap gap-8 mt-4 pt-6 border-t border-gray-200">
                {stats.map((stat, i) => (
                  <div key={i}>
                    <div className="text-2xl md:text-3xl font-bold text-primary-500 tabular-nums">
                      {stat.prefix}
                      {stat.value.toLocaleString()}
                      {stat.suffix}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {media && (
          <div className="relative flex justify-center lg:justify-end">
            <div className="w-full max-w-sm">{media}</div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroEditorial;
