/**
 * E2E: 利冲筛查 detail view（项目模式）+ list view（全局模式）
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

  // ━━━━━━━━━━ Phase 1: 未命中项目（中国华源 CC-2026-034 / 低风险）━━━━━━━━━━
  console.log('\n=== Phase 1: 项目 P-2026-0415 中国华源（未命中）detail view ===');
  errs.length = 0;
  await page.goto(BASE + '/pages/conflict-check.html?projectId=P-2026-0415', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  let txt = await page.$eval('body', b => b.innerText);
  ok(errs.length === 0, '无 JS 错误');
  ok(txt.includes('中国华源集团有限公司'), '标题含主体名');
  ok(txt.includes('detail view'), '徽章显示 detail view');
  ok(txt.includes('USCC'), '本主体身份卡显示 USCC');
  ok(txt.includes('91310000132215150M'), 'USCC 值正确');
  ok(txt.includes('CC-2026-034'), '本次筛查编号 CC-2026-034');
  ok(txt.includes('未命中 · 通过'), '总体结论：未命中');
  ok(txt.includes('低 风险'), '风险级别：低');
  ok(txt.includes('12 类规则逐条结果'), '12 类规则区域存在');
  ok(txt.includes('项目组成员持股') && txt.includes('过往任职') && txt.includes('亲属关系'), '至少 3 条规则名渲染');
  ok(txt.includes('咨询顾问'), '第 12 条规则也渲染');
  ok(txt.includes('陈秋萍'), '检查人显示');
  ok(txt.includes('合规部'), '检查人岗位显示');
  ok(txt.includes('为本项目触发新筛查'), '行动区按钮文案为项目级');
  ok(txt.includes('下载筛查报告 PDF'), '行动区有下载按钮');
  ok(txt.includes('历次筛查时间线'), '时间线区域存在');
  ok(txt.includes('← 返回项目工作台'), '提供返回工作台链接');
  ok(txt.includes('查看全公司利冲台账'), '提供反向链接');
  // 通过项目模式不应出现的：KPI 卡片标题、规则配置
  ok(!txt.includes('本月筛查总数'), '项目模式不显示「本月筛查总数」KPI');
  ok(!txt.includes('筛查规则配置（公司层面）'), '项目模式不显示「筛查规则配置」入口卡');
  // 不应出现他项目的筛查编号
  ok(!txt.includes('CC-2026-031') && !txt.includes('CC-2026-032') && !txt.includes('CC-2026-033'), '不含他项目筛查编号');

  // ━━━━━━━━━━ Phase 2: 命中项目（江苏华西 CC-2026-032 / 高风险）━━━━━━━━━━
  console.log('\n=== Phase 2: 项目 P-2026-0420 江苏华西（命中）detail view ===');
  errs.length = 0;
  await page.goto(BASE + '/pages/conflict-check.html?projectId=P-2026-0420', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  txt = await page.$eval('body', b => b.innerText);
  ok(errs.length === 0, '无 JS 错误');
  ok(txt.includes('江苏华西集团有限公司'), '标题含主体名');
  ok(txt.includes('CC-2026-032'), '本次筛查编号 CC-2026-032');
  ok(txt.includes('命中预警 · 须合规复核'), '总体结论：命中');
  ok(txt.includes('高 风险'), '风险级别：高');
  ok(txt.includes('李雨欣'), '命中细节含人名');
  ok(txt.includes('0.3% 股份'), '命中细节含具体数据');
  ok(txt.includes('命中处置与签字'), '命中处置区存在');
  ok(txt.includes('更换成员'), '处置方案显示');
  ok(txt.includes('合规总监') && txt.includes('法务总监') && txt.includes('客户合规官'), '三签字角色显示');
  ok(txt.includes('王雪') && txt.includes('刘宇翔') && txt.includes('孙琳琳'), '三签字人名显示');
  ok(txt.includes('已闭环'), '处置已闭环显示');
  ok(txt.includes('合规复核 / 豁免'), '行动区显示复核按钮');
  // 12 条规则区域 — 其中 #01 项目组成员持股 应该命中
  ok(txt.includes('项目组成员持股'), '12 类规则中含「项目组成员持股」');
  ok(txt.includes('严重度'), '命中条目显示严重度标签');

  // ━━━━━━━━━━ Phase 3: 全局模式 list view ━━━━━━━━━━
  console.log('\n=== Phase 3: 全局模式 list view ===');
  errs.length = 0;
  await page.goto(BASE + '/pages/conflict-check.html', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  txt = await page.$eval('body', b => b.innerText);
  ok(errs.length === 0, '无 JS 错误');
  ok(txt.includes('全公司台账 · list view'), '徽章显示 list view');
  ok(txt.includes('本月筛查总数'), '全局模式显示「本月筛查总数」KPI');
  ok(txt.includes('筛查规则配置（公司层面）'), '全局模式显示规则配置区');
  ok(txt.includes('前往合规规则库'), '规则配置区提供前往规则库链接');
  ok(['CC-2026-031','CC-2026-032','CC-2026-033','CC-2026-034'].every(id => txt.includes(id)), '4 条筛查全部列出');
  // 「详情 →」链接应指向各自项目的 detail view
  const links = await page.$$eval('a[href*="conflict-check.html?projectId="]', as => as.map(a => a.getAttribute('href')));
  const linkSet = new Set(links);
  ok(linkSet.has('conflict-check.html?projectId=P-2026-0421'), '详情链接：P-2026-0421');
  ok(linkSet.has('conflict-check.html?projectId=P-2026-0420'), '详情链接：P-2026-0420');
  ok(linkSet.has('conflict-check.html?projectId=P-2026-0418'), '详情链接：P-2026-0418');
  ok(linkSet.has('conflict-check.html?projectId=P-2026-0415'), '详情链接：P-2026-0415');

  // ━━━━━━━━━━ Phase 4: list ↔ detail 闭环 ━━━━━━━━━━
  console.log('\n=== Phase 4: list → detail 跳转闭环 ===');
  errs.length = 0;
  // 从 list 点 0420 的详情
  await page.click('a[href="conflict-check.html?projectId=P-2026-0420"]');
  await new Promise(r => setTimeout(r, 500));
  const url = page.url();
  ok(url.includes('projectId=P-2026-0420'), '点击后 URL 包含 projectId=P-2026-0420');
  txt = await page.$eval('body', b => b.innerText);
  ok(txt.includes('江苏华西集团有限公司') && txt.includes('CC-2026-032'), '跳转后显示对应项目的 detail view');

  // ━━━━━━━━━━ Phase 5: 12 类规则数量正确 ━━━━━━━━━━
  console.log('\n=== Phase 5: 12 类规则数量 ===');
  await page.goto(BASE + '/pages/conflict-check.html?projectId=P-2026-0415', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  const ruleCount = await page.evaluate(() => {
    const cur = MockData.conflictChecks.find(c => c.project === 'P-2026-0415');
    return cur && cur.ruleResults && cur.ruleResults.length;
  });
  ok(ruleCount === 12, `每条筛查记录包含 12 条规则（实际 ${ruleCount}）`);
  // 命中条目命中数
  const hitCount0420 = await page.evaluate(() => {
    const cur = MockData.conflictChecks.find(c => c.project === 'P-2026-0420');
    return cur.ruleResults.filter(r => r.hit).length;
  });
  ok(hitCount0420 === 1, `0420 江苏华西命中 1 条（实际 ${hitCount0420}）`);
  const hitCount0415 = await page.evaluate(() => {
    const cur = MockData.conflictChecks.find(c => c.project === 'P-2026-0415');
    return cur.ruleResults.filter(r => r.hit).length;
  });
  ok(hitCount0415 === 0, `0415 中国华源命中 0 条（实际 ${hitCount0415}）`);

  if (failed) { console.log(`\n❌ ${failed} 项失败`); process.exit(1); }
  console.log('\n🎉 detail-view + list-view 全部通过');
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
