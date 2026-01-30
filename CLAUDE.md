# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Development
npm run dev                 # Start dev server on http://localhost:3000
npm run build               # TypeScript compile + production build
npm run preview             # Preview production build locally

# Testing
npm run test                # Run Vitest in watch mode
npm run test:coverage       # Generate coverage report
npm run test:ui             # Launch Vitest UI
npm run test -- ComponentName  # Run specific test file
npx playwright test         # Run E2E tests (requires dev server)
npx playwright test --ui    # Run E2E tests in UI mode
npx playwright test tests/specific.spec.ts  # Run single E2E test file

# Code Quality
npm run lint                # Run ESLint
npm run format              # Format with Prettier
npm run format:check        # Check formatting without changes
npx tsc --noEmit            # Type checking without build

# Supabase (Local Development)
npx supabase start          # Start local Supabase stack
npx supabase stop           # Stop local Supabase
npx supabase db reset       # Reset database to migrations
```

## Architecture Overview

### Tech Stack
- **React 19** + **TypeScript** + **Vite 7** (requires Node.js v20+)
- **Tailwind CSS** for styling
- **React Router** for client-side routing with GitHub Pages SPA support
- **Supabase** for backend (visitor counter, page views)
- **Vitest** for unit tests, **Playwright** for E2E tests

### Application Structure

**Routing & SPA Support:**
- `src/App.tsx` handles GitHub Pages 404 redirect workaround via URL params
  - GitHub Pages serves `404.html` for all routes
  - `404.html` captures the path and redirects to `/?redirect=/path`
  - `AppRoutes` reads the `redirect` param and navigates to the correct route
- Routes are defined in `AppRoutes` component: `/`, `/testimonials`, `/about`, `/privacy`
- `ScrollToTop` component ensures page scrolls to top on route changes

**Backend Integration:**
- `src/services/supabase.ts` provides `PageViewService` singleton for visitor tracking
- Uses RPC function `increment_page_views` for atomic increments
- Falls back gracefully when Supabase is not configured
- `src/config/environment.ts` validates env vars with Zod and exports feature flags

**Component Categories:**
- `src/components/Layout/` - Header, Footer, Layout wrapper
- `src/components/ui/` - Reusable UI components (carousels, buttons, cards, counters)
- `src/pages/` - Page-level components (Home, Testimonials, About, Privacy)

**Key UI Components:**
- **TickerBanner** - Announcement banner above header
  - Static centered display on desktop/laptop (≥1024px)
  - Scrolling ticker animation on mobile/tablet (<1024px)
  - Hover-pause only works on devices with true hover capability (desktop with mouse)
  - Content: Registration announcement with link to certificate
- **Carousels:** `EnhancedCarousel`, `CelebrityCarousel`, `TestimonialCarousel`, `YouTubeShortsCarousel`, `PeekCarousel`, `EventsCarousel` - various carousel implementations with drag-to-scroll, autoplay, and accessibility features
  - **EventsCarousel** - Auto-rotating carousel for Recent Events section
    - Auto-rotates every 4 seconds (configurable via `autoRotateInterval` prop)
    - Pauses on hover (desktop), continuous rotation on touch devices
    - Navigation arrows positioned on image corners
    - Pagination dots for manual navigation
    - Responsive layout: single column (<1280px), side-by-side (≥1280px)
    - Fixed heights on desktop to prevent container jumping between slides
- **VisitorCounter** - Displays page views from Supabase with caching
- **GoogleAnalytics** - GA4 integration (only enabled in production)
- **TypewriterText**, **StatsCounter** - Animated text effects
- **Hero** - Hero section with conditional logo, subheadline, and subtitle support
  - Supports optional `subheadline` prop (bold, prominent text below title)
  - Uses `heading-1` class by default, `heading-2` when `showLogo={true}`
  - Social icons (Facebook, YouTube) rendered when `primaryCTA` is present

**Type System** (`src/types/index.ts`):
- Domain types: `Testimonial`, `Story`, `Program`, `Stats`, `TeamMember`, `TimelineEvent`
- Component prop types: `ButtonProps`, `CardProps`, `HeroProps`, `YouTubeEmbedProps`
- Testimonial roles: `'Student' | 'Parent' | 'Mentor' | 'Contributor'`
- Story categories: `'Education' | 'Career' | 'Community'`

### Configuration System

**Environment Variables** (`src/config/environment.ts`):
- Validates all env vars with Zod schema at startup
- Exports `config` object with typed settings for Supabase, analytics, features
- Exports `isDevelopment`, `isStaging`, `isProduction` helpers
- Feature flags in `config.features` control behavior per environment

**Required Environment Variables:**
```bash
VITE_SUPABASE_URL           # Supabase project URL
VITE_SUPABASE_ANON_KEY      # Supabase anon key
VITE_ENVIRONMENT            # development | staging | production
VITE_GA_MEASUREMENT_ID      # Google Analytics (optional)
```

### Testing Strategy

**Unit Tests (Vitest):**
- Setup in `src/test/setup.ts` with `@testing-library/react`
- Uses MSW (Mock Service Worker) for API mocking (Counter API endpoints)
- Example: `src/components/__tests__/VisitorCounter.test.tsx`
- Run with `npm run test` in watch mode
- Run specific test: `npm run test -- ComponentName` or `npm run test -- src/path/to/test.tsx`
- Test files: `src/**/*.{test,spec}.{ts,tsx}` (co-located with components in `__tests__/`)
- MSW server instance available globally as `__msw_server__` for test customization

**E2E Tests (Playwright):**
- Located in `tests/` directory
- Configured in `playwright.config.ts` to auto-start dev server on port 3000
- Example: `tests/celebrity-endorsements.spec.ts`
- Run specific test: `npx playwright test tests/specific.spec.ts`
- UI mode: `npx playwright test --ui` for interactive debugging

**Test Isolation:**
- Note: Some tests have mock isolation issues with live Supabase in CI
- Production deploys skip unit tests but run lint, type-check, and build

### Deployment Architecture

**Production (GitHub Pages):**
- Deployed via `.github/workflows/deploy.yml` on push to `main`
- Builds with production env vars from GitHub secrets
- URL: www.perhitsiksha.org
- Post-deployment: health checks + Supabase connectivity verification

**Staging (Cloudflare Tunnel):**
- Deployed via `.github/workflows/deploy-staging.yml`
- URL: staging.materiallab.io
- Tests full production build before merging to main

**CI/CD Pipeline:**
- `pr-validate.yml` - Runs on PRs: lint, type-check, test, build
- `nightly-tests.yml` - Scheduled E2E tests
- All workflows enforce conventional commits via `commitlint.config.js`

## Development Guidelines

### Commit Conventions
Follow conventional commits (enforced by commitlint):
- `feat:` new features
- `fix:` bug fixes
- `perf:` performance improvements
- `refactor:` code restructuring
- `test:` test additions/changes
- `docs:` documentation
- `style:` formatting, no code change
- `revert:` reverts a previous commit
- `build:`, `ci:`, `chore:`

Max subject length: 100 chars
Max body line length: 100 chars

### Styling Patterns
- Use Tailwind utility classes for all styling
- Component-specific styles are inline via className
- Responsive design: mobile-first with `sm:`, `md:`, `lg:`, `xl:` breakpoints
- Animations use Tailwind's `transition-*` utilities

**Responsive Breakpoint Guidelines:**
- **Header Navigation:** Uses `lg:` breakpoint (1024px)
  - Burger menu for < 1024px (phones & tablets)
  - Full navigation for ≥ 1024px (laptops & desktops)
- **EventsCarousel:** Uses `xl:` breakpoint (1280px)
  - Single column layout for < 1280px (phones & tablets)
  - Side-by-side layout with fixed heights for ≥ 1280px (large screens)
- When creating responsive layouts with significant structural changes (grid to flex, column count changes), prefer `xl:` for tablets to avoid overlap issues at 1024px
- Test responsive behavior at key widths: 375px (mobile), 768px (tablet), 1024px (small laptop), 1280px (desktop)

### State Management
- No global state library (Redux/Zustand)
- Component state via `useState`, `useReducer`
- Shared state lifted to nearest common ancestor or Context
- API state managed in service layer (`src/services/supabase.ts`)

### Performance Considerations
- Lazy loading not currently implemented (small app)
- Images should use responsive formats and lazy loading attributes
- Carousels use `requestAnimationFrame` for smooth scrolling
- Visitor counter implements client-side caching (TTL from `config.counter.cacheTTL`)

### TypeScript Patterns
- Strict type checking enabled
- Types defined in `src/types/index.ts` for shared interfaces
- Avoid `any` - use `unknown` or proper types
- Component props use explicit interfaces (e.g., `ButtonProps`, `HeroProps`)

### SEO & Metadata Management

**Structured Data & Meta Tags:**
- Both `index.html` and `public/404.html` contain identical structured data (JSON-LD)
- Structured data includes: organization info, contact details, address, social media links
- Must be kept in sync across both files when updating contact information

**Official Contact Information** (must be consistent across all files):
- **Phone:** +91 81422 38633 (WhatsApp: `wa.me/918142238633`)
- **Email:** clsi.perhitsiksha@gmail.com
- **Address:** H NO. 659 Eldeco Udayan-I, Sec-3 Bangla Bazar, Dilkusha, Lucknow, Uttar Pradesh - 226002
- **Facebook:** https://www.facebook.com/share/19uSggzByG/
- **YouTube:** https://www.youtube.com/@PerhitSikshaFoundation
- **Founding Date:** 2009 (in structured data)
- **Legal Registration:** December 6, 2025 (CIN: U85500UP2025NPL237759)

**SEO Files:**
- `public/robots.txt` - Allows all crawlers, points to sitemap
- `public/sitemap.xml` - Lists all pages with priorities and update frequencies
- Update sitemap's `<lastmod>` dates when making significant content changes
- Submit sitemap to Google Search Console after deployment

**When Adding New Pages:**
1. Create component in `src/pages/`
2. Add route in `src/App.tsx` `<Routes>` block
3. Update navigation in `src/components/Layout/Header.tsx`
4. Add URL to `public/sitemap.xml` with appropriate priority and change frequency

### Working with Supabase
- Always check `config.supabase.enabled` before using client
- Use `pageViewService` singleton for visitor tracking
- Handle errors gracefully - log and return fallback values
- Local development: `npx supabase start` for full local stack
- Database schema changes require migrations via Supabase CLI

### Content Management

**Branding & Naming:**
- Organization name: **"Perhitsiksha"** (capitalized) for display/branding
- Lowercase **"perhitsiksha"** used only in technical contexts (emails, URLs, package names)
- Official legal name: **"Perhitsiksha Foundation"**
- Legal entity: Section 8 Company under Companies Act, 2013
- Full legal details available in `src/components/Layout/Footer.tsx`

**Key Content Locations:**
- **Celebrity Endorsements:** Hardcoded array in `src/pages/Home.tsx` (lines 22-113)
  - Add new celebrities by appending to the `celebrityEndorsements` array with `id`, `name`, `videoId`, and `profession`
  - YouTube video IDs extracted from youtube.com/watch?v=ID or youtube.com/shorts/ID
- **Student Testimonials:** JSON file at `src/data/testimonials.json`
  - Videos embedded via `youtubeId` field
  - Filtered by `role: "Student"` for Voices of Change carousel
- **Recent Events:** Hardcoded array in `src/pages/Home.tsx` (EventsCarousel events prop)
  - Add new events by appending to the events array with: `id`, `title`, `description`, `date`, `image`, `imageAlt`, `ctaText`, `ctaLink`
  - Images stored in `public/` folder (referenced as `/filename.jpg`)
  - Events display in carousel with auto-rotation
- **Ticker Banner:** `src/components/ui/TickerBanner.tsx`
  - Contains registration announcement
  - Responsive: static on desktop (≥1024px), scrolling on mobile (<1024px)
  - Links to certificate on Google Drive
- **Hero Section:** Title uses TypewriterText, supports optional `subheadline` (bold prominent text), subtitle, and CTAs
- **Registration Certificate:**
  - Image: `public/certificate-of-incorporation.jpg` (local file)
  - PDF: Google Drive link (in ticker banner and Official Registration section)
  - Details section in `src/pages/Home.tsx` (Official Registration section)

### Node.js Version Requirement
This project requires **Node.js v20+** due to Vite 7 dependency.
- If using nvm: `nvm use` (reads `.nvmrc` if present)
- Setup script `./setup.sh` auto-installs Node 20 via nvm

### Icon Library
- Project uses **`react-icons`** for all icons
- Common icon sets available: Font Awesome (`react-icons/fa`), Heroicons (`react-icons/hi`), Material Design
- Example: `import { FaExternalLinkAlt } from 'react-icons/fa';`

### Working with Images
- Static images stored in `public/` folder are served from root path `/`
- Example: `public/certificate-of-incorporation.jpg` is referenced as `src="/certificate-of-incorporation.jpg"`
- For assets imported in components, use `src/assets/images/`
- Prefer local hosting over external services (e.g., Google Drive) for reliability and performance
