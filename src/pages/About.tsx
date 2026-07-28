import React from 'react';
import { useTranslation } from 'react-i18next';
import HeroEditorial from '../components/ui/HeroEditorial';
import Card from '../components/ui/Card';
import StatBand from '../components/ui/StatBand';
import {
  FaCheckCircle,
  FaSeedling,
  FaGlobeAmericas,
  FaGraduationCap,
  FaLightbulb,
  FaPaperPlane,
  FaHeart,
  FaEnvelope,
  FaPhone,
} from 'react-icons/fa';
import Button from '../components/ui/Button';

// Hero decoration sprites (v3 about-v3.html .sprite/.float — sparkle, star,
// grad-cap, burst stand in for the mockup's sparkle/star/book/paper-plane set,
// which aren't in our sprite sheet).
import spriteSparkle from '../assets/images/sprites/01-sprite-sparkle.png';
import spriteStar from '../assets/images/sprites/02-sprite-smiling-star.png';
import spriteGradCap from '../assets/images/sprites/13-sprite-grad-cap.png';
import spriteBurst from '../assets/images/sprites/03-sprite-burst.png';

// v3 "who we are" pillar / core-value card-chip tints — mirrors Home's
// `.card-chip` blob treatment (home-v3.html `.card.orange/.blue/.green`).
const chipTint: Record<string, string> = {
  blue: 'bg-primary-500/10 text-primary-600',
  orange: 'bg-[rgba(255,115,0,0.12)] text-[#FF7300]',
  green: 'bg-[rgba(1,166,82,0.12)] text-[#01A652]',
  yellow: 'bg-[rgba(255,206,0,0.16)] text-[#B88A00]',
};

const AboutHeroSprites: React.FC = () => (
  <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
    <img
      src={spriteSparkle}
      alt=""
      className="sprite-float absolute w-12 sm:w-14 drop-shadow-md"
      style={{ top: '12%', left: '6%' }}
    />
    <img
      src={spriteStar}
      alt=""
      className="sprite-float delay-1 absolute w-11 sm:w-14 drop-shadow-md"
      style={{ top: '18%', right: '7%' }}
    />
    <img
      src={spriteGradCap}
      alt=""
      className="sprite-float delay-2 absolute w-14 sm:w-16 drop-shadow-md"
      style={{ bottom: '10%', left: '9%' }}
    />
    <img
      src={spriteBurst}
      alt=""
      className="sprite-float absolute w-12 sm:w-14 drop-shadow-md"
      style={{ bottom: '14%', right: '6%' }}
    />
  </div>
);

