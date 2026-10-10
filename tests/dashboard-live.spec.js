import { test, expect } from '@playwright/test';

// Opt-in test against the real backend. No request interception or mock responses.
const baseURL = process.env.DASHBOARD_BASE_URL;
test.skip(!baseURL, 'Set DASHBOARD_BASE_URL to test an actual running backend');
const usd = value => Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

test('dashboard displays the real backend response', async ({ page, request }) => {
  const response = await request.get(`${baseURL}/api/dashboard/stats`);
  expect(response.ok()).toBe(true);
  const stats = await response.json();
  expect(stats.activity.weekly.secondaryValues).toHaveLength(7);
  expect(stats.activity.monthly.secondaryValues).toHaveLength(4);
  expect(stats.activity.yearly.secondaryValues).toHaveLength(12);
  // These metrics have no historical source in the existing database.
  expect(stats.metrics.weeklyActiveUsers).toBeNull();
  expect(stats.donations.summary.recurring).toBeNull();
  expect(stats.donations.summary.recent30Days).toBeNull();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem('mindful_living_auth', 'true'));
  await page.setViewportSize({ width: 1440, height: 1024 });
  await page.goto(`${baseURL}/dashboard`);
  await expect(page.getByRole('status')).toContainText('Updated', { timeout: 20000 });
  await expect(page.getByLabel('Key Metrics')).toContainText(`${stats.metrics.notesLast30Days} notes`);
  await expect(page.locator('.dsh-donut-center strong')).toHaveText(String(stats.metrics.totalUsers));
  await expect(page.getByLabel('Donations')).toContainText(usd(stats.donations.summary.total));
  await expect(page.getByLabel('Attention Needed')).toContainText(`${stats.reports.pendingCount} pending report`);
  await expect(page.locator('.dsh-table tbody tr')).toHaveCount(stats.donations.recentSupporters.length);
  for (const supporter of stats.donations.topSupporters) {
    await expect(page.locator('.dsh-rank-list')).toContainText(supporter.name);
    await expect(page.locator('.dsh-rank-list')).toContainText(usd(supporter.amount));
  }
  if (stats.notes.mostTaggedCategory) await expect(page.getByLabel('Notes & Bookmarks')).toContainText(stats.notes.mostTaggedCategory.name);
  await expect(page.locator('.chart-dot-primary')).toHaveCount(0);
  await expect(page.locator('.chart-dot-secondary')).toHaveCount(7);
  await page.getByRole('button', { name: 'Yearly', exact: true }).click();
  await expect(page.locator('.chart-dot-secondary')).toHaveCount(12);
  await page.getByRole('button', { name: 'Weekly', exact: true }).click();
  await page.getByRole('heading', { name: 'Top Contributors' }).scrollIntoViewIfNeeded();
  await expect(page.getByRole('heading', { name: 'Top Contributors' })).toBeInViewport();
  await page.addStyleTag({ content: '.dashboard-page, .dashboard-shell, .dashboard-main { height: auto; max-height: none; overflow: visible; }' });
  await page.locator('.dsh-page').screenshot({ path: '/tmp/mindful-dashboard-real-backend.png' });
  expect(errors).toEqual([]);
});
