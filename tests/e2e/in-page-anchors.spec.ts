import { test, expect } from '@playwright/test';

// ページ内リンク（href="#…"）を押したとき、URL に章が残り、キーボードの位置も移動先へ移ること

test('TOC link updates the URL hash and moves focus to the chapter', async ({ page }) => {
  await page.goto('/post-parent/');
  await page.getByRole('navigation', { name: 'このページの目次' }).getByRole('link', { name: /いま、備える/ }).click();

  await expect.poll(() => page.evaluate(() => location.hash)).toBe('#prepare');
  const focusInTarget = await page.evaluate(() => {
    const target = document.getElementById('prepare');
    return !!target && target.contains(document.activeElement);
  });
  expect(focusInTarget).toBe(true);
});

test('Back button returns from a TOC jump', async ({ page }) => {
  await page.goto('/post-parent/');
  await page.getByRole('navigation', { name: 'このページの目次' }).getByRole('link', { name: /声を聴く/ }).click();
  await expect.poll(() => page.evaluate(() => location.hash)).toBe('#voices');
  await page.goBack();
  await expect.poll(() => page.evaluate(() => location.hash)).toBe('');
});

test('in-page link to a closed feature box on ai-tips opens it', async ({ page }) => {
  await page.goto('/ai-tips/');
  expect(await page.locator('details#dougu').evaluate((d: HTMLDetailsElement) => d.open)).toBe(false);
  // リンクは別の特集ボックスの中にあるので、まずそちらを開く
  const link = page.locator('a[href="#dougu"]').first();
  await link.evaluate((a) => ((a.closest('details') as HTMLDetailsElement).open = true));
  await link.click();
  await expect.poll(() => page.locator('details#dougu').evaluate((d: HTMLDetailsElement) => d.open)).toBe(true);
});

test.describe('on a phone, block anchors land below the fixed top bar', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  for (const [path, id] of [
    ['/post-parent/', 'omoi'],
    ['/post-parent/', 'column'],
    ['/post-parent/', 'tax'],
    ['/kimachiya/', 'makasete-wednesday'],
  ]) {
    test(`${path}#${id}`, async ({ page }) => {
      // 読み込み済みのページの中でリンクを押したときと同じ移動
      await page.goto(path, { waitUntil: 'load' });
      await page.evaluate((i) => (location.hash = i), id);
      // スクロールが止まるのを待ってから位置を測る
      const top = await page.evaluate(async (i) => {
        let last = -1;
        while (window.scrollY !== last) {
          last = window.scrollY;
          await new Promise((r) => setTimeout(r, 300));
        }
        return Math.round(document.getElementById(i)!.getBoundingClientRect().top);
      }, id);
      // 上の画像の読み込みで後から下へずれることがあるので、上限は見ない
      expect(top).toBeGreaterThanOrEqual(64);
    });
  }
});
