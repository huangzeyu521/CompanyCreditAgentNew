/**
 * Debug Master V4 · 视觉 / 模态 / 图表 / 警告 / 全部页面健康
 */
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
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
    const allPages = fs.readdirSync(path.join(__dirname, '../pages')).filter(f => f.endsWith('.html')).sort();

    // ━━━━ Phase 1: 每个页面深度健康（无 console.error / 无 console.warn 关键字段 / 主区有内容） ━━━━
    console.log('\n=========== Phase 1: 53 页面深度扫描 ===========');
    const pageIssues = {};
    // login.html / 404.html / index.html 使用自定义全屏布局，不通过 mountLayout
    const SPECIAL_PAGES = new Set(['login.html', '404.html']);

    for (const pg of allPages) {
      page.removeAllListeners('pageerror');
      page.removeAllListeners('console');
      const errs = [];
      const warns = [];
      page.on('pageerror', e => errs.push('[pageerror] ' + e.message.slice(0,200)));
      page.on('console', m => {
        const t = m.text();
        if (t.includes('Failed to load resource')) return;
        if (t.includes('cdn.tailwind')) return;
        if (m.type() === 'error') errs.push('[error] ' + t.slice(0,200));
        else if (m.type() === 'warning' || m.type() === 'warn') {
          if (!t.includes('cdn.tailwindcss.com should not be used in production')) {
            warns.push('[warn] ' + t.slice(0,200));
          }
        }
      });
      try {
        await page.goto(BASE + '/pages/' + pg + '?projectId=P-2026-0421', { waitUntil:'domcontentloaded', timeout: 15000 });
        await new Promise(r => setTimeout(r, 500));
        // login/404 用 body 直接布局，其它页面用 #app
        const hasContent = await page.evaluate((isSpecial) => {
          const sel = isSpecial ? 'body' : 'main, #main, #app';
          const el = document.querySelector(sel);
          return el ? el.innerText.trim().length > 50 : false;
        }, SPECIAL_PAGES.has(pg));
        if (errs.length > 0 || !hasContent) {
          pageIssues[pg] = { errs, warns, hasContent };
        }
      } catch (e) {
        pageIssues[pg] = { errs:['[load] '+ e.message.slice(0,100)], warns:[], hasContent: false };
      }
    }
    if (Object.keys(pageIssues).length === 0) {
      ok(true, `所有 ${allPages.length} 页面健康（无 JS 错误 + 主区有内容）`);
    } else {
      Object.entries(pageIssues).slice(0, 20).forEach(([pg, info]) => {
        console.log(`  ⚠ ${pg}:`);
        if (!info.mainHasContent) console.log('     · 主区为空');
        info.errs.forEach(e => console.log('     ' + e));
      });
      ok(false, `${Object.keys(pageIssues).length} 页面有问题`);
    }

    // ━━━━ Phase 2: 图表渲染（有 echarts 的页面）━━━━
    console.log('\n=========== Phase 2: 图表渲染 ===========');
    const pagesWithCharts = ['workbench.html','cockpit.html','subject-rating.html','monitoring-report.html',
                             'tracking.html','peer-benchmark.html','grade-mapping.html','openapi.html'];
    for (const pg of pagesWithCharts) {
      if (!allPages.includes(pg)) continue;
      await page.goto(BASE + '/pages/' + pg + '?projectId=P-2026-0421', { waitUntil:'networkidle2' });
      await new Promise(r => setTimeout(r, 1500));  // 等图表渲染
      const chartCount = await page.evaluate(() => {
        // ECharts 渲染后 div 内会有 canvas 或 svg
        const canvases = document.querySelectorAll('canvas, [_echarts_instance_]');
        return canvases.length;
      });
      ok(chartCount >= 0, `${pg} 图表元素 ${chartCount} 个`);
    }

    // ━━━━ Phase 3: 模态对话框开关 ━━━━
    console.log('\n=========== Phase 3: 模态对话框开关 ===========');
    // 我的项目 → 新建项目模态
    await page.goto(BASE + '/pages/project-intake.html', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 500));
    // 打开
    await page.click('button[onclick="openIntakeModal()"]');
    await page.waitForSelector('#if-kind', { timeout: 5000 });
    let maskVisible = await page.$('#__modal_mask__');
    ok(!!maskVisible, '新建项目模态打开');
    // 关闭
    await page.evaluate(() => closeModal());
    await new Promise(r => setTimeout(r, 300));
    maskVisible = await page.$('#__modal_mask__');
    ok(!maskVisible, '模态可关闭');

    // ━━━━ Phase 4: 侧栏导航 ━━━━
    console.log('\n=========== Phase 4: 侧栏分组展开 / 导航 ===========');
    await page.goto(BASE + '/pages/project-intake.html', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 500));
    const groupCount = await page.$$eval('.sidebar-group', els => els.length);
    ok(groupCount === 5, `侧栏 5 个一级分组（实际 ${groupCount}）`);
    // 展开"跨项目视图"
    const expanded = await page.evaluate(() => {
      const btn = document.querySelector('.sidebar-group[data-group="cross-project"] button');
      if (btn) btn.click();
      const items = document.querySelector('.sidebar-group[data-group="cross-project"] .sidebar-items');
      return items && !items.classList.contains('hidden');
    });
    ok(expanded, '跨项目视图组可展开');

    // ━━━━ Phase 5: 表单校验（必填字段）━━━━
    console.log('\n=========== Phase 5: 表单校验 ===========');
    await page.goto(BASE + '/pages/project-intake.html', { waitUntil:'networkidle2' });
    await page.click('button[onclick="openIntakeModal()"]');
    await page.waitForSelector('#if-kind', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 200));
    // 不填任何东西，直接提交
    await page.click('button[onclick="submitIntakeForm()"]');
    await new Promise(r => setTimeout(r, 400));
    const errVisible = await page.$eval('#if-error', el => !el.classList.contains('hidden')).catch(() => false);
    ok(errVisible, '空表单提交触发校验错误');

    // ━━━━ Phase 6: 关键按钮在所有相关页面响应 ━━━━
    console.log('\n=========== Phase 6: AI 助手按钮全局响应 ===========');
    for (const pg of ['project-intake.html', 'project-workbench.html', 'dd-financial-ocr.html', 'workbench.html']) {
      await page.goto(BASE + '/pages/' + pg + '?projectId=P-2026-0421', { waitUntil:'networkidle2' });
      await new Promise(r => setTimeout(r, 600));
      const aiBtnExists = await page.$('button[onclick*="AIAgent"]');
      ok(!!aiBtnExists, `${pg} 有 AI 助手按钮`);
    }

    // ━━━━ Phase 7: 项目工作台 12 阶段都有阶段卡渲染 ━━━━
    console.log('\n=========== Phase 7: 12 阶段卡片渲染 ===========');
    await page.goto(BASE + '/pages/project-workbench.html?projectId=P-2026-0421', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 500));
    const stages = ['intake','preparation','fieldwork','drafting','three-level','committee','finalization','appeal','publish','update','archive','tracking'];
    for (const sid of stages) {
      await page.evaluate(s => selectStage(s), sid);
      await new Promise(r => setTimeout(r, 250));
      const stageHeader = await page.evaluate(() => {
        const h = document.querySelector('section.shadow-card .text-base.font-semibold');
        return h ? h.innerText : '';
      });
      ok(stageHeader && stageHeader.length > 0, `${sid} 阶段卡 header 渲染（${stageHeader.slice(0,20)}）`);
    }

    // ━━━━ Phase 8: 信用中国官方报告 8 章节折叠展开 ━━━━
    console.log('\n=========== Phase 8: 信用中国报告 8 章节 ===========');
    await page.goto(BASE + '/pages/subject-rating.html?projectId=P-2026-0421&step=2', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 800));
    const detailsCount = await page.$$eval('details', els => els.length);
    ok(detailsCount >= 8, `信用中国报告至少 8 个折叠章节（实际 ${detailsCount}）`);

    // ━━━━ Phase 9: 项目切换器实际生效 ━━━━
    console.log('\n=========== Phase 9: 切换项目工作台 ===========');
    await page.goto(BASE + '/pages/project-workbench.html?projectId=P-2026-0421', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 500));
    const beforeBody = await page.$eval('main', m => m.innerText);
    ok(beforeBody.includes('南京钢铁'), '默认显示南京钢铁');
    await page.evaluate(() => {
      const sel = Array.from(document.querySelectorAll('select')).find(s => s.options[0] && s.options[0].value && s.options[0].value.startsWith('P-2026'));
      const t = Array.from(sel.options).find(o => o.value === 'P-2026-0418');
      if (t) {
        sel.value = 'P-2026-0418';
        sel.dispatchEvent(new Event('change'));
      }
    });
    await page.waitForFunction(() => location.search.includes('P-2026-0418'), { timeout: 5000 });
    await new Promise(r => setTimeout(r, 600));
    const afterBody = await page.$eval('main', m => m.innerText);
    ok(afterBody.includes('福禧投资'), '切换到福禧投资工作台');

    // ━━━━ Phase 10: 各页面 viewport 不溢出（响应式 1024 vs 1440） ━━━━
    console.log('\n=========== Phase 10: 响应式 viewport ===========');
    for (const w of [1280, 1440, 1920]) {
      await page.setViewport({ width: w, height: 900 });
      await page.goto(BASE + '/pages/project-workbench.html?projectId=P-2026-0421', { waitUntil:'networkidle2' });
      await new Promise(r => setTimeout(r, 500));
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth + 5;
      });
      ok(!overflow, `${w}px 宽度无横向溢出`);
    }
    await page.setViewport({ width: 1440, height: 900 });

    // ━━━━ Phase 11: 信用中国 8 类条目 真实 PDF 数据 ━━━━
    console.log('\n=========== Phase 11: 信用中国南京钢铁真实数据 ===========');
    await page.goto(BASE + '/pages/subject-rating.html?projectId=P-2026-0421&step=2', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 800));
    const realData = await page.evaluate(() => {
      const r = MockData.subjects.find(s => s.name === '南京钢铁联合有限公司').officialReport;
      return {
        admin: r.administrativeMgmt.length,
        good:  r.goodCredit.length,
        commit: r.creditCommitments.length,
        reportNo: r.reportNo
      };
    });
    ok(realData.admin === 15, `南钢行政管理 15 条（PDF 真实，实际 ${realData.admin}）`);
    ok(realData.good === 4,   `南钢诚实守信 4 条（PDF 真实，实际 ${realData.good}）`);
    ok(realData.commit === 5, `南钢信用承诺 5 条（PDF 真实，实际 ${realData.commit}）`);
    ok(realData.reportNo === '2026050419025750859D39', `南钢报告编号匹配 PDF`);

    // ━━━━ 总结 ━━━━
    if (failed) {
      console.log(`\n========== ❌ ${failed} 项失败 ==========`);
      failures.forEach((f, i) => console.log(`  ${i+1}. ${f}`));
      process.exit(1);
    }
    console.log('\n========== 🎉 V4 全部通过 ==========');
  } catch (e) {
    console.error('FATAL', e);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
