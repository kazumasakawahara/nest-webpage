import { test, expect } from '@playwright/test';

test('post-parent page has a table of contents for four chapters', async ({ page }) => {
  await page.goto('/post-parent/');
  const links = page.getByRole('navigation', { name: 'このページの目次' }).getByRole('link');
  await expect(links).toHaveCount(4);
  expect(await links.evaluateAll((as) => as.map((a) => a.getAttribute('href')))).toEqual([
    '#belief',
    '#voices',
    '#prepare',
    '#connect',
  ]);
});

test('chapters are h2 headings in the planned order', async ({ page }) => {
  await page.goto('/post-parent/');
  await expect(page.locator('.pp-chapter h2')).toHaveText(['わたしたちの考え', '声を聴く', 'いま、備える', '資料とつながり']);
});

test('blocks follow the chapter order and existing anchors remain', async ({ page }) => {
  await page.goto('/post-parent/');
  const inOrder = await page.evaluate(() => {
    const byText = (t: string) =>
      [...document.querySelectorAll('main h2, main h3')].find((h) => h.textContent?.trim() === t) ?? null;
    const els = [
      document.getElementById('toc'),
      document.getElementById('belief'),
      byText('お金より、遺すべきものがある'),
      byText('「親なき後」を希望に変える'),
      document.getElementById('voices'),
      document.getElementById('omoi'),
      document.getElementById('column'),
      document.getElementById('prepare'),
      byText('知恵を、引き継げる形に'),
      document.getElementById('tax'),
      document.getElementById('connect'),
      document.getElementById('pp-resources-title'),
      document.getElementById('pp-community-title'),
    ];
    if (els.some((e) => !e)) return `missing: ${els.findIndex((e) => !e)}`;
    for (let i = 1; i < els.length; i++) {
      if (!(els[i - 1]!.compareDocumentPosition(els[i]!) & Node.DOCUMENT_POSITION_FOLLOWING)) return `out of order at ${i}`;
    }
    return 'ok';
  });
  expect(inOrder).toBe('ok');
});
