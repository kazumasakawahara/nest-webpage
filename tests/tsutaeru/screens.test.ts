import { describe, it, expect } from 'vitest';
import { buildHistoryEntry, findCard } from '~/apps/tsutaeru/ui/screens';
import { createSession, tap } from '~/apps/tsutaeru/flow';
import { PRESET_THEMES } from '~/apps/tsutaeru/presets';
import type { Session } from '~/apps/tsutaeru/flow';
import type { Theme } from '~/apps/tsutaeru/types';

function theme(id: string): Theme {
  const t = PRESET_THEMES.find((x) => x.id === id);
  if (!t) throw new Error(`missing theme ${id}`);
  return t;
}

// Commit a card (two taps: pending, then confirm).
function commit(s: Session, cardId: string): Session {
  return tap(tap(s, cardId), cardId);
}

describe('buildHistoryEntry', () => {
  it('maps theme id/title and picks, and injects id/at', () => {
    let s = createSession(theme('yesno'));
    s = commit(s, 'yn-hai');
    expect(s.done).toBe(true);

    const entry = buildHistoryEntry(s, '2026-07-16T05:00:00.000Z', 'uuid-1');

    expect(entry.id).toBe('uuid-1');
    expect(entry.at).toBe('2026-07-16T05:00:00.000Z');
    expect(entry.themeId).toBe('yesno');
    expect(entry.themeTitle).toBe('はい・いいえ');
    expect(entry.picks).toEqual([
      { questionId: 'yn-main', cardId: 'yn-hai', label: 'はい' },
    ]);
  });

  it('carries all picks in order for a multi-question theme', () => {
    let s = createSession(theme('emotion'));
    s = commit(s, 'emo-ureshii');
    s = commit(s, 'emo-totemo');
    expect(s.done).toBe(true);

    const entry = buildHistoryEntry(s, '2026-07-16T05:00:00.000Z', 'uuid-2');

    expect(entry.picks.map((p) => p.label)).toEqual(['うれしい', 'とても']);
  });

  it('copies picks so later session mutation does not leak into the entry', () => {
    let s = createSession(theme('yesno'));
    s = commit(s, 'yn-iie');
    const entry = buildHistoryEntry(s, 'now', 'id');

    entry.picks[0].label = 'CHANGED';
    expect(s.picks[0].label).toBe('いいえ');
  });
});

describe('findCard', () => {
  it('resolves a card id across a theme\'s questions', () => {
    const t = theme('emotion');
    const card = findCard(t, 'emo-totemo');
    expect(card?.label).toBe('とても');
  });
  it('returns undefined for escape-card ids (they live in flow, not the theme)', () => {
    expect(findCard(theme('yesno'), '_none')).toBeUndefined();
  });
  it('returns undefined for an unknown id', () => {
    expect(findCard(theme('yesno'), 'nope')).toBeUndefined();
  });
});
