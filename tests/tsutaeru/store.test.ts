import { describe, it, expect, beforeEach } from 'vitest';
import { PRESET_THEMES } from '~/apps/tsutaeru/presets';
import type { HistoryEntry } from '~/apps/tsutaeru/types';
import {
  loadThemes,
  saveThemes,
  addHistory,
  listHistory,
  deleteHistory,
  clearHistory,
  loadSettings,
  saveSettings,
  resetAll,
} from '~/apps/tsutaeru/store';

// The vitest environment is `node`, which has no localStorage. Install a
// minimal in-memory mock on globalThis so the store module (which reads
// `localStorage`) has something to talk to.
class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
  // Direct raw access used by tests to inject corrupted values.
  _raw(key: string, value: string): void {
    this.store.set(key, value);
  }
}

const THEMES_KEY = 'tsutaeru.themes.v1';
const HISTORY_KEY = 'tsutaeru.history.v1';
const SETTINGS_KEY = 'tsutaeru.settings.v1';

let mem: MemoryStorage;

beforeEach(() => {
  mem = new MemoryStorage();
  (globalThis as unknown as { localStorage: MemoryStorage }).localStorage = mem;
});

function makeEntry(id: string): HistoryEntry {
  return {
    id,
    at: new Date().toISOString(),
    themeId: 'emotion',
    themeTitle: 'きもち',
    picks: [{ questionId: 'emo-which', cardId: 'emo-ureshii', label: 'うれしい' }],
  };
}

describe('themes persistence', () => {
  it('save → reload round-trips a modified theme set', () => {
    const themes = loadThemes();
    themes[0].title = 'かわった';
    saveThemes(themes);
    const reloaded = loadThemes();
    expect(reloaded[0].title).toBe('かわった');
    expect(reloaded).toHaveLength(themes.length);
  });

  it('empty storage returns a deep clone of PRESET_THEMES', () => {
    const themes = loadThemes();
    expect(themes).toEqual(PRESET_THEMES);
    expect(themes).not.toBe(PRESET_THEMES);
    // Mutating the result must not mutate PRESET_THEMES.
    themes[0].title = 'MUTATED';
    themes[0].questions[0].cards[0].label = 'MUTATED';
    expect(PRESET_THEMES[0].title).not.toBe('MUTATED');
    expect(PRESET_THEMES[0].questions[0].cards[0].label).not.toBe('MUTATED');
  });

  it('corrupted themes JSON falls back to preset defaults without throwing', () => {
    mem._raw(THEMES_KEY, '{not valid json');
    let themes: ReturnType<typeof loadThemes>;
    expect(() => {
      themes = loadThemes();
    }).not.toThrow();
    expect(themes!).toEqual(PRESET_THEMES);
  });
});

describe('history', () => {
  it('lists newest-first', () => {
    addHistory(makeEntry('a'));
    addHistory(makeEntry('b'));
    addHistory(makeEntry('c'));
    const ids = listHistory().map((e) => e.id);
    expect(ids).toEqual(['c', 'b', 'a']);
  });

  it('round-trips added entries', () => {
    const e = makeEntry('x');
    addHistory(e);
    expect(listHistory()[0]).toEqual(e);
  });

  it('deleteHistory removes exactly one entry', () => {
    addHistory(makeEntry('a'));
    addHistory(makeEntry('b'));
    deleteHistory('a');
    const ids = listHistory().map((e) => e.id);
    expect(ids).toEqual(['b']);
  });

  it('clearHistory empties the list', () => {
    addHistory(makeEntry('a'));
    addHistory(makeEntry('b'));
    clearHistory();
    expect(listHistory()).toEqual([]);
  });

  it('corrupted history JSON falls back to empty list without throwing', () => {
    mem._raw(HISTORY_KEY, 'garbage');
    let result: HistoryEntry[];
    expect(() => {
      result = listHistory();
    }).not.toThrow();
    expect(result!).toEqual([]);
  });
});

describe('settings', () => {
  it('defaults to { speech: true } on empty storage', () => {
    expect(loadSettings()).toEqual({ speech: true });
  });

  it('save → reload round-trips settings', () => {
    saveSettings({ speech: false });
    expect(loadSettings()).toEqual({ speech: false });
  });

  it('corrupted settings JSON falls back to default without throwing', () => {
    mem._raw(SETTINGS_KEY, '<<broken');
    let result: ReturnType<typeof loadSettings>;
    expect(() => {
      result = loadSettings();
    }).not.toThrow();
    expect(result!).toEqual({ speech: true });
  });
});

describe('resetAll', () => {
  it('clears all three keys', () => {
    saveThemes(loadThemes());
    addHistory(makeEntry('a'));
    saveSettings({ speech: false });
    resetAll();
    expect(mem.getItem(THEMES_KEY)).toBeNull();
    expect(mem.getItem(HISTORY_KEY)).toBeNull();
    expect(mem.getItem(SETTINGS_KEY)).toBeNull();
    // And loaders return defaults again.
    expect(loadThemes()).toEqual(PRESET_THEMES);
    expect(listHistory()).toEqual([]);
    expect(loadSettings()).toEqual({ speech: true });
  });
});
