const puppeteer = require('puppeteer-core');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args:['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:8000/pages/project-intake.html', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  const data = await page.evaluate(() => ({
    stages: MockData.STAGE_DEFS && MockData.STAGE_DEFS.map(s => ({ key: s.key, label: s.label || s.name })),
    persistKeys: Object.keys(window).filter(k => /[Pp]ersist/.test(k) || /[Ss]torage/.test(k)),
    lsKeys: Object.keys(localStorage)
  }));
  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();
