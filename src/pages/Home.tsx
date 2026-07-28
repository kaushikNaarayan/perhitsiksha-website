import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Hero from '../components/ui/Hero';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import YouTubeEmbed from '../components/ui/YouTubeEmbed';
import PeekCarousel from '../components/ui/PeekCarousel';
import EventsCarousel from '../components/ui/EventsCarousel';
import YouTubeShortsCarousel from '../components/ui/YouTubeShortsCarousel';
import ScrollProgress from '../components/ui/ScrollProgress';
import StatsCounter from '../components/ui/StatsCounter';
import {
  gsap,
  useGSAP,
  ScrollTrigger,
  prefersReducedMotion,
} from '../lib/gsap';
import { useDonationDrawer, DONATE_HREF } from '../context/DonationContext';
import type { Testimonial } from '../types';

// Import data
import testimonialsData from '../data/testimonials.json';
import facebookEventsData from '../data/facebook-events.json';
import celebrityEndorsementsData from '../data/celebrity-endorsements.json';
import type { Event } from '../types';

// Import images
import heroBgImage from '../assets/images/hero-bg.png';

const certificates = [
  {
    labelKey: 'incorporation',
    image: '/certificate-of-incorporation.jpg',
    link: 'https://drive.google.com/file/d/1ozwZyO0k4ZiZUWqoTQh60qHTI_w5K2L_/view',
  },
  {
    labelKey: 'certificate12A',
    image: '/12A-certificate.jpg',
    link: '/12A-certificate.pdf',
  },
  {
    labelKey: 'certificate80G',
    image: '/80G-certificate.jpg',
    link: '/80G-certificate.pdf',
  },
  {
    labelKey: 'csrRegistration',
    image: '/CSR-certificate.jpg',
    link: '/CSR-certificate.pdf',
  },
];

