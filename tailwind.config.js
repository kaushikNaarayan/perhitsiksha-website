/** @type {import('tailwindcss').Config} */
export default {
  // Dark mode is driven by an explicit `data-theme="dark"` on <html>
  // (set by ThemeToggle). Enables `dark:` utilities to target that attribute.
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Portrait student-photo utilities (pe-gdu B3): kept in the bundle so they're
  // available for student/testimonial photo cards even where markup applies
  // them dynamically. See .portrait-3-4 / .photo-name-scrim in src/index.css.
  safelist: ["portrait-3-4", "photo-name-scrim"],
  theme: {
    extend: {
      colors: {
        primary: {
          // Canonical Perhitsiksha DS blue (pe-6wt migration: #0068B3 -> #0061EF).
          // Anchored on the DS token layer in src/index.css (:root --blue-*).
          50: '#E9F0FE',
          100: '#C7D9FD',
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
          // Ramp darkened for WCAG AA (pe-09n): body/subtext grays now clear
          // 4.5:1 on white. 600=#5A5F66 (6.4:1), 700=#3C4043 (10.5:1).
          // Ramp kept monotonic; 800 nudged darker to stay below the new 700.
          50: '#F8F9FA',
          100: '#F1F3F4',
          200: '#E8EAED',
          300: '#DADCE0',
          400: '#BDC1C6',
          500: '#9AA0A6',
          600: '#5A5F66', // ~6.4:1 on white — body/subtext floor
          700: '#3C4043', // ~10.5:1 on white
          800: '#2A2D30',
          900: '#202124',
        }
      },
      fontFamily: {
        // Canonical DS type: Anek (script-routed Latin + Devanagari; browser picks glyphs by lang).
        'sans': ['"Anek Latin"', '"Anek Devanagari"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        'display': ['"Anek Latin"', '"Anek Devanagari"', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      // Corner radii — mirror the --radius-* DS tokens (pe-gdu B3). No sharp
      // corners: cards at 24px, media/inputs/chips at 16px.
      borderRadius: {
        card: 'var(--radius-card)', // 24px
        media: 'var(--radius-media)', // 16px
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
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
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
        'counter': 'counter 2s ease-out',
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
  plugins: [
    require('@tailwindcss/typography'),
  ],
}