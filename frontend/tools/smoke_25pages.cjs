/**
 * 全站冒烟：所有真实存在页面运行时错误巡检
 */
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = 'http://127.0.0.1:8000';

(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args:['--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message.slice(0,200)));
  page.on('console', m => { if (m.type() === 'error') errors.push('[console] ' + m.text().slice(0,200)); });
  page.on('response', r => { if (r.status() >= 400 && !r.url().includes('favicon.ico')) errors.push('HTTP ' + r.status() + ' ' + r.url().replace(BASE,'')); });

  const dir = path.join(__dirname, '..', 'pages');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== '404.html').sort();
  const urls = files.map(f => '/pages/' + f);
  // 给关键 project 页面附带 projectId
  const PROJECT = 'P-2026-0510';
  const withCtx = (u) => {
    if (u.includes('project-workbench') || u.includes('subject-rating')) return u + '?projectId=' + PROJECT + (u.includes('subject-rating') ? '&step=2' : '');
    return u;
  };

  let bad = 0;
  for (const u of urls) {
    const url = withCtx(u);
    errors.length = 0;
    await page.goto(BASE + url, { waitUntil:'networkidle2' }).catch(e => errors.push('NAV ' + e.message.slice(0,100)));
    await new Promise(r => setTimeout(r, 300));
    if (errors.length) { console.log('❌ ' + url); errors.forEach(e => console.log('   ' + e)); bad++; }
    else console.log('✅ ' + url);
  }
  console.log('\n' + (bad === 0 ? '🎉 ' + urls.length + ' 页全部 0 错误' : '❌ ' + bad + '/' + urls.length + ' 页有错误'));
  await browser.close();
  process.exit(bad === 0 ? 0 : 1);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
