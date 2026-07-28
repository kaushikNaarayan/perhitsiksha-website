import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FaHandHoldingHeart, FaUserFriends, FaBriefcase } from 'react-icons/fa';
import joinMissionIllustration from '../assets/images/illustrations/join-mission.png';
import HeroEditorial from '../components/ui/HeroEditorial';
import PhotoFrame from '../components/ui/PhotoFrame';
import KidStackCarousel from '../components/ui/KidStackCarousel';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import YouTubeEmbed from '../components/ui/YouTubeEmbed';
import PeekCarousel from '../components/ui/PeekCarousel';
import EventsCarousel from '../components/ui/EventsCarousel';
import YouTubeShortsCarousel from '../components/ui/YouTubeShortsCarousel';
import ScrollProgress from '../components/ui/ScrollProgress';
import StatBand from '../components/ui/StatBand';
import { gsap, useGSAP, ScrollTrigger } from '../lib/gsap';
import { useDonationDrawer, DONATE_HREF } from '../context/DonationContext';
import type { Testimonial } from '../types';

// Import data
import testimonialsData from '../data/testimonials.json';
import facebookEventsData from '../data/facebook-events.json';
import celebrityEndorsementsData from '../data/celebrity-endorsements.json';
import type { Event } from '../types';

// Generic/anonymous stock portraits for the hero "kid-stack" carousel — no
// real student photos here (real students are gated behind pe-tsu until the
// ingested-application pipeline, pe-dfm, lands).
import portraitFlower from '../assets/images/portraits/portrait-flower.jpg';
import portraitBook from '../assets/images/portraits/portrait-book.jpg';
import portraitStudy from '../assets/images/portraits/portrait-study.jpg';
import portraitSchoolgirl from '../assets/images/portraits/portrait-schoolgirl.jpg';
import portraitCollegegirl from '../assets/images/portraits/portrait-collegegirl.jpg';

