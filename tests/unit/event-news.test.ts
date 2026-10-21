import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { eventEndsAt, isEventOver, findReport, eventNotice } from '~/lib/event-news';

// frontmatter の日付は z.coerce.date() で UTC の 0 時として読まれる
const day = (s: string) => new Date(`${s}T00:00:00Z`);
const jst = (s: string) => new Date(`${s}+09:00`);

describe('eventEndsAt / isEventOver', () => {
  it('ends at midnight JST after the event day', () => {
    expect(eventEndsAt(day('2026-10-17')).toISOString()).toBe('2026-10-17T15:00:00.000Z');
  });

  it('is not over during the event day, and is over from the next day', () => {
    expect(isEventOver(day('2026-10-17'), jst('2026-10-17T21:30:00'))).toBe(false);
    expect(isEventOver(day('2026-10-17'), jst('2026-10-17T23:59:59'))).toBe(false);
    expect(isEventOver(day('2026-10-17'), jst('2026-10-18T00:00:00'))).toBe(true);
  });
});

describe('findReport', () => {
  const item = (id: string, date: string, reportOf?: string, draft = false) => ({
    id,
    data: { date: day(date), reportOf, draft },
  });

  it('finds the report that names the announcement', () => {
    const items = [item('a', '2026-09-02'), item('b', '2026-10-21', 'a'), item('c', '2026-10-21', 'x')];
    expect(findReport(items, 'a')?.id).toBe('b');
    expect(findReport(items, 'b')).toBeUndefined();
  });

  it('skips drafts and prefers the newest report', () => {
    const items = [item('r1', '2026-10-20', 'a'), item('r2', '2026-10-22', 'a', true), item('r3', '2026-10-21', 'a')];
    expect(findReport(items, 'a')?.id).toBe('r3');
  });
});

describe('eventNotice', () => {
  const before = jst('2026-10-10T12:00:00');
  const after = jst('2026-10-20T12:00:00');
  const eventDate = day('2026-10-17');

  it('points to the report once one is published', () => {
    expect(eventNotice({ eventDate, soldOut: true, hasReport: true }, before)).toBe('report');
    expect(eventNotice({ soldOut: false, hasReport: true }, after)).toBe('report');
  });

  it('says the event is over after the day, sold out or not', () => {
    expect(eventNotice({ eventDate, soldOut: true, hasReport: false }, after)).toBe('over');
    expect(eventNotice({ eventDate, soldOut: false, hasReport: false }, after)).toBe('over');
  });

  it('shows sold out only before the day', () => {
    expect(eventNotice({ eventDate, soldOut: true, hasReport: false }, before)).toBe('soldOut');
    expect(eventNotice({ eventDate, soldOut: false, hasReport: false }, before)).toBe('none');
  });

  it('keeps older articles without eventDate as they were', () => {
    expect(eventNotice({ soldOut: true, hasReport: false }, after)).toBe('soldOut');
    expect(eventNotice({ soldOut: false, hasReport: false }, after)).toBe('none');
  });
});

// 開催報告の reportOf は、開催日（eventDate）を書いた告知記事を指していること。書き間違えると報告への案内が出ない
describe('news content: event reports', () => {
  const dir = fileURLToPath(new URL('../../src/content/news/', import.meta.url));
  const files = readdirSync(dir).filter((f) => f.endsWith('.md'));
  const front = (f: string) => readFileSync(dir + f, 'utf8').split('---')[1] ?? '';
  const field = (fm: string, key: string) => fm.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1].trim();

  const reports = files
    .map((f) => ({ file: f, reportOf: field(front(f), 'reportOf') }))
    .filter((r): r is { file: string; reportOf: string } => !!r.reportOf);

  it('has at least one report wired up', () => {
    expect(reports.length).toBeGreaterThan(0);
  });

  it.each(reports)('$file points to an announcement with eventDate', ({ reportOf }) => {
    expect(files).toContain(`${reportOf}.md`);
    expect(field(front(`${reportOf}.md`), 'eventDate')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
