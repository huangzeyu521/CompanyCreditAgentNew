/**
 * E2E: 项目级入口必须按 projectId 过滤数据 + 显示项目身份
 * 覆盖：conflict-check / kyc / committee-resolution / appeal-flow / tracking-stage / client-portal
 */
const puppeteer = require('puppeteer-core');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = 'http://127.0.0.1:8000';
let failed = 0;
function ok(c, l) { console.log((c ? '  ✅ ' : '  ❌ FAIL: ') + l); if (!c) failed++; }

const TARGETS = [
  {
    pid: 'P-2026-0415', subject: '中国华源集团有限公司',
    // 该项目在数据中应有的关联（来自 mock-data）
    expectInConflict: 'CC-2026-034',           // 利冲筛查
    expectNotInConflict: ['CC-2026-031','CC-2026-032','CC-2026-033'],
  },
  {
    pid: 'P-2026-0420', subject: '江苏华西集团有限公司',
    expectInConflict: 'CC-2026-032',
    expectNotInConflict: ['CC-2026-031','CC-2026-033','CC-2026-034'],
  }
];

(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args:['--no-sandbox'] });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message.slice(0,200)));

  for (const t of TARGETS) {
    console.log(`\n=== ${t.pid} · ${t.subject} ===`);

    // ───── conflict-check 项目级 ─────
    errs.length = 0;
    await page.goto(BASE + '/pages/conflict-check.html?projectId=' + t.pid, { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 400));
    let txt = await page.$eval('body', b => b.innerText);
    ok(errs.length === 0, '利冲筛查 项目模式 无 JS 错误');
    ok(txt.includes(t.subject), `利冲筛查 标题含「${t.subject.slice(0,6)}」`);
    ok(txt.includes('项目级'), '利冲筛查 显示「项目级」徽章');
    ok(txt.includes('为本项目触发新筛查'), '利冲筛查 按钮文案为项目级');
    ok(txt.includes(t.expectInConflict), `利冲筛查 含本项目记录 ${t.expectInConflict}`);
    for (const not of t.expectNotInConflict) {
      ok(!txt.includes(not), `利冲筛查 不含他项目记录 ${not}`);
    }
    ok(txt.includes('查看全公司利冲台账'), '利冲筛查 提供返回全局台账的链接');

    // ───── conflict-check 全局模式 ─────
    errs.length = 0;
    await page.goto(BASE + '/pages/conflict-check.html', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 400));
    txt = await page.$eval('body', b => b.innerText);
    ok(errs.length === 0, '利冲筛查 全局模式 无 JS 错误');
    ok(txt.includes('全公司台账'), '利冲筛查 全局模式显示「全公司台账」徽章');
    let hasAll = ['CC-2026-031','CC-2026-032','CC-2026-033','CC-2026-034'].every(id => txt.includes(id));
    ok(hasAll, '利冲筛查 全局模式列出所有 4 条记录');

    // ───── kyc 项目级 ─────
    errs.length = 0;
    await page.goto(BASE + '/pages/kyc.html?projectId=' + t.pid, { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 600)); // 等 setTimeout(0) renderResult 执行
    txt = await page.$eval('body', b => b.innerText);
    ok(errs.length === 0, 'KYC 项目模式 无 JS 错误');
    ok(txt.includes(t.subject), `KYC 标题含「${t.subject.slice(0,6)}」`);
    ok(txt.includes('公共信用快查'), 'KYC 项目模式标题为公共信用快查');

    // ───── committee-resolution 项目级 ─────
    errs.length = 0;
    await page.goto(BASE + '/pages/committee-resolution.html?projectId=' + t.pid, { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 400));
    txt = await page.$eval('body', b => b.innerText);
    ok(errs.length === 0, '信评委决议书 项目模式 无 JS 错误');
    ok(txt.includes(t.subject), `信评委决议书 标题含「${t.subject.slice(0,6)}」`);

    // ───── appeal-flow 项目级 ─────
    errs.length = 0;
    await page.goto(BASE + '/pages/appeal-flow.html?projectId=' + t.pid, { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 400));
    txt = await page.$eval('body', b => b.innerText);
    ok(errs.length === 0, '复评流程 项目模式 无 JS 错误');
    ok(txt.includes(t.subject), `复评流程 标题含「${t.subject.slice(0,6)}」`);

    // ───── tracking-stage 项目级 ─────
    errs.length = 0;
    await page.goto(BASE + '/pages/tracking-stage.html?projectId=' + t.pid, { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 400));
    txt = await page.$eval('body', b => b.innerText);
    ok(errs.length === 0, '跟踪评级 项目模式 无 JS 错误');
    ok(txt.includes(t.subject), `跟踪评级 标题含「${t.subject.slice(0,6)}」`);

    // ───── client-portal 项目级 ─────
    errs.length = 0;
    await page.goto(BASE + '/pages/client-portal.html?projectId=' + t.pid, { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 400));
    txt = await page.$eval('body', b => b.innerText);
    ok(errs.length === 0, '客户专用门户 项目模式 无 JS 错误');
    ok(txt.includes(t.subject), `客户专用门户 标题含「${t.subject.slice(0,6)}」`);
  }

  if (failed) { console.log(`\n❌ ${failed} 项失败`); process.exit(1); }
  console.log('\n🎉 项目级入口审计全部通过');
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
