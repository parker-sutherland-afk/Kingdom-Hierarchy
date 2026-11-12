import { expect, test } from '@playwright/test';

const avatarProviderHosts = ['minotar.net', 'cravatar.eu', 'mineskin.eu', 'mc-heads.net'];
const googleTestClientId = 'playwright-test.apps.googleusercontent.com';
const googleTestCredential = `eyJhbGciOiJub25lIn0.${Buffer.from(JSON.stringify({
  aud: googleTestClientId,
  iss: 'https://accounts.google.com',
  email: 'citizen@example.com',
  email_verified: true,
  name: 'Test Imperium',
  sub: 'test-google-user',
  exp: Math.floor(Date.now() / 1000) + 3600,
})).toString('base64url')}.test-signature`;

async function installGoogleSignInMock(page) {
  await page.route('https://accounts.google.com/gsi/client', route => route.fulfill({
    contentType: 'application/javascript',
    body: `
      window.google = { accounts: { id: {
        initialize(options) { window.__imperiusGoogleCallback = options.callback; },
        renderButton(container) {
          const button = document.createElement('button');
          button.type = 'button';
          button.textContent = 'Continue with Google';
          button.addEventListener('click', () => window.__imperiusGoogleCallback({
            credential: ${JSON.stringify(googleTestCredential)}
          }));
          container.append(button);
        }
      } } };
    `,
  }));
}

async function signInWithGoogle(page) {
  await installGoogleSignInMock(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Sign in / Register', exact: true }).click();
  await page.getByRole('button', { name: 'Continue with Google' }).click();
  await expect(page.getByText('Signed in as Test Imperium')).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await signInWithGoogle(page);
});

