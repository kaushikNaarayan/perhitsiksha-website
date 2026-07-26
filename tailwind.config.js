/** @type {import('tailwindcss').Config} */
export default {
  // Dark mode is driven by an explicit `data-theme="dark"` on <html>
  // (set by ThemeToggle). Enables `dark:` utilities to target that attribute.
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  // Portrait student-photo utilities (pe-gdu B3): kept in the bundle so they're
  // available for student/testimonial photo cards even where markup applies
  // them dynamically. See .portrait-3-4 / .photo-name-scrim in src/index.css.
  safelist: ['portrait-3-4', 'photo-name-scrim'],
  theme: {
    extend: {
      colors: {
        primary: {
          // Canonical Perhitsiksha DS blue (pe-6wt migration: #0068B3 -> #0061EF).
          // Anchored on the DS token layer in src/index.css (:root --blue-*).
          // 50 = the canonical --blue-050 pale UI tint (pe-bta round 1 — was a
          // synthetic invented hex disconnected from the token ramp); 100 is a
          // derived mid-tint between --blue-050 and the --blue-200 base (DS's
          // own --blue-100 #00A4FF is a saturated accent hue, not a pale tint,
          // so it's unsuitable for the soft-background role 100 plays here).
          50: '#DCE7FF',
          100: '#B8D2FF',
          200: '#9DBBFB',
          300: '#6693F8',
          400: '#3377F4',
          500: '#0061EF', // Main brand blue (DS --blue-200)
          600: '#0040EA', // DS --blue-300
          700: '#0000DB', // DS --blue-400 (shadow)
          800: '#0000B0',
          900: '#00008A',
        },
        accent: {
          50: '#e6f8ff',
          100: '#b3ecff',
          200: '#80dfff',
          300: '#4dd3ff',
          400: '#1ac6ff',
          500: '#00A6E7', // Light blue accent
          600: '#0085b8',
          700: '#006489',
          800: '#00435a',
          900: '#00222b',
        },
        success: {
          50: '#e6fff4',
          100: '#b3ffe0',
          200: '#80ffcc',
          300: '#4dffb8',
          400: '#1affa4',
          500: '#00B388', // Success green
          600: '#008f6d',
          700: '#006b52',
          800: '#004737',
          900: '#00231c',
        },
        gray: {
          // Warm DS --grey-* ramp (pe-bta round 1 — was cool Material grey,
          // #3C4043/#202124, per audit pe-702 gap #2). Anchored on the exact
          // ds/tokens/colors.css --grey-100..800 steps, with two interpolated
          // in-between stops (100, 500) to keep a 9-step Tailwind scale.
          // Contrast re-verified (WCAG, on white) so the pe-09n AA hardening
          // isn't regressed: 600 #63605D 6.25:1 (was 5A5F66 6.43:1), 700
          // #44423F 10.02:1 (was 3C4043 10.47:1), 800 #2D2C2B 13.94:1 (was
          // 2A2D30/202124 ~15-16:1) — all comfortably clear of the 4.5:1 floor.
          50: '#F9F4F2', // DS --grey-100 — warm-white ground
          100: '#F1EAE7', // interpolated
          200: '#E2DED9', // DS --grey-200
          300: '#C6C1B9', // DS --grey-300
          400: '#A8A5A0', // DS --grey-400
          500: '#8B8783', // interpolated
          600: '#63605D', // DS --grey-500 "muted text" — body/subtext floor
          700: '#44423F', // DS --grey-600
          800: '#2D2C2B', // DS --grey-700 — the canonical text "black"
          900: '#141313', // DS --grey-800 — deepest / illustration-face
        },
      },
      fontFamily: {
        // Canonical DS type: Anek (script-routed Latin + Devanagari; browser picks glyphs by lang).
        sans: [
          '"Anek Latin"',
          '"Anek Devanagari"',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'sans-serif',
        ],
        display: [
          '"Anek Latin"',
          '"Anek Devanagari"',
          'system-ui',
          'sans-serif',
        ],
      },
      spacing: {
        18: '4.5rem',
        88: '22rem',
        128: '32rem',
      },
      // Corner radii — mirror the --radius-* DS tokens (pe-gdu B3; band
      // corrected pe-bta round 1 per audit pe-702 gap #3 — cards sit in the
      // 12-18px band, 24px (--radius-2xl) is reserved for modals/overlays).
      borderRadius: {
        card: 'var(--radius-card)', // 16px — cards / large surfaces
        media: 'var(--radius-media)', // 16px — images / inputs / chips
        overlay: 'var(--radius-2xl)', // 24px — modals / drawers / popovers ONLY
      },
      // Hard-block shadow bridge (pe-bta round 1, audit pe-702 gap #1) — the
      // plain `shadow-sm/md/lg/xl` utilities now resolve to the canonical DS
      // effects.css tokens (flat 0-blur underline at rest, soft lift on
      // elevation/hover) instead of Tailwind's default blurred shadows, so
      // every existing shadow-* usage across the app inherits conformance.
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-md)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-overlay)',
        overlay: 'var(--shadow-overlay)',
        drawer: 'var(--shadow-drawer)',
        none: 'none',
      },
      // Strict z-index scale — mirror the --z-* DS tokens (pe-gdu B3).
      zIndex: {
        bg: 'var(--z-bg)', // -1
        base: 'var(--z-base)', // 1
        float: 'var(--z-float)', // 10 (hero sparkles)
        header: 'var(--z-header)', // 100
        modal: 'var(--z-modal)', // 1000
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
        '7xl': '4.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        counter: 'counter 2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        counter: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
