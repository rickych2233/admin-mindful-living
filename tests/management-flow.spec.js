import { test, expect } from '@playwright/test';

const baseURL = process.env.MANAGEMENT_BASE_URL || 'http://127.0.0.1:5173';
const imageFile = { name: 'thumbnail.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="160"><rect width="320" height="160" fill="#885f9a"/></svg>') };
const sessionFile = { name: 'session.mp3', mimeType: 'audio/mpeg', buffer: Buffer.from('test media upload') };
const chapters = [{ id: 1, chapter_order: 1, title: { en: 'Presence' }, description: { en: 'Daily awareness' }, sections: 1, status: 'Published' }];
const practices = [{ id: 5, title: 'Mindful Breathing', caption: 'Pause and notice your breath.', category: 'Grounding', duration: '5-10 mins', goal: 'Stress relief', related_chapters: [1], sessions: 1, status: 'Published', sessions_data: [{ title: 'Original session', type: 'Audio', contentFileName: 'original.mp3', status: 'Published' }] }];
const sections = [{ id: 10, section_order: 1, title: { en: 'Notice Your Breath' }, description: { en: 'An introduction' }, content: { en: '<p>Introduction</p>' }, type: 'Text', status: 'Published', contents: [{ id: 7, title: 'Guided audio', type: 'Audio', is_required: true }] }];

async function setup(page) {
  const writes = [];
  await page.addInitScript(() => localStorage.setItem('mindful_living_auth', 'true'));
  // Intercept every API request, including uploads and writes; never modify production data in these tests.
  await page.route('**/api/**', route => {
    const req = route.request();
    const path = new URL(req.url()).pathname;
    if (req.method() !== 'GET') {
      writes.push({ path, method: req.method(), body: req.headers()['content-type']?.includes('application/json') ? req.postDataJSON() : null });
      if (path.endsWith('/upload')) return route.fulfill({ json: { filename: 'uploaded-session.mp3' } });
      if (path.endsWith('/translate')) return route.fulfill({ json: { translations: {} } });
      return route.fulfill({ json: { id: 5, ...(req.postDataJSON() || {}) } });
    }
    if (path.endsWith('/practices/categories')) return route.fulfill({ json: [{ id: 1, name: 'Grounding' }] });
    if (path.endsWith('/sections')) return route.fulfill({ json: sections });
    if (path.endsWith('/chapters')) return route.fulfill({ json: chapters });
    if (path.endsWith('/practices')) return route.fulfill({ json: practices });
    return route.fulfill({ json: [] });
  });
  return writes;
}
async function uploadSession(dialog) {
  await dialog.getByPlaceholder('Enter session name').fill('New breathing session');
  await dialog.getByRole('button', { name: 'Audio', exact: true }).click();
  await dialog.locator('input[type=file]').setInputFiles(sessionFile);
}

