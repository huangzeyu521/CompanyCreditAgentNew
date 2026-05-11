/**
 * E2E: 4 个项目级 detail view（committee-resolution / appeal-flow / tracking-stage / client-portal）
 * 覆盖：
 *  - 项目模式 detail view 渲染（含 / 不含数据两种）
 *  - 全局模式 list view + 「详情 →」闭环
 *  - 数据按 project / subject 过滤
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

  // ━━━━━━━━━━ committee-resolution ━━━━━━━━━━

  // Phase 1a: 南京钢铁 P-2026-0421（一致通过）
  console.log('\n=== committee-resolution · P-2026-0421 南京钢铁（一致通过）===');
  errs.length = 0;
  await page.goto(BASE + '/pages/committee-resolution.html?projectId=P-2026-0421', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  let txt = await page.$eval('body', b => b.innerText);
  ok(errs.length === 0, '无 JS 错误');
  ok(txt.includes('南京钢铁联合有限公司'), '标题含主体');
  ok(txt.includes('detail view'), 'detail view 徽章');
  ok(txt.includes('CR-2026-018'), '本次决议编号 CR-2026-018');
  ok(txt.includes('投票委员'), '投票委员区存在');
  ok(['周建华','刘宇翔','孙琳琳','王雪','张志强','李明'].every(n => txt.includes(n)), '6 位委员全显示');
  ok(txt.includes('关键风险点'), '关键风险区存在');
  ok(txt.includes('短期债务集中度'), '风险点 1 内容渲染');
  ok(txt.includes('U 盾 ✓'), '签字 U 盾标识');
  ok(txt.includes('附件'), '附件区存在');
  ok(txt.includes('BACP 评分明细'), '附件 1 渲染');

  // Phase 1b: 江苏华西 P-2026-0420（D 红线锁定）
  console.log('\n=== committee-resolution · P-2026-0420 江苏华西（D 红线锁定）===');
  errs.length = 0;
  await page.goto(BASE + '/pages/committee-resolution.html?projectId=P-2026-0420', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  txt = await page.$eval('body', b => b.innerText);
  ok(errs.length === 0, '无 JS 错误');
  ok(txt.includes('江苏华西集团有限公司'), '标题含主体');
  ok(txt.includes('CR-2026-019'), '本次决议编号 CR-2026-019');
  ok(txt.includes('红线锁定'), '红线锁定卡显示');
  ok(txt.includes('BBB-'), '锁定上限 BBB-');
  ok(txt.includes('回避'), '李明回避显示');
  ok(txt.includes('利冲关系'), '回避理由显示');

  // Phase 1c: 福禧投资 P-2026-0418（议委修订）
  console.log('\n=== committee-resolution · P-2026-0418 福禧投资（议委修订）===');
  await page.goto(BASE + '/pages/committee-resolution.html?projectId=P-2026-0418', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  txt = await page.$eval('body', b => b.innerText);
  ok(txt.includes('议委修订'), '议委修订标识');
  ok(txt.includes('委员异议'), '异议区存在');
  ok(txt.includes('担保链穿透'), '异议理由内容');
  ok(txt.includes('议委采纳'), '异议已采纳标识');

  // Phase 1d: 中国华源 P-2026-0415（无决议 - 空状态）
  console.log('\n=== committee-resolution · P-2026-0415 中国华源（无决议）===');
  await page.goto(BASE + '/pages/committee-resolution.html?projectId=P-2026-0415', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  txt = await page.$eval('body', b => b.innerText);
  ok(txt.includes('中国华源集团有限公司'), '标题含主体');
  ok(txt.includes('本项目尚无信评委决议书'), '空状态提示');
  ok(txt.includes('前往信评委投票'), '空状态行动按钮');

  // Phase 1e: 全局模式 list view
  console.log('\n=== committee-resolution · 全局 list view ===');
  await page.goto(BASE + '/pages/committee-resolution.html', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  txt = await page.$eval('body', b => b.innerText);
  ok(txt.includes('全公司决议库 · list view'), 'list view 徽章');
  ok(['CR-2026-017','CR-2026-018','CR-2026-019'].every(id => txt.includes(id)), '3 条决议全显示');
  // 「详情 →」link to detail view for matched projects
  const crLinks = await page.$$eval('a[href*="committee-resolution.html?projectId="]', as => as.map(a => a.getAttribute('href')));
  ok(crLinks.some(h => h.includes('projectId=P-2026-0421')), '详情链接 → 0421');
  ok(crLinks.some(h => h.includes('projectId=P-2026-0420')), '详情链接 → 0420');
  ok(crLinks.some(h => h.includes('projectId=P-2026-0418')), '详情链接 → 0418');

  // ━━━━━━━━━━ appeal-flow ━━━━━━━━━━

  // Phase 2a: 江苏华西 P-2026-0420（已排信评委，第 4 步）
  console.log('\n=== appeal-flow · P-2026-0420 江苏华西（第 4 步）===');
  errs.length = 0;
  await page.goto(BASE + '/pages/appeal-flow.html?projectId=P-2026-0420', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  txt = await page.$eval('body', b => b.innerText);
  ok(errs.length === 0, '无 JS 错误');
  ok(txt.includes('江苏华西集团有限公司'), '标题含主体');
  ok(txt.includes('AP-2026-004'), '复评编号');
  ok(txt.includes('复评进行中 · 第 4/7 步'), '当前步数显示');
  ok(txt.includes('7 步流程进度'), '7 步流程图');
  ok(txt.includes('异议理由'), '异议理由区');
  ok(txt.includes('战略转型说明'), '新增证据渲染');
  ok(txt.includes('信评委安排'), '信评委安排区');
  ok(txt.includes('周建华'), '主席显示');
  ok(txt.includes('💰 免费'), '免费标识');
  ok(txt.includes('集团办 吴主任'), '委托方联系人');

  // Phase 2b: 中国华源 P-2026-0415（无复评 - 空状态）
  console.log('\n=== appeal-flow · P-2026-0415 中国华源（无复评）===');
  await page.goto(BASE + '/pages/appeal-flow.html?projectId=P-2026-0415', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  txt = await page.$eval('body', b => b.innerText);
  ok(txt.includes('本项目尚无复评申请'), '空状态提示');

  // Phase 2c: 全局 list view
  console.log('\n=== appeal-flow · 全局 list view ===');
  await page.goto(BASE + '/pages/appeal-flow.html', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  txt = await page.$eval('body', b => b.innerText);
  ok(txt.includes('全公司复评台账 · list view'), 'list view 徽章');
  ok(['AP-2026-001','AP-2026-002','AP-2026-003','AP-2026-004'].every(id => txt.includes(id)), '4 条复评全显示');

  // ━━━━━━━━━━ tracking-stage ━━━━━━━━━━

  // Phase 3a: 江苏华西 P-2026-0420（紧急 · 5 个事项触发）
  console.log('\n=== tracking-stage · P-2026-0420 江苏华西（紧急）===');
  errs.length = 0;
  await page.goto(BASE + '/pages/tracking-stage.html?projectId=P-2026-0420', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  txt = await page.$eval('body', b => b.innerText);
  ok(errs.length === 0, '无 JS 错误');
  ok(txt.includes('江苏华西集团有限公司'), '标题含主体');
  ok(txt.includes('紧急'), '紧急标识');
  ok(txt.includes('21 类重大事项逐条结果'), '21 类事项区');
  ok(txt.includes('重大债务违约') && txt.includes('重大诉讼/仲裁'), '命中事项名');
  ok(txt.includes('华东建材'), '命中事项 1 内容');
  ok(txt.includes('严重失信主体名单'), '命中事项 2 内容');
  ok(txt.includes('立即出具跟踪报告'), '紧急状态行动按钮');
  ok(txt.includes('C30 建材制造'), '行业风险显示');

  // Phase 3b: 中国华源 P-2026-0415（正常）
  console.log('\n=== tracking-stage · P-2026-0415 中国华源（正常）===');
  await page.goto(BASE + '/pages/tracking-stage.html?projectId=P-2026-0415', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  txt = await page.$eval('body', b => b.innerText);
  ok(txt.includes('中国华源集团有限公司'), '标题含主体');
  ok(txt.includes('正常'), '正常标识');
  ok(txt.includes('21 类重大事项逐条结果'), '21 类事项区');
  // 21 类中应有 0 命中
  ok(txt.includes('命中 0') || txt.includes('0 / 21'), '0 命中显示');

  // Phase 3c: 全局 list view
  console.log('\n=== tracking-stage · 全局 list view ===');
  await page.goto(BASE + '/pages/tracking-stage.html', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  txt = await page.$eval('body', b => b.innerText);
  ok(txt.includes('全公司跟踪台账 · list view'), 'list view 徽章');
  ok(txt.includes('订阅主体列表'), '订阅主体列表');
  const trkLinks = await page.$$eval('a[href*="tracking-stage.html?projectId="]', as => as.map(a => a.getAttribute('href')));
  ok(trkLinks.some(h => h.includes('projectId=P-2026-0420')), '详情链接 → 0420');

  // ━━━━━━━━━━ client-portal ━━━━━━━━━━

  // Phase 4a: 江苏华西 P-2026-0420（复评申请已响应）
  console.log('\n=== client-portal · P-2026-0420 江苏华西（复评已响应）===');
  errs.length = 0;
  await page.goto(BASE + '/pages/client-portal.html?projectId=P-2026-0420', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  txt = await page.$eval('body', b => b.innerText);
  ok(errs.length === 0, '无 JS 错误');
  ok(txt.includes('江苏华西集团有限公司'), '标题含主体');
  ok(txt.includes('CF-2026-018'), '反馈编号');
  ok(txt.includes('5 工作日 SLA'), 'SLA 卡');
  ok(txt.includes('集团办 吴主任'), '联系人');
  ok(txt.includes('136****8810'), '联系电话脱敏');
  ok(txt.includes('已响应'), '已响应标识');
  ok(txt.includes('王明远'), '回复人');
  ok(txt.includes('附件'), '附件区');
  ok(txt.includes('战略转型说明.pdf'), '附件 1');
  ok(txt.includes('关联复评'), '关联复评链接');
  // 不应含其它项目的反馈
  ok(!txt.includes('CF-2026-021') && !txt.includes('CF-2026-020') && !txt.includes('CF-2026-019'), '不含他项目反馈');

  // Phase 4b: 福禧投资 P-2026-0418（待响应 - 补充材料）
  console.log('\n=== client-portal · P-2026-0418 福禧投资（待响应）===');
  await page.goto(BASE + '/pages/client-portal.html?projectId=P-2026-0418', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  txt = await page.$eval('body', b => b.innerText);
  ok(txt.includes('福禧投资控股有限公司'), '标题含主体');
  ok(txt.includes('CF-2026-020'), '反馈编号');
  ok(txt.includes('补充材料'), '反馈类型');
  ok(txt.includes('待响应'), '待响应标识');
  ok(txt.includes('2026-Q1 未审报表.pdf'), '附件文件名');

  // Phase 4c: 中国华源 P-2026-0415（无反馈）
  console.log('\n=== client-portal · P-2026-0415 中国华源（无反馈）===');
  await page.goto(BASE + '/pages/client-portal.html?projectId=P-2026-0415', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  txt = await page.$eval('body', b => b.innerText);
  ok(txt.includes('本项目尚无客户反馈'), '空状态提示');

  // Phase 4d: 全局 list view
  console.log('\n=== client-portal · 全局 list view ===');
  await page.goto(BASE + '/pages/client-portal.html', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  txt = await page.$eval('body', b => b.innerText);
  ok(txt.includes('全公司反馈台账 · list view'), 'list view 徽章');
  ok(['CF-2026-018','CF-2026-019','CF-2026-020','CF-2026-021'].every(id => txt.includes(id)), '4 条反馈全显示');
  const cpLinks = await page.$$eval('a[href*="client-portal.html?projectId="]', as => as.map(a => a.getAttribute('href')));
  ok(cpLinks.some(h => h.includes('projectId=P-2026-0420')), '详情链接 → 0420');

  // ━━━━━━━━━━ Phase 5: 数据扩展不破坏其它页面 ━━━━━━━━━━
  console.log('\n=== Phase 5: 数据扩展不影响其它页面 ===');
  // 验证 mock-data 仍然可在原页面正常加载
  await page.goto(BASE + '/pages/project-intake.html', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  const stats = await page.evaluate(() => ({
    subjects: MockData.subjects.length,
    projects: MockData.projects.length,
    cfWithProject: MockData.clientFeedback.filter(c => c.project).length,
    appealsWithEvidence: MockData.appeals.filter(a => a.evidence && a.evidence.length > 0).length,
    subsWithEvents: MockData.trackingSubscriptions.filter(s => s.triggeredEvents && s.triggeredEvents.length > 0).length,
    crWithMembers: MockData.committeeResolutions.filter(r => r.members && r.members.length === 6).length
  }));
  ok(stats.subjects === 19, '19 主体仍然完整');
  ok(stats.projects >= 11, '11+ 项目仍然完整');
  ok(stats.cfWithProject === 3, '3 条反馈含 project 字段');
  ok(stats.appealsWithEvidence === 4, '4 条复评含证据');
  ok(stats.subsWithEvents === 3, '3 条订阅有事项触发');
  ok(stats.crWithMembers === 3, '3 条决议含 6 委员');

  if (failed) { console.log(`\n❌ ${failed} 项失败`); process.exit(1); }
  console.log('\n🎉 4 个项目级 detail view 全部通过');
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
