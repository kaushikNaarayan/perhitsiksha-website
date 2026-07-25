import React from 'react';
import { useTranslation } from 'react-i18next';
import Hero from '../components/ui/Hero';
import Card from '../components/ui/Card';
import {
  FaGraduationCap,
  FaBullseye,
  FaSeedling,
  FaGem,
  FaEnvelope,
  FaPhone,
  FaEye,
  FaRocket,
  FaHeart,
  FaUsers,
} from 'react-icons/fa';
import Button from '../components/ui/Button';

// Import images
import aboutHeroBg from '../assets/images/about-hero-bg.png';

const About: React.FC = () => {
  const { t } = useTranslation('about');
  return (
    <div>
      {/* Hero Section */}
      <Hero
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        backgroundImage={aboutHeroBg}
        overlay={true}
      />

      {/* Founding Story — "the Why" (sourced from WEBSITE_TEXT.md) */}
      <section className="bg-gray-50 section-padding">
        <div className="max-w-3xl mx-auto container-padding text-center">
          <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide mb-2">
            {t('foundingStory.eyebrow')}
          </p>
          <h2 className="heading-2 mb-6">{t('foundingStory.title')}</h2>
          <p className="body-large text-gray-700 leading-relaxed mb-4">
            {t('foundingStory.paragraph1')}
          </p>
          <p className="body-large text-gray-700 leading-relaxed">
            {t('foundingStory.paragraph2')}
          </p>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="bg-white section-padding">
        <div className="max-w-6xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-6">{t('whoWeAre.title')}</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              {t('whoWeAre.intro')}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-3xl font-bold text-gray-900">
                  {t('whoWeAre.approach.title')}
                </h3>
                <p className="body-large text-gray-700 leading-relaxed">
                  {t('whoWeAre.approach.paragraph1')}
                </p>
                <p className="body-large text-gray-700 leading-relaxed">
                  {t('whoWeAre.approach.paragraph2')}
                </p>
              </div>

              <div className="bg-primary-50 p-6 rounded-2xl border border-primary-100">
                <h4 className="text-lg font-bold text-primary-900 mb-4 flex items-center">
                  <FaHeart className="mr-3 text-primary-600" />
                  {t('whoWeAre.whyItMatters.title')}
                </h4>
                <p className="text-primary-800 leading-relaxed">
                  {t('whoWeAre.whyItMatters.body')}
                </p>
              </div>
            </div>

            <div className="bg-primary-500 p-8 rounded-2xl text-white shadow-sm">
              <h4 className="text-xl font-bold mb-6 text-center">
                {t('whoWeAre.impact.title')}
              </h4>
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">450+</div>
                  <div className="text-sm text-primary-100">
                    {t('whoWeAre.impact.studentsSupported')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">700+</div>
                  <div className="text-sm text-primary-100">
                    {t('whoWeAre.impact.contributors')}
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-primary-400 text-center">
                <p className="text-sm text-primary-100">
                  {t('whoWeAre.impact.note')}
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="p-8 text-center hover:shadow-md transition-all duration-300 border-0 bg-primary-50">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-500 rounded-full flex items-center justify-center">
                <FaBullseye className="text-2xl text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                {t('whoWeAre.pillars.accountability.title')}
              </h4>
              <p className="text-gray-700 leading-relaxed">
                {t('whoWeAre.pillars.accountability.body')}
              </p>
            </Card>
            <Card className="p-8 text-center hover:shadow-md transition-all duration-300 border-0 bg-gray-50">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-600 rounded-full flex items-center justify-center">
                <FaSeedling className="text-2xl text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                {t('whoWeAre.pillars.mentorship.title')}
              </h4>
              <p className="text-gray-700 leading-relaxed">
                {t('whoWeAre.pillars.mentorship.body')}
              </p>
            </Card>
            <Card className="p-8 text-center hover:shadow-md transition-all duration-300 border-0 bg-primary-50">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-500 rounded-full flex items-center justify-center">
                <FaUsers className="text-2xl text-white" />
              </div>
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
      <section className="bg-gray-50 section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-6">{t('visionMission.title')}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('visionMission.subtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Vision Card */}
            <Card className="hover:shadow-lg transition-all duration-300 border border-primary-200 bg-white">
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mr-4">
                    <FaEye className="text-3xl text-primary-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {t('visionMission.vision.title')}
                  </h3>
                </div>
                <p className="text-lg leading-relaxed text-gray-700">
                  {t('visionMission.vision.body')}
                </p>
                <div className="mt-6 pt-6 border-t border-primary-200">
                  <p className="text-sm text-primary-600 italic">
                    {t('visionMission.vision.quote')}
                  </p>
                </div>
              </div>
            </Card>

            {/* Mission Card */}
            <Card className="hover:shadow-lg transition-all duration-300 border border-primary-200 bg-primary-50">
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mr-4">
                    <FaRocket className="text-3xl text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {t('visionMission.mission.title')}
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-primary-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <p className="text-gray-700 leading-relaxed">
                      {t('visionMission.mission.point1')}
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-primary-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <p className="text-gray-700 leading-relaxed">
                      {t('visionMission.mission.point2')}
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-primary-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <p className="text-gray-700 leading-relaxed">
                      {t('visionMission.mission.point3')}
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-primary-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <p className="text-gray-700 leading-relaxed">
                      {t('visionMission.mission.point4')}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Core Principles */}
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
              {t('visionMission.howWeMakeItHappen.title')}
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary-500 rounded-2xl flex items-center justify-center">
                  <FaHeart className="text-2xl text-white" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  {t('visionMission.howWeMakeItHappen.dignity.title')}
                </h4>
                <p className="text-gray-600 text-sm">
                  {t('visionMission.howWeMakeItHappen.dignity.body')}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-600 rounded-2xl flex items-center justify-center">
                  <FaGem className="text-2xl text-white" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  {t('visionMission.howWeMakeItHappen.transparency.title')}
                </h4>
                <p className="text-gray-600 text-sm">
                  {t('visionMission.howWeMakeItHappen.transparency.body')}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary-500 rounded-2xl flex items-center justify-center">
                  <FaUsers className="text-2xl text-white" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  {t('visionMission.howWeMakeItHappen.community.title')}
                </h4>
                <p className="text-gray-600 text-sm">
                  {t('visionMission.howWeMakeItHappen.community.body')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-6">{t('values.title')}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('values.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-8 text-center hover:shadow-md transition-all duration-300 border-0 bg-primary-50">
              <div className="w-20 h-20 mx-auto mb-6 bg-primary-500 rounded-2xl flex items-center justify-center">
                <FaGraduationCap className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {t('values.educationFirst.title')}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {t('values.educationFirst.body')}
              </p>
            </Card>
            <Card className="p-8 text-center hover:shadow-md transition-all duration-300 border-0 bg-gray-50">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-500 rounded-2xl flex items-center justify-center">
                <FaBullseye className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {t('values.meritNeed.title')}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {t('values.meritNeed.body')}
              </p>
            </Card>
            <Card className="p-8 text-center hover:shadow-md transition-all duration-300 border-0 bg-primary-50">
              <div className="w-20 h-20 mx-auto mb-6 bg-primary-500 rounded-2xl flex items-center justify-center">
                <FaSeedling className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {t('values.holisticGrowth.title')}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {t('values.holisticGrowth.body')}
              </p>
            </Card>
            <Card className="p-8 text-center hover:shadow-md transition-all duration-300 border-0 bg-gray-50">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-500 rounded-2xl flex items-center justify-center">
                <FaGem className="text-3xl text-white" />
              </div>
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

      {/* Our Journey */}
      <section className="bg-gray-50 section-padding">
        <div className="max-w-4xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">{t('journey.title')}</h2>
            <p className="body-large text-gray-600">{t('journey.subtitle')}</p>
          </div>

          <div className="relative">
            {/* Timeline line - vertical for both mobile and desktop */}
            <div className="absolute left-8 md:left-12 top-0 bottom-0 w-1 bg-primary-400"></div>

            <div className="space-y-8">
              {/* 2022 - Foundation */}
              <div className="relative flex items-start">
                <div className="relative z-10 flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-primary-500 text-white rounded-full shadow-sm flex-shrink-0">
                  <div className="text-center">
                    <div className="text-sm md:text-base font-bold">2022</div>
                  </div>
                </div>
                <div className="ml-6 md:ml-8 flex-1">
                  <Card className="p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center mb-3">
                      <div className="w-3 h-3 bg-primary-500 rounded-full mr-3"></div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {t('journey.milestones.foundation.title')}
                      </h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {t('journey.milestones.foundation.body')}
                    </p>
                  </Card>
                </div>
              </div>

              {/* 2023 - First Milestone */}
              <div className="relative flex items-start">
                <div className="relative z-10 flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-primary-500 text-white rounded-full shadow-sm flex-shrink-0">
                  <div className="text-center">
                    <div className="text-sm md:text-base font-bold">2023</div>
                  </div>
                </div>
                <div className="ml-6 md:ml-8 flex-1">
                  <Card className="p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border-l-4 border-primary-300">
                    <div className="flex items-center mb-3">
                      <div className="w-3 h-3 bg-primary-500 rounded-full mr-3"></div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {t('journey.milestones.fiftyStudents.title')}
                      </h3>
                      <span className="ml-2 text-xs px-2 py-1 bg-primary-100 text-primary-600 rounded-full">
                        {t('journey.milestones.fiftyStudents.tag')}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {t('journey.milestones.fiftyStudents.body')}
                    </p>
                  </Card>
                </div>
              </div>

              {/* 2024 - Expansion */}
              <div className="relative flex items-start">
                <div className="relative z-10 flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-primary-500 text-white rounded-full shadow-sm flex-shrink-0">
                  <div className="text-center">
                    <div className="text-sm md:text-base font-bold">2024</div>
                  </div>
                </div>
                <div className="ml-6 md:ml-8 flex-1">
                  <Card className="p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border-l-4 border-gray-300">
                    <div className="flex items-center mb-3">
                      <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {t('journey.milestones.hundredStudents.title')}
                      </h3>
                      <span className="ml-2 text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                        {t('journey.milestones.hundredStudents.tag')}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {t('journey.milestones.hundredStudents.body')}
                    </p>
                  </Card>
                </div>
              </div>

              {/* 2025 - Future Vision */}
              <div className="relative flex items-start">
                <div className="relative z-10 flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-primary-600 text-white rounded-full shadow-sm flex-shrink-0 ring-4 ring-primary-100">
                  <div className="text-center">
                    <div className="text-sm md:text-base font-bold">2025</div>
                  </div>
                </div>
                <div className="ml-6 md:ml-8 flex-1">
                  <Card className="p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border-l-4 border-primary-300 bg-primary-50">
                    <div className="flex items-center mb-3">
                      <div className="w-3 h-3 bg-primary-500 rounded-full mr-3"></div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {t('journey.milestones.twoHundredStudents.title')}
                      </h3>
                      <span className="ml-2 text-xs px-2 py-1 bg-primary-100 text-primary-600 rounded-full">
                        {t('journey.milestones.twoHundredStudents.tag')}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {t('journey.milestones.twoHundredStudents.body')}
                    </p>
                  </Card>
                </div>
              </div>
            </div>

            {/* Timeline end indicator */}
            <div className="relative flex items-start mt-8">
              <div className="relative z-10 flex items-center justify-center w-8 h-8 bg-primary-300 rounded-full shadow-sm flex-shrink-0 ml-4 md:ml-6">
                <div className="w-2 h-2 bg-white rounded-full"></div>
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
      <section className="bg-white section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">{t('team.title')}</h2>
            <p className="body-large">{t('team.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <Card className="text-center p-6 hover:shadow-md transition-all duration-300">
              <div className="w-24 h-24 mx-auto bg-primary-500 rounded-full mb-4 flex items-center justify-center shadow-sm">
                <span className="text-2xl font-bold text-white">SS</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {t('team.member1.name')}
              </h3>
              <p className="text-primary-600 font-medium mb-2">
                {t('team.director')}
              </p>
              <p className="text-sm text-gray-600">{t('team.member1.role')}</p>
            </Card>

            <Card className="text-center p-6 hover:shadow-md transition-all duration-300">
              <div className="w-24 h-24 mx-auto bg-primary-500 rounded-full mb-4 flex items-center justify-center shadow-sm">
                <span className="text-2xl font-bold text-white">SJ</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {t('team.member2.name')}
              </h3>
              <p className="text-primary-600 font-medium mb-2">
                {t('team.director')}
              </p>
              <p className="text-sm text-gray-600">{t('team.member2.role')}</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary-500 text-white section-padding">
        <div className="max-w-4xl mx-auto container-padding text-center">
          <h2 className="heading-2 mb-4">{t('cta.title')}</h2>
          <p className="text-xl mb-8 text-primary-100">
            {t('cta.description')}
          </p>

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

      {/* Contact */}
      <section className="bg-gray-50 section-padding">
        <div className="max-w-4xl mx-auto container-padding">
          <div className="text-center mb-8">
            <h2 className="heading-2 mb-4">{t('contact.title')}</h2>
            <p className="body-large">{t('contact.subtitle')}</p>
          </div>

          <div className="flex justify-center">
            <div className="space-y-4">
              <div className="flex items-center">
                <FaEnvelope className="w-5 h-5 text-primary-500 mr-3" />
                <a
                  href="mailto:clsi.perhitsiksha@gmail.com"
                  className="text-gray-700 hover:text-primary-500 transition-colors duration-200"
                >
                  clsi.perhitsiksha@gmail.com
                </a>
              </div>
              <div className="flex items-center">
                <FaPhone className="w-5 h-5 text-primary-500 mr-3" />
                <a
                  href="https://wa.me/918317580423?text=Hi,%20I%20would%20like%20to%20contribute."
                  className="text-gray-700 hover:text-primary-500 transition-colors duration-200"
                >
                  +91 83175 80423
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
