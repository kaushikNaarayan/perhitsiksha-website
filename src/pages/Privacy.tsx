import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import Hero from '../components/ui/Hero';

// Import images
import aboutHeroBg from '../assets/images/about-hero-bg.png';

const Privacy: React.FC = () => {
  const { t, i18n } = useTranslation('privacy');

  const lastUpdated = new Date().toLocaleDateString(
    i18n.language.startsWith('hi') ? 'hi-IN' : 'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  );

  const personalItems = t('privacy.collect.personalItems', {
    returnObjects: true,
  }) as string[];
  const autoItems = t('privacy.collect.autoItems', {
    returnObjects: true,
  }) as string[];
  const useItems = t('privacy.use.items', { returnObjects: true }) as string[];
  const sharingItems = t('privacy.sharing.items', {
    returnObjects: true,
  }) as string[];
  const securityItems = t('privacy.security.items', {
    returnObjects: true,
  }) as string[];
  const rightsItems = t('privacy.rights.items', {
    returnObjects: true,
  }) as string[];
  const thirdPartyItems = t('privacy.thirdParty.items', {
    returnObjects: true,
  }) as string[];

  return (
    <div>
      {/* Hero Section */}
      <Hero
        title={t('privacy.heroTitle')}
        subtitle={t('privacy.heroSubtitle')}
        backgroundImage={aboutHeroBg}
        overlay={false}
      />

      {/* Privacy Policy Content */}
      <section className="bg-white section-padding">
        <div className="max-w-4xl mx-auto container-padding">
          <div className="space-y-8 body-base text-gray-700 leading-relaxed">
            <div>
              <p className="mb-4">
                <strong>{t('privacy.lastUpdatedLabel')}</strong> {lastUpdated}
              </p>
              <p>{t('privacy.intro')}</p>
            </div>

            <div>
              <h2 className="heading-3 mb-4">{t('privacy.collect.title')}</h2>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t('privacy.collect.personalTitle')}
              </h3>
              <p className="mb-4">{t('privacy.collect.personalIntro')}</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                {personalItems.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t('privacy.collect.autoTitle')}
              </h3>
              <p className="mb-4">{t('privacy.collect.autoIntro')}</p>
              <ul className="list-disc pl-6 space-y-2">
                {autoItems.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="heading-3 mb-4">{t('privacy.use.title')}</h2>
              <p className="mb-4">{t('privacy.use.intro')}</p>
              <ul className="list-disc pl-6 space-y-2">
                {useItems.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="heading-3 mb-4">{t('privacy.sharing.title')}</h2>
              <p className="mb-4">{t('privacy.sharing.intro')}</p>
              <ul className="list-disc pl-6 space-y-2">
                {sharingItems.map((item, index) => (
                  <li key={index}>
                    <Trans
                      t={t}
                      defaults={item}
                      components={{ b: <strong /> }}
                    />
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="heading-3 mb-4">{t('privacy.security.title')}</h2>
              <p className="mb-4">{t('privacy.security.intro')}</p>
              <ul className="list-disc pl-6 space-y-2">
                {securityItems.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p>{t('privacy.security.note')}</p>
            </div>

            <div>
              <h2 className="heading-3 mb-4">{t('privacy.rights.title')}</h2>
              <p className="mb-4">{t('privacy.rights.intro')}</p>
              <ul className="list-disc pl-6 space-y-2">
                {rightsItems.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="mt-4">{t('privacy.rights.contact')}</p>
            </div>

            <div>
              <h2 className="heading-3 mb-4">
                {t('privacy.thirdParty.title')}
              </h2>
              <p className="mb-4">{t('privacy.thirdParty.intro')}</p>
              <ul className="list-disc pl-6 space-y-2">
                {thirdPartyItems.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p>{t('privacy.thirdParty.note')}</p>
            </div>

            <div>
              <h2 className="heading-3 mb-4">{t('privacy.children.title')}</h2>
              <p>{t('privacy.children.body')}</p>
            </div>

            <div>
              <h2 className="heading-3 mb-4">{t('privacy.changes.title')}</h2>
              <p>{t('privacy.changes.body')}</p>
            </div>

            <div>
              <h2 className="heading-3 mb-4">{t('privacy.contact.title')}</h2>
              <p className="mb-4">{t('privacy.contact.intro')}</p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="font-semibold text-gray-900 mb-2">
                  {t('privacy.contact.orgName')}
                </p>
                <p className="mb-1">{t('privacy.contact.emailLabel')}</p>
                <p className="mb-1">{t('privacy.contact.phoneLabel')}</p>
                <p>{t('privacy.contact.responseNote')}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-600">{t('privacy.footerNote')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Privacy;