test('Google browser sign-in survives navigation and signs out to the guest home page', async ({ page }) => {
  const storedIdentity = await page.evaluate(() => JSON.parse(sessionStorage.getItem('imperius.google.identity')));
  expect(storedIdentity).toMatchObject({
    email: 'citizen@example.com',
    name: 'Test Imperium',
  });
  expect(storedIdentity).not.toHaveProperty('credential');

  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page.getByText('Signed in as Test Imperium')).toHaveCount(0);
  await expect(page.getByRole('main', { name: 'Kingdom member roster' })).toBeVisible();
  await page.getByRole('button', { name: 'Sign in / Register', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Welcome to the Realm' })).toBeVisible();
  await expect(page.getByText(/Email sign-in is not set up yet/)).toBeVisible();
  await expect(page.getByText(/VITE_HANKO_API_URL/)).toBeVisible();
  await page.getByRole('button', { name: 'Back to home' }).click();
  await expect(page.getByRole('main', { name: 'Kingdom member roster' })).toBeVisible();

  await page.goto('/?page=community&section=constitution');
  await expect(page.getByRole('heading', { name: 'Community pages locked' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Kingdom Currency' })).toHaveCount(0);

  await page.getByRole('button', { name: 'Sign in / Register', exact: true }).click();
  await page.getByRole('button', { name: 'Continue with Google' }).click();
  await expect(page.getByText('Signed in as Test Imperium')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Signed in as Test Imperium')).toBeVisible();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page.getByRole('button', { name: 'Sign in / Register', exact: true })).toBeVisible();
});

test('guests browse the home page with limited access and are asked to sign in for locked actions', async ({ page }) => {
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page.getByRole('button', { name: 'Sign in / Register', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Charlie Pringle', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /Minecraft username/ })).toHaveCount(0);

  await page.getByRole('button', { name: 'View full profile' }).first().click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByText('You need to be signed in to view full member profiles.')).toBeVisible();

  await page.getByRole('button', { name: 'Share view' }).click();
  await expect(page.getByText('You need to be signed in to share filtered views.')).toBeVisible();

  await page.getByRole('button', { name: 'Print roster' }).click();
  await expect(page.getByText('You need to be signed in to print the roster.')).toBeVisible();

  await page.getByRole('button', { name: 'Community (sign in required)' }).click();
  await expect(page.getByText('You need to be signed in to open the Community pages.')).toBeVisible();

  await page.goto('/?member=3');
  await expect(page.getByRole('dialog')).not.toBeVisible();

  await page.getByRole('button', { name: 'Sign in / Register', exact: true }).click();
  await page.getByRole('button', { name: 'Continue with Google' }).click();
  await expect(page.getByText('Signed in as Test Imperium')).toBeVisible();
});

test('returned King clears acting-leader status without changing permanent roles or voting points', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('status', { name: 'Leadership status' })).toHaveCount(0);

  for (const name of ['Parker', 'Darcy']) {
    const card = page.locator('article').filter({ has: page.getByRole('heading', { name, exact: true }) });
    await expect(card.getByText('Acting leader', { exact: true })).toHaveCount(0);
    await expect(card.getByLabel('3 voting points from Advisor primary role')).toBeVisible();
  }

  const kingCard = page.locator('article').filter({ has: page.getByRole('heading', { name: 'Will', exact: true }) });
  await expect(kingCard.getByLabel('5 voting points from King primary role')).toBeVisible();
  await expect(kingCard.getByText('Acting leader', { exact: true })).toHaveCount(0);
});

test('Max is displayed in Citizens without changing his Prince role or points', async ({ page }) => {
  await page.goto('/');

  const maxCard = page.locator('#member-roster section').filter({
    has: page.getByRole('heading', { name: 'CITIZENS' }),
  }).locator('article').filter({ has: page.getByRole('heading', { name: 'Max', exact: true }) });
  await expect(maxCard).toBeVisible();
  await expect(maxCard.getByRole('button', { name: 'Filter roster by primary role Prince' })).toBeVisible();
  await expect(maxCard.getByLabel('2 voting points from Prince primary role')).toBeVisible();

  await page.getByRole('button', { name: 'Hierarchy', exact: true }).click();
  const citizenTier = page.locator('#member-roster section').filter({
    has: page.getByRole('heading', { name: 'CITIZENS' }),
  });
  await expect(citizenTier.getByRole('button', { name: "Open Max's profile" })).toContainText('Prince');
  await page.getByRole('button', { name: 'Roster', exact: true }).click();

  await page.getByRole('button', { name: /Citizens/ }).click();
  await expect(page.getByRole('heading', { name: 'Max', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Charlie Pringle', exact: true })).toBeVisible();
  await expect(page.getByRole('group', { name: "Charlie Pringle's Minecraft avatar" })).toContainText('CP');
});

test('community pages publish notices, build plans, and the constitution without chat or a council board', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('link', { name: 'Community' }).click();

  await expect(page.getByRole('heading', { name: 'Realm Hall', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'A Royal Welcome to Charlie Pringle' })).toBeVisible();
  await expect(page.getByText('Realm records updated')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Read the Constitution' })).toBeVisible();
  await page.getByRole('link', { name: 'Notices', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Notices', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'A Royal Welcome to Charlie Pringle' })).toBeVisible();
  await expect(page.getByText(/welcoming Charlie Pringle to the realm/)).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Community pages' }).getByRole('link', { name: 'Message board' })).toHaveCount(0);
  await expect(page.getByRole('navigation', { name: 'Community pages' }).getByRole('link', { name: 'Council' })).toHaveCount(0);

  await page.getByRole('link', { name: 'Build projects' }).click();
  await expect(page.getByRole('heading', { name: 'Floor 3: Armory, Strategy Rooms & Combat Training' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Front Yard Renovation at the Impyramid' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Creeper Farm' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Skeleton Farm' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Enderman Farm' })).toBeVisible();
  await expect(page.getByText('planned', { exact: true })).toHaveCount(5);

  await page.getByRole('link', { name: 'Constitution' }).click();
  await expect(page.getByRole('heading', { name: 'Kingdom Currency' })).toBeVisible();
  await expect(page.getByRole('row', { name: 'Netherite Block 2,700' })).toBeVisible();
  await expect(page.getByRole('row', { name: 'Dragon Egg Guaranteed purchase' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Constitution sections' }).getByRole('link')).toHaveCount(15);
  const constitutionNav = page.getByRole('navigation', { name: 'Constitution sections' });
  await constitutionNav.getByRole('link', { name: 'Departments, Roles & Powers' }).click();
  await expect(page.getByText(/no more than two departments/)).toBeVisible();
  await constitutionNav.getByRole('link', { name: 'Conditions of Court' }).click();
  await expect(page.getByRole('heading', { name: 'Conditions of Court' })).toBeVisible();
  await expect(page.getByText(/Judge Thomas maintains order in court/)).toBeVisible();
  await constitutionNav.getByRole('link', { name: 'Conditions of Construction' }).click();
  await expect(page.getByRole('heading', { name: 'Conditions of Construction' })).toBeVisible();
  await expect(page.getByText(/constitutional monarchy created on the Boothboys Minecraft server/)).toBeVisible();
  await constitutionNav.getByRole('link', { name: 'Parliament', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Parliament' })).toBeVisible();
  await expect(page.getByText(/at least 51% of votes/)).toBeVisible();
  await constitutionNav.getByRole('link', { name: 'Court & Powers of the Court' }).click();
  await expect(page.getByRole('heading', { name: 'Court & Powers of the Court' })).toBeVisible();
  await expect(page.getByText(/within one week of being caught/)).toBeVisible();
  await constitutionNav.getByRole('link', { name: 'Military Powers' }).click();
  await expect(page.getByRole('heading', { name: 'Military Powers' })).toBeVisible();
  await expect(page.getByText(/up to 20% of Imperius's weekly budget/)).toBeVisible();
  await constitutionNav.getByRole('link', { name: 'Signatures' }).click();
  await expect(page.getByRole('heading', { name: 'Signatures' })).toBeVisible();

  await page.getByRole('link', { name: 'Profiles' }).click();
  await expect(page.getByRole('heading', { name: 'Max', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Charlie Pringle', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Full profile' }).last().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Charlie Pringle' })).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
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
  await expect(guide.locator('time')).toHaveAttribute('datetime', '2026-11-05');
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
  await expect(page.getByRole('status').filter({ hasText: 'Showing 1 of 11 members' })).toBeVisible();

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
  await expect(page.getByRole('status').filter({ hasText: 'Showing 1 of 11 members' })).toBeVisible();
});

test('hierarchy view follows filters, is shareable, and opens member profiles', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockAvatarProviders(page, route => route.fulfill({
    status: 200,
    contentType: 'image/svg+xml',
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>',
  }), []);
  await page.goto('/?q=Darcy&group=Military&layout=hierarchy');

  const hierarchy = page.locator('#member-roster');
  await expect(hierarchy).toHaveAttribute('data-layout-mode', 'hierarchy');
  await expect(hierarchy.getByRole('heading', { name: 'HIGH COUNCIL' })).toBeVisible();
  await expect(hierarchy.getByRole('heading', { name: 'CITIZENS' })).toHaveCount(0);
  await expect(hierarchy.getByRole('button', { name: "Open Darcy's profile" })).toBeVisible();
  await expect(
    hierarchy.getByRole('group', { name: "Darcy's Minecraft avatar" })
      .getByRole('img', { name: "Darcy's Minecraft skin" })
  ).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);

  await page.getByRole('button', { name: 'Share view' }).click();
  await expect(page.getByText('Filtered view link copied.')).toBeVisible();
  const sharedUrl = new URL(await page.evaluate(() => navigator.clipboard.readText()));
  expect(sharedUrl.searchParams.get('layout')).toBe('hierarchy');
  expect(sharedUrl.searchParams.get('group')).toBe('Military');
  expect(sharedUrl.searchParams.get('q')).toBe('Darcy');

  await page.goto(sharedUrl.href);
  await page.locator('#member-roster').getByRole('button', { name: "Open Darcy's profile" }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page).toHaveURL(/layout=hierarchy/);
  await page.goBack();
  await expect(page.locator('#member-roster')).toHaveAttribute('data-layout-mode', 'hierarchy');
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
  await expect(page).toHaveURL(/member=3/);
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
  await expect(summary).toContainText('Showing 1 of 11 members.');
  await expect(summary).toContainText('Search: “Darcy”');
  await expect(summary).toContainText('Group: Military');
  await expect(page.getByRole('region', { name: 'Find a member' })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Print roster' })).toBeHidden();

  await page.goto('/?layout=hierarchy');
  await page.emulateMedia({ media: 'print' });
  await expect(page.getByTestId('print-roster-summary')).toContainText('Layout: Hierarchy');
  await expect(page.getByRole('button', { name: "Open Will's profile" })).toBeVisible();
});