const About: React.FC = () => {
  const { t } = useTranslation('about');
  return (
    <div>
      {/* Hero — v3 centered warm-ground layout: eyebrow -> h1 (orange word)
          -> lede, floating sprites, NO photo (replaces the old dark photo
          hero per the design-fidelity spec). */}
      <HeroEditorial
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        accentWord={t('hero.accentWord')}
        lede={t('hero.subtitle')}
        centered
        decor={<AboutHeroSprites />}
      />

      {/* Founding Story — "the Why" (existing content, no v3 mockup slot —
          kept intact per AC #2, re-skinned to the same editorial prose
          chrome Home uses for "The Problem"). */}
      <section className="bg-white section-fluid">
        <div className="max-w-3xl mx-auto container-padding text-center">
          <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide mb-2">
            {t('foundingStory.eyebrow')}
          </p>
          <h2 className="heading-2 mb-6">{t('foundingStory.title')}</h2>
          <p className="body-large text-gray-700 leading-relaxed mb-4 prose-measure mx-auto">
            {t('foundingStory.paragraph1')}
          </p>
          <p className="body-large text-gray-700 leading-relaxed prose-measure mx-auto">
            {t('foundingStory.paragraph2')}
          </p>
        </div>
      </section>

      {/* Who We Are — prose+callout | blue impact-numbers card, then a
          3-pillar card-chip grid. */}
      <section className="bg-gray-50 section-fluid">
        <div className="max-w-6xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-6">{t('whoWeAre.title')}</h2>
            <p className="body-large text-gray-600 max-w-4xl mx-auto prose-measure">
              {t('whoWeAre.intro')}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-start mb-16">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                {t('whoWeAre.approach.title')}
              </h3>
              <p className="body-large text-gray-700 leading-relaxed mb-4">
                {t('whoWeAre.approach.paragraph1')}
              </p>
              <p className="body-large text-gray-700 leading-relaxed mb-6">
                {t('whoWeAre.approach.paragraph2')}
              </p>

              <div className="bg-[rgba(0,97,239,0.06)] border border-[rgba(0,97,239,0.20)] p-8 rounded-2xl">
                <h4 className="text-lg font-bold text-primary-900 mb-3 flex items-center">
                  <FaHeart className="mr-3 text-primary-600" />
                  {t('whoWeAre.whyItMatters.title')}
                </h4>
                <p className="text-primary-800 leading-relaxed">
                  {t('whoWeAre.whyItMatters.body')}
                </p>
              </div>
            </div>

            <div className="bg-primary-500 rounded-2xl text-white shadow-lg p-8 sm:p-10 text-center">
              <p className="text-xl font-bold mb-8">
                {t('whoWeAre.impact.title')}
              </p>
              <StatBand
                className="max-w-sm mx-auto"
                numberClassName="text-white"
                labelClassName="text-white/85"
                items={[
                  {
                    display: '450+',
                    label: t('whoWeAre.impact.studentsSupported'),
                  },
                  { display: '700+', label: t('whoWeAre.impact.contributors') },
                ]}
              />
              <div className="mt-8 pt-6 border-t border-white/25">
                <p className="text-sm text-white/90">
                  {t('whoWeAre.impact.note')}
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="p-10 text-center" hover>
              <span
                className={`mx-auto mb-4 flex h-[88px] w-[88px] items-center justify-center rounded-full text-3xl ${chipTint.blue}`}
                aria-hidden="true"
              >
                <FaCheckCircle />
              </span>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                {t('whoWeAre.pillars.accountability.title')}
              </h4>
              <p className="text-gray-700 leading-relaxed">
                {t('whoWeAre.pillars.accountability.body')}
              </p>
            </Card>
            <Card className="p-10 text-center" hover>
              <span
                className={`mx-auto mb-4 flex h-[88px] w-[88px] items-center justify-center rounded-full text-3xl ${chipTint.orange}`}
                aria-hidden="true"
              >
                <FaSeedling />
              </span>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                {t('whoWeAre.pillars.mentorship.title')}
              </h4>
              <p className="text-gray-700 leading-relaxed">
                {t('whoWeAre.pillars.mentorship.body')}
              </p>
            </Card>
            <Card className="p-10 text-center" hover>
              <span
                className={`mx-auto mb-4 flex h-[88px] w-[88px] items-center justify-center rounded-full text-3xl ${chipTint.green}`}
                aria-hidden="true"
              >
                <FaGlobeAmericas />
              </span>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                {t('whoWeAre.pillars.community.title')}
              </h4>
              <p className="text-gray-700 leading-relaxed">
                {t('whoWeAre.pillars.community.body')}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="bg-white section-fluid">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-6">{t('visionMission.title')}</h2>
            <p className="body-large text-gray-600 max-w-3xl mx-auto">
              {t('visionMission.subtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Vision Card */}
            <Card className="p-8 sm:p-10" hover>
              <div className="flex items-center gap-4 mb-6">
                <span
                  className={`flex h-16 w-16 flex-none items-center justify-center rounded-2xl text-2xl ${chipTint.blue}`}
                  aria-hidden="true"
                >
                  <FaLightbulb />
                </span>
                <h3 className="text-2xl font-bold text-gray-900">
                  {t('visionMission.vision.title')}
                </h3>
              </div>
              <p className="body-large leading-relaxed text-gray-700 mb-5">
                {t('visionMission.vision.body')}
              </p>
              <p className="border-t border-gray-200 pt-5 text-sm italic text-primary-600">
                {t('visionMission.vision.quote')}
              </p>
            </Card>

            {/* Mission Card */}
            <Card className="p-8 sm:p-10" hover>
              <div className="flex items-center gap-4 mb-6">
                <span
                  className={`flex h-16 w-16 flex-none items-center justify-center rounded-2xl text-2xl ${chipTint.orange}`}
                  aria-hidden="true"
                >
                  <FaPaperPlane />
                </span>
                <h3 className="text-2xl font-bold text-gray-900">
                  {t('visionMission.mission.title')}
                </h3>
              </div>
              <div className="space-y-4">
                {(['point1', 'point2', 'point3', 'point4'] as const).map(
                  point => (
                    <div key={point} className="flex items-start">
                      <div className="w-3 h-3 bg-primary-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                      <p className="body-large text-gray-700 leading-relaxed">
                        {t(`visionMission.mission.${point}`)}
                      </p>
                    </div>
                  )
                )}
              </div>
            </Card>
          </div>

          {/* How we make it happen */}
          <Card className="p-8 sm:p-10" hover={false}>
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
              {t('visionMission.howWeMakeItHappen.title')}
            </h3>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <span
                  className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl ${chipTint.blue}`}
                  aria-hidden="true"
                >
                  <FaHeart />
                </span>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  {t('visionMission.howWeMakeItHappen.dignity.title')}
                </h4>
                <p className="text-gray-600 text-sm">
                  {t('visionMission.howWeMakeItHappen.dignity.body')}
                </p>
              </div>
              <div>
                <span
                  className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl ${chipTint.blue}`}
                  aria-hidden="true"
                >
                  <FaCheckCircle />
                </span>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  {t('visionMission.howWeMakeItHappen.transparency.title')}
                </h4>
                <p className="text-gray-600 text-sm">
                  {t('visionMission.howWeMakeItHappen.transparency.body')}
                </p>
              </div>
              <div>
                <span
                  className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl ${chipTint.blue}`}
                  aria-hidden="true"
                >
                  <FaGlobeAmericas />
                </span>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  {t('visionMission.howWeMakeItHappen.community.title')}
                </h4>
                <p className="text-gray-600 text-sm">
                  {t('visionMission.howWeMakeItHappen.community.body')}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Our Core Values */}
      <section className="bg-gray-50 section-fluid">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-6">{t('values.title')}</h2>
            <p className="body-large text-gray-600 max-w-3xl mx-auto">
              {t('values.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-8 text-center" hover>
              <span
                className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl text-3xl ${chipTint.blue}`}
                aria-hidden="true"
              >
                <FaGraduationCap />
              </span>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {t('values.educationFirst.title')}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {t('values.educationFirst.body')}
              </p>
            </Card>
            <Card className="p-8 text-center" hover>
              <span
                className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl text-3xl ${chipTint.orange}`}
                aria-hidden="true"
              >
                <FaLightbulb />
              </span>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {t('values.meritNeed.title')}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {t('values.meritNeed.body')}
              </p>
            </Card>
            <Card className="p-8 text-center" hover>
              <span
                className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl text-3xl ${chipTint.green}`}
                aria-hidden="true"
              >
                <FaSeedling />
              </span>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {t('values.holisticGrowth.title')}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {t('values.holisticGrowth.body')}
              </p>
            </Card>
            <Card className="p-8 text-center" hover>
              <span
                className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl text-3xl ${chipTint.yellow}`}
                aria-hidden="true"
              >
                <FaCheckCircle />
              </span>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {t('values.transparency.title')}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {t('values.transparency.body')}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Journey — full-width vertical timeline. v3 pairs this with a
          static illustration (journey-grid); PM decision (pw-o73) accepts
          full-width, no-illustration as the shipped shape — an illustration
          is a later polish item, not a blocker. */}
      <section className="bg-white section-fluid">
        <div className="max-w-4xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">{t('journey.title')}</h2>
            <p className="body-large text-gray-600">{t('journey.subtitle')}</p>
          </div>

          <div className="relative">
            <div className="absolute left-8 md:left-9 top-0 bottom-0 w-[3px] bg-primary-500/30"></div>

            <div className="space-y-8">
              {(
                [
                  { key: 'foundation', year: '2022', tag: false },
                  { key: 'fiftyStudents', year: '2023', tag: true },
                  { key: 'hundredStudents', year: '2024', tag: true },
                  { key: 'twoHundredStudents', year: '2025', tag: true },
                ] as const
              ).map(m => (
                <div key={m.key} className="relative flex items-start">
                  <div className="relative z-10 flex items-center justify-center w-16 h-16 md:w-[72px] md:h-[72px] bg-primary-500 text-white rounded-full shadow-md flex-shrink-0">
                    <span className="text-sm md:text-base font-bold">
                      {m.year}
                    </span>
                  </div>
                  <div className="ml-6 md:ml-8 flex-1">
                    <Card className="p-6" hover>
                      <div className="flex items-center flex-wrap gap-3 mb-2">
                        <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                          <span className="w-[11px] h-[11px] bg-primary-500 rounded-full flex-shrink-0"></span>
                          {t(`journey.milestones.${m.key}.title`)}
                        </h3>
                        {m.tag && (
                          <span className="text-xs px-2.5 py-1 bg-primary-500/10 text-primary-600 font-semibold rounded-full">
                            {t(`journey.milestones.${m.key}.tag`)}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {t(`journey.milestones.${m.key}.body`)}
                      </p>
                    </Card>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative flex items-center mt-8">
              <div className="flex items-center justify-center w-16 md:w-[72px] flex-shrink-0">
                <span className="w-5 h-5 bg-primary-500 rounded-full shadow-[0_0_0_3px_var(--brand-secondary,#0061EF)]"></span>
              </div>
              <div className="ml-6 md:ml-8 flex-1">
                <p className="text-sm text-gray-600 italic">
                  {t('journey.continues')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="bg-gray-50 section-fluid">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">{t('team.title')}</h2>
            <p className="body-large text-gray-600">{t('team.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <Card className="text-center p-8" hover>
              <div className="w-24 h-24 mx-auto bg-primary-500 rounded-full mb-4 flex items-center justify-center shadow-md">
                <span className="text-2xl font-bold text-white">SS</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {t('team.member1.name')}
              </h3>
              <p className="text-primary-600 font-bold mb-2">
                {t('team.director')}
              </p>
              <p className="text-sm text-gray-600">{t('team.member1.role')}</p>
            </Card>

            <Card className="text-center p-8" hover>
              <div className="w-24 h-24 mx-auto bg-primary-500 rounded-full mb-4 flex items-center justify-center shadow-md">
                <span className="text-2xl font-bold text-white">SJ</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {t('team.member2.name')}
              </h3>
              <p className="text-primary-600 font-bold mb-2">
                {t('team.director')}
              </p>
              <p className="text-sm text-gray-600">{t('team.member2.role')}</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action — full-bleed blue band (not the rounded floating
          card used on Home/Testimonials — About's v3 CTA is a flat band). */}
      <section className="bg-primary-500 text-white section-fluid">
        <div className="max-w-4xl mx-auto container-padding text-center">
          <h2 className="heading-2 mb-4 text-white">{t('cta.title')}</h2>
          <p className="text-xl mb-8 text-white/90">{t('cta.description')}</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="secondary"
              size="lg"
              href="https://wa.me/918317580423?text=Hi,%20I%20would%20like%20to%20contribute."
              className="text-primary-500 border-white hover:bg-white"
            >
              {t('cta.becomeContributor')}
            </Button>
            <Button
              variant="outline"
              size="lg"
              href="/testimonials"
              className="text-white border-white hover:bg-white hover:text-primary-500"
            >
              {t('cta.seeImpactStories')}
            </Button>
          </div>
        </div>
      </section>

      {/* Get in Touch */}
      <section className="bg-gray-50 section-fluid text-center">
        <div className="max-w-4xl mx-auto container-padding">
          <h2 className="heading-2 mb-4">{t('contact.title')}</h2>
          <p className="body-large text-gray-600 mb-8">
            {t('contact.subtitle')}
          </p>

          <div className="flex flex-col items-center gap-4">
            <a
              href="mailto:clsi.perhitsiksha@gmail.com"
              className="inline-flex items-center gap-3 text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors duration-200"
            >
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary-500/10 text-primary-600">
                <FaEnvelope className="w-4 h-4" />
              </span>
              clsi.perhitsiksha@gmail.com
            </a>
            <a
              href="https://wa.me/918317580423?text=Hi,%20I%20would%20like%20to%20contribute."
              className="inline-flex items-center gap-3 text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors duration-200"
            >
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary-500/10 text-primary-600">
                <FaPhone className="w-4 h-4" />
              </span>
              +91 83175 80423
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
