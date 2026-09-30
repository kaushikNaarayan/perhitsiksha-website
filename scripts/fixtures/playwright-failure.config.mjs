import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'playwright-failure.spec.mjs',
  retries: 0,
  workers: 1,
});
