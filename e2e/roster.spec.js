import { expect, test } from '@playwright/test';

const avatarProviderHosts = ['minotar.net', 'cravatar.eu', 'mineskin.eu', 'mc-heads.net'];

test('realm overview names the acting leaders without changing permanent voting points', async ({ page }) => {
  await page.goto('/');

  const overview = page.getByRole('region', { name: 'Leadership' });
  await expect(overview.getByText('The crown', { exact: true })).toBeVisible();
  await expect(overview.getByRole('button', { name: /Will/ })).toBeVisible();
  await expect(overview.getByText('Acting leadership · King away')).toBeVisible();
  await expect(overview.getByRole('button', { name: /Parker/ })).toBeVisible();
  await expect(overview.getByRole('button', { name: /Darcy/ }).first()).toBeVisible();
  await expect(overview.getByText('Resources and Projects')).toBeVisible();
  await expect(overview.getByText('Combat And War')).toBeVisible();
  await expect(page.getByText('Updated November 4, 2026')).toBeVisible();

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
  await page.getByRole('navigation', { name: 'Page sections' }).getByRole('button', { name: 'Roles & points' }).click();

  const guide = page.locator('details.group\\/guide');
  await expect(guide).toHaveAttribute('open', '');
  await expect(guide.getByText('King', { exact: true })).toBeVisible();
  await expect(guide.getByText('5 primary-role points')).toBeVisible();
  await expect(guide.getByText('Advisor', { exact: true })).toBeVisible();
  await expect(guide.getByText('3 primary-role points')).toBeVisible();
});

test('sticky section navigation opens the role guide and jumps to roster areas', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const navigation = page.getByRole('navigation', { name: 'Page sections' });
  await navigation.getByRole('button', { name: 'Roles & points' }).click();
  await expect(page.locator('#role-guide')).toHaveAttribute('open', '');
  await expect(page.locator('#role-guide')).toBeInViewport();

  await navigation.getByRole('link', { name: 'Find members' }).click();
  await expect(page).toHaveURL(/#roster-controls$/);
  await expect(page.locator('#roster-controls')).toBeInViewport();

  await navigation.getByRole('link', { name: 'Roster', exact: true }).click();
  await expect(page).toHaveURL(/#member-roster$/);
  await expect(page.locator('#member-roster')).toBeInViewport();
  const navBounds = await navigation.boundingBox();
  expect(navBounds.y).toBeLessThan(30);

  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});

test('compact mode is shareable and the copied view restores the active filters', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Search the roster' }).fill('Darcy');
  await page.getByRole('button', { name: /Military/ }).click();
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

  await page.getByRole('button', { name: 'Local', exact: true }).click();
  await expect(page.getByRole('group', { name: "Will's Minecraft avatar" })).toContainText('WI');
  await expect(page.getByRole('button', { name: "Retry loading Will's avatar" })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Local', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('comfortable and compact layouts fit narrow phones with usable card columns', async ({ page }) => {
  await page.goto('/');

  for (const width of [320, 360, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    const dimensions = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      summaryColumns: getComputedStyle(
        document.querySelector('#realm-overview .grid.grid-cols-3')
      ).gridTemplateColumns.split(' ').length,
      leadershipColumns: getComputedStyle(
        document.querySelector('[aria-labelledby="realm-glance-title"] .grid.grid-cols-2')
      ).gridTemplateColumns.split(' ').length,
    }));
    expect(dimensions.documentWidth, `comfortable layout at ${width}px`).toBeLessThanOrEqual(dimensions.viewportWidth);
    expect(dimensions.summaryColumns, `overview stat columns at ${width}px`).toBe(3);
    expect(dimensions.leadershipColumns, `leadership columns at ${width}px`).toBe(2);
    const navigation = await page.getByRole('navigation', { name: 'Page sections' }).evaluate(element => ({
      width: element.clientWidth,
      contentWidth: element.scrollWidth,
    }));
    expect(navigation.contentWidth, `navigation width at ${width}px`).toBeLessThanOrEqual(navigation.width);
    const groupFilters = page.getByRole('group', { name: 'Filter member groups' });
    const groupBounds = await groupFilters.boundingBox();
    for (const button of await groupFilters.getByRole('button').all()) {
      const bounds = await button.boundingBox();
      expect(bounds.x, `filter left edge at ${width}px`).toBeGreaterThanOrEqual(groupBounds.x);
      expect(bounds.x + bounds.width, `filter right edge at ${width}px`).toBeLessThanOrEqual(groupBounds.x + groupBounds.width);
    }

    const overview = await page.getByRole('region', { name: 'Leadership' }).boundingBox();
    expect(overview.x, `overview left edge at ${width}px`).toBeGreaterThanOrEqual(0);
    expect(overview.x + overview.width, `overview right edge at ${width}px`).toBeLessThanOrEqual(width);

    await page.getByRole('button', { name: 'Compact', exact: true }).click();
    const compactDimensions = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      highCouncilColumns: getComputedStyle(
        document.querySelector('#rank-2')?.closest('section')?.querySelector(':scope > div.grid')
      ).gridTemplateColumns.split(' ').length,
    }));
    expect(compactDimensions.documentWidth, `compact layout at ${width}px`).toBeLessThanOrEqual(compactDimensions.viewportWidth);
    expect(compactDimensions.highCouncilColumns, `compact columns at ${width}px`).toBe(width < 420 ? 1 : 2);

    const profileButton = page.getByRole('button', { name: 'Profile', exact: true }).first();
    await expect(profileButton).toHaveCSS('min-height', '40px');
    await profileButton.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const bounds = await dialog.boundingBox();
    expect(bounds.x, `profile left edge at ${width}px`).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width, `profile right edge at ${width}px`).toBeLessThanOrEqual(width);
    expect(bounds.height, `profile height at ${width}px`).toBeLessThanOrEqual(844);
    await page.getByRole('button', { name: 'Close member profile' }).click();
    await page.getByRole('button', { name: 'Comfortable', exact: true }).click();
  }
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
  await expect(page.getByRole('navigation', { name: 'Page sections' })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Print roster' })).toBeHidden();
});
