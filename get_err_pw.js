import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  // Set localStorage via context
  const context = await browser.newContext();
  await context.addInitScript(() => {
    window.localStorage.setItem('mindful_living_auth', 'true');
  });
  const page = await context.newPage();
  
  // Set viewport large enough
  await page.setViewportSize({ width: 1280, height: 1024 });

  // Log all console messages
  page.on('console', msg => {
    console.log(`[BROWSER ${msg.type().toUpperCase()}] ${msg.text()}`);
  });
  
  await page.goto('http://localhost:5173/dashboard/chapter', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  await page.screenshot({ path: 'pw_screenshot.png' });
  console.log("Saved screenshot to pw_screenshot.png");

  await browser.close();
})();
