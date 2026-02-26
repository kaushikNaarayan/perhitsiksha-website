# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Initial Setup (automated - handles Node.js version + npm install)
./setup.sh && cp .env.example .env   # Then fill in .env values

# Development
npm run dev                 # Start dev server on http://localhost:3000
npm run build               # TypeScript compile + production build
npm run preview             # Preview production build locally

# Testing
npm run test                # Run Vitest (single run)
npm run test:watch          # Run Vitest in watch mode
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
npm run size                # Analyze bundle size

# Supabase (Local Development)
npx supabase start          # Start local Supabase stack (Studio at http://127.0.0.1:54323)
npx supabase stop           # Stop local Supabase
npx supabase db reset       # Reset database to migrations

# Facebook Events (Automation)
npm run fetch:facebook      # Fetch events from Facebook Graph API
npm run validate:events     # Validate facebook-events.json schema
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
  - **EventsCarousel** - Auto-rotating carousel for Recent Events section (automated via Facebook API)
    - Auto-rotates every 4 seconds (configurable via `autoRotateInterval` prop)
    - Pauses on hover (desktop), continuous rotation on touch devices
    - Navigation arrows positioned on image corners
    - Pagination dots for manual navigation
    - Responsive layout: single column (<1280px), side-by-side (≥1280px)
    - Fixed heights on desktop to prevent container jumping between slides
    - Supports single images, single videos, and album posts (multiple media)
    - Clicking album posts opens GalleryModal, videos open VideoModal
- **GalleryModal** - Full-screen lightbox for viewing album posts
  - Navigation with arrows, swipe gestures, pagination dots
  - Keyboard navigation (arrow keys, ESC to close)
  - Media counter ("2 / 5") and event title display
  - Uses MediaViewer for rendering individual images/videos
- **MediaViewer** - Renders individual media items (images or Facebook videos) within gallery
  - Lazy loading for images when not active
  - Facebook video embeds with mobile fallback (opens in Facebook app on mobile)
- **VideoModal** - Supports both YouTube and Facebook video playback
  - Platform detection via `platform` prop ('youtube' | 'facebook')
  - YouTube: existing implementation with youtube-nocookie.com
  - Facebook: iframe embed with mobile fallback
- **YouTubeEmbed** - Reusable YouTube iframe wrapper with 16:9 aspect ratio and privacy-enhanced nocookie domain
- **VisitorCounter** - Displays page views from Supabase with caching
- **GoogleAnalytics** - GA4 integration (only enabled in production)
- **TypewriterText**, **StatsCounter** - Animated text effects
- **Hero** - Hero section with conditional logo, subheadline, and subtitle support
  - Supports optional `subheadline` prop (bold, prominent text below title)
  - Uses `heading-1` class by default, `heading-2` when `showLogo={true}`
  - Social icons (Facebook, YouTube) rendered when `primaryCTA` is present

**Type System** (`src/types/index.ts`):
- Domain types: `Testimonial`, `Story`, `Program`, `Stats`, `TeamMember`, `TimelineEvent`, `Event`, `MediaItem`
- Component prop types: `ButtonProps`, `CardProps`, `HeroProps`, `YouTubeEmbedProps`
- Testimonial roles: `'Student' | 'Parent' | 'Mentor' | 'Contributor'`
- Story categories: `'Education' | 'Career' | 'Community'`
- Event media types: `'image' | 'video' | 'text' | 'album'`
- MediaItem types: `'image' | 'video'` (for album posts)

### Configuration System

**Environment Variables** (`src/config/environment.ts`):
- Validates all env vars with Zod schema at startup
- Exports `config` object with typed settings for Supabase, analytics, features
- Exports `isDevelopment`, `isStaging`, `isProduction` helpers
- Feature flags in `config.features` control behavior per environment

**Required Environment Variables:**
```bash
# Application
VITE_SUPABASE_URL           # Supabase project URL
VITE_SUPABASE_ANON_KEY      # Supabase anon key
VITE_ENVIRONMENT            # development | staging | production
VITE_GA_MEASUREMENT_ID      # Google Analytics (optional)

# Facebook API (for local fetch script testing only)
FACEBOOK_PAGE_ID            # Facebook Page ID (stored in GitHub Secrets for CI)
FACEBOOK_ACCESS_TOKEN       # Long-lived Page Access Token (stored in GitHub Secrets for CI)
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
- `sync-facebook-events.yml` - Daily automated sync of Facebook events at 8 AM UTC
- All workflows enforce conventional commits via `commitlint.config.js`

### Facebook Events Automation System

**Overview:**
Recent Events in the EventsCarousel are automatically synced from the Perhitsiksha Foundation Facebook page daily via GitHub Actions. No manual code updates needed.

**How It Works:**
1. **Daily Sync:** GitHub Actions workflow runs at 8 AM UTC (1:30 PM IST)
2. **Fetch Script:** `scripts/fetch-facebook-events.js` fetches latest 15 posts via Facebook Graph API
3. **Smart Filtering:** Only posts with media (photo/video/album) AND message ≥20 chars are included
4. **Image Processing:** Downloads and compresses images to ~200KB using Sharp library
5. **Album Support:** For album posts, downloads first image as thumbnail, stores rest as CDN URLs
6. **Data Output:** Writes to `src/data/facebook-events.json` (top 10 valid events)
7. **Validation:** Zod schema validates event structure before commit
8. **Smart Caching:** Re-runs skip re-downloading existing images, complete in ~1-2 seconds
9. **Auto-Commit:** If changes detected, commits to main and triggers deployment

**Key Files:**
- `scripts/fetch-facebook-events.js` (~300 lines) - Main fetch and transform logic
- `scripts/validate-events-data.js` (~80 lines) - Zod validation schema
- `src/data/facebook-events.json` - Generated events data (consumed by EventsCarousel)
- `public/fb-events/` - Downloaded and compressed event images
- `.github/workflows/sync-facebook-events.yml` - Daily automation workflow

**GitHub Secrets Required:**
- `FACEBOOK_PAGE_ID` - Numeric Facebook Page ID
- `FACEBOOK_ACCESS_TOKEN` - Long-lived Page Access Token (~60 day expiry)

**Local Development:**
```bash
# Set environment variables
export FACEBOOK_PAGE_ID="your-page-id"
export FACEBOOK_ACCESS_TOKEN="your-token"

