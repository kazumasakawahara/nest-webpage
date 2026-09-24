import { describe, it, expect } from 'vitest';
import { yearsSince, establishedOn, stats, site } from '~/lib/site';

describe('site.copyright', () => {
  it('spans from the founding year to the current year', () => {
    expect(site.copyright).toBe(`© 2006–${new Date().getFullYear()} 特定非営利活動法人（NPO法人）nest`);
  });
});

describe('yearsSince', () => {
  it('counts full years, adding one on the anniversary itself', () => {
    expect(yearsSince('2006-08-15', new Date(2026, 7, 14))).toBe(19);
    expect(yearsSince('2006-08-15', new Date(2026, 7, 15))).toBe(20);
    expect(yearsSince('2006-08-15', new Date(2026, 8, 25))).toBe(20);
  });

  it('does not add a year earlier in the same year', () => {
    expect(yearsSince('2006-08-15', new Date(2027, 0, 1))).toBe(20);
    expect(yearsSince('2006-08-15', new Date(2027, 7, 15))).toBe(21);
  });
});

describe('stats', () => {
  it('derives the years-since-founding figure from the founding date', () => {
    expect(establishedOn).toBe('2006-08-15');
    const founding = stats.find((s) => s.label === '設立から');
    expect(founding?.since).toBe(establishedOn);
    expect(founding?.value).toBe(yearsSince(establishedOn));
  });
});
