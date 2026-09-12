import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  await context.addInitScript(() => {
    window.localStorage.setItem('mindful_living_auth', 'true');
  });
  const page = await context.newPage();
  
  page.on('console', msg => console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', err => console.log(`[BROWSER UNCAUGHT] ${err.message}`));
  
  // Intercept network requests to /api/translate
  page.on('request', request => {
    if (request.url().includes('/api/translate')) {
      console.log(`[NETWORK] Request to ${request.url()} with body: ${request.postData()}`);
    }
  });
  page.on('response', async response => {
    if (response.url().includes('/api/translate')) {
      console.log(`[NETWORK] Response from ${response.url()}: ${response.status()}`);
      try {
        console.log(`[NETWORK] Response body: ${await response.text()}`);
      } catch (e) {}
    }
  });

  await page.goto('http://localhost:5173/dashboard/chapter', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  console.log("Clicking Edit button...");
  const editButtons = await page.$$('.chapter-icon-btn[aria-label^="Edit"]');
  if (editButtons.length > 0) {
    await editButtons[0].click();
    await page.waitForTimeout(1000);
    
    console.log("Typing 'hello' in title...");
    const titleInput = await page.$('input[placeholder="Enter content title"]');
    if (titleInput) {
      await titleInput.fill('hello');
      // Trigger blur by clicking somewhere else (like the background)
      await page.click('.dashboard-header'); 
      console.log("Triggered blur.");
      await page.waitForTimeout(3000); // Wait for API response
      
      console.log("Clicking Indonesian tab...");
      const idTab = await page.$('text="Indonesian 🇮🇩"');
      if (idTab) {
        await idTab.click();
        await page.waitForTimeout(1000);
        const titleValue = await titleInput.inputValue();
        console.log(`Title value in Indonesian tab: ${titleValue}`);
      }
    }
  }
  
  await browser.close();
})();
