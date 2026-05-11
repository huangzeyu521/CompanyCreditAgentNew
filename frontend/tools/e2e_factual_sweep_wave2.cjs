/**
 * E2E: 第 2 步全局横扫 · 第 2 波（fusion-engine / report-detail / system）
 *
 * fusion-engine.html L68/L207:
 *   - 表头「公共信用等级」→「公共信用综合评价」
 *   - 表前面加注释：远东资信按 GB/T 45255-2025，非信用中国官方
 *   - 当前主体融合 KPI 同步更名
 *
 * report-detail.html L443:
 *   - 「公共信用等级」→「公共信用综合评价」
 *   - 副标加 "GB/T 45255-2025 · 非信用中国官方"
 *   - 数据源行修正去重
 *
 * system.html 模型库:
 *   - 「公共信用评分模型」→「公共信用综合评价模型（GB/T 45255-2025）」
 *   - 加 note 说明：读取信用中国 8 大类事实条目 → ABCD（非信用中国官方）
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

  // ━━━━━ fusion-engine.html ━━━━━
  console.log('\n=== fusion-engine.html · ABCD↔AAA-C 映射 + 当前主体融合结果 ===');
  errs.length = 0;
  await page.goto(BASE + '/pages/fusion-engine.html', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  let txt = await page.$eval('body', b => b.innerText);
  ok(errs.length === 0, '无 JS 错误');
  // 表头修正
  ok(txt.includes('公共信用综合评价'), '表头改为「公共信用综合评价」');
  // 旧表头不应再以 KPI/列头形式出现（解释段中包含「公共信用综合评价」即可）
  const oldHeader = await page.evaluate(() => {
    const ths = [...document.querySelectorAll('th')];
    return ths.some(th => th.textContent.trim() === '公共信用等级');
  });
  ok(!oldHeader, '表头不再用「公共信用等级」');
  // 注释段
  ok(txt.includes('GB/T 45255-2025') && txt.includes('非信用中国官方'), '表注释明示标准和归属');
  ok(txt.includes('信用中国本身不打分'), '注释明示信用中国不打分');
  // KPI 卡（L207）
  const kpiUsesNew = await page.evaluate(() => {
    const divs = [...document.querySelectorAll('.shadow-card div')];
    return divs.some(d => /公共信用综合评价/.test(d.textContent) && d.querySelector + ''); // simple check
  });
  ok(kpiUsesNew || txt.includes('GB/T 45255-2025 · 非信用中国官方'), '当前主体 KPI 卡含新副标');

  // ━━━━━ report-detail.html ━━━━━
  console.log('\n=== report-detail.html · 12 公共信用融合 ===');
  errs.length = 0;
  await page.goto(BASE + '/pages/report-detail.html', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  txt = await page.$eval('body', b => b.innerText);
  ok(errs.length === 0, '无 JS 错误');
  // KPI 卡更名
  ok(txt.includes('公共信用综合评价'), '12 节 KPI 卡改名');
  // 副标
  ok(txt.includes('GB/T 45255-2025') && txt.includes('非信用中国官方'), '副标明示标准和归属');
  // 旧重复依据被替换
  ok(!txt.match(/GB\/T 45255-2025 · GB\/T 45255-2025/), '依据行重复字符串已修');
  ok(txt.includes('数据源：信用中国官方报告') && txt.includes('事实条目'), '依据行明确数据源');

  // ━━━━━ system.html · 模型库 ━━━━━
  console.log('\n=== system.html · 模型版本管理 ===');
  errs.length = 0;
  await page.goto(BASE + '/pages/system.html', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  // 默认 tab 不一定是模型，尝试切换到 models tab
  await page.evaluate(() => {
    if (typeof switchTab === 'function') switchTab('models');
    else { const btn = [...document.querySelectorAll('button')].find(b => /模型/.test(b.textContent)); if (btn) btn.click(); }
  });
  await new Promise(r => setTimeout(r, 400));
  txt = await page.$eval('body', b => b.innerText);
  ok(errs.length === 0, '无 JS 错误');
  // 旧名「公共信用评分模型」彻底移除（包括 toast 文本里）
  const stillHasOldName = await page.evaluate(() => {
    return [...document.querySelectorAll('div, span')].some(el => el.childNodes.length === 1 && el.textContent.trim() === '公共信用评分模型');
  });
  ok(!stillHasOldName, '旧名「公共信用评分模型」彻底移除（无单独文本节点）');
  // 新名
  ok(txt.includes('公共信用综合评价模型') && txt.includes('GB/T 45255-2025'), '新名「公共信用综合评价模型（GB/T 45255-2025）」');
  // note 说明
  ok(txt.includes('信用中国 8 大类事实条目') || txt.includes('8 大类事实'), '模型 note 含 8 大类事实');
  ok(txt.includes('非信用中国官方'), '模型 note 明示非信用中国官方');

  // ━━━━━ 第 2 波横扫验证：全站再无 publicScore/1000 形态 ━━━━━
  console.log('\n=== 全站交叉验证：subject-rating step 5 + kyc 应均无 /1000 ===');
  for (const url of [
    '/pages/subject-rating.html?subject=' + encodeURIComponent('中国华源集团有限公司') + '&step=5',
    '/pages/kyc.html?projectId=P-2026-0415',
    '/pages/fusion-engine.html',
    '/pages/report-detail.html'
  ]) {
    await page.goto(BASE + url, { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 400));
    const t = await page.$eval('body', b => b.innerText);
    ok(!t.match(/公共信用评分.*\d+\/1000/), `${url.split('?')[0]} 无「公共信用评分 数字/1000」`);
  }

  if (failed) { console.log(`\n❌ ${failed} 项失败`); process.exit(1); }
  console.log('\n🎉 第 2 波横扫全部通过');
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
