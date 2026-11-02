import { describe, it, expect } from 'vitest';
import { NEW_DAYS, newUntil, isNew, latestTips, shelfLabel } from '~/lib/ai-tips-new';

// frontmatter の日付は z.coerce.date() で UTC の 0 時として読まれる
const day = (s: string) => new Date(`${s}T00:00:00Z`);
const jst = (s: string) => new Date(`${s}+09:00`);

describe('newUntil / isNew', () => {
  it('keeps NEW for NEW_DAYS days counting the publish day, until midnight JST', () => {
    expect(NEW_DAYS).toBe(14);
    expect(newUntil(day('2026-11-02')).toISOString()).toBe('2026-11-15T15:00:00.000Z');
    expect(isNew(day('2026-11-02'), jst('2026-11-02T00:00:00'))).toBe(true);
    expect(isNew(day('2026-11-02'), jst('2026-11-15T23:59:59'))).toBe(true);
    expect(isNew(day('2026-11-02'), jst('2026-11-16T00:00:00'))).toBe(false);
  });
});

describe('latestTips', () => {
  const tip = (id: string, date: string, draft = false) => ({ id, data: { date: day(date), draft } });

  it('returns the newest published articles first, without drafts', () => {
    const items = [
      tip('2026-09-11-a', '2026-09-11'),
      tip('2026-11-10-draft', '2026-11-10', true),
      tip('2026-11-02-b', '2026-11-02'),
      tip('2026-10-15-c', '2026-10-15'),
      tip('2026-07-01-d', '2026-07-01'),
    ];
    expect(latestTips(items).map((t) => t.id)).toEqual(['2026-11-02-b', '2026-10-15-c', '2026-09-11-a']);
  });

  it('puts the later file name first on the same day (その5 before その4)', () => {
    const items = [tip('2026-09-11-onegai-4', '2026-09-11'), tip('2026-09-11-onegai-5', '2026-09-11')];
    expect(latestTips(items, 1)[0].id).toBe('2026-09-11-onegai-5');
  });
});

describe('shelfLabel', () => {
  const tip = (kind?: string, series?: string[]) => ({ id: 'x', data: { date: day('2026-11-02'), kind, series } });

  it('names the shelf, and the feature when the article is also there', () => {
    expect(shelfLabel(tip('anshin'))).toBe('あんしん編');
    expect(shelfLabel(tip())).toBe('便利ワザ編');
    expect(shelfLabel(tip(undefined, ['onegai']))).toBe('便利ワザ編／特集・こんな風にお願いするといいよ');
    expect(shelfLabel(tip('practice', ['google']))).toBe('相棒編／特集・Googleの道具箱');
    expect(shelfLabel(tip('haiyu'))).toBe('特集・AIは俳優');
  });
});
