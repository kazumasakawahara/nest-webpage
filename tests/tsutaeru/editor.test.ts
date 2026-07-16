import { describe, it, expect } from 'vitest';
import { PRESET_THEMES } from '~/apps/tsutaeru/presets';
import { ART_IDS } from '~/apps/tsutaeru/art';
import type { Theme } from '~/apps/tsutaeru/types';
import {
  move,
  toggleThemeHidden,
  moveTheme,
  setThemeDisplay,
  addTheme,
  restorePreset,
  toggleQuestionEnabled,
  toggleQuestionEscape,
  toggleQuestionShuffle,
  editCardField,
  toggleCardHidden,
  moveCard,
  addCard,
  setCardPhoto,
} from '~/apps/tsutaeru/editor';

// A fresh, independent copy of the preset set for each test.
function themes(): Theme[] {
  return structuredClone(PRESET_THEMES);
}

describe('move', () => {
  it('moves an item up', () => {
    expect(move(['a', 'b', 'c'], 1, -1)).toEqual(['b', 'a', 'c']);
  });
  it('moves an item down', () => {
    expect(move(['a', 'b', 'c'], 1, 1)).toEqual(['a', 'c', 'b']);
  });
  it('clamps: first item up is a no-op', () => {
    expect(move(['a', 'b', 'c'], 0, -1)).toEqual(['a', 'b', 'c']);
  });
  it('clamps: last item down is a no-op', () => {
    expect(move(['a', 'b', 'c'], 2, 1)).toEqual(['a', 'b', 'c']);
  });
  it('unknown index (-1) is a no-op returning a copy', () => {
    const arr = ['a', 'b'];
    const out = move(arr, -1, 1);
    expect(out).toEqual(['a', 'b']);
    expect(out).not.toBe(arr);
  });
  it('does not mutate the input', () => {
    const arr = ['a', 'b', 'c'];
    move(arr, 1, -1);
    expect(arr).toEqual(['a', 'b', 'c']);
  });
});

describe('toggleThemeHidden', () => {
  it('hides a visible theme and does not mutate input', () => {
    const t = themes();
    const out = toggleThemeHidden(t, 'emotion');
    expect(out.find((x) => x.id === 'emotion')!.hidden).toBe(true);
    expect(t.find((x) => x.id === 'emotion')!.hidden).toBeUndefined();
  });
  it('un-hides a hidden theme', () => {
    const t = toggleThemeHidden(themes(), 'emotion');
    const out = toggleThemeHidden(t, 'emotion');
    expect(out.find((x) => x.id === 'emotion')!.hidden).toBe(false);
  });
});

describe('moveTheme', () => {
  it('reorders themes', () => {
    const t = themes();
    const firstTwo = [t[0].id, t[1].id];
    const out = moveTheme(t, t[1].id, -1);
    expect([out[0].id, out[1].id]).toEqual([firstTwo[1], firstTwo[0]]);
  });
  it('unknown id is a no-op', () => {
    const t = themes();
    expect(moveTheme(t, 'nope', 1).map((x) => x.id)).toEqual(t.map((x) => x.id));
  });
});

describe('setThemeDisplay', () => {
  it('sets display and leaves others alone', () => {
    const out = setThemeDisplay(themes(), 'emotion', 'photo');
    expect(out.find((x) => x.id === 'emotion')!.display).toBe('photo');
    expect(out.find((x) => x.id === 'trouble')!.display).toBe('art');
  });
});

describe('addTheme', () => {
  it('appends a non-builtin theme with one enabled empty question', () => {
    const out = addTheme(themes(), {
      id: 'custom-1',
      title: 'あさのき',
      prompt: 'どうしたい？',
      questionId: 'q-1',
    });
    const t = out[out.length - 1];
    expect(t.id).toBe('custom-1');
    expect(t.title).toBe('あさのき');
    expect(t.builtin).toBe(false);
    expect(t.display).toBe('text');
    expect(t.questions).toHaveLength(1);
    expect(t.questions[0]).toMatchObject({
      id: 'q-1',
      prompt: 'どうしたい？',
      cards: [],
      enabled: true,
      escape: false,
      shuffle: false,
    });
  });
});

describe('restorePreset', () => {
  it('restores an edited builtin theme verbatim', () => {
    let t = editCardField(themes(), 'yesno', 'yn-main', 'yn-hai', 'label', 'YES!!');
    t = toggleThemeHidden(t, 'yesno');
    const out = restorePreset(t, 'yesno');
    expect(out.find((x) => x.id === 'yesno')).toEqual(
      PRESET_THEMES.find((x) => x.id === 'yesno'),
    );
  });
  it('returns a clone independent of PRESET_THEMES', () => {
    const out = restorePreset(themes(), 'yesno');
    const restored = out.find((x) => x.id === 'yesno')!;
    restored.title = 'MUTATED';
    expect(PRESET_THEMES.find((x) => x.id === 'yesno')!.title).not.toBe('MUTATED');
  });
  it('unknown id is a no-op', () => {
    const t = themes();
    expect(restorePreset(t, 'nope').map((x) => x.id)).toEqual(t.map((x) => x.id));
  });
});

describe('question toggles', () => {
  it('toggleQuestionEnabled flips enabled', () => {
    const out = toggleQuestionEnabled(themes(), 'body', 'body-where');
    const q = out.find((x) => x.id === 'body')!.questions.find((q) => q.id === 'body-where')!;
    expect(q.enabled).toBe(true); // ships false
  });
  it('toggleQuestionEscape flips escape', () => {
    const out = toggleQuestionEscape(themes(), 'yesno', 'yn-main');
    const q = out.find((x) => x.id === 'yesno')!.questions[0];
    expect(q.escape).toBe(true); // ships false
  });
  it('toggleQuestionShuffle flips shuffle', () => {
    const out = toggleQuestionShuffle(themes(), 'yesno', 'yn-main');
    const q = out.find((x) => x.id === 'yesno')!.questions[0];
    expect(q.shuffle).toBe(true); // ships false
  });
});