const heroKidStackImages = [
  portraitFlower,
  portraitBook,
  portraitStudy,
  portraitSchoolgirl,
  portraitCollegegirl,
];

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
  const rootRef = useRef<HTMLDivElement>(null);

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

  // v3 assigns each program card its own tint (orange/blue/green) via a
  // `.card-chip` blob icon — see home-v3.html's `.card.orange/.blue/.green`.
  const programs = [
    {
      id: 'financialAid',
      tint: 'orange' as const,
      icon: FaHandHoldingHeart,
    },
    { id: 'mentorship', tint: 'blue' as const, icon: FaUserFriends },
    { id: 'careerGuidance', tint: 'green' as const, icon: FaBriefcase },
  ];

  const programChipTint: Record<string, string> = {
    orange: 'bg-[rgba(255,115,0,0.12)] text-[#FF7300]',
    blue: 'bg-primary-500/10 text-primary-600',
    green: 'bg-[rgba(1,166,82,0.12)] text-[#01A652]',
  };

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

        return () => {
          batch.forEach(st => st.kill());
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

  return (
    <div ref={rootRef}>
      <ScrollProgress />
      {/* Hero Section — v3 warm-white editorial layout: eyebrow -> headline
          (one orange-signature word) -> lede -> CTAs -> inline stats, with
          the kid-stack portrait carousel as a side media column instead of
          a full-bleed background photo. */}
      <HeroEditorial
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        accentWord={t('hero.accentWord')}
        lede={t('hero.lede')}
        primaryCTA={{
          text: t('hero.primaryCta'),
          // Sentinel href: DonationDrawer intercepts clicks on a[href="#donate"]
          // and opens the drawer (we can't attach an onClick through Hero.tsx).
          href: DONATE_HREF,
        }}
        taxNote={t('common:taxNote')}
        stats={[
          { value: 450, suffix: '+', label: t('statsBand.successStories') },
          {
            value: 700,
            suffix: '+',
            label: t('statsBand.globalContributors'),
          },
        ]}
        media={
          <PhotoFrame>
            <KidStackCarousel
              images={heroKidStackImages}
              ariaLabel="Students Perhitsiksha supports — swipe, drag, or use the arrow keys to browse"
            />
          </PhotoFrame>
        }
      />

      {/* Celebrated Voices — public figures who lent their voice (org's own YouTube-channel videos) */}
      {celebrityEndorsementsData.length > 0 && (
        <section className="bg-primary-50 border-y border-primary-100 pt-0 pb-16 sm:pb-20 lg:pb-24">
          <div className="max-w-6xl mx-auto container-padding text-center">
            <h2 className="heading-2 mb-0">
              {t('celebrityEndorsements.title')}
            </h2>
            <p className="body-large mb-6 sm:mb-8 prose-measure mx-auto">
              {t('celebrityEndorsements.subtitle')}
            </p>
            <Card className="p-4 sm:p-6" hover={false}>
              <YouTubeShortsCarousel endorsements={celebrityEndorsementsData} />
            </Card>
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
                {programs.map(program => {
                  const Icon = program.icon;
                  return (
                    <Card
                      key={program.id}
                      className="reveal-card p-6 text-center"
                    >
                      <span
                        className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-2xl ${programChipTint[program.tint]}`}
                        aria-hidden="true"
                      >
                        <Icon />
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {t(`programs.${program.id}.title`)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {t(`programs.${program.id}.description`)}
                      </p>
                    </Card>
                  );
                })}
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
      <section id="impact" className="w-full bg-primary-500 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto container-padding text-center">
          <p className="text-sm font-semibold text-white/80 uppercase tracking-wide mb-2">
            {t('impact.eyebrow')}
          </p>
          <h2 className="heading-2 mb-8 text-white">{t('impact.title')}</h2>
          <StatBand
            className="max-w-3xl mx-auto"
            numberClassName="text-white"
            labelClassName="text-white/80"
            items={[
              {
                value: 450,
                suffix: '+',
                label: t('statsBand.successStories'),
                hoverTip: t('statsBand.successStoriesTip'),
              },
              {
                value: 700,
                suffix: '+',
                label: t('statsBand.globalContributors'),
                infoContent: t('statsBand.contributorsInfo'),
                infoLabel: t('statsBand.contributorsInfoLabel'),
              },
              {
                display: t('statsBand.taxExemptDisplay'),
                label: t('statsBand.taxExempt'),
              },
              {
                display: t('statsBand.section8Display'),
                label: t('statsBand.registeredNgo'),
              },
            ]}
          />
        </div>
      </section>

      {/* Officially Registered — v3's calm, light 2-col treatment: copy +
          doc-chip pill row on the left, a static registered-facts card on
          the right. Content is a 1:1 match with the previous rotating
          carousel (same registration and certificates locale keys), this
          is a pure layout/visual swap per the design-fidelity spec. */}
      <section className="bg-white section-fluid">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide mb-2">
                {t('registration.title')}
              </p>
              <h2 className="heading-2 mb-4">{t('registration.title')}</h2>
              <p className="body-large text-gray-600 mb-8 max-w-xl">
                {t('registration.description')}
              </p>

              {/* Doc-chip pill row — links to each certificate/PDF */}
              <div className="flex flex-wrap gap-3">
                {certificates.map(cert => (
                  <a
                    key={cert.labelKey}
                    href={cert.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-gray-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-900 transition-colors hover:border-[#FF7300] hover:text-[#FF7300]"
                  >
                    {t(`certificates.${cert.labelKey}`)}
                  </a>
                ))}
              </div>
            </div>

            {/* Registered facts card */}
            <Card className="p-6 sm:p-8 bg-gray-50" hover={false}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                    {t('registration.cinNumber')}
                  </p>
                  <p className="font-bold text-gray-900 font-mono break-words">
                    U85500UP2025NPL237759
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                    {t('registration.panNumber')}
                  </p>
                  <p className="font-bold text-gray-900 font-mono">
                    AAQCP4229F
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                    {t('registration.tanNumber')}
                  </p>
                  <p className="font-bold text-gray-900 font-mono">
                    LKNP13723D
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                    {t('registration.csrRegistrationNumber')}
                  </p>
                  <p className="font-bold text-gray-900 font-mono">
                    CSR00108984
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                    {t('registration.dateOfIncorporation')}
                  </p>
                  <p className="font-bold text-gray-900">December 6, 2025</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                    {t('registration.csrCertifiedOn')}
                  </p>
                  <p className="font-bold text-gray-900">April 1, 2026</p>
                </div>
              </div>
            </Card>
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
          <h2 className="heading-2 mb-4 text-white">
            {t('joinMission.title')}
          </h2>
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

      {/* Closing strip — v3's simpler generic "Join our mission" band,
          reserved for the very final CTA (the donor/family two-pathway
          block above stays as its own, richer, WhatsApp-linked feature). */}
      <section className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto container-padding">
          <div className="rounded-2xl bg-primary-500 text-white shadow-xl overflow-hidden grid md:grid-cols-2 items-center">
            <div className="p-8 sm:p-12">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                {t('joinMission.title')}
              </h2>
              <p className="text-white/90 mb-6">
                {t('joinMission.description')}
              </p>
              <Button variant="secondary" size="lg" onClick={openDonation}>
                {t('joinMission.cta')}
              </Button>
            </div>
            <img
              src={joinMissionIllustration}
              alt=""
              aria-hidden="true"
              className="hidden md:block w-full h-full object-contain p-8"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
