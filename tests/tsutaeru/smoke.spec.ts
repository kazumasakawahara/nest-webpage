import { createServer, type Server } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, expect, type Page } from '@playwright/test';
import { PORT } from './playwright.config';

// ── Static server for the production build ──────────────────────────────────
// Serves dist/client exactly as Cloudflare would (plain files, explicit MIME).
// This is the only faithful target: `astro preview` returns a dev server here.
// Run `npm run build` before this suite so dist/client is fresh.

const DIST = fileURLToPath(new URL('../../dist/client/', import.meta.url));

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2',
};

let server: Server;

test.beforeAll(async () => {
  server = createServer(async (req, res) => {
    try {
      let path = decodeURIComponent((req.url ?? '/').split('?')[0]);
      if (path.endsWith('/')) path += 'index.html';
      // Contain path traversal: normalise and re-root under DIST.
      const rel = normalize(path).replace(/^(\.\.[/\\])+/, '');
      const file = join(DIST, rel);
      if (!file.startsWith(DIST)) {
        res.writeHead(403).end();
        return;
      }
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404).end('not found');
    }
  });
  await new Promise<void>((resolve) => server.listen(PORT, resolve));
});

test.afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

// ── Helpers ─────────────────────────────────────────────────────────────────

const APP = '/apps/tsutaeru/';

/**
 * The app's tap semantics: a card's FIRST tap selects it (adds `.selected`), the
 * SECOND tap on the same card commits and advances. The app re-renders between
 * taps (root is cleared + rebuilt), so we re-query the locator each click.
 */
async function commitCard(page: Page, label: string): Promise<void> {
  const card = page.locator('.card-btn', { hasText: label });
  await card.click(); // first tap: select
  await expect(page.locator('.card-btn.selected')).toContainText(label);
  await card.click(); // second tap: commit
}

/** Run the built-in きもち theme end to end, picking うれしい then とても. */
async function runKimochi(page: Page): Promise<void> {
  await page.locator('.theme-btn', { hasText: 'きもち' }).click();
  await expect(page.locator('.prompt')).toHaveText('いま、どんな きもち？');
  await commitCard(page, 'うれしい');
  await expect(page.locator('.prompt')).toHaveText('どのくらい？');
  await commitCard(page, 'とても');
}

// ── Scenarios ────────────────────────────────────────────────────────────────

test('1. home renders: 7 themes, gear, ほんにんモード toggle', async ({ page }) => {
  await page.goto(APP);
  await expect(page.locator('.theme-btn')).toHaveCount(7);
  await expect(page.locator('.gear')).toBeVisible();
  await expect(page.locator('.kiosk-toggle')).toBeVisible();
  await expect(page.locator('.kiosk-toggle')).toHaveText('ほんにんモード');
});

test('2. きもち full run reaches result with both picks', async ({ page }) => {
  // The app must no-op safely without a headless speech engine: assert zero
  // uncaught page errors across the whole run.
  const pageErrors: string[] = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));

  await page.goto(APP);
  await runKimochi(page);

  // Result screen: the two picked labels + もういちど / ホームへ.
  await expect(page.locator('.result-card')).toHaveCount(2);
  await expect(page.locator('.result-card').nth(0)).toContainText('うれしい');
  await expect(page.locator('.result-card').nth(1)).toContainText('とても');
  await expect(page.locator('.action-btn', { hasText: 'もういちど' })).toBeVisible();
  await expect(page.locator('.action-btn', { hasText: 'ホームへ' })).toBeVisible();

  expect(pageErrors, `unexpected page errors: ${pageErrors.join(' | ')}`).toEqual([]);
});

test('3. history shows exactly one entry with the picked labels', async ({ page }) => {
  await page.goto(APP);
  await runKimochi(page);

  // From result, back home, then into 支援者ゾーン via the gear.
  await page.locator('.action-btn', { hasText: 'ホームへ' }).click();
  await page.locator('.gear').click();

  // りれき is the default tab. Exactly one row for the single session.
  await expect(page.locator('.support-tab.active')).toHaveText('りれき');
  await expect(page.locator('.history-row')).toHaveCount(1);
  // NOTE: the on-screen row is formatRow() = `M/D HH:MM <picks>` — it does NOT
  // include the theme title (きもち); that is a Task 8 design decision (flat
  // list). We assert the picked labels, which are what the row actually shows.
  await expect(page.locator('.history-line')).toContainText('うれしい → とても');
  await expect(page.locator('.row-delete')).toBeVisible();
});

test('4. copy produces the ■-date heading and picks line', async ({ page }) => {
  await page.goto(APP);
  await runKimochi(page);
  await page.locator('.action-btn', { hasText: 'ホームへ' }).click();
  await page.locator('.gear').click();

  await page.locator('.copy-btn', { hasText: 'コピーする' }).click();
  await expect(page.locator('.toast')).toHaveText('コピーしました');

  const clip = await page.evaluate(() => navigator.clipboard.readText());
  // export.ts formatEntries(): `■ YYYY/MM/DD` heading + `YYYY/MM/DD HH:MM <picks>`.
  expect(clip).toMatch(/■ \d{4}\/\d{2}\/\d{2}/);
  expect(clip).toContain('うれしい → とても');
});

test('5. ふりかえり branch inserts the からだ follow-up question', async ({ page }) => {
  await page.goto(APP);
  await page.locator('.theme-btn', { hasText: 'ふりかえり' }).click();

  await expect(page.locator('.prompt')).toHaveText('きょうは どうだった？');
  await commitCard(page, 'たのしかった');

  await expect(page.locator('.prompt')).toHaveText('なにが あった？');
  await commitCard(page, 'からだのこと'); // carries next: rev-body

  // The branch question (rev-body) appears next. NOTE: the actual prompt is
  // 'からだは どうだった？' (presets.ts is truth; the brief's "からだのようす"
  // is an earlier working name).
  await expect(page.locator('.prompt')).toHaveText('からだは どうだった？');
  await commitCard(page, 'ねむれなかった');

  // Result shows all three picks in order.
  await expect(page.locator('.result-card')).toHaveCount(3);
  await expect(page.locator('.result-card').nth(0)).toContainText('たのしかった');
  await expect(page.locator('.result-card').nth(1)).toContainText('からだのこと');
  await expect(page.locator('.result-card').nth(2)).toContainText('ねむれなかった');
});
