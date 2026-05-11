/**
 * Debug Master V3 · End-to-End 用户故事
 * 模拟真实业务场景：王明远新建一个项目 → 进入工作台 → 用各阶段工具 → 退出
 */
const puppeteer = require('puppeteer-core');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = 'http://127.0.0.1:8000';

let failed = 0;
const failures = [];
function ok(c, l) {
  console.log((c ? '  ✅ ' : '  ❌ FAIL: ') + l);
  if (!c) { failed++; failures.push(l); }
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args:['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    // ━━━━ User Story 1: 新建项目 → 自动进工作台 ━━━━
    console.log('\n=========== Story 1: 新建项目 → 进工作台 ===========');
    await page.goto(BASE + '/pages/project-intake.html', { waitUntil: 'networkidle2' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 500));

    // 打开新建对话框
    await page.click('button[onclick="openIntakeModal()"]');
    await page.waitForSelector('#if-kind', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 200));

    // 填表
    await page.evaluate(() => {
      const el = document.querySelector('#if-kind');
      el.value = 'corp';
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await new Promise(r => setTimeout(r, 200));
    await page.type('#if-subject', 'Story-1 测试主体');
    await page.$eval('#if-due', el => el.value = '2026-12-31');
    await page.evaluate(() => {
      ['#if-industry','#if-market','#if-business'].forEach(s => {
        const el = document.querySelector(s);
        if (el && el.options[0]) {
          el.value = el.options[1] ? el.options[1].value : el.options[0].value;
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    });
    // 选一个方法学
    await page.evaluate(() => {
      const m = document.querySelector('.if-method');
      if (m && !m.checked) m.click();
    });
    await page.click('button[onclick="submitIntakeForm()"]');
    await new Promise(r => setTimeout(r, 700));

    // 验证项目已创建
    const newProj = await page.evaluate(() => {
      return MockData.projects.find(p => p.subject === 'Story-1 测试主体');
    });
    ok(!!newProj, '新项目已创建');
    ok(newProj && Array.isArray(newProj.stages) && newProj.stages.length === 12, '新项目有 12 阶段');
    ok(newProj && newProj.currentStage === 'intake', '新项目当前阶段为接受委托');

    // 跳到工作台
    await page.goto(BASE + '/pages/project-workbench.html?projectId=' + newProj.id, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    let body = await page.$eval('body', b => b.innerText);
    ok(body.includes('Story-1 测试主体'), '工作台显示新项目名');
    ok(body.includes('12 阶段工作流'), '12 阶段时间线渲染');
    ok(body.includes('接受委托'), '当前阶段显示"接受委托"');

    // ━━━━ User Story 2: 切换阶段查看不同工具集 ━━━━
    console.log('\n=========== Story 2: 切换阶段 ===========');
    // intake 阶段：2 工具（利冲 + KYC）
    await page.evaluate(() => selectStage('intake'));
    await new Promise(r => setTimeout(r, 400));
    let toolCount = await page.$$eval('a[href*="?projectId="]', as => as.filter(a => a.href.includes('?projectId=') && !a.href.includes('project-workbench')).length);
    ok(toolCount >= 2, `intake 阶段至少 2 工具（实际 ${toolCount}）`);

    // preparation 阶段：0 工具（内联视图）
    await page.evaluate(() => selectStage('preparation'));
    await new Promise(r => setTimeout(r, 400));
    body = await page.$eval('body', b => b.innerText);
    ok(body.includes('项目组') && body.includes('工作计划'), 'preparation 阶段显示内联视图（无独立工具）');

    // fieldwork 阶段：5 工具
    await page.evaluate(() => selectStage('fieldwork'));
    await new Promise(r => setTimeout(r, 400));
    toolCount = await page.$$eval('main a[href*="?projectId="]', as => as.filter(a => !a.href.includes('project-workbench')).length);
    ok(toolCount >= 5, `fieldwork 阶段至少 5 工具（实际 ${toolCount}）`);

    // ━━━━ User Story 3: 进尽调工具 → 看到本项目数据 ━━━━
    console.log('\n=========== Story 3: 进尽调工具 ===========');
    await page.goto(BASE + '/pages/dd-collection.html?projectId=' + newProj.id, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 500));
    body = await page.$eval('body', b => b.innerText);
    ok(body.includes('Story-1 测试主体'), '尽调工具页显示项目');
    ok(body.includes('返回项目工作台'), '尽调工具页有"返回项目工作台"链接');

    // ━━━━ User Story 4: 浏览器后退保留 projectId ━━━━
    console.log('\n=========== Story 4: 浏览器后退 ===========');
    await page.goBack({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 500));
    let url = page.url();
    ok(url.includes('projectId=' + newProj.id), '后退后 URL 保留 projectId');

    // ━━━━ User Story 5: 切换不同项目 ━━━━
    console.log('\n=========== Story 5: 切换项目 ===========');
    await page.goto(BASE + '/pages/project-workbench.html?projectId=' + newProj.id, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 500));
    const switched = await page.evaluate(() => {
      const sel = Array.from(document.querySelectorAll('select')).find(s => Array.from(s.options).some(o => o.value && o.value.startsWith('P-2026-0')));
      if (!sel) return null;
      const target = Array.from(sel.options).find(o => o.value === 'P-2026-0421');
      if (!target) return null;
      sel.value = 'P-2026-0421';
      sel.dispatchEvent(new Event('change'));
      return 'P-2026-0421';
    });
    ok(!!switched, '通过切换器选择南京钢铁');
    await page.waitForFunction(() => location.search.includes('projectId=P-2026-0421'), { timeout: 5000 });
    await new Promise(r => setTimeout(r, 600));
    body = await page.$eval('body', b => b.innerText);
    ok(body.includes('南京钢铁'), '已切换到南京钢铁工作台');

    // ━━━━ User Story 6: 跨项目视图无 ctxBar ━━━━
    console.log('\n=========== Story 6: 跨项目视图无 ctxBar ===========');
    const crossProjPages = ['account-manager.html', 'committee-agenda.html', 'tracking.html', 'monitoring-report.html'];
    for (const p of crossProjPages) {
      await page.goto(BASE + '/pages/' + p + '?projectId=P-2026-0421', { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 400));
      const t = await page.$eval('body', b => b.innerText);
      // ProjectContextBar 的标志：面包屑"我的项目 › [项目名] (...)"
      const hasCtxBar = /我的项目\s*[›>]\s*南京钢铁/.test(t);
      ok(!hasCtxBar, `${p} (跨项目视图) 不显示项目上下文栏`);
    }

    // ━━━━ User Story 7: 双轨融合引擎从工作台进入 ━━━━
    console.log('\n=========== Story 7: 双轨融合引擎流程 ===========');
    await page.goto(BASE + '/pages/subject-rating.html?projectId=P-2026-0421', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    // 跳到 Step 5
    await page.evaluate(() => {
      currentStep = 5;
      refreshStep();
    });
    await new Promise(r => setTimeout(r, 500));
    body = await page.$eval('body', b => b.innerText);
    ok(body.includes('双轨融合') || body.includes('第 5 步'), '能跳到双轨融合 Step 5');
    // 退出按钮
    await page.evaluate(() => { window.confirmDialog = () => Promise.resolve(true); });
    await page.evaluate(() => exitFlow());
    await page.waitForFunction(() => location.pathname.includes('project-workbench'), { timeout: 5000 });
    url = page.url();
    ok(url.includes('projectId=P-2026-0421'), 'Step 5 退出后回工作台保留 projectId');

    // ━━━━ 清理 ━━━━
    await page.evaluate(() => localStorage.clear());

    if (failed) {
      console.log(`\n========== ❌ ${failed} 项失败 ==========`);
      failures.forEach((f, i) => console.log(`  ${i+1}. ${f}`));
      process.exit(1);
    }
    console.log('\n========== 🎉 V3 用户故事全部通过 ==========');
  } catch (e) {
    console.error('FATAL', e);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