test('new practice keeps its stepper and summary through session, review, and Back', async ({ page }) => {
  await setup(page);
  await page.goto(`${baseURL}/dashboard/practice`);
  await page.getByRole('button', { name: 'Add Practice', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByPlaceholder('Enter practice name').fill('Evening Breath');
  await dialog.getByPlaceholder('Enter practice caption or short explanation').fill('Relax after a busy day.');
  await dialog.locator('select').nth(0).selectOption('Grounding');
  await dialog.locator('select').nth(1).selectOption('5-10 mins');
  await dialog.locator('input[type=file]').setInputFiles(imageFile);
  await expect(dialog.locator('.chapter-thumbnail-preview')).toBeVisible();
  await dialog.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(dialog.locator('[aria-current=step]')).toContainText('Add Session');
  await expect(dialog.getByLabel('Practice summary')).toContainText('Evening Breath');
  await expect(dialog.getByLabel('Practice summary')).toContainText('Relax after a busy day.');
  await dialog.screenshot({ path: '/tmp/mindful-practice-session-fixed.png' });
  await uploadSession(dialog);
  await dialog.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(dialog.locator('[aria-current=step]')).toContainText('Review & Publish');
  await expect(dialog.getByLabel('Practice summary')).toHaveCount(1);
  await expect(dialog).toContainText('New breathing session');
  await dialog.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(dialog.getByPlaceholder('Enter session name')).toHaveValue('New breathing session');
  await expect(dialog).toContainText('session.mp3');
  await dialog.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(dialog.getByPlaceholder('Enter practice name')).toHaveValue('Evening Breath');
  await expect(dialog.getByPlaceholder('Enter practice caption or short explanation')).toHaveValue('Relax after a busy day.');
});

test('adding a session to an existing practice shows its context and reviews before saving', async ({ page }) => {
  const writes = await setup(page);
  await page.goto(`${baseURL}/dashboard/practice`);
  await page.getByRole('button', { name: 'View Sessions', exact: true }).click();
  await page.getByRole('button', { name: 'Add Session', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('[aria-current=step]')).toContainText('Add Session');
  await expect(dialog.getByLabel('Practice summary')).toContainText('Mindful Breathing');
  await expect(dialog.getByLabel('Practice summary')).toContainText('Pause and notice your breath.');
  await expect(dialog.getByLabel('Practice summary')).toContainText('Presence');
  await uploadSession(dialog);
  await dialog.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(dialog.locator('[aria-current=step]')).toContainText('Review & Publish');
  expect(writes.filter(req => req.path.endsWith('/practices/5'))).toHaveLength(0);
  await dialog.getByRole('button', { name: 'Publish Now', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  const saved = writes.find(req => req.path.endsWith('/practices/5')).body;
  expect(saved.title).toBe(practices[0].title);
  expect(saved.caption).toBe(practices[0].caption);
  expect(saved.goal).toBe(practices[0].goal);
  expect(saved.related_chapters).toEqual([1]);
  expect(saved.sessions_data).toHaveLength(2);
  expect(saved.sessions_data[0].title).toBe('Original session');
  expect(saved.sessions_data[1].title).toBe('New breathing session');
});

test('chapter filters sit close to the table and section icons use the main action color', async ({ page }) => {
  await setup(page);
  await page.goto(`${baseURL}/dashboard/chapter`);
  await expect(page.locator('.chapter-table-card')).toBeVisible();
  const distance = await page.evaluate(() => document.querySelector('.chapter-table-card').getBoundingClientRect().top - document.querySelector('.chapter-toolbar').getBoundingClientRect().bottom);
  expect(distance).toBeGreaterThanOrEqual(12);
  expect(distance).toBeLessThanOrEqual(20);
  await page.getByRole('button', { name: 'View Sections', exact: true }).click();
  const color = await page.locator('.chapter-actions .chapter-icon-btn').first().evaluate(el => getComputedStyle(el).color);
  await expect(page.getByRole('button', { name: 'Edit section', exact: true })).toHaveCSS('color', color);
  await expect(page.getByRole('button', { name: 'Delete section', exact: true })).toHaveCSS('color', color);
  await expect(page.locator('.content-icon')).toHaveCSS('color', color);
  await page.screenshot({ path: '/tmp/mindful-chapter-management-fixed.png' });
});

test('image insertion stays close to text and follows image height in the chapter drawer', async ({ page }) => {
  await setup(page);
  await page.goto(`${baseURL}/dashboard/chapter`);
  await page.getByRole('button', { name: 'View Sections', exact: true }).click();
  await page.getByRole('button', { name: 'Add Section', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.locator('.custom-rte-content').first().fill('Introduction before the image.');
  await dialog.locator('[title="Insert Image"] input').setInputFiles(imageFile);
  await expect(dialog.locator('.chapter-editor-image img')).toBeVisible();
  const layout = await dialog.evaluate(el => {
    const text = el.querySelector('.custom-rte-content').getBoundingClientRect();
    const image = el.querySelector('.chapter-editor-image').getBoundingClientRect();
    return { textHeight: text.height, imageHeight: image.height, gap: image.top - text.bottom };
  });
  expect(layout.textHeight).toBeLessThan(60);
  expect(layout.imageHeight).toBeLessThan(200);
  expect(layout.gap).toBeLessThanOrEqual(12);
  await expect(dialog.locator('.custom-rte-content').first()).toContainText('Introduction before the image.');
  await dialog.screenshot({ path: '/tmp/mindful-chapter-editor-fixed.png' });
});
