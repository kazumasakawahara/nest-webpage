import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Drift guard: the sw.js precache list is authored as a literal array, so a
// new art SVG (or a deleted one) can silently fall out of sync with it.
// This test locks public/apps/tsutaeru/art/ and sw.js's PRECACHE together.

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const SW_PATH = ROOT + 'public/apps/tsutaeru/sw.js';
const ART_DIR = ROOT + 'public/apps/tsutaeru/art';

function precachedArtPaths(): string[] {
  const sw = readFileSync(SW_PATH, 'utf8');
  return [...sw.matchAll(/'(\/apps\/tsutaeru\/art\/[^']+)'/g)].map((m) => m[1]);
}

function artFilePaths(): string[] {
  return readdirSync(ART_DIR)
    .filter((f) => f.endsWith('.svg'))
    .map((f) => `/apps/tsutaeru/art/${f}`);
}

describe('sw.js precache list', () => {
  it('includes every SVG in public/apps/tsutaeru/art/', () => {
    const cached = new Set(precachedArtPaths());
    const missing = artFilePaths().filter((p) => !cached.has(p));
    expect(missing).toEqual([]);
  });

  it('has no art entry without a matching file', () => {
    const files = new Set(artFilePaths());
    const orphans = precachedArtPaths().filter((p) => !files.has(p));
    expect(orphans).toEqual([]);
  });
});
