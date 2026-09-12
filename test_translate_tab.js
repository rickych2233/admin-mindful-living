import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  await context.addInitScript(() => {
    window.localStorage.setItem('mindful_living_auth', 'true');
  });
  const page = await context.newPage();
  
  page.on('console', msg => console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`));
  
  // Intercept network requests to /api/translate
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
    
    // Go to step 2
    console.log("Clicking Next Step...");
    const nextBtn = await page.$('button:has-text("Next Step")');
    if (nextBtn) {
      await nextBtn.click();
      await page.waitForTimeout(1000);
      
      console.log("Typing 'hello' in Section Name...");
      const sectionNameInput = await page.$('input[placeholder="Enter section name"]');
      if (sectionNameInput) {
        await sectionNameInput.fill('hello');
        
        console.log("Clicking Indonesian tab...");
        const idTab = await page.$('button:has-text("Indonesian 🇮🇩")');
        if (idTab) {
          await idTab.click(); // This will trigger blur on the input!
          await page.waitForTimeout(4000); // Wait for API
          const titleValue = await sectionNameInput.inputValue();
          console.log(`Title value in Indonesian tab: ${titleValue}`);
        }
      }
    }
  }
  
  await browser.close();
})();
