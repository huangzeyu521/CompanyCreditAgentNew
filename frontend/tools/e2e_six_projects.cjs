/**
 * E2E：6 个 PDF 主体的项目入口（P-2026-0505 ~ 0510）
 */
const puppeteer = require('puppeteer-core');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = 'http://127.0.0.1:8000';
let failed = 0;
function ok(c, l) { console.log((c ? '  ✅ ' : '  ❌ FAIL: ') + l); if (!c) failed++; }

const TARGETS = [
  { pid:'P-2026-0505', subject:'深圳市福田产业投资服务有限公司' },
  { pid:'P-2026-0506', subject:'石家庄市供销合作总社安全统筹公司' },
  { pid:'P-2026-0507', subject:'四川齐光建设工程有限公司' },
  { pid:'P-2026-0508', subject:'四川蜀运恒通建设工程有限公司' },
  { pid:'P-2026-0509', subject:'望城经开区投资建设集团有限公司' },
  { pid:'P-2026-0510', subject:'枣庄市道桥工程有限公司' }
];

(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args:['--no-sandbox'] });
  const page = await browser.newPage();
  try {
    // ━━━━ 我的项目页含 11 个项目 ━━━━
    console.log('\n=== 我的项目列表 ===');
    await page.goto(BASE + '/pages/project-intake.html', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 500));
    const projCount = await page.evaluate(() => MockData.projects.length);
    ok(projCount >= 11, `项目数 ≥ 11（实际 ${projCount}）`);

    // 每个项目：进工作台 + 主体名 + 12 阶段
    for (const t of TARGETS) {
      console.log(`\n=== ${t.pid} ${t.subject.slice(0,12)}... ===`);
      page.removeAllListeners('pageerror');
      const errs = [];
      page.on('pageerror', e => errs.push(e.message.slice(0,150)));

      await page.goto(BASE + '/pages/project-workbench.html?projectId=' + t.pid, { waitUntil:'networkidle2' });
      await new Promise(r => setTimeout(r, 600));

      ok(errs.length === 0, '工作台无 JS 错误');
      const text = await page.$eval('body', b => b.innerText);
      ok(text.includes(t.subject), `工作台显示 ${t.subject.slice(0,8)}...`);
      ok(text.includes('12 阶段工作流'), '12 阶段时间线渲染');
      ok(text.includes('接受委托') && text.includes('实地调研') && text.includes('跟踪评级'), '阶段名称完整');

      // 验证可以点击 fieldwork 阶段进工具
      await page.evaluate(() => selectStage('fieldwork'));
      await new Promise(r => setTimeout(r, 400));
      const txt2 = await page.$eval('body', b => b.innerText);
      ok(txt2.includes('财报 OCR') && txt2.includes('访谈管理'), 'fieldwork 工具集渲染');

      // 验证从工作台进入信用中国报告（subject-rating）
      await page.goto(BASE + '/pages/subject-rating.html?projectId=' + t.pid + '&step=2', { waitUntil:'networkidle2' });
      await new Promise(r => setTimeout(r, 600));
      const txt3 = await page.$eval('body', b => b.innerText);
      ok(txt3.includes(t.subject), `双轨融合引擎 step 2 显示 ${t.subject.slice(0,8)}...`);
      // 验证报告内容（信用中国官方报告）
      ok(txt3.includes('信用信息概要'), '信用信息概要展示');
      ok(txt3.includes('国家公共信用和地理空间信息中心'), '出具单位正确');
    }

    // ━━━━ 我的项目入口链接 ━━━━
    console.log('\n=== 我的项目"进入工作台"链接 ===');
    await page.goto(BASE + '/pages/project-intake.html', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 500));
    // 只统计主区内的链接，排除侧栏「项目工作台」的动态 href
    const allLinks = await page.$$eval('main a[href*="project-workbench.html?projectId="]', as => as.map(a => a.getAttribute('href')));
    const newProjLinks = [...new Set(allLinks.filter(h => /P-2026-050[5-9]|P-2026-0510/.test(h)))];
    ok(newProjLinks.length === 6, `6 个新项目"进入工作台"链接（实际 ${newProjLinks.length}）`);

    if (failed) { console.log(`\n❌ ${failed} 项失败`); process.exit(1); }
    console.log('\n🎉 全部通过');
  } finally { await browser.close(); }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
