import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Hero from '../components/ui/Hero';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import VideoModal from '../components/ui/VideoModal';
import PlayButton from '../components/ui/PlayButton';
import { useLanguage } from '../i18n/useLanguage';
import type { Testimonial } from '../types';
import { FaStar } from 'react-icons/fa';
import { gsap, useGSAP, ScrollTrigger } from '../lib/gsap';

// Import data
import testimonialsData from '../data/testimonials.json';

// Import images
import testimonialsHeroBg from '../assets/images/testimonials-hero-bg.png';
import emptyStateIllustration from '../assets/images/illustrations/empty-state.png';

const Testimonials: React.FC = () => {
  const { t } = useTranslation(['testimonials', 'common']);
  const { lang } = useLanguage();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState<
    Testimonial[]
  >([]);
  const [featuredTestimonials, setFeaturedTestimonials] = useState<
    Testimonial[]
  >([]);
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [modalVideo, setModalVideo] = useState<{
    isOpen: boolean;
    videoId: string;
    title: string;
    celebrityName: string;
  }>({
    isOpen: false,
    videoId: '',
    title: '',
    celebrityName: '',
  });

  const rootRef = useRef<HTMLDivElement>(null);
  const featuredWrapRef = useRef<HTMLDivElement>(null);
  const featuredTextRef = useRef<HTMLDivElement>(null);

  const roles = ['All', 'Student', 'Parent', 'Mentor', 'Contributor'];

  useEffect(() => {
    const typedTestimonials = testimonialsData as Testimonial[];
    setTestimonials(typedTestimonials);
    setFilteredTestimonials(typedTestimonials);
    setFeaturedTestimonials(typedTestimonials.filter(t => t.featured));
  }, []);

  useEffect(() => {
    if (selectedRole === 'All') {
      setFilteredTestimonials(testimonials);
    } else {
      setFilteredTestimonials(
        testimonials.filter(testimonial => testimonial.role === selectedRole)
      );
    }
  }, [testimonials, selectedRole]);

  // GSAP layer: pin the featured text column, scrub-parallax the grid
  // portraits, and stagger-reveal the grid cards. All matchMedia-gated so
  // reduced-motion gets static end-states.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Pin the left featured text column while the right cards scroll (lg+).
      mm.add(
        '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
        () => {
          if (!featuredWrapRef.current || !featuredTextRef.current) return;
          const st = ScrollTrigger.create({
            trigger: featuredWrapRef.current,
            start: 'top 120px',
            end: 'bottom bottom',
            pin: featuredTextRef.current,
            pinSpacing: false,
          });
          return () => st.kill();
        }
      );

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Vertical scrub parallax on grid portraits (frames are overflow-hidden).
        const portraits = gsap.utils.toArray<HTMLElement>(
          '.parallax-portrait',
          rootRef.current
        );
        portraits.forEach(img => {
          gsap.fromTo(
            img,
            { yPercent: -15, scale: 1.5 },
            {
              yPercent: 15,
              scale: 1.5,
              ease: 'none',
              scrollTrigger: {
                trigger: img,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            }
          );
        });

        // Staggered reveal of grid cards.
        const cards = gsap.utils.toArray<HTMLElement>(
          '.reveal-card',
          rootRef.current
        );
        if (cards.length) {
          gsap.set(cards, { autoAlpha: 0, y: 50 });
          const batch = ScrollTrigger.batch('.reveal-card', {
            start: 'top 85%',
            once: true,
            onEnter: b =>
              gsap.to(b, {
                y: 0,
                autoAlpha: 1,
                stagger: 0.1,
                ease: 'spring',
                duration: 0.7,
              }),
          });
          return () => batch.forEach(st => st.kill());
        }
      });

      ScrollTrigger.refresh();
    },
    {
      scope: rootRef,
      dependencies: [filteredTestimonials, featuredTestimonials],
    }
  );

  const handleRoleFilter = (role: string) => {
    setSelectedRole(role);
  };

  const handleVideoPlay = (testimonial: Testimonial) => {
    setModalVideo({
      isOpen: true,
      videoId: testimonial.youtubeId!,
      title: `${testimonial.name} - ${testimonial.role}`,
      celebrityName: testimonial.name,
    });
  };

  const handleModalClose = () => {
    setModalVideo({
      isOpen: false,
      videoId: '',
      title: '',
      celebrityName: '',
    });
  };

  const getYouTubeThumbnail = (videoId: string) => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  return (
    <div ref={rootRef}>
      {/* Hero Section */}
      <Hero
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        backgroundImage={testimonialsHeroBg}
        overlay={true}
      />

      {/* Featured Testimonials Section — 2 columns: pinned text + scrolling cards */}
      <section className="bg-white section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div
            ref={featuredWrapRef}
            className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-12 items-start"
          >
            {/* Left: pinned intro text */}
            <div ref={featuredTextRef} className="lg:py-8">
              <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide mb-2">
                {t('featured.eyebrow')}
              </p>
              <h2 className="heading-2 mb-4">{t('featured.title')}</h2>
              <p className="body-large text-gray-600 max-w-xl">
                {t('featured.subtitle')}
              </p>
            </div>

            {/* Right: scrolling featured cards */}
            <div className="space-y-8">
              {featuredTestimonials.slice(0, 2).map(testimonial => (
                <article key={testimonial.id}>
                  <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300">
                    {/* Video Preview */}
                    <div className="relative aspect-video bg-gray-900">
                      <img
                        src={getYouTubeThumbnail(testimonial.youtubeId!)}
                        alt={`${testimonial.name} testimonial`}
                        className="w-full h-full object-cover"
                        onError={e => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://img.youtube.com/vi/${testimonial.youtubeId}/hqdefault.jpg`;
                        }}
                      />

                      {/* Play Button Overlay */}
                      <div
                        className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center cursor-pointer group-hover:bg-opacity-50 transition-all duration-200"
                        onClick={() => handleVideoPlay(testimonial)}
                      >
                        <PlayButton
                          size={80}
                          ariaLabel={`Play ${testimonial.name} testimonial`}
                        />
                      </div>

                      {/* Featured Badge — orange signature pill (v3 .featured-tag),
                          the one deliberate exception to "orange never a button"
                          since this is a status tag, not a CTA. */}
                      <div className="absolute top-4 left-4">
                        <div className="flex items-center gap-1 bg-[#FF7300] text-[#141313] px-3 py-1 rounded-full text-sm font-bold">
                          <FaStar className="w-3 h-3" />
                          {t('featured.badge')}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                          {testimonial.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {testimonial.name}
                          </h3>
                          {/* One consistent accent per surface, not a
                              role-keyed rainbow (audit pe-702 gap #10). */}
                          <span className="inline-block mt-1 px-2.5 py-0.5 text-xs font-bold rounded-full bg-gray-100 text-gray-600">
                            {testimonial.role}
                          </span>
                        </div>
                      </div>

                      <blockquote className="text-gray-700 leading-relaxed">
                        <span className="text-[#FF7300] font-bold mr-1">
                          &ldquo;
                        </span>
                        {testimonial.quote[lang] ?? testimonial.quote.en}
                      </blockquote>
                    </div>
                  </Card>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-gray-50 py-8 border-b">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {t('filters.title')}
              </h2>
              <p className="text-gray-600">{t('filters.subtitle')}</p>
            </div>

            <div className="flex gap-2 flex-wrap">
              {roles.map(role => (
                <button
                  key={role}
                  onClick={() => handleRoleFilter(role)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${
                    // Deliberate orange signature accent on the active filter
                    // chip (v3 .chip.active) — a specifically-called-out
                    // exception to "orange never a button" (V3_DESIGN_FIDELITY_SPEC.md).
                    selectedRole === role
                      ? 'bg-[#FF7300] text-[#141313] border-[#FF7300]'
                      : 'bg-white text-gray-900 border-gray-200 hover:border-[#FF7300] hover:text-[#FF7300]'
                  }`}
                >
                  {t(`filters.roles.${role.toLowerCase()}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {t('filters.showing', { count: filteredTestimonials.length })}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              {t('filters.clickToWatch')}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Grid */}
      <section className="bg-gray-50 section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          {filteredTestimonials.length === 0 ? (
            <div className="flex flex-col items-center text-center py-16 max-w-md mx-auto">
              <img
                src={emptyStateIllustration}
                alt=""
                aria-hidden="true"
                className="w-48 sm:w-60 mb-4"
              />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t('empty.title')}
              </h3>
              <p className="text-gray-600">{t('empty.subtitle')}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTestimonials.map(testimonial => (
                <article key={testimonial.id} className="reveal-card">
                  <Card
                    className="overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => handleVideoPlay(testimonial)}
                  >
                    {/* Video Thumbnail */}
                    <div className="relative aspect-video bg-gray-900 overflow-hidden">
                      <img
                        src={getYouTubeThumbnail(testimonial.youtubeId!)}
                        alt={`${testimonial.name} testimonial`}
                        className="parallax-portrait absolute inset-0 w-full h-full object-cover"
                        onError={e => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://img.youtube.com/vi/${testimonial.youtubeId}/hqdefault.jpg`;
                        }}
                      />

                      {/* Play Button */}
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center group-hover:bg-opacity-40 transition-all duration-200">
                        <PlayButton
                          size={48}
                          ariaLabel={`Play ${testimonial.name} testimonial`}
                        />
                      </div>

                      {/* Featured Badge — orange signature pill (v3 .featured-tag),
                          the one deliberate exception to "orange never a button"
                          since this is a status tag, not a CTA. */}
                      {testimonial.featured && (
                        <div className="absolute top-3 left-3">
                          <div className="bg-[#FF7300] text-[#141313] text-xs px-2.5 py-1 rounded-full font-bold">
                            {t('featured.badge')}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start gap-2 mb-3">
                        <div className="w-8 h-8 flex-none bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {testimonial.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm">
                            {testimonial.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {testimonial.role} &middot; {testimonial.location}
                          </p>
                          {/* One consistent accent per surface, not a
                              role-keyed rainbow (audit pe-702 gap #10). */}
                          <span className="inline-block mt-1 px-2.5 py-0.5 text-xs font-bold rounded-full bg-gray-100 text-gray-600">
                            {testimonial.role}
                          </span>
                        </div>
                      </div>

                      <blockquote className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                        {testimonial.quote[lang] ?? testimonial.quote.en}
                      </blockquote>
                    </div>
                  </Card>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Closing CTA — rounded floating card in a page-ground gutter (v3
          .cta-inner), not the old full-bleed band; mirrors Home's
          joinMission closing-card treatment. */}
      <section className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto container-padding">
          <div className="rounded-2xl bg-primary-500 text-white shadow-xl p-8 sm:p-12 text-center">
            <h2 className="heading-2 mb-4">{t('cta.title')}</h2>
            <p className="text-xl mb-8 text-primary-100">
              {t('cta.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="secondary"
                size="lg"
                className="text-primary-500 border-white hover:bg-white"
              >
                {t('cta.becomeContributor')}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                href="/about"
                className="text-gray-800 border-white hover:bg-gray-50"
              >
                {t('cta.learnMore')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <VideoModal
        isOpen={modalVideo.isOpen}
        onClose={handleModalClose}
        videoId={modalVideo.videoId}
        title={modalVideo.title}
        celebrityName={modalVideo.celebrityName}
      />
    </div>
  );
};

export default Testimonials;
