import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { speak, stopSpeech } from '~/apps/tsutaeru/speech';
import { saveSettings } from '~/apps/tsutaeru/store';

// node env has no localStorage; minimal in-memory stub so store.loadSettings works.
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
}

// Records what speak() did to the speechSynthesis API.
function installSynthStub() {
  const calls: string[] = [];
  const utterances: Array<{ text: string; lang: string }> = [];

  class FakeUtterance {
    lang = '';
    constructor(public text: string) {}
  }

  const synth = {
    cancel: () => calls.push('cancel'),
    speak: (u: FakeUtterance) => {
      calls.push('speak');
      utterances.push({ text: u.text, lang: u.lang });
    },
  };

  (globalThis as unknown as { speechSynthesis: unknown }).speechSynthesis = synth;
  (globalThis as unknown as { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance =
    FakeUtterance;

  return { calls, utterances };
}

function clearSynthStub() {
  delete (globalThis as unknown as Record<string, unknown>).speechSynthesis;
  delete (globalThis as unknown as Record<string, unknown>).SpeechSynthesisUtterance;
}

describe('speak', () => {
  beforeEach(() => {
    (globalThis as unknown as { localStorage: MemoryStorage }).localStorage = new MemoryStorage();
  });
  afterEach(() => {
    clearSynthStub();
    vi.restoreAllMocks();
  });

  it('cancels then speaks in ja-JP when speech is enabled (default)', () => {
    const { calls, utterances } = installSynthStub();

    speak('こんにちは');

    expect(calls).toEqual(['cancel', 'speak']); // cancel must precede speak
    expect(utterances).toEqual([{ text: 'こんにちは', lang: 'ja-JP' }]);
  });

  it('no-ops when settings.speech is false', () => {
    saveSettings({ speech: false });
    const { calls } = installSynthStub();

    speak('しずかに');

    expect(calls).toEqual([]);
  });

  it('no-ops (no throw) when the speechSynthesis API is unavailable', () => {
    // No stub installed → API absent, as during SSR/build.
    expect(() => speak('だれもいない')).not.toThrow();
  });
});

describe('stopSpeech', () => {
  afterEach(() => {
    clearSynthStub();
  });

  it('cancels any in-progress utterance when the API is present', () => {
    const { calls } = installSynthStub();
    stopSpeech();
    expect(calls).toEqual(['cancel']);
  });

  it('no-ops (no throw) when the speechSynthesis API is unavailable', () => {
    expect(() => stopSpeech()).not.toThrow();
  });
});
