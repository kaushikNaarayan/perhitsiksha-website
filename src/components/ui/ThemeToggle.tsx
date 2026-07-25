import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/gsap';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'perhit-theme';

/** Resolve the initial theme: stored choice wins, else OS preference. */
function resolveInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/** Reflect a theme onto <html data-theme> so the CSS token layer flips. */
function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = theme;
}

/**
 * Sun/moon icon button that flips the site between light and dark.
 * Toggles `document.documentElement.dataset.theme`, persists the choice to
 * localStorage (`perhit-theme`), and reads it on mount (falling back to the OS
 * `prefers-color-scheme`). The icon swap is a GSAP cross-rotate; reduced-motion
 * swaps instantly. Sized/shaped to match the neighbouring LanguageToggle pill.
 */
const ThemeToggle = () => {
  const { t } = useTranslation('header');
  const [theme, setTheme] = useState<Theme>(() => resolveInitialTheme());
  const rootRef = useRef<HTMLDivElement>(null);
  const sunRef = useRef<HTMLSpanElement>(null);
  const moonRef = useRef<HTMLSpanElement>(null);
  const didMount = useRef(false);

  // Ensure <html> matches state on mount (covers the SSR/first-paint case
  // where an inline guard hasn't run) and whenever the choice changes.
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const isDark = theme === 'dark';

  // Animate the sun<->moon swap. First render only positions (no tween).
  useGSAP(
    () => {
      const sun = sunRef.current;
      const moon = moonRef.current;
      if (!sun || !moon) return;

      const sunState = { autoAlpha: isDark ? 0 : 1, rotate: isDark ? -90 : 0 };
      const moonState = { autoAlpha: isDark ? 1 : 0, rotate: isDark ? 0 : 90 };

      if (!didMount.current || prefersReducedMotion()) {
        didMount.current = true;
        gsap.set(sun, sunState);
        gsap.set(moon, moonState);
        return;
      }
      gsap.to(sun, { ...sunState, duration: 0.35, ease: 'spring' });
      gsap.to(moon, { ...moonState, duration: 0.35, ease: 'spring' });
    },
    { scope: rootRef, dependencies: [isDark] }
  );

  const toggle = useCallback(() => {
    setTheme(prev => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* storage may be unavailable (private mode) — non-fatal */
      }
      return next;
    });
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative inline-flex items-center rounded-full bg-primary-50 p-1"
    >
      <button
        type="button"
        onClick={toggle}
        aria-pressed={isDark}
        aria-label={t('themeToggle', { defaultValue: 'Toggle theme' })}
        className="relative z-10 flex h-8 w-9 items-center justify-center rounded-full text-primary-600 transition-colors hover:bg-white/40 dark:hover:bg-white/10"
      >
        {/* Sun (light) */}
        <span
          ref={sunRef}
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        </span>
        {/* Moon (dark) */}
        <span
          ref={moonRef}
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </span>
      </button>
    </div>
  );
};

export default ThemeToggle;
