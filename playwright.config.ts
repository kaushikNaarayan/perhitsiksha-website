import { defineConfig, devices } from '@playwright/test';

// pw-goht: dedicated port for CI so this suite's dev server can never be the
// victim of accessibility-check's "reap orphan servers on port 3000" step —
// both jobs can land on the same shared gt2 runner and run concurrently,
// and that step's `kill -9` doesn't know or care whose process it owns. It
// killed this suite's server mid-run the first time both jobs overlapped
// (CI run 32559739222). Local dev keeps port 3000 unchanged.
const PORT = process.env.CI ? 3100 : 3000;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    // --strictPort: fail loudly if the port is taken instead of Vite
    // silently picking a different one — the exact class of bug pw-9q5
    // already found once on this repo's other preview-server usages.
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
  },
});
