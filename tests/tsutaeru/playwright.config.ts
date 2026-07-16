import { fileURLToPath } from 'node:url';
import { defineConfig } from '@playwright/test';

// Dedicated config for the つたえるカード PWA smoke suite.
//
// Kept separate from the repo-wide playwright.config.ts (which serves
// `npm run dev` from tests/e2e). This suite must run against the *production*
// static build served out of dist/client — the Astro dev server does not
// reproduce the hashed /_astro/ bundles nor Cloudflare's static delivery, so
// verifying the built app there would be misleading (see Task 14 report).
//
// The static file server that serves dist/client is started/stopped inside the
// spec's beforeAll/afterAll (self-contained, no extra process to manage here).
//
// Run:  npx playwright test --config tests/tsutaeru/playwright.config.ts
//
// Note: file is named .config.ts / .spec.ts (not *.test.ts) so vitest's
// include glob (tests/**/*.test.ts) never picks it up.

const here = fileURLToPath(new URL('.', import.meta.url));
export const PORT = 5099;

export default defineConfig({
  testDir: here,
  testMatch: 'smoke.spec.ts',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Mobile viewport per Task 16 brief (iPhone-ish portrait).
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3,
    // Scenario 4 reads navigator.clipboard.readText() after コピーする.
    permissions: ['clipboard-read', 'clipboard-write'],
  },
  // Default browser is chromium; isMobile is chromium-only.
  projects: [{ name: 'chromium' }],
});
