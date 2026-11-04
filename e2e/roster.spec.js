import { expect, test } from '@playwright/test';

const avatarProviderHosts = ['minotar.net', 'cravatar.eu', 'mineskin.eu', 'mc-heads.net'];

test('king-away status names the acting leaders without changing permanent voting points', async ({ page }) => {
  await page.goto('/');

  const status = page.getByRole('status', { name: 'Leadership status' });
  await expect(status).toContainText('King away');
  await expect(status).toContainText('Acting leadership: Parker and Darcy.');

  for (const name of ['Parker', 'Darcy']) {
    const card = page.locator('article').filter({ has: page.getByRole('heading', { name, exact: true }) });
    await expect(card.getByText('Acting leader', { exact: true })).toBeVisible();
    await expect(card.getByLabel('3 voting points from Advisor primary role')).toBeVisible();
  }

  const kingCard = page.locator('article').filter({ has: page.getByRole('heading', { name: 'Will', exact: true }) });
  await expect(kingCard.getByLabel('5 voting points from King primary role')).toBeVisible();
  await expect(kingCard.getByText('Acting leader', { exact: true })).toHaveCount(0);
});

async function mockAvatarProviders(page, handleAvatar, requests) {
  for (const host of avatarProviderHosts) {
    await page.route(`https://${host}/**`, async route => {
      const requestUrl = route.request().url();
      if (requestUrl.includes('/EighthSea6218/')) requests.push(requestUrl);
      await handleAvatar(route, host, requestUrl);
    });
  }
}

test('role guide explains each role and its primary-role points', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Role guide and primary-role voting points').click();

  const guide = page.locator('details.group\\/guide');
  await expect(guide.getByText('King', { exact: true })).toBeVisible();
  await expect(guide.getByText('5 primary-role points')).toBeVisible();
  await expect(guide.getByText('Advisor', { exact: true })).toBeVisible();
  await expect(guide.getByText('3 primary-role points')).toBeVisible();
});

test('compact mode is shareable and the copied view restores the active filters', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Search the roster' }).fill('Darcy');
  await page.getByRole('button', { name: /Military/ }).click();
  await page.locator('details').filter({ hasText: 'Display options' }).locator('summary').click();
  await page.getByRole('button', { name: 'Compact', exact: true }).click();

  await expect(page.getByRole('button', { name: 'Compact', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page).toHaveURL(/q=Darcy/);
  await expect(page).toHaveURL(/group=Military/);
  await expect(page).toHaveURL(/view=compact/);
  await expect(page.getByRole('status').filter({ hasText: 'Showing 1 of 10 members' })).toBeVisible();

  await page.getByRole('button', { name: 'Share view' }).click();
  await expect(page.getByText('Filtered view link copied.')).toBeVisible();
  const sharedUrl = new URL(await page.evaluate(() => navigator.clipboard.readText()));
  expect(sharedUrl.searchParams.get('q')).toBe('Darcy');
  expect(sharedUrl.searchParams.get('group')).toBe('Military');
  expect(sharedUrl.searchParams.get('view')).toBe('compact');
  expect(sharedUrl.searchParams.has('member')).toBe(false);

  await page.goto(sharedUrl.href);
  await expect(page.getByRole('searchbox', { name: 'Search the roster' })).toHaveValue('Darcy');
  await page.locator('details').filter({ hasText: 'Display options' }).locator('summary').click();
  await expect(page.getByRole('button', { name: 'Compact', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('status').filter({ hasText: 'Showing 1 of 10 members' })).toBeVisible();
});

test('filter state survives opening a member profile and browser back/forward', async ({ page }) => {
  await page.goto('/?q=Darcy&group=Council&role=Advisor&sort=name&view=compact');
  await page.getByRole('button', { name: 'Profile', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page).toHaveURL(/member=3/);
  await expect(page).toHaveURL(/group=Council/);
  await page.goBack();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('searchbox', { name: 'Search the roster' })).toHaveValue('Darcy');
  await page.goForward();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Darcy' })).toBeVisible();
});

test('Minecraft avatars fall back through providers until a skin loads', async ({ page }) => {
  const avatarRequests = [];
  await mockAvatarProviders(page, async (route, host) => {
    if (host === 'mineskin.eu') {
      await route.fulfill({
        status: 200,
        contentType: 'image/svg+xml',
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>',
      });
    } else {
      await route.abort();
    }
  }, avatarRequests);
  await page.goto('/');

  const avatar = page.getByRole('group', { name: "Will's Minecraft avatar" });
  await expect(avatar.locator('img[src*="mineskin.eu"]')).toBeVisible();
  await expect.poll(() => avatarRequests.map(url => new URL(url).hostname)).toEqual([
    'minotar.net',
    'cravatar.eu',
    'mineskin.eu',
  ]);
  expect(await avatar.locator('img').evaluate(image => image.naturalWidth)).toBeGreaterThan(0);
});

test('all failed skin providers show initials, allow retry, and keep local mode available', async ({ page }) => {
  const avatarRequests = [];
  await mockAvatarProviders(page, route => route.abort(), avatarRequests);
  await page.goto('/');

  const retryButton = page.getByRole('button', { name: "Retry loading Will's avatar" });
  await expect(retryButton).toBeVisible();
  await expect(page.getByRole('group', { name: "Will's Minecraft avatar" })).toContainText('WI');
  await expect.poll(() => avatarRequests.map(url => new URL(url).hostname)).toEqual(avatarProviderHosts);

  await retryButton.click();
  await expect.poll(() => avatarRequests).toHaveLength(8);
  expect(avatarRequests.slice(4).map(url => new URL(url).hostname)).toEqual(avatarProviderHosts);
  expect(avatarRequests[4]).toContain('?retry=1');
  await expect(retryButton).toBeVisible();

  await page.locator('details').filter({ hasText: 'Display options' }).locator('summary').click();
  await page.getByRole('button', { name: 'Local', exact: true }).click();
  await expect(page.getByRole('group', { name: "Will's Minecraft avatar" })).toContainText('WI');
  await expect(page.getByRole('button', { name: "Retry loading Will's avatar" })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Local', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('compact layout fits a phone width and profile dialog stays in the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('details').filter({ hasText: 'Display options' }).locator('summary').click();
  await page.getByRole('button', { name: 'Compact', exact: true }).click();

  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);

  await page.getByRole('button', { name: 'Profile', exact: true }).first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const bounds = await dialog.boundingBox();
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
  expect(bounds.height).toBeLessThanOrEqual(844);
});

test('print view includes active search and filters but hides interactive controls', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Search the roster' }).fill('Darcy');
  await page.getByRole('button', { name: /Military/ }).click();
  await page.emulateMedia({ media: 'print' });

  const summary = page.getByTestId('print-roster-summary');
  await expect(summary).toBeVisible();
  await expect(summary).toContainText('Showing 1 of 10 members.');
  await expect(summary).toContainText('Search: “Darcy”');
  await expect(summary).toContainText('Group: Military');
  await expect(page.getByRole('region', { name: 'Find a member' })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Print roster' })).toBeHidden();
});
