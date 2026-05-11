/**
 * E2E: KYC 改造为事实驱动
 *  · 不再显示虚构的「公共信用等级 D / 公共信用评分 340/1000 / 熔断状态」
 *  · 显示 8 大类事实条目计数（来自信用中国官方报告）
 *  · 承接判定基于事实条目（labels / seriousCount / anomalyCount）
 *  · 严重失信主体显示红线证据（court / caseNo / behaviorType 等）
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

  // ━━━━━━━━━ Phase 1: 中国华源 P-2026-0415（失信惩戒对象，不建议承接）━━━━━━━━━
  console.log('\n=== Phase 1: 中国华源（失信惩戒对象）KYC ===');
  errs.length = 0;
  await page.goto(BASE + '/pages/kyc.html?projectId=P-2026-0415', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 600));
  let txt = await page.$eval('body', b => b.innerText);
  ok(errs.length === 0, '无 JS 错误');
  ok(txt.includes('中国华源集团有限公司'), '锁定中国华源主体');
  ok(txt.includes('不建议承接'), '判定为不建议承接');
  ok(txt.includes('失信惩戒对象') || txt.includes('失信被执行人'), '理由含信用中国官方标签');
  ok(txt.includes('GB/T 45255-2025') && txt.includes('第六条'), '引用正确法规');

  // 关键：移除了虚构评分 / 等级
  ok(!txt.includes('340/1000') && !txt.includes('/1000'), '不再显示 "/1000" 评分');
  ok(!txt.includes('基于 GB/T 23794'), '不再显示 "基于 GB/T 23794" 错误注脚');
  ok(!txt.includes('R_total'), '不再显示 R_total 虚构指标');
  // 「熔断状态 已触发」这种伪 KPI 不应再单独存在
  const hasFakeFuseKpi = await page.evaluate(() => {
    const all = [...document.querySelectorAll('.shadow-card')];
    return all.some(el => /熔断状态/.test(el.innerText) && /已触发/.test(el.innerText) && /最近校验/.test(el.innerText));
  });
  ok(!hasFakeFuseKpi, '不再显示「熔断状态/最近校验」伪 KPI');

  // 关键：8 大类事实计数存在
  ok(txt.includes('公共信用 8 大类事实条目'), '8 大类计数区存在');
  ok(['行政管理','诚实守信','严重失信','经营异常','信用承诺','信用评价','司法判决','其他'].every(c => txt.includes(c)), '8 大类全部命名');
  ok(txt.includes('不对主体打分'), '明示不打分');
  ok(txt.includes('信用中国官方报告'), '信用中国报告头存在');
  ok(txt.includes('20260505163213731547U5') || txt.includes('国家公共信用和地理空间信息中心'), '报告编号或出具单位渲染');

  // 严重失信详情（红线证据）
  ok(txt.includes('严重失信记录'), '严重失信详情区存在');
  ok(txt.includes('失信被执行人') && txt.includes('上海市浦东新区人民法院'), '红线证据：法院 + 失信被执行人');

  // ━━━━━━━━━ Phase 2: 南京钢铁 P-2026-0421（守信激励对象，建议承接）━━━━━━━━━
  console.log('\n=== Phase 2: 南京钢铁（守信激励对象）KYC ===');
  errs.length = 0;
  await page.goto(BASE + '/pages/kyc.html?projectId=P-2026-0421', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 600));
  txt = await page.$eval('body', b => b.innerText);
  ok(errs.length === 0, '无 JS 错误');
  ok(txt.includes('南京钢铁联合有限公司'), '锁定南京钢铁主体');
  ok(txt.includes('建议承接') && !txt.includes('不建议承接') && !txt.includes('谨慎承接'), '判定为建议承接');
  ok(txt.includes('守信激励对象') || txt.includes('纳税信用'), '理由含守信激励对象 / 纳税信用');
  ok(!txt.includes('340/1000'), '不再显示 "/1000" 评分');
  // 南京钢铁 seriousMisconduct=[] → 不应渲染"红线证据"区
  ok(!txt.includes('红线证据'), '南京钢铁无「红线证据」区（seriousMisconduct=[]）');

  // ━━━━━━━━━ Phase 3: 江苏华西 P-2026-0420（守信激励对象但有大量行政管理 80 条 → 谨慎）━━━━━━━━━
  console.log('\n=== Phase 3: 江苏华西（守信激励但 80 条行政许可）KYC ===');
  errs.length = 0;
  await page.goto(BASE + '/pages/kyc.html?projectId=P-2026-0420', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 600));
  txt = await page.$eval('body', b => b.innerText);
  ok(errs.length === 0, '无 JS 错误');
  ok(txt.includes('江苏华西集团有限公司'), '锁定江苏华西主体');
  // 江苏华西 labels=['守信激励对象','存续']，summary[行政管理]=80（>50 → 谨慎）
  ok(txt.includes('谨慎承接'), '判定为谨慎承接（行政管理 80 > 50 阈值）');
  ok(txt.includes('80') && txt.includes('行政管理'), '理由含行政管理 80 条');

  // ━━━━━━━━━ Phase 4: 无项目模式 · 全局搜索主体 ━━━━━━━━━
  console.log('\n=== Phase 4: 无 projectId 模式 ===');
  errs.length = 0;
  await page.goto(BASE + '/pages/kyc.html', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  txt = await page.$eval('body', b => b.innerText);
  ok(errs.length === 0, '无 JS 错误');
  ok(txt.includes('信用中国为事实披露平台') || txt.includes('不对主体打分'), '无项目模式也明示不打分');

  // ━━━━━━━━━ Phase 5: 不应有任何 publicGrade A/B/C/D 大徽章式展示 ━━━━━━━━━
  console.log('\n=== Phase 5: 公共信用等级 ABCD 徽章已移除 ===');
  await page.goto(BASE + '/pages/kyc.html?projectId=P-2026-0415', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 600));
  const hasPublicGradeBadge = await page.evaluate(() => {
    // 找"公共信用等级"标题 + 紧接着的大徽章
    const sections = [...document.querySelectorAll('.shadow-card')];
    return sections.some(el => /公共信用等级/.test(el.innerText) && /基于 GB\/T 23794/.test(el.innerText));
  });
  ok(!hasPublicGradeBadge, '「公共信用等级 + 基于 GB/T 23794」KPI 卡已彻底移除');

  if (failed) { console.log(`\n❌ ${failed} 项失败`); process.exit(1); }
  console.log('\n🎉 KYC 事实化改造全部通过');
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
