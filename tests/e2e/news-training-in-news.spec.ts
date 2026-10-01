import { test, expect } from '@playwright/test';

// 研修会の記事は研修会コーナーに並ぶ。参加者を募る案内（showInNews: true）だけは News 一覧・トップにも出す
const ANNOUNCE = '/news/2026-10-01-sei-training-2/';
const REPORT = '/news/2026-06-25-sei-training/';

test('training announcement appears in the news list, top page, and training corner', async ({ page }) => {
  for (const path of ['/news/', '/', '/news/training/']) {
    await page.goto(path);
    await expect(page.locator(`.news-list a[href="${ANNOUNCE}"]`)).toHaveCount(1);
  }
});

test('training report stays only in the training corner', async ({ page }) => {
  await page.goto('/news/');
  await expect(page.locator(`.news-list a[href="${REPORT}"]`)).toHaveCount(0);
  await page.goto('/news/training/');
  await expect(page.locator(`.news-list a[href="${REPORT}"]`)).toHaveCount(1);
});