describe('editCardField', () => {
  it('edits the label', () => {
    const out = editCardField(themes(), 'yesno', 'yn-main', 'yn-hai', 'label', 'うん');
    const c = out.find((x) => x.id === 'yesno')!.questions[0].cards.find((c) => c.id === 'yn-hai')!;
    expect(c.label).toBe('うん');
  });
  it('sets a speech value', () => {
    const out = editCardField(themes(), 'yesno', 'yn-main', 'yn-hai', 'speech', 'はい、そうです');
    const c = out.find((x) => x.id === 'yesno')!.questions[0].cards.find((c) => c.id === 'yn-hai')!;
    expect(c.speech).toBe('はい、そうです');
  });
  it('clearing speech removes the property', () => {
    let out = editCardField(themes(), 'yesno', 'yn-main', 'yn-hai', 'speech', 'よ');
    out = editCardField(out, 'yesno', 'yn-main', 'yn-hai', 'speech', '   ');
    const c = out.find((x) => x.id === 'yesno')!.questions[0].cards.find((c) => c.id === 'yn-hai')!;
    expect('speech' in c).toBe(false);
  });
  it('does not mutate the input', () => {
    const t = themes();
    editCardField(t, 'yesno', 'yn-main', 'yn-hai', 'label', 'X');
    expect(t.find((x) => x.id === 'yesno')!.questions[0].cards[0].label).toBe('はい');
  });
});

describe('toggleCardHidden', () => {
  it('hides then un-hides a card', () => {
    let out = toggleCardHidden(themes(), 'yesno', 'yn-main', 'yn-hai');
    let c = out.find((x) => x.id === 'yesno')!.questions[0].cards.find((c) => c.id === 'yn-hai')!;
    expect(c.hidden).toBe(true);
    out = toggleCardHidden(out, 'yesno', 'yn-main', 'yn-hai');
    c = out.find((x) => x.id === 'yesno')!.questions[0].cards.find((c) => c.id === 'yn-hai')!;
    expect(c.hidden).toBe(false);
  });
});

describe('moveCard', () => {
  it('reorders cards within a question', () => {
    const t = themes();
    const q = t.find((x) => x.id === 'yesno')!.questions[0];
    const [a, b] = [q.cards[0].id, q.cards[1].id];
    const out = moveCard(t, 'yesno', 'yn-main', b, -1);
    const cards = out.find((x) => x.id === 'yesno')!.questions[0].cards;
    expect([cards[0].id, cards[1].id]).toEqual([b, a]);
  });
});

describe('addCard', () => {
  it('appends a card with art', () => {
    const out = addCard(themes(), 'yesno', 'yn-main', {
      id: 'new-1',
      label: 'たぶん',
      art: 'emo-totemo',
    });
    const cards = out.find((x) => x.id === 'yesno')!.questions[0].cards;
    const added = cards[cards.length - 1];
    expect(added).toEqual({ id: 'new-1', label: 'たぶん', art: 'emo-totemo' });
  });
  it('appends a card without art', () => {
    const out = addCard(themes(), 'yesno', 'yn-main', { id: 'new-2', label: 'むり' });
    const cards = out.find((x) => x.id === 'yesno')!.questions[0].cards;
    const added = cards[cards.length - 1];
    expect(added).toEqual({ id: 'new-2', label: 'むり' });
    expect('art' in added).toBe(false);
  });
});

describe('setCardPhoto', () => {
  it('sets photoId on a card', () => {
    const out = setCardPhoto(themes(), 'yesno', 'yn-main', 'yn-hai', 'photo-1');
    const c = out.find((x) => x.id === 'yesno')!.questions[0].cards.find((c) => c.id === 'yn-hai')!;
    expect(c.photoId).toBe('photo-1');
  });
  it('clearing photoId (null) removes the property', () => {
    let out = setCardPhoto(themes(), 'yesno', 'yn-main', 'yn-hai', 'photo-1');
    out = setCardPhoto(out, 'yesno', 'yn-main', 'yn-hai', null);
    const c = out.find((x) => x.id === 'yesno')!.questions[0].cards.find((c) => c.id === 'yn-hai')!;
    expect('photoId' in c).toBe(false);
  });
  it('does not mutate the input', () => {
    const t = themes();
    setCardPhoto(t, 'yesno', 'yn-main', 'yn-hai', 'photo-1');
    expect('photoId' in t.find((x) => x.id === 'yesno')!.questions[0].cards[0]).toBe(false);
  });
  it('leaves other cards untouched', () => {
    const out = setCardPhoto(themes(), 'yesno', 'yn-main', 'yn-hai', 'photo-1');
    const other = out
      .find((x) => x.id === 'yesno')!
      .questions[0].cards.find((c) => c.id === 'yn-iie')!;
    expect('photoId' in other).toBe(false);
  });
});

describe('ART_IDS', () => {
  it('lists every preset card art id (id === art for presets)', () => {
    const presetArtIds = PRESET_THEMES.flatMap((t) =>
      t.questions.flatMap((q) => q.cards.map((c) => c.art!).filter(Boolean)),
    );
    // Every preset art id is offered by the picker.
    for (const id of presetArtIds) expect(ART_IDS).toContain(id);
    // And the literal has no duplicates.
    expect(new Set(ART_IDS).size).toBe(ART_IDS.length);
  });
});
