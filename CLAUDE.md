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
- **Carousels:** `EnhancedCarousel`, `CelebrityCarousel`, `TestimonialCarousel`, `YouTubeShortsCarousel`, `PeekCarousel` - various carousel implementations with drag-to-scroll, autoplay, and accessibility features
- **VisitorCounter** - Displays page views from Supabase with caching
- **GoogleAnalytics** - GA4 integration (only enabled in production)
- **TypewriterText**, **StatsCounter** - Animated text effects

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
- Example: `src/components/__tests__/VisitorCounter.test.tsx`
- Run with `npm run test` in watch mode
- Run specific test: `npm run test -- ComponentName` or `npm run test -- src/path/to/test.tsx`
- Test files: `src/**/*.{test,spec}.{ts,tsx}` (co-located with components in `__tests__/`)

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
- `build:`, `ci:`, `chore:`

Max subject length: 100 chars
Max body line length: 100 chars

### Styling Patterns
- Use Tailwind utility classes for all styling
- Component-specific styles are inline via className
- Responsive design: mobile-first with `sm:`, `md:`, `lg:` breakpoints
- Animations use Tailwind's `transition-*` utilities

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

### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `src/App.tsx` `<Routes>` block
3. Update navigation in `src/components/Layout/Header.tsx`
4. Consider adding to sitemap for SEO

### Working with Supabase
- Always check `config.supabase.enabled` before using client
- Use `pageViewService` singleton for visitor tracking
- Handle errors gracefully - log and return fallback values
- Local development: `npx supabase start` for full local stack
- Database schema changes require migrations via Supabase CLI

### Content Management

**Celebrity Endorsements Carousel** (`src/pages/Home.tsx`):
- Videos stored as hardcoded array in `celebrityEndorsements` (lines 22-95+)
- Uses YouTube video IDs, not local files
- To add new celebrity:
  ```typescript
  {
    id: '16',
    name: 'Celebrity Name',
    videoId: 'YOUTUBE_VIDEO_ID',  // Extract from youtube.com/watch?v=ID or youtube.com/shorts/ID
    profession: 'Their Profession',
  }
  ```

**Student Testimonials** (`src/data/testimonials.json`):
- JSON file with testimonial data
- Videos embedded via `youtubeId` field
- Filtered by `role: "Student"` for Voices of Change carousel
- Add new entries directly to JSON array

**Footer Branding** (`src/components/Layout/Footer.tsx`):
- Material Lab attribution in bottom bar
- Links to https://www.materiallab.io/

### Node.js Version Requirement
This project requires **Node.js v20+** due to Vite 7 dependency.
- If using nvm: `nvm use` (reads `.nvmrc` if present)
- Setup script `./setup.sh` auto-installs Node 20 via nvm
