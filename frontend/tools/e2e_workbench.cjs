/**
 * E2E 全链路：项目工作台 + 项目上下文 + 12 阶段 + 工具页项目过滤
 */
const puppeteer = require('puppeteer-core');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = 'http://127.0.0.1:8000';

let failed = 0;
function ok(c, l) { console.log((c ? '  ✅ ' : '  ❌ FAIL: ') + l); if (!c) failed++; }

(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args:['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    page.on('pageerror', e => console.error('  ⚠ PAGE ERROR:', e.message));

    // ───── ① 项目工作台 ─────
    console.log('\n=== ① 项目工作台 (P-2026-0421 南京钢铁) ===');
    await page.goto(BASE + '/pages/project-workbench.html?projectId=P-2026-0421', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    let body = await page.$eval('body', b => b.innerText);
    ok(body.includes('南京钢铁联合有限公司'), '项目工作台显示南京钢铁');
    ok(body.includes('P-2026-0421'),         '显示项目编号');
    ok(body.includes('① 接受委托') || body.includes('接受委托'), '12 阶段时间线包含"接受委托"');
    ok(body.includes('实地调研'),             '12 阶段包含"实地调研"');
    ok(body.includes('跟踪评级'),             '12 阶段包含"跟踪评级"');
    ok(body.includes('阶段工具集'),           '当前阶段工具集区块');
    ok(body.includes('项目组'),               '项目组区块');
    ok(body.includes('关键事件时间轴'),         '关键事件时间轴');
    // 12 阶段计数
    const stagesCount = await page.evaluate(() => {
      return MockData.STAGE_DEFS && MockData.STAGE_DEFS.length;
    });
    ok(stagesCount === 12, `STAGE_DEFS 共 12 阶段（实际 ${stagesCount}）`);

    // ───── ② 工具页带 projectId ─────
    console.log('\n=== ② 财报 OCR 带 projectId ===');
    await page.goto(BASE + '/pages/dd-financial-ocr.html?projectId=P-2026-0421', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    body = await page.$eval('body', b => b.innerText);
    ok(body.includes('当前项目'),               '财报 OCR 显示"当前项目"标识');
    ok(body.includes('南京钢铁联合有限公司'),    '财报 OCR 显示项目名');
    ok(body.includes('返回项目工作台'),         '财报 OCR 提供返回工作台链接');

    // ───── ③ 项目上下文栏（顶部固定） ─────
    console.log('\n=== ③ 项目上下文栏 ===');
    const ctxVisible = await page.evaluate(() => {
      const txt = document.body.innerText;
      return txt.includes('我的项目') && txt.includes('返回工作台');
    });
    ok(ctxVisible, '顶部项目上下文栏可见');

    // ───── ④ 工具页不带 projectId 显示警告 ─────
    console.log('\n=== ④ 财报 OCR 不带 projectId 显示警告 ===');
    await page.goto(BASE + '/pages/dd-financial-ocr.html', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 500));
    body = await page.$eval('body', b => b.innerText);
    ok(body.includes('未选择项目'), '不带 projectId 时显示"未选择项目"警告');

    // ───── ⑤ 我的项目入口跳转到工作台 ─────
    console.log('\n=== ⑤ 我的项目"进入工作台"链接 ===');
    await page.goto(BASE + '/pages/project-intake.html', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    const links = await page.$$eval('a', as => as.map(a => a.getAttribute('href')).filter(Boolean));
    const hasWorkbenchLink = links.some(h => h && h.startsWith('project-workbench.html?projectId='));
    ok(hasWorkbenchLink, '"进入工作台"链接指向 project-workbench.html?projectId=...');

    // ───── ⑥ 五步闭环重命名 ─────
    console.log('\n=== ⑥ 五步闭环重命名为"双轨融合引擎" ===');
    await page.goto(BASE + '/pages/subject-rating.html?projectId=P-2026-0421', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    body = await page.$eval('body', b => b.innerText);
    ok(body.includes('双轨融合引擎'),     '页面标题改名为"双轨融合引擎"');
    ok(!body.includes('主体评级 · 五步闭环'), '不再显示"主体评级 · 五步闭环"');

    // ───── ⑦ 菜单 IA 重组 ─────
    console.log('\n=== ⑦ 菜单 IA 重组：项目驱动 + 跨项目分离 ===');
    const menuLabels = await page.evaluate(() =>
      AppConfig.routeGroups.map(g => g.label)
    );
    console.log('  · 菜单分组:', menuLabels.join(' / '));
    ok(menuLabels.includes('我的工作'),     '一级菜单含"我的工作"');
    ok(menuLabels.includes('跨项目视图'),    '一级菜单含"跨项目视图"');

    // ───── ⑧ 项目切换器 ─────
    console.log('\n=== ⑧ 项目切换器（顶部下拉）===');
    await page.goto(BASE + '/pages/dd-financial-ocr.html?projectId=P-2026-0421', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    const switcherCount = await page.evaluate(() => {
      const sels = Array.from(document.querySelectorAll('select'));
      const proj = sels.find(s => Array.from(s.options).some(o => /P-2026-/.test(o.value || '')));
      return proj ? proj.options.length : 0;
    });
    ok(switcherCount >= 5, `项目切换器至少 5 个选项（实际 ${switcherCount}）`);

    if (failed) { console.log(`\n❌ ${failed} 项失败`); process.exit(1); }
    console.log('\n🎉 全部断言通过');
  } finally { await browser.close(); }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
