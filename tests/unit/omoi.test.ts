import { describe, it, expect } from 'vitest';
import {
  OMOI_THEME_KEYS,
  OMOI_THEME_LABELS,
  OMOI_RELATION_KEYS,
  OMOI_RELATION_LABELS,
  sortOmoi,
  omoiByline,
} from '~/lib/omoi';

describe('labels', () => {
  it('has a label for every theme key', () => {
    expect(OMOI_THEME_KEYS.map((k) => OMOI_THEME_LABELS[k])).toEqual([
      '子どもに遺したい言葉',
      'いま一番気がかりなこと',
      'こうなっていたら安心できる',
      '自由に',
    ]);
  });

  it('has a label for every relation key', () => {
    expect(OMOI_RELATION_KEYS.map((k) => OMOI_RELATION_LABELS[k])).toEqual(['親', 'きょうだい', '祖父母', 'その他の家族']);
  });
});

describe('sortOmoi', () => {
  const e = (id: string, d: string) => ({ id, data: { publishedAt: new Date(d) } });

  it('puts the newest first', () => {
    const out = sortOmoi([e('2026-10-01-01', '2026-10-01'), e('2026-11-01-01', '2026-11-01')]);
    expect(out.map((x) => x.id)).toEqual(['2026-11-01-01', '2026-10-01-01']);
  });

  it('orders same-day posts by the larger serial first', () => {
    const out = sortOmoi([e('2026-10-01-01', '2026-10-01'), e('2026-10-01-02', '2026-10-01')]);
    expect(out.map((x) => x.id)).toEqual(['2026-10-01-02', '2026-10-01-01']);
  });

  it('does not mutate the input', () => {
    const input = [e('a', '2026-10-01'), e('b', '2026-11-01')];
    sortOmoi(input);
    expect(input.map((x) => x.id)).toEqual(['a', 'b']);
  });
});

describe('omoiByline', () => {
  it('joins relation and age, then the pen name', () => {
    expect(omoiByline({ relation: 'kyodai', ageRange: '40代', penName: 'ひまわり' })).toBe('きょうだい・40代／ひまわり');
  });

  it('omits the age when it is not given', () => {
    expect(omoiByline({ relation: 'oya', penName: '匿名' })).toBe('親／匿名');
  });
});
