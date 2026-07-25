import { useTranslation } from 'react-i18next';

export type Language = 'en' | 'hi';

export interface UseLanguageResult {
  lang: Language;
  setLang: (lang: Language) => void;
}

/**
 * Small convenience hook over react-i18next for reading and switching the
 * active UI language. The chosen language is persisted to localStorage by the
 * LanguageDetector (key: `perhit-lang`).
 */
export function useLanguage(): UseLanguageResult {
  const { i18n } = useTranslation();

  const lang: Language = i18n.language?.startsWith('hi') ? 'hi' : 'en';

  const setLang = (next: Language) => {
    void i18n.changeLanguage(next);
  };

  return { lang, setLang };
}
