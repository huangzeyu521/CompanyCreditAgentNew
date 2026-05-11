/**
 * E2E: 第 2 步全局横扫 · 第 3 波（committee 系列 + review-stage）
 *
 * 5 个页面统一加 ABCD 口径说明 amber notice:
 *  - committee-agenda.html
 *  - committee-vote.html
 *  - committee-workbench.html
 *  - committee-resolution.html
 *  - review-stage.html
 *
 * 关键断言：
 *  - 每页都含 "GB/T 45255-2025" 标准引用
 *  - 每页都明示 "信用中国本身不打分"
 *  - 每页都明示 "非信用中国官方"
 *  - committee-resolution 决议正文中"融合公共信用"句已加注脚
 *  - review-stage AI 上下文 dump 含口径说明
 */
const puppeteer = require('puppeteer-core');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = 'http://127.0.0.1:8000';
let failed = 0;
function ok(c, l) { console.log((c ? '  ✅ ' : '  ❌ FAIL: ') + l); if (!c) failed++; }

const TARGETS = [
  { url:'/pages/committee-agenda.html',       name:'committee-agenda',       expectExtra:['"D 级红线议项"即综合评价为 D'] },
  { url:'/pages/committee-vote.html',         name:'committee-vote',         expectExtra:[] },
  { url:'/pages/committee-workbench.html',    name:'committee-workbench',    expectExtra:['D 级红线 · 强制 ≤ BBB-'] },
  { url:'/pages/committee-resolution.html?projectId=P-2026-0420', name:'committee-resolution(0420 江苏华西)', expectExtra:['D 级红线锁定','公共信用综合评价','非信用中国官方等级'] },
  { url:'/pages/review-stage.html',           name:'review-stage',           expectExtra:['"D 级红线议项"即综合评价为 D'] }
];

(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args:['--no-sandbox'] });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message.slice(0,200)));

  for (const t of TARGETS) {
    console.log(`\n=== ${t.name} ===`);
    errs.length = 0;
    await page.goto(BASE + t.url, { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 500));
    const txt = await page.$eval('body', b => b.innerText);
    ok(errs.length === 0, `${t.name} 无 JS 错误`);
    ok(txt.includes('GB/T 45255-2025'), `${t.name} 引用 GB/T 45255-2025`);
    ok(txt.includes('信用中国本身不打分') || txt.includes('不对主体打分'), `${t.name} 明示信用中国不打分`);
    ok(txt.includes('非信用中国官方'), `${t.name} 明示非信用中国官方`);
    ok(txt.includes('远东资信') || txt.includes('远东'), `${t.name} 明确归属于远东资信`);
    for (const extra of t.expectExtra) {
      ok(txt.includes(extra), `${t.name} 含 "${extra.slice(0,30)}..."`);
    }
  }

  // ━━━━━ review-stage AI 上下文 dump 验证 ━━━━━
  console.log('\n=== review-stage AI 上下文 dump 含口径说明 ===');
  await page.goto(BASE + '/pages/review-stage.html', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 400));
  const ctx = await page.evaluate(() => {
    if (!window.AIAgent) return null;
    const orig = window.AIAgent.send;
    let lastCtx = null;
    window.AIAgent.send = function(msg, ctx) { lastCtx = ctx; };
    if (typeof askAIReview === 'function') try { askAIReview(); } catch (_) {}
    window.AIAgent.send = orig;
    return lastCtx;
  });
  ok(ctx !== null, 'AI 上下文已捕获');
  if (ctx) {
    ok(ctx.includes('GB/T 45255-2025'), 'AI 上下文含 GB/T 45255-2025');
    ok(ctx.includes('非信用中国官方'), 'AI 上下文明示非信用中国官方');
  }

  // ━━━━━ 交叉验证：5 页均不残留旧错误注脚「基于 GB/T 23794」（关于公共信用语境下）━━━━━
  console.log('\n=== 5 页均不出现旧错误注脚（公共信用 + GB/T 23794）===');
  for (const t of TARGETS) {
    await page.goto(BASE + t.url, { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 300));
    const html = await page.content();
    // 真实业务有"GB/T 23794《企业信用评价指标》" 引用 — 是合理的（其它语境）
    // 但 KYC 那种 "公共信用等级 / 基于 GB/T 23794" 组合不应出现在这 5 页
    const hasOldKpi = /公共信用等级[\s\S]{0,80}基于 GB\/T 23794/.test(html);
    ok(!hasOldKpi, `${t.name} 不残留「公共信用等级 + 基于 GB/T 23794」错误组合`);
  }

  if (failed) { console.log(`\n❌ ${failed} 项失败`); process.exit(1); }
  console.log('\n🎉 第 3 波横扫全部通过');
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