const Home: React.FC = () => {
  const { t } = useTranslation('home');
  const { open: openDonation } = useDonationDrawer();
  const [scholarTestimonials, setScholarTestimonials] = useState<Testimonial[]>(
    []
  );
  const [supporterTestimonials, setSupporterTestimonials] = useState<
    Testimonial[]
  >([]);
  const [certIndex, setCertIndex] = useState(0);
  const [certPaused, setCertPaused] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const certImgsRef = useRef<HTMLDivElement>(null);
  const certLinkRef = useRef<HTMLAnchorElement>(null);
  const certUnderlineRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Scholars = students (the "Lives Transformed" proof carousel).
    // Supporters = contributors / mentors / coordinators / parents — kept
    // in a distinct section so the two audiences are never intermixed.
    const all = testimonialsData as Testimonial[];
    setScholarTestimonials(
      all.filter(item => item.role === 'Student' && item.youtubeId)
    );
    setSupporterTestimonials(
      all.filter(item => item.role !== 'Student' && item.youtubeId)
    );
  }, []);

  // Auto-rotate certificates every 5s
  useEffect(() => {
    if (certPaused) return;
    const timer = setInterval(() => {
      setCertIndex(prev => (prev + 1) % certificates.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [certPaused]);

  const programs = [
    { id: 'financialAid' },
    { id: 'mentorship' },
    { id: 'careerGuidance' },
  ];

  // Page-level GSAP scope. Because it's scoped to rootRef, every ScrollTrigger
  // created here auto-reverts on unmount/route-change (SPA leak fix).
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Staggered reveal of the "What We Do" cards.
        const cards = gsap.utils.toArray<HTMLElement>(
          '.reveal-card',
          rootRef.current
        );
        let batch: ScrollTrigger[] = [];
        if (cards.length) {
          gsap.set(cards, { autoAlpha: 0, y: 50 });
          batch = ScrollTrigger.batch('.reveal-card', {
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
        }

        // Certificate "View certificate" underline micro-interaction.
        const link = certLinkRef.current;
        const underline = certUnderlineRef.current;
        const onEnter = () => {
          gsap.to(underline, {
            scaleX: 1,
            transformOrigin: 'left center',
            duration: 0.35,
            ease: 'power2.out',
          });
        };
        const onLeave = () => {
          gsap.to(underline, {
            scaleX: 0,
            transformOrigin: 'right center',
            duration: 0.35,
            ease: 'power2.in',
          });
        };
        if (link && underline) {
          gsap.set(underline, { scaleX: 0, transformOrigin: 'left center' });
          link.addEventListener('mouseenter', onEnter);
          link.addEventListener('mouseleave', onLeave);
        }

        return () => {
          batch.forEach(st => st.kill());
          if (link) {
            link.removeEventListener('mouseenter', onEnter);
            link.removeEventListener('mouseleave', onLeave);
          }
        };
      });

      // DrawSVG connectors between the What-We-Do cards (lg-only).
      mm.add(
        '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
        () => {
          const connectors = gsap.utils.toArray<SVGPathElement>(
            '.wwd-connector',
            rootRef.current
          );
          if (!connectors.length) return;
          const tween = gsap.from(connectors, {
            drawSVG: '0%',
            stagger: 0.2,
            ease: 'none',
            scrollTrigger: {
              trigger: connectors[0],
              start: 'top 90%',
              end: 'bottom 60%',
              scrub: true,
            },
          });
          return () => {
            tween.scrollTrigger?.kill();
            tween.kill();
          };
        }
      );

      // Recompute trigger positions once fonts / images / embeds settle.
      ScrollTrigger.refresh();
      const onLoad = () => ScrollTrigger.refresh();
      window.addEventListener('load', onLoad);
      return () => window.removeEventListener('load', onLoad);
    },
    {
      scope: rootRef,
      dependencies: [scholarTestimonials.length, supporterTestimonials.length],
    }
  );

  // Certificate carousel scale/fade transition, driven by certIndex.
  useGSAP(
    () => {
      const container = certImgsRef.current;
      if (!container) return;
      const imgs = gsap.utils.toArray<HTMLElement>(
        container.querySelectorAll('img')
      );
      if (!imgs.length) return;

      if (prefersReducedMotion()) {
        imgs.forEach((img, i) => {
          gsap.set(img, { autoAlpha: i === certIndex ? 1 : 0, scale: 1 });
        });
        return;
      }

      imgs.forEach((img, i) => {
        if (i === certIndex) {
          gsap.fromTo(
            img,
            { autoAlpha: 0, scale: 1.1 },
            { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'expo.out' }
          );
        } else {
          gsap.to(img, {
            autoAlpha: 0,
            scale: 0.9,
            duration: 0.5,
            ease: 'power2.out',
          });
        }
      });
    },
    { scope: certImgsRef, dependencies: [certIndex] }
  );

  return (
    <div ref={rootRef}>
      <ScrollProgress />
      {/* Hero Section */}
      <Hero
        title={t('hero.title')}
        subheadline={t('hero.subheadline')}
        subtitle={t('hero.subtitle')}
        showLogo={true}
        primaryCTA={{
          text: t('hero.primaryCta'),
          // Sentinel href: DonationDrawer intercepts clicks on a[href="#donate"]
          // and opens the drawer (we can't attach an onClick through Hero.tsx).
          href: DONATE_HREF,
        }}
        taxNote={t('common:taxNote')}
        stats={[]}
        backgroundImage={heroBgImage}
        overlay={false}
      />

      {/* Celebrated Voices — public figures who lent their voice (org's own YouTube-channel videos) */}
      {celebrityEndorsementsData.length > 0 && (
        <section className="bg-primary-50 border-y border-primary-100 pt-0 pb-16 sm:pb-20 lg:pb-24">
          <div className="max-w-6xl mx-auto container-padding text-center">
            <h2 className="heading-2 mb-0.5 sm:mb-1">
              {t('celebrityEndorsements.title')}
            </h2>
            <p className="body-large mb-2 sm:mb-3 prose-measure mx-auto">
              {t('celebrityEndorsements.subtitle')}
            </p>
            <YouTubeShortsCarousel endorsements={celebrityEndorsementsData} />
          </div>
        </section>
      )}

      {/* The Problem — why deserving students drop out */}
      <section className="bg-white section-fluid">
        <div className="max-w-3xl mx-auto container-padding text-center">
          <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide mb-2">
            {t('problem.eyebrow')}
          </p>
          <h2 className="heading-2 mb-6">{t('problem.title')}</h2>
          <p className="body-large text-gray-700 leading-relaxed mb-4 prose-measure mx-auto">
            {t('problem.body1')}
          </p>
          <p className="body-large text-gray-900 font-semibold leading-relaxed prose-measure mx-auto">
            {t('problem.body2')}
          </p>
        </div>
      </section>

      {/* Solution — How we bridge the gap */}
      <section className="bg-gray-50 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-8">
            <h2 className="heading-2 mb-2">{t('whatWeDo.title')}</h2>
            <p className="body-large max-w-2xl mx-auto mb-6">
              {t('whatWeDo.subtitle')}
            </p>

            {/* Programs Grid */}
            <div className="relative mb-8">
              {/* DrawSVG connectors between the 3 cards (lg-only, decorative) */}
              <svg
                aria-hidden="true"
                className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none z-0"
                viewBox="0 0 100 30"
                preserveAspectRatio="none"
                fill="none"
              >
                <path
                  className="wwd-connector"
                  d="M31 15 L35 15"
                  stroke="var(--blue-200, #0061EF)"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  className="wwd-connector"
                  d="M65 15 L69 15"
                  stroke="var(--blue-200, #0061EF)"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              <div className="relative z-10 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {programs.map(program => (
                  <Card
                    key={program.id}
                    className="reveal-card p-4 text-center"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {t(`programs.${program.id}.title`)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t(`programs.${program.id}.description`)}
                    </p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Video Introduction */}
            <div className="max-w-4xl mx-auto">
              <YouTubeEmbed
                videoId="-slFir-pGh0"
                title={t('whatWeDo.videoTitle')}
                lazyLoad={true}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Proof — Scholars ("Lives Transformed") */}
      {scholarTestimonials.length > 0 && (
        <section id="stories" className="bg-primary-50 section-fluid">
          <div className="max-w-6xl mx-auto container-padding text-center">
            <h2 className="heading-2 mb-4">{t('scholars.title')}</h2>
            <p className="body-large mb-8 prose-measure mx-auto">
              {t('scholars.subtitle')}
            </p>

            <PeekCarousel testimonials={scholarTestimonials} />

            <div className="mt-8">
              <Button href="/testimonials" variant="primary">
                {t('scholars.seeAll')}
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Trust — Our Supporters (contributors & mentors) */}
      {supporterTestimonials.length > 0 && (
        <section className="bg-gray-50 section-fluid">
          <div className="max-w-6xl mx-auto container-padding text-center">
            <h2 className="heading-2 mb-4">{t('supportersStories.title')}</h2>
            <p className="body-large mb-8 prose-measure mx-auto">
              {t('supportersStories.subtitle')}
            </p>

            <PeekCarousel testimonials={supporterTestimonials} />
          </div>
        </section>
      )}

      {/* Our Impact — full-bleed stats ribbon */}
      <section
        id="impact"
        className="w-full bg-primary-50 border-y border-primary-100 py-12 sm:py-16"
      >
        <div className="max-w-5xl mx-auto container-padding text-center">
          <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide mb-2">
            {t('impact.eyebrow')}
          </p>
          <h2 className="heading-2 mb-8">{t('impact.title')}</h2>
          <div className="grid grid-cols-2 gap-8 max-w-3xl mx-auto">
            <StatsCounter
              value={450}
              suffix="+"
              label={t('statsBand.successStories')}
              hoverTip={t('statsBand.successStoriesTip')}
            />
            <StatsCounter
              value={700}
              suffix="+"
              label={t('statsBand.globalContributors')}
              infoContent={t('statsBand.contributorsInfo')}
              infoLabel={t('statsBand.contributorsInfoLabel')}
            />
          </div>
        </div>
      </section>

      {/* Official Registration Announcement */}
      <section className="bg-white section-fluid">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 ring-1 ring-primary-400/20 shadow-xl">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>

            <div className="relative z-10 p-8 md:p-12 lg:p-16">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                {/* Certificate Carousel */}
                <div
                  className="lg:col-span-5"
                  onMouseEnter={() => setCertPaused(true)}
                  onMouseLeave={() => setCertPaused(false)}
                >
                  <div className="relative">
                    <a
                      ref={certLinkRef}
                      href={certificates[certIndex].link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group"
                    >
                      <div
                        ref={certImgsRef}
                        className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl"
                      >
                        {certificates.map((cert, i) => (
                          <img
                            key={cert.labelKey}
                            src={cert.image}
                            alt={t(`certificates.${cert.labelKey}`)}
                            style={{ opacity: i === certIndex ? 1 : 0 }}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ))}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <p className="text-white text-sm font-semibold drop-shadow-lg">
                            {t(
                              `certificates.${certificates[certIndex].labelKey}`
                            )}
                          </p>
                        </div>
                      </div>

                      {/* View certificate — underline micro-interaction */}
                      <span className="mt-3 inline-flex flex-col items-start text-white text-sm font-semibold">
                        {t('registration.viewCertificate')}
                        <span
                          ref={certUnderlineRef}
                          className="mt-0.5 h-0.5 w-full bg-white"
                          style={{ transformOrigin: 'left center' }}
                        />
                      </span>
                    </a>

                    {/* Prev/Next arrows */}
                    <button
                      onClick={e => {
                        e.preventDefault();
                        setCertIndex(
                          (certIndex - 1 + certificates.length) %
                            certificates.length
                        );
                      }}
                      className="group absolute left-2 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center text-white"
                      aria-label={t('registration.prevCertificate')}
                    >
                      <span className="w-8 h-8 rounded-full bg-black/30 group-hover:bg-black/50 flex items-center justify-center transition-colors">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </span>
                    </button>
                    <button
                      onClick={e => {
                        e.preventDefault();
                        setCertIndex((certIndex + 1) % certificates.length);
                      }}
                      className="group absolute right-2 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center text-white"
                      aria-label={t('registration.nextCertificate')}
                    >
                      <span className="w-8 h-8 rounded-full bg-black/30 group-hover:bg-black/50 flex items-center justify-center transition-colors">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </span>
                    </button>

                    {/* Dots */}
                    <div className="flex justify-center mt-3">
                      {certificates.map((cert, i) => (
                        <button
                          key={cert.labelKey}
                          onClick={() => setCertIndex(i)}
                          className="group min-w-[44px] min-h-[44px] flex items-center justify-center"
                          aria-label={t(`certificates.${cert.labelKey}`)}
                        >
                          <span
                            className={`block w-2 h-2 rounded-full transition-all ${i === certIndex ? 'bg-white scale-125' : 'bg-white/40 group-hover:bg-white/60'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Certificate Details */}
                <div className="lg:col-span-7">
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl leading-tight font-bold text-gray-900 mb-4">
                    {t('registration.title')}
                  </h2>
                  <p className="text-lg sm:text-xl text-white/90 max-w-2xl mb-8">
                    {t('registration.description')}
                  </p>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur ring-1 ring-white/20 flex items-center justify-center text-white">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {t('registration.cinNumber')}
                          </p>
                          <p className="text-xs text-white/80 font-mono">
                            U85500UP2025NPL237759
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur ring-1 ring-white/20 flex items-center justify-center text-white">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {t('registration.dateOfIncorporation')}
                          </p>
                          <p className="text-xs text-white/80">
                            December 6, 2025
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur ring-1 ring-white/20 flex items-center justify-center text-white">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {t('registration.panNumber')}
                          </p>
                          <p className="text-xs text-white/80 font-mono">
                            AAQCP4229F
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur ring-1 ring-white/20 flex items-center justify-center text-white">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {t('registration.tanNumber')}
                          </p>
                          <p className="text-xs text-white/80 font-mono">
                            LKNP13723D
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur ring-1 ring-white/20 flex items-center justify-center text-white">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {t('registration.csrRegistrationNumber')}
                          </p>
                          <p className="text-xs text-white/80 font-mono">
                            CSR00108984
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur ring-1 ring-white/20 flex items-center justify-center text-white">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {t('registration.csrCertifiedOn')}
                          </p>
                          <p className="text-xs text-white/80">April 1, 2026</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex flex-wrap gap-3">
                      {certificates.map((cert, i) => (
                        <a
                          key={cert.labelKey}
                          href={cert.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => {
                            e.preventDefault();
                            setCertIndex(i);
                            window.open(cert.link, '_blank');
                          }}
                          className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all shadow-lg hover:shadow-xl ${i === certIndex ? 'bg-white text-primary-600 hover:bg-white/90' : 'bg-white/10 text-white border border-white/30 hover:bg-white/20'}`}
                        >
                          {t(`certificates.${cert.labelKey}`)}
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Events */}
      <section className="bg-white section-fluid">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide mb-2">
              {t('events.eyebrow')}
            </p>
            <h2 className="heading-2">{t('events.title')}</h2>
          </div>

          <EventsCarousel
            events={facebookEventsData as Event[]}
            autoRotateInterval={4000}
          />
        </div>
      </section>

      {/* Final CTA — Fund a Scholar (contribution model + audience pathways) */}
      <section
        id="contribute"
        className="bg-primary-500 text-white section-fluid"
      >
        <div className="max-w-5xl mx-auto container-padding text-center">
          <h2 className="heading-2 mb-4">{t('joinMission.title')}</h2>
          <p className="text-lg sm:text-xl text-white leading-relaxed mb-10 prose-measure mx-auto">
            {t('joinMission.description')}
          </p>

          {/* How the contribution model works */}
          <p className="text-sm font-semibold text-white/80 uppercase tracking-wide mb-4">
            {t('joinMission.model.title')}
          </p>
          <div className="grid gap-4 sm:grid-cols-3 text-left mb-12">
            <div className="rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/20 p-6">
              <p className="text-2xl font-bold mb-1">
                {t('joinMission.model.amount')}
              </p>
              <p className="text-sm text-white/90">
                {t('joinMission.model.amountLabel')}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/20 p-6">
              <p className="text-lg font-bold mb-1">
                {t('joinMission.model.direct')}
              </p>
              <p className="text-sm text-white/90">
                {t('joinMission.model.directLabel')}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/20 p-6">
              <p className="text-lg font-bold mb-1">
                {t('joinMission.model.transparent')}
              </p>
              <p className="text-sm text-white/90">
                {t('joinMission.model.transparentLabel')}
              </p>
            </div>
          </div>

          {/* Two clear pathways: donors (primary) and families seeking support */}
          <div className="grid gap-6 md:grid-cols-2 text-left">
            <div className="rounded-2xl bg-white p-8 text-gray-900 shadow-xl">
              <h3 className="text-xl font-bold mb-2">
                {t('joinMission.donor.title')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('joinMission.donor.body')}
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={openDonation}
                magnetic
                attention
              >
                {t('joinMission.donor.cta')}
              </Button>
              <p className="mt-3 text-xs text-gray-500">
                {t('common:taxNote')}
              </p>
            </div>
            <div className="rounded-2xl bg-primary-600/40 ring-1 ring-white/20 p-8">
              <h3 className="text-xl font-bold mb-2 text-white">
                {t('joinMission.family.title')}
              </h3>
              <p className="text-white/90 mb-6">
                {t('joinMission.family.body')}
              </p>
              <Button
                variant="outline"
                size="lg"
                className="text-white border-white hover:bg-white hover:text-primary-500"
                href="https://wa.me/918317580423?text=Hi,%20I%20would%20like%20to%20request%20support%20for%20my%20child%27s%20education."
              >
                {t('joinMission.family.cta')}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
