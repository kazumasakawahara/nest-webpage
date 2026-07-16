import { describe, it, expect } from 'vitest';
import { formatRow, filterByPeriod, type Period } from '~/apps/tsutaeru/history';
import type { HistoryEntry, Pick } from '~/apps/tsutaeru/types';

function pick(label: string): Pick {
  return { questionId: 'q', cardId: 'c', label };
}

// Build `at` from a LOCAL Date so expected local-time output is deterministic
// regardless of machine timezone.
function entry(
  y: number, mo: number, d: number, h: number, mi: number,
  labels: string[] = ['あ'],
): HistoryEntry {
  return {
    id: `${y}-${mo}-${d}-${h}-${mi}`,
    at: new Date(y, mo - 1, d, h, mi, 0).toISOString(),
    themeId: 'kimochi',
    themeTitle: 'きもち',
    picks: labels.map(pick),
  };
}

describe('formatRow', () => {
  it('renders short date + time + picks joined with an arrow', () => {
    const e = entry(2026, 7, 16, 14, 3, ['きもち', 'おこってる', 'とても']);
    expect(formatRow(e)).toBe('7/16 14:03 きもち → おこってる → とても');
  });

  it('does not zero-pad month/day but zero-pads hour/minute', () => {
    const e = entry(2026, 1, 5, 9, 5, ['あ']);
    expect(formatRow(e)).toBe('1/5 09:05 あ');
  });
});

describe('filterByPeriod', () => {
  // Fixed "now": 2026/07/16 12:00 local.
  const now = new Date(2026, 6, 16, 12, 0, 0);

  it('all returns the same list untouched', () => {
    const list = [entry(2026, 7, 16, 1, 0), entry(2026, 7, 1, 1, 0)];
    expect(filterByPeriod(list, 'all', now)).toBe(list);
  });

  it('today keeps only entries on the same calendar day as now', () => {
    const list = [
      entry(2026, 7, 16, 0, 1), // today, just after midnight
      entry(2026, 7, 16, 23, 59), // today, late
      entry(2026, 7, 15, 23, 59), // yesterday
    ];
    const ids = filterByPeriod(list, 'today', now).map((e) => e.id);
    expect(ids).toEqual(['2026-7-16-0-1', '2026-7-16-23-59']);
  });

  it('7days keeps today + previous 6 days, drops the 7th day back', () => {
    const list = [
      entry(2026, 7, 16, 12, 0), // today
      entry(2026, 7, 10, 0, 0), // 6 days ago, midnight → included (threshold)
      entry(2026, 7, 9, 23, 59), // 7 days ago (before threshold) → excluded
    ];
    const ids = filterByPeriod(list, '7days', now).map((e) => e.id);
    expect(ids).toEqual(['2026-7-16-12-0', '2026-7-10-0-0']);
  });

  it('is exhaustive over Period values', () => {
    const periods: Period[] = ['today', '7days', 'all'];
    for (const p of periods) {
      expect(() => filterByPeriod([], p, now)).not.toThrow();
    }
  });
});
