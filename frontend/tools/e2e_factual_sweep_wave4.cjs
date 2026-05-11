/**
 * E2E: 第 2 步全局横扫 · 第 4 波（收尾）
 *
 * 数据层：
 *  - mock-data.js 19 个 subjects 全部移除 publicScore 字段（0 命中）
 *  - project-intake.html 新建项目模板不再写 publicScore
 *
 * 三页 ABCD 口径补银 amber notice:
 *  - credit-repair-sync.html
 *  - investor-service.html
 *  - three-review.html
 *
 * 文案修正:
 *  - tracking.html L184「公共信用等级变动」→ 「公共信用综合评价等级变动 / 信用中国官方标签变动」
 *  - prompts.js L158 AI prompt 加 GB/T 45255-2025 注脚
 *  - login.html L59 营销文案补 GB/T 45255-2025 引用
 */
const puppeteer = require('puppeteer-core');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = 'http://127.0.0.1:8000';
let failed = 0;
function ok(c, l) { console.log((c ? '  ✅ ' : '  ❌ FAIL: ') + l); if (!c) failed++; }

(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args:['--no-sandbox'] });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message.slice(0,200)));

  // ━━━━━ Phase 1: 数据层 publicScore 字段彻底删除 ━━━━━
  console.log('\n=== Phase 1: publicScore 字段已彻底删除 ===');
  await page.goto(BASE + '/pages/project-intake.html', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 400));
  const dataCheck = await page.evaluate(() => {
    const subs = MockData.subjects || [];
    const withScore = subs.filter(s => 'publicScore' in s).length;
    return { total: subs.length, withScore };
  });
  ok(dataCheck.withScore === 0, `19 主体均无 publicScore 字段（${dataCheck.withScore}/${dataCheck.total}）`);

  // ━━━━━ Phase 2: 三页 ABCD 口径 banner ━━━━━
  console.log('\n=== Phase 2: 3 页 ABCD 口径 banner ===');
  for (const [url, name] of [
    ['/pages/credit-repair-sync.html',  'credit-repair-sync'],
    ['/pages/investor-service.html',    'investor-service'],
    ['/pages/three-review.html',        'three-review']
  ]) {
    errs.length = 0;
    await page.goto(BASE + url, { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 400));
    const txt = await page.$eval('body', b => b.innerText);
    ok(errs.length === 0, `${name} 无 JS 错误`);
    ok(txt.includes('GB/T 45255-2025'), `${name} 引用 GB/T 45255-2025`);
    ok(txt.includes('信用中国本身不打分') || txt.includes('不对主体打分'), `${name} 明示信用中国不打分`);
    ok(txt.includes('非信用中国官方'), `${name} 明示非信用中国官方`);
    ok(txt.includes('远东资信'), `${name} 明确归属于远东资信`);
  }

  // ━━━━━ Phase 3: tracking.html 订阅术语修正 ━━━━━
  console.log('\n=== Phase 3: tracking.html 订阅选项文案 ===');
  errs.length = 0;
  await page.goto(BASE + '/pages/tracking.html', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 400));
  // 订阅选项在 addSubscription() 模态框内，须先打开
  await page.evaluate(() => { if (typeof addSubscription === 'function') addSubscription(); });
  await new Promise(r => setTimeout(r, 300));
  const modalTxt = await page.evaluate(() => document.body.innerText);
  ok(errs.length === 0, 'tracking 无 JS 错误');
  ok(modalTxt.includes('公共信用综合评价等级变动') && modalTxt.includes('信用中国官方标签变动'), '订阅选项术语已修正');
  // 旧文本不应再独立出现
  const hasOldTermAlone = await page.evaluate(() => {
    const labels = [...document.querySelectorAll('label')];
    return labels.some(l => l.textContent.trim() === '公共信用等级变动');
  });
  ok(!hasOldTermAlone, '旧文本「公共信用等级变动」（单独）已移除');

  // ━━━━━ Phase 4: prompts.js AI 上下文修正 ━━━━━
  console.log('\n=== Phase 4: prompts.js AI prompt 修正 ===');
  const promptsContent = await page.evaluate(async () => {
    const resp = await fetch('/assets/js/prompts.js?v=20260511b');
    return resp.text();
  });
  ok(promptsContent.includes('公共信用综合评价等级（GB/T 45255-2025'), 'prompts.js REPAIR_PATH 修正');
  ok(!promptsContent.match(/预期可恢复的子级数 \/ 公共信用等级\n/), '旧 prompt 文案已替换');

  // ━━━━━ Phase 5: login.html 营销文案修正 ━━━━━
  console.log('\n=== Phase 5: login.html 营销文案 ===');
  errs.length = 0;
  await page.goto(BASE + '/pages/login.html', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 400));
  const loginTxt = await page.$eval('body', b => b.innerText);
  ok(errs.length === 0, 'login 无 JS 错误');
  ok(loginTxt.includes('GB/T 23794-2023') && loginTxt.includes('GB/T 45255-2025'), '同时引用两个国标');
  ok(loginTxt.includes('事实条目可追溯'), '事件级归因事实条目可追溯');
  ok(!loginTxt.includes('基于 GB/T 23794-2023 国标，明确每一笔扣分依据'), '旧短文案已替换');

  // ━━━━━ Phase 6: 全站交叉验证 ━━━━━
  console.log('\n=== Phase 6: 全站交叉验证（grep 关键词） ===');
  // 通过 sniff /pages/kyc.html /pages/subject-rating.html 应均无 "/1000"
  const checkPages = [
    '/pages/kyc.html?projectId=P-2026-0415',
    '/pages/subject-rating.html?subject=' + encodeURIComponent('中国华源集团有限公司') + '&step=5',
    '/pages/conflict-check.html?projectId=P-2026-0415',
    '/pages/fusion-engine.html',
    '/pages/report-detail.html',
    '/pages/committee-resolution.html?projectId=P-2026-0420',
    '/pages/credit-repair-sync.html',
    '/pages/investor-service.html',
    '/pages/three-review.html'
  ];
  for (const u of checkPages) {
    await page.goto(BASE + u, { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 250));
    const t = await page.$eval('body', b => b.innerText);
    ok(!t.match(/公共信用评分.*\d+\/1000/), `${u.split('?')[0]} 无 "公共信用评分 X/1000"`);
  }

  if (failed) { console.log(`\n❌ ${failed} 项失败`); process.exit(1); }
  console.log('\n🎉 第 4 波收尾全部通过');
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
