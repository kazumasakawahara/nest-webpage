import { describe, it, expect } from 'vitest';
import { createSession, tap, currentQuestion } from '~/apps/tsutaeru/flow';
import { PRESET_THEMES } from '~/apps/tsutaeru/presets';
import type { Theme } from '~/apps/tsutaeru/types';

function theme(id: string): Theme {
  const t = PRESET_THEMES.find((x) => x.id === id);
  if (!t) throw new Error(`missing theme ${id}`);
  return t;
}

// Deterministic PRNG so shuffles are reproducible in tests.
function mulberry32(seed: number): () => number {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ESCAPE_IDS = ['_none', '_unknown'];

describe('createSession', () => {
  it('queues only enabled questions in order', () => {
    const s = createSession(theme('review'));
    expect(s.queue.map((q) => q.id)).toEqual(['rev-day', 'rev-what']);
    expect(s.index).toBe(0);
    expect(s.done).toBe(false);
    expect(s.picks).toEqual([]);
    expect(s.pending).toBeNull();
  });

  it('appends the two fixed escape cards at the END when escape=true', () => {
    const s = createSession(theme('emotion'));
    const cards = s.queue[0].cards;
    expect(cards.slice(-2).map((c) => c.id)).toEqual(ESCAPE_IDS);
    expect(cards.find((c) => c.id === '_none')).toEqual({
      id: '_none',
      label: 'どれもちがう',
      art: 'esc-none',
    });
    expect(cards.find((c) => c.id === '_unknown')).toEqual({
      id: '_unknown',
      label: 'わからない',
      art: 'esc-unknown',
    });
  });

  it('omits escape cards when escape=false (yesno)', () => {
    const s = createSession(theme('yesno'));
    const ids = s.queue[0].cards.map((c) => c.id);
    expect(ids).not.toContain('_none');
    expect(ids).not.toContain('_unknown');
    expect(ids).toEqual(['yn-hai', 'yn-iie', 'yn-wakaranai', 'yn-docchimo-iya']);
  });

  it('excludes hidden cards from the queued view', () => {
    // body-where is disabled; body-how is enabled. Verify hidden exclusion
    // generically: no queued card carries hidden:true.
    const s = createSession(theme('body'));
    for (const q of s.queue) {
      for (const c of q.cards) expect(c.hidden).not.toBe(true);
    }
  });

  it('shuffles reproducibly for a fixed rng', () => {
    const a = createSession(theme('emotion'), mulberry32(42));
    const b = createSession(theme('emotion'), mulberry32(42));
    expect(a.queue[0].cards.map((c) => c.id)).toEqual(
      b.queue[0].cards.map((c) => c.id),
    );
    // Same visible set as the source (escape cards excluded from comparison).
    const src = theme('emotion').questions[0].cards.map((c) => c.id).sort();
    const got = a.queue[0].cards
      .filter((c) => !ESCAPE_IDS.includes(c.id))
      .map((c) => c.id)
      .sort();
    expect(got).toEqual(src);
  });

  it('keeps escape cards last even after shuffling', () => {
    const s = createSession(theme('emotion'), mulberry32(7));
    expect(s.queue[0].cards.slice(-2).map((c) => c.id)).toEqual(ESCAPE_IDS);
  });

  it('yields an empty queue when every question is disabled', () => {
    // A theme whose questions are all disabled must not enter the cards screen;
    // the app-level guard keys off queue.length === 0 (and currentQuestion null).
    const allOff: Theme = {
      id: 'empty',
      title: 'から',
      icon: 'icon-emotion',
      display: 'art',
      builtin: false,
      questions: [
        { id: 'q1', prompt: 'a', cards: [{ id: 'c1', label: 'a', art: 'gen-e' }], enabled: false, escape: false, shuffle: false },
        { id: 'q2', prompt: 'b', cards: [{ id: 'c2', label: 'b', art: 'gen-e' }], enabled: false, escape: false, shuffle: false },
      ],
    };
    const s = createSession(allOff);
    expect(s.queue).toEqual([]);
    expect(s.done).toBe(false);
    expect(currentQuestion(s)).toBeNull();
  });
});

describe('tap', () => {
  it('first tap sets pending but does NOT commit', () => {
    const s0 = createSession(theme('yesno'));
    const s1 = tap(s0, 'yn-hai');
    expect(s1.pending?.id).toBe('yn-hai');
    expect(s1.picks).toEqual([]);
    expect(s1.index).toBe(0);
    expect(s1.done).toBe(false);
  });

  it('tapping a different card switches pending', () => {
    const s0 = createSession(theme('yesno'));
    const s1 = tap(s0, 'yn-hai');
    const s2 = tap(s1, 'yn-iie');
    expect(s2.pending?.id).toBe('yn-iie');
    expect(s2.picks).toEqual([]);
  });

  it('second tap on the SAME card commits and advances', () => {
    const s0 = createSession(theme('emotion'));
    const first = s0.queue[0].cards[0].id;
    const s1 = tap(s0, first);
    const s2 = tap(s1, first);
    expect(s2.picks).toHaveLength(1);
    expect(s2.picks[0]).toEqual({
      questionId: 'emo-which',
      cardId: first,
      label: s0.queue[0].cards[0].label,
    });
    expect(s2.pending).toBeNull();
    expect(s2.index).toBe(1);
    expect(s2.done).toBe(false);
  });

  it('does not mutate the input session (immutability)', () => {
    const s0 = createSession(theme('yesno'));
    const snapshot = JSON.stringify(s0);
    const s1 = tap(s0, 'yn-hai');
    tap(s1, 'yn-hai');
    expect(JSON.stringify(s0)).toBe(snapshot);
    expect(s0.pending).toBeNull();
    expect(s0.picks).toEqual([]);
    expect(s0.index).toBe(0);
  });

  it('reaches done=true after the last question commits', () => {
    const s0 = createSession(theme('yesno'));
    const s1 = tap(tap(s0, 'yn-hai'), 'yn-hai');
    expect(s1.done).toBe(true);
    expect(currentQuestion(s1)).toBeNull();
    // Further taps are no-ops once done.
    const s2 = tap(s1, 'yn-hai');
    expect(s2.done).toBe(true);
    expect(s2.picks).toHaveLength(1);
  });

  it('escape cards commit like normal cards and record their label', () => {
    const s0 = createSession(theme('emotion'));
    const s1 = tap(tap(s0, '_unknown'), '_unknown');
    expect(s1.picks[0]).toEqual({
      questionId: 'emo-which',
      cardId: '_unknown',
      label: 'わからない',
    });
    // emotion has a second question, so not done yet.
    expect(s1.index).toBe(1);
    expect(s1.done).toBe(false);
  });

  it('ignores taps on unknown card ids', () => {
    const s0 = createSession(theme('yesno'));
    const s1 = tap(s0, 'does-not-exist');
    expect(s1).toEqual(s0);
  });
});

describe('next branch', () => {
  it('inserts the next question immediately after the current index', () => {
    const s0 = createSession(theme('review'));
    // Commit rev-day (any card) to advance to rev-what.
    const day = s0.queue[0].cards[0].id;
    const atWhat = tap(tap(s0, day), day);
    expect(currentQuestion(atWhat)?.id).toBe('rev-what');
    // Commit rev-karada which has next:'rev-body'.
    const branched = tap(tap(atWhat, 'rev-karada'), 'rev-karada');
    expect(branched.queue.map((q) => q.id)).toEqual([
      'rev-day',
      'rev-what',
      'rev-body',
    ]);
    expect(branched.index).toBe(2);
    expect(currentQuestion(branched)?.id).toBe('rev-body');
    expect(branched.done).toBe(false);
  });

  it('builds the inserted view with the same shuffle/escape rules', () => {
    const s0 = createSession(theme('review'), mulberry32(3));
    const day = s0.queue[0].cards[0].id;
    const atWhat = tap(tap(s0, day), day);
    const branched = tap(tap(atWhat, 'rev-karada'), 'rev-karada');
    const body = branched.queue[2];
    // rev-body: shuffle=true, escape=false → no escape cards, same 5 ids.
    const ids = body.cards.map((c) => c.id).sort();
    expect(ids).toEqual(
      theme('review')
        .questions.find((q) => q.id === 'rev-body')!
        .cards.map((c) => c.id)
        .sort(),
    );
    expect(ids).not.toContain('_none');
  });

  it('does NOT insert the next question when it is already queued (rev-body enabled)', () => {
    // The editor can turn rev-body ON; it is then queued up-front. Committing
    // rev-karada (next:'rev-body') must not insert it a second time.
    const t = structuredClone(theme('review'));
    t.questions.find((q) => q.id === 'rev-body')!.enabled = true;
    const s0 = createSession(t);
    expect(s0.queue.map((q) => q.id)).toEqual(['rev-day', 'rev-what', 'rev-body']);

    const day = s0.queue[0].cards[0].id;
    const atWhat = tap(tap(s0, day), day);
    const branched = tap(tap(atWhat, 'rev-karada'), 'rev-karada');

    expect(branched.queue.map((q) => q.id)).toEqual(['rev-day', 'rev-what', 'rev-body']);
    expect(currentQuestion(branched)?.id).toBe('rev-body');

    // Finish: rev-body must be asked (and recorded) exactly once.
    const body = branched.queue[2].cards[0].id;
    const done = tap(tap(branched, body), body);
    expect(done.done).toBe(true);
    expect(done.picks.filter((p) => p.questionId === 'rev-body')).toHaveLength(1);
  });

  it('does NOT re-insert a next question that was already asked', () => {
    // Synthetic theme: q2's card branches back to q1, which was already asked.
    const t: Theme = {
      id: 'loop',
      title: 'loop',
      icon: 'icon-loop',
      display: 'text',
      builtin: false,
      questions: [
        {
          id: 'q1',
          prompt: 'one?',
          enabled: true,
          escape: false,
          shuffle: false,
          cards: [{ id: 'c1', label: 'c1' }],
        },
        {
          id: 'q2',
          prompt: 'two?',
          enabled: true,
          escape: false,
          shuffle: false,
          cards: [{ id: 'c2', label: 'c2', next: 'q1' }],
        },
      ],
    };
    const s0 = createSession(t);
    const s1 = tap(tap(s0, 'c1'), 'c1');
    const s2 = tap(tap(s1, 'c2'), 'c2');
    expect(s2.queue.map((q) => q.id)).toEqual(['q1', 'q2']);
    expect(s2.done).toBe(true);
    expect(s2.picks.map((p) => p.questionId)).toEqual(['q1', 'q2']);
  });

  it('never queues a question that is only reachable and disabled (body-where)', () => {
    // body-where is enabled:false and nothing branches to it.
    const s0 = createSession(theme('body'));
    let s = s0;
    // Walk the whole session committing the first available card each step.
    for (let guard = 0; guard < 20 && !s.done; guard++) {
      const q = currentQuestion(s);
      if (!q) break;
      const id = q.cards[0].id;
      s = tap(tap(s, id), id);
    }
    const seen = s.picks.map((p) => p.questionId);
    expect(seen).not.toContain('body-where');
    expect(s.queue.map((q) => q.id)).not.toContain('body-where');
  });
});

describe('currentQuestion', () => {
  it('returns the question at the current index, null when done', () => {
    const s0 = createSession(theme('yesno'));
    expect(currentQuestion(s0)?.id).toBe('yn-main');
    const done = tap(tap(s0, 'yn-hai'), 'yn-hai');
    expect(currentQuestion(done)).toBeNull();
  });
});
