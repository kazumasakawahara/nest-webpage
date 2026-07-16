import type { Card, Pick, Question, Theme } from './types';

/**
 * Runtime state for one tsutaeru session. This is transient in-memory state;
 * persistence (history) is the UI's job — see store.ts. `rng` is captured at
 * creation so that a `next` question inserted mid-session shuffles from the
 * same (optionally seeded) sequence.
 */
export interface Session {
  theme: Theme;
  queue: Question[];
  index: number;
  picks: Pick[];
  pending: Card | null;
  done: boolean;
  rng: () => number;
}

// The two fixed escape cards, always appended (in this order) to a question
// whose escape=true. Never shuffled into the middle, never carry `next`.
const ESCAPE_CARDS: Card[] = [
  { id: '_none', label: 'どれもちがう', art: 'esc-none' },
  { id: '_unknown', label: 'わからない', art: 'esc-unknown' },
];

// Fisher–Yates on a copy; leaves the input untouched.
function shuffle(cards: Card[], rng: () => number): Card[] {
  const a = cards.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Snapshot a question's presentable card order: drop hidden cards, shuffle the
// visible ones when shuffle=true, then append the escape pair when escape=true.
function buildView(q: Question, rng: () => number): Question {
  let cards = q.cards.filter((c) => c.hidden !== true);
  if (q.shuffle) cards = shuffle(cards, rng);
  if (q.escape) cards = [...cards, ...ESCAPE_CARDS];
  return { ...q, cards };
}

export function createSession(theme: Theme, rng: () => number = Math.random): Session {
  const queue = theme.questions
    .filter((q) => q.enabled)
    .map((q) => buildView(q, rng));
  return { theme, queue, index: 0, picks: [], pending: null, done: false, rng };
}

export function tap(s: Session, cardId: string): Session {
  if (s.done) return s;
  const question = s.queue[s.index];
  if (!question) return s;

  const card = question.cards.find((c) => c.id === cardId);
  if (!card) return s;

  // First tap on a card, or switching to a different card: just set pending.
  if (s.pending?.id !== cardId) {
    return { ...s, pending: card };
  }

  // Second tap on the same card: commit.
  const picks = [...s.picks, { questionId: question.id, cardId: card.id, label: card.label }];

  // Insert the branch target after the current question — unless that question
  // is already anywhere in the queue (asked earlier or still pending, e.g. the
  // editor enabled rev-body up-front): never ask twice, never double-record.
  let queue = s.queue;
  if (card.next && !queue.some((q) => q.id === card.next)) {
    const nextQ = s.theme.questions.find((q) => q.id === card.next);
    if (nextQ) {
      const view = buildView(nextQ, s.rng);
      queue = [...queue.slice(0, s.index + 1), view, ...queue.slice(s.index + 1)];
    }
  }

  const index = s.index + 1;
  return { ...s, queue, index, picks, pending: null, done: index >= queue.length };
}

export function currentQuestion(s: Session): Question | null {
  if (s.done) return null;
  return s.queue[s.index] ?? null;
}
