import { test, expect } from '@playwright/test';

// API fixtures belong only to tests. The production dashboard always fetches /api/dashboard/stats.
const fixture = {
  metrics: { totalUsers: 317, weeklyActiveUsers: null, returningUsers: null, highestFriction: null, notesLast30Days: 29 },
  notes: { recent7Days: 12, previous7Days: 8, bookmarksRecent7Days: 6, bookmarksPrevious7Days: 3,
    mostTaggedCategory: { name: 'Awareness', count: 11 } },
  activity: {
    weekly: { labels: ['04 Oct', '05 Oct', '06 Oct', '07 Oct', '08 Oct', '09 Oct', '10 Oct'], primaryValues: null, secondaryValues: [2, 4, 1, 0, 6, 3, 7] },
    monthly: { labels: ['21 Sep', '28 Sep', '05 Oct', '12 Oct'], primaryValues: null, secondaryValues: [11, 18, 9, 4] },
    yearly: { labels: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'], primaryValues: null, secondaryValues: [4, 8, 11, 6, 10, 12, 24, 10, 20, 18, 30, 16] },
  },
  appUsage: null,
  reports: { pendingCount: 2 },
  content: { mostNoted: { chapter: 'Chapter 4', section: 'Section 2', count: 17 },
    mostQuestioned: { chapter: 'Chapter 2', section: 'Section 1', count: 5 } },
  community: {
    newestDiscussion: { message: 'How do you practise presence during a busy day?', name: 'Rani Putri', createdAt: '2026-10-10T05:00:00Z' },
    mostResonatedCategory: { name: 'Personal Reflection', count: 32 },
    mostReportedCategory: { reason: 'Spam', count: 2 },
    topDiscussionCategories: [ { name: 'Awareness', count: 24 }, { name: 'Meditation', count: 18 }, { name: 'Breathwork', count: 12 }, { name: 'Reflection', count: 9 }, { name: 'Grounding', count: 8 }, { name: 'Sleep', count: 6 }, { name: 'Chapter 2', count: 4 } ],
  },
  donations: { summary: { total: 987.65, highest: 250, average: 123.46, recurring: null },
    topSupporters: [{ name: 'Rani Putri', amount: 250, joinedAt: '2026-09-01T00:00:00Z' }],
    recentSupporters: [{ name: 'Dimas Aditya', amount: 42.75, joinedAt: '2026-10-09T00:00:00Z' }] },
};
async function open(page, data = fixture) {
  await page.addInitScript(() => localStorage.setItem('mindful_living_auth', 'true'));
  await page.route('**/api/dashboard/stats', route => route.fulfill({ json: data }));
  await page.goto('http://127.0.0.1:5173/dashboard');
  await expect(page.getByRole('status')).toContainText('Updated');
}

test('renders API data and switches registration ranges without inventing unavailable metrics', async ({ page }) => {
  await open(page);
  await expect(page.getByLabel('Key Metrics')).toContainText('29 notes');
  await expect(page.getByLabel('Notes & Bookmarks')).toContainText('12 notes');
  await expect(page.getByLabel('Notes & Bookmarks')).toContainText('+50%');
  await expect(page.getByLabel('Community')).toContainText('Personal Reflection');
  await expect(page.getByLabel('Donations')).toContainText('$987.65');
  await expect(page.getByLabel('Donations')).toContainText('Dimas Aditya');
  await expect(page.getByLabel('Donations')).toContainText('9 Oct 2026');
  await expect(page.getByLabel('Donations')).toContainText('Recurring payments not tracked yet');
  await expect(page.locator('.dsh-donut-center')).toContainText('317');
  await expect(page.locator('.donut-segment')).toHaveCount(0);
  await expect(page.locator('.chart-dot-primary')).toHaveCount(0);
  await expect(page.locator('.chart-dot-secondary')).toHaveCount(7);
  await page.getByRole('button', { name: 'Monthly', exact: true }).click();
  await expect(page.locator('.chart-dot-secondary')).toHaveCount(4);
  await page.getByRole('button', { name: 'Yearly', exact: true }).click();
  await expect(page.locator('.chart-dot-secondary')).toHaveCount(12);
});

test('renders desktop and mobile without horizontal overflow', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [1440, 1100, 768, 375]) {
    await page.setViewportSize({ width, height: 1024 });
    await open(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(await page.locator('.dsh-page').evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
    await page.getByRole('heading', { name: 'Top Contributors' }).scrollIntoViewIfNeeded();
    await expect(page.getByRole('heading', { name: 'Top Contributors' })).toBeInViewport();
    // Expand only the scroll container for a complete screenshot of the design.
    await page.addStyleTag({ content: '.dashboard-page, .dashboard-shell, .dashboard-main { height: auto; max-height: none; overflow: visible; }' });
    await page.screenshot({ path: `/tmp/mindful-dashboard-${width}.png`, fullPage: true });
    await page.locator('.dsh-page').screenshot({ path: `/tmp/mindful-dashboard-content-${width}.png` });
  }
  expect(errors).toEqual([]);
});

test('refreshes from the API and preserves last successful data on failure', async ({ page }) => {
  await page.clock.install();
  await page.addInitScript(() => localStorage.setItem('mindful_living_auth', 'true'));
  let phase = 0;
  await page.route('**/api/dashboard/stats', route => {
    return phase === 2 ? route.fulfill({ status: 500, json: { message: 'Database unavailable' } }) :
      route.fulfill({ json: { ...fixture, metrics: { ...fixture.metrics, notesLast30Days: phase === 0 ? 29 : 41 } } });
  });
  await page.goto('http://127.0.0.1:5173/dashboard');
  await expect(page.getByLabel('Key Metrics')).toContainText('29 notes');
  phase = 1;
  await page.clock.fastForward(31000);
  await expect(page.getByLabel('Key Metrics')).toContainText('41 notes');
  phase = 2;
  await page.clock.fastForward(31000);
  await expect(page.getByRole('status')).toContainText('Showing the last loaded data');
  await expect(page.getByLabel('Key Metrics')).toContainText('41 notes');
});

test('failed first load displays an error alongside zero placeholders', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('mindful_living_auth', 'true'));
  await page.route('**/api/dashboard/stats', route => route.fulfill({ status: 500, json: { message: 'Unavailable' } }));
  await page.goto('http://127.0.0.1:5173/dashboard');
  await expect(page.getByRole('status')).toContainText('could not be loaded');
  await expect(page.getByLabel('Donations')).toContainText('$0.00');
  await expect(page.getByLabel('Attention Needed')).toContainText('Report data unavailable');
});

test('empty database returns genuine zeroes and empty states', async ({ page }) => {
  await open(page, { metrics: { totalUsers: 0, notesLast30Days: 0 }, notes: { recent7Days: 0, previous7Days: 0, bookmarksRecent7Days: 0, bookmarksPrevious7Days: 0 }, donations: { summary: { total: 0, highest: 0, average: 0 }, topSupporters: [], recentSupporters: [] }, community: { topDiscussionCategories: [] }, reports: { pendingCount: 0 } });
  await expect(page.getByLabel('Key Metrics')).toContainText('0 notes');
  await expect(page.getByLabel('Donations')).toContainText('$0.00');
  await expect(page.getByLabel('Donations')).toContainText('No contributors yet');
  await expect(page.getByLabel('Attention Needed')).toContainText('No pending reports');
});
