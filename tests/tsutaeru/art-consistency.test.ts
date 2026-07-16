import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { PRESET_THEMES } from '~/apps/tsutaeru/presets';
import { ART_IDS } from '~/apps/tsutaeru/art';

// Every art id the app can reference must resolve to a real SVG on disk. This
// is the check that would have caught str-sukoshi/str-totemo shipping in
// presets.ts + ART_IDS with no matching file in public/apps/tsutaeru/art/.

const ART_DIR = fileURLToPath(new URL('../../public/apps/tsutaeru/art/', import.meta.url));

function artExists(id: string): boolean {
  return existsSync(ART_DIR + `${id}.svg`);
}

// Collect every art id a card references (cards mirror id into art, but honour
// an explicit `art` when present) across all preset themes.
function presetCardArtIds(): string[] {
  const ids: string[] = [];
  for (const theme of PRESET_THEMES) {
    for (const q of theme.questions) {
      for (const card of q.cards) {
        ids.push(card.art ?? card.id);
      }
    }
  }
  return [...new Set(ids)];
}

describe('art asset consistency', () => {
  it('every art id used by a preset card has a file', () => {
    const missing = presetCardArtIds().filter((id) => !artExists(id));
    expect(missing).toEqual([]);
  });

  it('every ART_IDS entry has a file', () => {
    const missing = ART_IDS.filter((id) => !artExists(id));
    expect(missing).toEqual([]);
  });

  it('every theme icon has a file', () => {
    const missing = PRESET_THEMES.map((t) => t.icon).filter((id) => !artExists(id));
    expect(missing).toEqual([]);
  });

  it('the escape-card art (esc-none / esc-unknown) exists', () => {
    expect(artExists('esc-none')).toBe(true);
    expect(artExists('esc-unknown')).toBe(true);
  });
});
