import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE_ERROR:', err.toString()));
  page.on('requestfailed', request => console.log('REQ_FAIL:', request.url(), request.failure().errorText));

  try {
    await page.goto('http://localhost:5173/dashboard/chapter', { waitUntil: 'networkidle2', timeout: 5000 });
  } catch (e) {
    console.log('GOTO_ERR:', e.toString());
  }

  await new Promise(r => setTimeout(r, 1000));
  await browser.close();
})();
