# PerhitSiksha Website

Modern React + TypeScript + Vite application for the PerhitSiksha nonprofit organization.

## Prerequisites

- **Node.js v20+** (required for Vite 7.x)
- **npm v10+**
- Supabase CLI (optional, for local development)

## Quick Start

### Automated Setup (Recommended)

```bash
./setup.sh
npm run dev
```

The setup script will:
- Check your Node.js version (requires v20+)
- Auto-install Node 20 via nvm if needed
- Install all dependencies
- Verify the environment

### Manual Setup

```bash
# Check Node.js version
node --version  # Must be v20 or higher

# If using nvm, switch to Node 20
nvm use

# Install dependencies
npm install

# Start development server (port 3000)
npm run dev
```

## Development

```bash
# Start dev server
npm run dev                 # http://localhost:3000

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test                # Watch mode
npm run test:coverage       # With coverage
npm run test:ui             # UI interface

# Code quality
npm run lint                # ESLint
npm run format              # Prettier format
npm run format:check        # Check formatting

# Type checking
npx tsc --noEmit
```

## Supabase Local Development

```bash
# Start Supabase (PostgreSQL, Auth, Storage, etc.)
npx supabase start

# Stop Supabase
npx supabase stop

# View Supabase Studio
# http://127.0.0.1:54323

# Database migrations
npx supabase db reset
npx supabase migration list
```

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite 7** - Build tool & dev server
- **Tailwind CSS** - Styling
- **Supabase** - Backend (database, visitor counter)
- **Vitest** - Testing framework
- **React Router** - Client-side routing

## Project Structure

```
src/
├── components/       # React components
│   ├── Layout/      # Header, Footer
│   ├── ui/          # Reusable UI components
│   └── __tests__/   # Component tests
├── pages/           # Page components
├── config/          # Environment configuration
├── services/        # API services (Supabase)
├── data/            # JSON data files
├── types/           # TypeScript types
└── utils/           # Utility functions
```

## Common Issues

### Node.js Version Error

**Error:** `TypeError: crypto.hash is not a function`

**Solution:** Vite 7 requires Node.js 20+. Run `./setup.sh` to auto-fix.

```bash
# Using nvm
nvm install 20
nvm use 20

# Or run the setup script
./setup.sh
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Supabase (Primary - Recommended)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Environment
VITE_ENVIRONMENT=development

# Optional: Google Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Deployment

- **Production:** www.perhitsiksha.org (GitHub Pages)
- **Staging:** staging.materiallab.io (Cloudflare Tunnel)

```bash
# Deploy to GitHub Pages
npm run build
gh-pages -d dist
```

## Contributing

See [CLAUDE.md](../CLAUDE.md) for detailed development guidelines.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
