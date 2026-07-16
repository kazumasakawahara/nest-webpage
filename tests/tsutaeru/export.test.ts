import { describe, it, expect } from 'vitest';
import { formatEntry, formatEntries } from '~/apps/tsutaeru/export';
import type { HistoryEntry, Pick } from '~/apps/tsutaeru/types';

function pick(label: string): Pick {
  return { questionId: 'q', cardId: 'c', label };
}

// Build `at` from a LOCAL Date so the expected local-time string is
// deterministic regardless of the machine timezone.
function entry(
  y: number, mo: number, d: number, h: number, mi: number,
  labels: string[], mark?: string,
): HistoryEntry {
  return {
    id: `${y}-${mo}-${d}-${h}-${mi}`,
    at: new Date(y, mo - 1, d, h, mi, 0).toISOString(),
    themeId: 'kimochi',
    themeTitle: 'きもち',
    picks: labels.map(pick),
    ...(mark ? { mark } : {}),
  };
}

describe('formatEntry', () => {
  it('renders datetime + picks joined with an arrow', () => {
    const e = entry(2026, 7, 16, 14, 3, ['きもち', 'おこってる', 'とても']);
    expect(formatEntry(e)).toBe('2026/07/16 14:03 きもち → おこってる → とても');
  });

  it('zero-pads month, day, hour, and minute', () => {
    const e = entry(2026, 1, 5, 9, 5, ['あ']);
    expect(formatEntry(e)).toBe('2026/01/05 09:05 あ');
  });

  it('prefixes the line with [mark] when mark is set', () => {
    const e = entry(2026, 7, 16, 14, 3, ['きもち'], 'め');
    expect(formatEntry(e)).toBe('[め] 2026/07/16 14:03 きもち');
  });
});

describe('formatEntries', () => {
  it('returns the empty message for an empty list', () => {
    expect(formatEntries([])).toBe('きろくは まだありません');
  });

  it('renders a single entry under its date heading', () => {
    const e = entry(2026, 7, 16, 14, 3, ['きもち', 'おこってる']);
    expect(formatEntries([e])).toBe(
      '■ 2026/07/16\n2026/07/16 14:03 きもち → おこってる',
    );
  });

  it('groups by date newest-first with a blank line between groups', () => {
    // Input is newest-first, as store.listHistory provides.
    const list = [
      entry(2026, 7, 17, 8, 0, ['あさ']),
      entry(2026, 7, 16, 14, 3, ['ひる']),
      entry(2026, 7, 16, 9, 5, ['あさ']),
    ];
    expect(formatEntries(list)).toBe(
      [
        '■ 2026/07/17',
        '2026/07/17 08:00 あさ',
        '',
        '■ 2026/07/16',
        '2026/07/16 14:03 ひる',
        '2026/07/16 09:05 あさ',
      ].join('\n'),
    );
  });
});
