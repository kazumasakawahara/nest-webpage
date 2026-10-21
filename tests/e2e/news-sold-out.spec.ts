import { test, expect } from '@playwright/test';

// イベント記事の札と囲み（src/lib/event-news.ts）。
// 満席（soldOut）は開催日（eventDate）まで。開催日を過ぎるか開催報告（reportOf）が出たら「終了」に変わる
const CONCERT = '/news/2026-09-02-kimachiya-autumn-concert/';
const CONCERT_REPORT = '/news/2026-10-21-kimachiya-autumn-concert-report/';
const TANGO = '/news/2026-09-29-kimachiya-tango-night/';

test('a past event with a report shows 終了 in the list, not 満席', async ({ page }) => {
  await page.goto('/news/');
  const concert = page.locator(`a[href="${CONCERT}"]`);
  await expect(concert.locator('.badge--closed:visible')).toHaveText('終了');
  await expect(concert.locator('.badge--sold-out')).toHaveCount(0);
});

test('the announcement points to its report at the top', async ({ page }) => {
  await page.goto(CONCERT);
  await expect(page.locator('.news-article__head .badge--closed:visible')).toHaveText('終了');
  await expect(page.locator('.news-article__head .badge--sold-out')).toHaveCount(0);
  const notice = page.getByRole('note').filter({ hasText: '開催報告を掲載しました' });
  await expect(notice).toBeVisible();
  await expect(notice.getByRole('link')).toHaveAttribute('href', CONCERT_REPORT);
  await expect(page.getByText('満席となりました')).toHaveCount(0);
});

test('an upcoming event switches to 終了 in the browser once its day has passed', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-08T00:00:01+09:00'));
  await page.goto(TANGO);
  await expect(page.locator('.news-article__head .badge--closed')).toBeVisible();
  await expect(page.getByRole('note').filter({ hasText: 'このイベントは終了しました' })).toBeVisible();
});

test('an upcoming event shows no 終了 before its day', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-07T20:00:00+09:00'));
  await page.goto(TANGO);
  await expect(page.locator('.news-article__head .badge--closed')).toBeHidden();
  await expect(page.getByRole('note')).toBeHidden();
});

test('other news pages show no event notice', async ({ page }) => {
  await page.goto('/news/2026-08-30-zei-no-tokurei/');
  await expect(page.locator('.badge--sold-out, .badge--closed')).toHaveCount(0);
  await expect(page.getByRole('note')).toHaveCount(0);
});
