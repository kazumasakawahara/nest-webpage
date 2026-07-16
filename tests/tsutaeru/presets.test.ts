import { describe, it, expect } from 'vitest';
import { PRESET_THEMES } from '~/apps/tsutaeru/presets';

describe('PRESET_THEMES', () => {
  it('defines exactly 7 themes', () => {
    expect(PRESET_THEMES).toHaveLength(7);
  });

  it('has no duplicate ids across themes, questions, and cards', () => {
    const ids: string[] = [];
    for (const theme of PRESET_THEMES) {
      ids.push(theme.id);
      for (const question of theme.questions) {
        ids.push(question.id);
        for (const card of question.cards) {
          ids.push(card.id);
        }
      }
    }
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(duplicates).toEqual([]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every card `next` points to a question id in the same theme', () => {
    for (const theme of PRESET_THEMES) {
      const questionIds = new Set(theme.questions.map((q) => q.id));
      for (const question of theme.questions) {
        for (const card of question.cards) {
          if (card.next !== undefined) {
            expect(questionIds.has(card.next)).toBe(true);
          }
        }
      }
    }
  });

  it('every card has an art id', () => {
    for (const theme of PRESET_THEMES) {
      for (const question of theme.questions) {
        for (const card of question.cards) {
          expect(card.art).toBeTruthy();
        }
      }
    }
  });
});
