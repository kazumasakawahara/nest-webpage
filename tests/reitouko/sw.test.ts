import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// sw.js の PRECACHE に挙げたファイルが public/ に実在することを確かめる
// （1 つでも欠けると cache.addAll が失敗し、オフラインで開けなくなる）。
const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const SW = readFileSync(ROOT + 'public/apps/reitouko/sw.js', 'utf8');

describe('reitouko sw.js', () => {
  it('PRECACHE の各ファイルが public/ にある', () => {
    const urls = [...SW.matchAll(/'(\/apps\/reitouko\/[^']+)'/g)].map((m) => m[1]).filter((u) => u !== '/apps/reitouko/');
    expect(urls.length).toBeGreaterThan(0);
    for (const u of urls) expect(existsSync(ROOT + 'public' + u), u).toBe(true);
  });
  it('manifest のアイコンも実在する', () => {
    const m = JSON.parse(readFileSync(ROOT + 'public/apps/reitouko/manifest.webmanifest', 'utf8'));
    expect(m.start_url).toBe('/apps/reitouko/');
    for (const ic of m.icons) expect(existsSync(ROOT + 'public' + ic.src), ic.src).toBe(true);
  });
});
