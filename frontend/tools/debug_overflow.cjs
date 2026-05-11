/** 找出 1280px 下到底是哪个元素溢出了 */
const puppeteer = require('puppeteer-core');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = 'http://127.0.0.1:8000';
(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args:['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(BASE + '/pages/project-workbench.html?projectId=P-2026-0421', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 800));
  const info = await page.evaluate(() => {
    return {
      bodyClientWidth: document.body.clientWidth,
      bodyScrollWidth: document.body.scrollWidth,
      htmlClientWidth: document.documentElement.clientWidth,
      htmlScrollWidth: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
      mainWidth: document.querySelector('#main, main') ? document.querySelector('#main, main').getBoundingClientRect().width : null,
      mainScrollWidth: document.querySelector('#main, main') ? document.querySelector('#main, main').scrollWidth : null,
      sidebarWidth: document.querySelector('aside') ? document.querySelector('aside').offsetWidth : null
    };
  });
  console.log('Layout info @ 1280:', JSON.stringify(info, null, 2));
  await browser.close();
})();
