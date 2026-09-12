import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  await context.addInitScript(() => {
    window.localStorage.setItem('mindful_living_auth', 'true');
  });
  const page = await context.newPage();
  
  await page.goto('http://localhost:5173/dashboard/chapter', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  const editButtons = await page.$$('.chapter-icon-btn[aria-label^="Edit"]');
  if (editButtons.length > 0) {
    await editButtons[0].click();
    await page.waitForTimeout(1000);
    
    // Go to step 2
    const nextBtn = await page.$('button:has-text("Next Step")');
    if (nextBtn) {
      await nextBtn.click();
      await page.waitForTimeout(1000);
      
      const sectionNameInput = await page.$('input[placeholder="Enter section name"]');
      if (sectionNameInput) {
        // clear and type
        await sectionNameInput.fill('');
        await sectionNameInput.fill('hello');
        
        await page.screenshot({ path: 'debug_step1.png' });
        
        // click indonesian
        const idTab = await page.$('button:has-text("Indonesian 🇮🇩")');
        if (idTab) {
          await idTab.click();
          await page.waitForTimeout(100);
          await page.screenshot({ path: 'debug_step2_just_clicked.png' });
          
          await page.waitForTimeout(3000); // wait for api
          await page.screenshot({ path: 'debug_step3_after_api.png' });
        }
      }
    }
  }
  
  await browser.close();
})();
