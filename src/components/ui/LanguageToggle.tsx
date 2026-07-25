import { useRef } from 'react';
import { gsap, useGSAP, Flip, prefersReducedMotion } from '../../lib/gsap';
import { useLanguage } from '../../i18n/useLanguage';

type Lang = 'en' | 'hi';

/**
 * Pill segmented control that switches the site language.
 * Two typographic glyphs — "A" (English) and "अ" (Hindi), no flags — with a
 * sliding white indicator. Switching uses GSAP Flip to glide the indicator and
 * a parallel cross-fade of the page content. Under reduced-motion it swaps
 * instantly with no Flip or fade.
 */
const LanguageToggle = () => {
  const { lang, setLang } = useLanguage();
  const rootRef = useRef<HTMLDivElement>(null);
  const enBtnRef = useRef<HTMLButtonElement>(null);
  const hiBtnRef = useRef<HTMLButtonElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const langRef = useRef<Lang>(lang);
  langRef.current = lang;

  const positionIndicator = (target: Lang) => {
    const indicator = indicatorRef.current;
    const btn = target === 'en' ? enBtnRef.current : hiBtnRef.current;
    if (!indicator || !btn) return;
    gsap.set(indicator, {
      left: btn.offsetLeft,
      top: btn.offsetTop,
      width: btn.offsetWidth,
      height: btn.offsetHeight,
    });
  };

  const getFadeTargets = (): Element[] =>
    ['#main-content', 'header', 'footer']
      .map(sel => document.querySelector(sel))
      .filter((el): el is Element => el !== null);

  const { contextSafe } = useGSAP(
    () => {
      positionIndicator(langRef.current);
      const onResize = () => positionIndicator(langRef.current);
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    },
    { scope: rootRef }
  );

  const switchTo = contextSafe((next: Lang) => {
    if (next === langRef.current) return;

    if (prefersReducedMotion()) {
      positionIndicator(next);
      setLang(next);
      return;
    }

    const indicator = indicatorRef.current;
    if (indicator) {
      const state = Flip.getState(indicator);
      positionIndicator(next);
      Flip.from(state, { duration: 0.4, ease: 'power2.inOut' });
    }

    const targets = getFadeTargets();
    gsap
      .timeline()
      .to(targets, { opacity: 0, duration: 0.18 })
      .add(() => setLang(next))
      .to(targets, { opacity: 1, duration: 0.22 });
  });

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label="Language"
      className="relative inline-flex items-center rounded-full bg-primary-50 p-1"
    >
      <span
        ref={indicatorRef}
        aria-hidden="true"
        className="absolute rounded-full bg-white shadow-sm"
      />
      <button
        ref={enBtnRef}
        type="button"
        lang="en"
        aria-pressed={lang === 'en'}
        onClick={() => switchTo('en')}
        className={`relative z-10 flex h-8 w-9 items-center justify-center rounded-full text-base font-semibold transition-colors ${
          lang === 'en' ? 'text-primary-600' : 'text-gray-600'
        }`}
      >
        A<span className="sr-only">English</span>
      </button>
      <button
        ref={hiBtnRef}
        type="button"
        lang="hi"
        aria-pressed={lang === 'hi'}
        onClick={() => switchTo('hi')}
        className={`relative z-10 flex h-8 w-9 items-center justify-center rounded-full text-lg font-semibold transition-colors ${
          lang === 'hi' ? 'text-primary-600' : 'text-gray-600'
        }`}
      >
        अ<span className="sr-only">हिंदी</span>
      </button>
    </div>
  );
};

export default LanguageToggle;