# Fetch events manually
npm run fetch:facebook

# Validate output
npm run validate:events

# Check generated files
cat src/data/facebook-events.json
ls -lh public/fb-events/
```

**Event Structure:**
```typescript
interface Event {
  id: string;              // Facebook post ID
  title: string;           // First line of message (max 100 chars)
  description: string;     // Full message text
  date: string;            // Formatted as "Jan 26, 2026"

  // Single media fields
  image?: string;          // Path to downloaded image
  imageAlt?: string;       // Alt text from post
  videoUrl?: string;       // Facebook video URL

  // Album support
  mediaType?: 'image' | 'video' | 'text' | 'album';
  thumbnailImage?: string; // First image for albums
  thumbnailAlt?: string;
  mediaCount?: number;     // Total media items in album
  media?: MediaItem[];     // Array of album media (CDN URLs)

  // CTA
  ctaText: string;         // "View on Facebook"
  ctaLink: string;         // Facebook post permalink
}
```

**Mobile Video Handling:**
Facebook video iframes don't work reliably on mobile browsers. Both VideoModal and MediaViewer detect mobile devices and show a "Watch on Facebook" button that opens the video in the Facebook app instead of embedding.

**Token Renewal:**
The current Page Access Token is **permanent** (`expires_at: 0`) — it does not expire every 60 days. This is because it was derived from a long-lived user token, which makes Facebook issue a non-expiring Page token.

However, **data access** (`data_access_expires_at`) expires around **mid-May 2026**. When this hits, the token remains valid but API calls will start failing. To renew data access:
1. Go to Facebook Graph API Explorer
2. Generate a new short-lived user token with the required permissions
3. Exchange for a long-lived user token via the API
4. Get the Page Access Token from the `/me/accounts` endpoint
5. Update `FACEBOOK_ACCESS_TOKEN` secret in GitHub

**Error Handling:**
If the workflow fails (token expired, API issues, network problems), it automatically creates a GitHub issue with:
- Workflow run link
- Possible causes (token expiry, rate limits, API status)
- Troubleshooting steps
- Links to Facebook Developer tools

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

**Brand Color Palette** (defined in `tailwind.config.js`):
- `primary-500: #0068B3` - Main brand blue (buttons, links, focus rings)
- `accent-500: #00A6E7` - Light blue accent
- `success-500: #00B388` - Success green
- Custom gray scale with values aligned to Google's Material palette

**Custom CSS Classes** (defined in `src/index.css`):
- Buttons: `btn-primary`, `btn-secondary`, `btn-outline`
- Layout: `card`, `container-padding`, `section-padding`
- Typography: `heading-1`, `heading-2`, `heading-3`, `body-large`, `body-base`
- Utilities: `hide-scrollbar` (carousels), `hover-lift`, `hero-content-box`, `shimmer-btn`
- YouTube: `youtube-embed` (16:9 responsive iframe wrapper)

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
- **Recent Events:** AUTOMATED via Facebook API - no manual updates needed
  - Data source: `src/data/facebook-events.json` (auto-generated daily)
  - Images: `public/fb-events/` (auto-downloaded and compressed)
  - Syncs daily at 8 AM UTC via GitHub Actions workflow
  - To manually trigger sync: Go to Actions → Sync Facebook Events → Run workflow
  - Supports single images, videos, and album posts with gallery modal
  - Post directly to Facebook page - changes appear automatically within 24 hours
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
- Automated: `./setup.sh` checks version and auto-installs Node 20 via nvm if needed
- Manual: `nvm install 20 && nvm use 20`
- **Error symptom:** `TypeError: crypto.hash is not a function` = Node < 20

### Icon Library
- Project uses **`react-icons`** for all icons
- Common icon sets available: Font Awesome (`react-icons/fa`), Heroicons (`react-icons/hi`), Material Design
- Example: `import { FaExternalLinkAlt } from 'react-icons/fa';`

### Working with Images
- Static images stored in `public/` folder are served from root path `/`
- Example: `public/certificate-of-incorporation.jpg` is referenced as `src="/certificate-of-incorporation.jpg"`
- For assets imported in components, use `src/assets/images/`
- Prefer local hosting over external services (e.g., Google Drive) for reliability and performance
