import type { Card, Display, Question, Theme } from './types';
import { PRESET_THEMES } from './presets';

// All mutations here are pure: they take a Theme[] and return a new Theme[],
// never touching the input. The support editor calls them, then persists the
// result via saveThemes(). Escape cards (どれもちがう/わからない) are appended
// at session time (flow.ts), so they never appear here — the per-question
// `escape` boolean is the only control the editor exposes for them.

// Move the item at `index` one slot in `dir` (-1 up / +1 down). Out-of-range
// moves (first item up, last item down, or an unknown index) are no-ops that
// still return a fresh array so callers can treat the result uniformly.
export function move<T>(arr: T[], index: number, dir: -1 | 1): T[] {
  const target = index + dir;
  if (index < 0 || index >= arr.length || target < 0 || target >= arr.length) {
    return arr.slice();
  }
  const next = arr.slice();
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function mapTheme(themes: Theme[], themeId: string, fn: (t: Theme) => Theme): Theme[] {
  return themes.map((t) => (t.id === themeId ? fn(t) : t));
}

function mapQuestion(theme: Theme, questionId: string, fn: (q: Question) => Question): Theme {
  return { ...theme, questions: theme.questions.map((q) => (q.id === questionId ? fn(q) : q)) };
}

function mapCard(question: Question, cardId: string, fn: (c: Card) => Card): Question {
  return { ...question, cards: question.cards.map((c) => (c.id === cardId ? fn(c) : c)) };
}

// ── theme-level ────────────────────────────────────────────────────────────

export function toggleThemeHidden(themes: Theme[], themeId: string): Theme[] {
  return mapTheme(themes, themeId, (t) => ({ ...t, hidden: t.hidden !== true }));
}

export function moveTheme(themes: Theme[], themeId: string, dir: -1 | 1): Theme[] {
  const i = themes.findIndex((t) => t.id === themeId);
  return move(themes, i, dir);
}

export function setThemeDisplay(themes: Theme[], themeId: string, display: Display): Theme[] {
  return mapTheme(themes, themeId, (t) => ({ ...t, display }));
}

// Create a custom (non-builtin) theme with a single, enabled, empty question.
// `id` and `questionId` are injected so the caller owns identity (uuid); the
// helper stays pure and testable. Display defaults to 'text' since a fresh
// theme has no art-bearing cards yet.
export function addTheme(
  themes: Theme[],
  opts: { id: string; title: string; prompt: string; questionId: string },
): Theme[] {
  const theme: Theme = {
    id: opts.id,
    title: opts.title,
    icon: 'icon-custom',
    display: 'text',
    builtin: false,
    questions: [
      {
        id: opts.questionId,
        prompt: opts.prompt,
        cards: [],
        enabled: true,
        escape: false,
        shuffle: false,
      },
    ],
  };
  return [...themes, theme];
}

// Restore a builtin theme to its shipped definition, discarding all edits.
// A deep clone keeps the returned theme independent of PRESET_THEMES.
export function restorePreset(themes: Theme[], themeId: string): Theme[] {
  const preset = PRESET_THEMES.find((t) => t.id === themeId);
  if (!preset) return themes.slice();
  return themes.map((t) => (t.id === themeId ? structuredClone(preset) : t));
}

// ── question-level ───────────────────────────────────────────────────────────

export function toggleQuestionEnabled(themes: Theme[], themeId: string, questionId: string): Theme[] {
  return mapTheme(themes, themeId, (t) =>
    mapQuestion(t, questionId, (q) => ({ ...q, enabled: !q.enabled })),
  );
}

export function toggleQuestionEscape(themes: Theme[], themeId: string, questionId: string): Theme[] {
  return mapTheme(themes, themeId, (t) =>
    mapQuestion(t, questionId, (q) => ({ ...q, escape: !q.escape })),
  );
}

export function toggleQuestionShuffle(themes: Theme[], themeId: string, questionId: string): Theme[] {
  return mapTheme(themes, themeId, (t) =>
    mapQuestion(t, questionId, (q) => ({ ...q, shuffle: !q.shuffle })),
  );
}

// ── card-level ───────────────────────────────────────────────────────────────

// Edit one text field of a card. Clearing the よみあげ文 (speech) removes the
// property entirely so flow.ts falls back to the label; ことば (label) is
// required and set verbatim.
export function editCardField(
  themes: Theme[],
  themeId: string,
  questionId: string,
  cardId: string,
  field: 'label' | 'speech',
  value: string,
): Theme[] {
  return mapTheme(themes, themeId, (t) =>
    mapQuestion(t, questionId, (q) =>
      mapCard(q, cardId, (c) => {
        if (field === 'label') return { ...c, label: value };
        const { speech: _drop, ...rest } = c;
        return value.trim() === '' ? rest : { ...rest, speech: value };
      }),
    ),
  );
}

export function toggleCardHidden(
  themes: Theme[],
  themeId: string,
  questionId: string,
  cardId: string,
): Theme[] {
  return mapTheme(themes, themeId, (t) =>
    mapQuestion(t, questionId, (q) => mapCard(q, cardId, (c) => ({ ...c, hidden: c.hidden !== true }))),
  );
}

export function moveCard(
  themes: Theme[],
  themeId: string,
  questionId: string,
  cardId: string,
  dir: -1 | 1,
): Theme[] {
  return mapTheme(themes, themeId, (t) =>
    mapQuestion(t, questionId, (q) => {
      const i = q.cards.findIndex((c) => c.id === cardId);
      return { ...q, cards: move(q.cards, i, dir) };
    }),
  );
}

// Append a new card to a question. `id` is injected (uuid). Art is optional —
// any ART_IDS entry or none.
export function addCard(
  themes: Theme[],
  themeId: string,
  questionId: string,
  opts: { id: string; label: string; art?: string },
): Theme[] {
  const card: Card = { id: opts.id, label: opts.label };
  if (opts.art) card.art = opts.art;
  return mapTheme(themes, themeId, (t) =>
    mapQuestion(t, questionId, (q) => ({ ...q, cards: [...q.cards, card] })),
  );
}
