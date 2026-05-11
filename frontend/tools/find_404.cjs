const puppeteer = require('puppeteer-core');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = 'http://127.0.0.1:8000';

(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args:['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('response', resp => {
    if (resp.status() >= 400) console.log('  HTTP ' + resp.status() + '  ' + resp.url());
  });
  page.on('requestfailed', req => {
    console.log('  FAILED  ' + req.failure().errorText + '  ' + req.url());
  });
  page.on('console', m => {
    if (m.type() === 'error') console.log('  [console.' + m.type() + '] ' + m.text());
  });
  page.on('pageerror', e => console.log('  [pageerror] ' + e.message));
  await page.goto(BASE + '/pages/account-manager.html', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await browser.close();
})();
