import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// English namespaces
import enCommon from '../locales/en/common.json';
import enHeader from '../locales/en/header.json';
import enFooter from '../locales/en/footer.json';
import enTicker from '../locales/en/ticker.json';
import enHome from '../locales/en/home.json';
import enAbout from '../locales/en/about.json';
import enTestimonials from '../locales/en/testimonials.json';
import enDonation from '../locales/en/donation.json';
import enCelebrity from '../locales/en/celebrity.json';
import enPrivacy from '../locales/en/privacy.json';

// Hindi namespaces (placeholder: mirrors English until real translations land)
import hiCommon from '../locales/hi/common.json';
import hiHeader from '../locales/hi/header.json';
import hiFooter from '../locales/hi/footer.json';
import hiTicker from '../locales/hi/ticker.json';
import hiHome from '../locales/hi/home.json';
import hiAbout from '../locales/hi/about.json';
import hiTestimonials from '../locales/hi/testimonials.json';
import hiDonation from '../locales/hi/donation.json';
import hiCelebrity from '../locales/hi/celebrity.json';
import hiPrivacy from '../locales/hi/privacy.json';

export const supportedLngs = ['en', 'hi'] as const;

export const namespaces = [
  'common',
  'header',
  'footer',
  'ticker',
  'home',
  'about',
  'testimonials',
  'donation',
  'celebrity',
  'privacy',
] as const;

// Vite bundles the JSON at build time, so we pass everything via `resources`
// rather than loading over the network with a backend.
const resources = {
  en: {
    common: enCommon,
    header: enHeader,
    footer: enFooter,
    ticker: enTicker,
    home: enHome,
    about: enAbout,
    testimonials: enTestimonials,
    donation: enDonation,
    celebrity: enCelebrity,
    privacy: enPrivacy,
  },
  hi: {
    common: hiCommon,
    header: hiHeader,
    footer: hiFooter,
    ticker: hiTicker,
    home: hiHome,
    about: hiAbout,
    testimonials: hiTestimonials,
    donation: hiDonation,
    celebrity: hiCelebrity,
    privacy: hiPrivacy,
  },
} as const;

const applyDocumentLang = (lng: string) => {
  document.documentElement.lang = lng;
  document.documentElement.setAttribute('data-lang', lng);
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: [...supportedLngs],
    fallbackLng: 'en',
    ns: [...namespaces],
    defaultNS: 'common',
    detection: {
      order: ['localStorage', 'htmlTag', 'navigator'],
      lookupLocalStorage: 'perhit-lang',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

// Keep <html lang> / [data-lang] in sync with the active language, both on the
// initial resolved language and on every subsequent change.
i18n.on('languageChanged', lng => {
  applyDocumentLang(lng);
});
applyDocumentLang(i18n.resolvedLanguage ?? i18n.language ?? 'en');

export default i18n;
