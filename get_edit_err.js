import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  await context.addInitScript(() => {
    window.localStorage.setItem('mindful_living_auth', 'true');
  });
  const page = await context.newPage();
  await page.setViewportSize({ width: 1280, height: 1024 });

  let hasError = false;
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[BROWSER ERROR] ${msg.text()}`);
      hasError = true;
    }
  });
  page.on('pageerror', err => {
    console.log(`[BROWSER UNCAUGHT] ${err.message}`);
    hasError = true;
  });

  await page.goto('http://localhost:5173/dashboard/chapter', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  console.log("Clicking Edit button...");
  // The edit button has aria-label="Edit [Chapter Name]"
  // We can just find the first .chapter-icon-btn that has an svg with a specific path or just by clicking the second button in .chapter-actions
  const editButtons = await page.$$('.chapter-icon-btn[aria-label^="Edit"]');
  if (editButtons.length > 0) {
    await editButtons[0].click();
    console.log("Clicked first Edit button.");
    await page.waitForTimeout(2000);
  } else {
    console.log("No Edit button found.");
  }

  await page.screenshot({ path: 'pw_edit_screenshot.png' });
  console.log("Saved screenshot to pw_edit_screenshot.png");
  await browser.close();
})();
