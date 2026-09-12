import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  console.log('Visiting Chapter Management...');
  await page.goto('http://localhost:5173/dashboard/chapter', { waitUntil: 'networkidle0' });
  
  console.log('Visiting Media Library...');
  await page.goto('http://localhost:5173/dashboard/media', { waitUntil: 'networkidle0' });

  await browser.close();
})();
