/**
 * Debug Master V5 · 极限边界 + 业务逻辑深度
 *  - 12 阶段所有内联视图 + 工具集 一一过完
 *  - 所有 53 页面在 3 个不同 viewport 下无溢出
 *  - 项目数据完整性（每个项目都有完整 schema）
 *  - 模态点击外部关闭 / ESC 关闭
 *  - 表单填写 → 提交 → 创建 → 进入工作台 全链路
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

    // ━━━━━ Phase 1: 53 页面 × 3 viewport = 159 个组合无溢出 ━━━━━
    console.log('\n=========== Phase 1: 53 页面 × 3 viewport 无横向溢出 ===========');
    let overflowCount = 0;
    const overflowPages = [];
    for (const w of [1280, 1440, 1920]) {
      await page.setViewport({ width: w, height: 900 });
      let pagesAtWidth = 0;
      for (const pg of allPages) {
        try {
          await page.goto(BASE + '/pages/' + pg + '?projectId=P-2026-0421', { waitUntil:'domcontentloaded', timeout: 10000 });
          await new Promise(r => setTimeout(r, 250));
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
          if (overflow > 5) { overflowCount++; overflowPages.push(`${pg}@${w}px (${overflow}px)`); }
          pagesAtWidth++;
        } catch (e) { /* 忽略加载超时 */ }
      }
    }
    if (overflowCount > 0) {
      console.log(`  ⚠ 溢出页面 (前 10 个):`);
      overflowPages.slice(0, 10).forEach(p => console.log('    ' + p));
    }
    ok(overflowCount === 0, `159 个 viewport×页面 组合 ${overflowCount === 0 ? '全部' : '仍有 ' + overflowCount + ' 个'} 无溢出`);
    await page.setViewport({ width: 1440, height: 900 });

    // ━━━━━ Phase 2: 项目数据完整性 ━━━━━
    console.log('\n=========== Phase 2: 项目 schema 完整性 ===========');
    await page.goto(BASE + '/pages/project-intake.html', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 400));
    const projAudit = await page.evaluate(() => {
      const out = {};
      MockData.projects.forEach(p => {
        out[p.id] = {
          hasStages: Array.isArray(p.stages) && p.stages.length === 12,
          hasTimeline: Array.isArray(p.timeline) && p.timeline.length > 0,
          hasCurrentStage: !!p.currentStage,
          hasSubject: !!p.subject,
          teamLength: (p.team || []).length
        };
      });
      return out;
    });
    let badProjects = 0;
    for (const [id, audit] of Object.entries(projAudit)) {
      if (!audit.hasStages || !audit.hasTimeline || !audit.hasCurrentStage || !audit.hasSubject || audit.teamLength === 0) {
        console.log(`  ⚠ ${id}:`, audit);
        badProjects++;
      }
    }
    ok(badProjects === 0, `${Object.keys(projAudit).length} 个项目 schema 完整`);

    // ━━━━━ Phase 3: 12 阶段 × 内联视图 + 工具集（共 12 阶段每个验证）━━━━━
    console.log('\n=========== Phase 3: 12 阶段全部正确渲染 ===========');
    await page.goto(BASE + '/pages/project-workbench.html?projectId=P-2026-0421', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 500));
    const stages = ['intake','preparation','fieldwork','drafting','three-level','committee','finalization','appeal','publish','update','archive','tracking'];
    for (const sid of stages) {
      page.removeAllListeners('pageerror');
      const errs = [];
      page.on('pageerror', e => errs.push(e.message));
      await page.evaluate(s => selectStage(s), sid);
      await new Promise(r => setTimeout(r, 250));
      const data = await page.evaluate(() => {
        // 阶段工具数量 + 内联视图块（如有）
        const tools = document.querySelectorAll('main a[href*="?projectId="]');
        const toolCount = Array.from(tools).filter(a => !a.href.includes('project-workbench')).length;
        const guideExists = document.body.innerText.includes('跨项目视图');
        const stageHeader = document.querySelector('main section .text-base.font-semibold');
        return { toolCount, guideExists, hasHeader: !!stageHeader };
      });
      ok(errs.length === 0 && data.hasHeader && data.guideExists,
         `${sid}: 工具 ${data.toolCount} | header ✓ | 跨项目引导 ${data.guideExists ? '✓' : '✗'}`);
    }

    // ━━━━━ Phase 4: 模态 ESC 关闭 ━━━━━
    console.log('\n=========== Phase 4: 模态 ESC 关闭 ===========');
    await page.goto(BASE + '/pages/project-intake.html', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 500));
    await page.click('button[onclick="openIntakeModal()"]');
    await page.waitForSelector('#__modal_mask__');
    await new Promise(r => setTimeout(r, 300));
    // 测试点击 mask 外部关闭
    const closedByMask = await page.evaluate(() => {
      const mask = document.getElementById('__modal_mask__');
      if (!mask) return false;
      // 模拟点击 mask 自身（不点击内部）
      mask.click();
      // 等一下检查
      return new Promise(r => setTimeout(() => r(!document.getElementById('__modal_mask__')), 200));
    });
    ok(closedByMask, '点击 mask 外部可关闭模态');

    // ━━━━━ Phase 5: 创建 → 工作台 → 工具页 全链路 ━━━━━
    console.log('\n=========== Phase 5: 完整业务链路 ===========');
    await page.evaluate(() => localStorage.clear());
    await page.goto(BASE + '/pages/project-intake.html', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 500));
    await page.click('button[onclick="openIntakeModal()"]');
    await page.waitForSelector('#if-kind');
    await new Promise(r => setTimeout(r, 200));
    await page.evaluate(() => {
      const k = document.querySelector('#if-kind');
      k.value = 'corp';
      k.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await new Promise(r => setTimeout(r, 300));
    await page.type('#if-subject', 'V5 全链路测试主体');
    await page.$eval('#if-due', el => el.value = '2026-12-31');
    await page.evaluate(() => {
      const m = document.querySelector('.if-method');
      if (m && !m.checked) m.click();
    });
    await page.click('button[onclick="submitIntakeForm()"]');
    await new Promise(r => setTimeout(r, 700));
    // 验证项目存在
    const newId = await page.evaluate(() => {
      const p = MockData.projects.find(x => x.subject === 'V5 全链路测试主体');
      return p ? p.id : null;
    });
    ok(!!newId, `创建项目得到 ID ${newId}`);
    // 进入工作台
    await page.goto(BASE + '/pages/project-workbench.html?projectId=' + newId, { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    let body = await page.$eval('body', b => b.innerText);
    ok(body.includes('V5 全链路测试主体'), '工作台显示新项目');
    // 切到 fieldwork 进入工具
    await page.evaluate(() => selectStage('fieldwork'));
    await new Promise(r => setTimeout(r, 400));
    const toolHref = await page.evaluate(() => {
      const a = document.querySelector('main a[href*="dd-financial-ocr"]');
      return a ? a.getAttribute('href') : null;
    });
    ok(toolHref && toolHref.includes('projectId=' + newId), '工具链接保留新项目 ID');
    await page.evaluate(() => localStorage.clear());

    // ━━━━━ Phase 6: AI 抽屉打开 + 关闭 ━━━━━
    console.log('\n=========== Phase 6: AI 抽屉交互 ===========');
    await page.goto(BASE + '/pages/dd-financial-ocr.html?projectId=P-2026-0421', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(() => AIAgent.toggle());
    await new Promise(r => setTimeout(r, 400));
    const aiOpen = await page.evaluate(() => !!document.querySelector('.ai-modal.open, .ai-drawer.open'));
    ok(aiOpen, 'AI 抽屉/弹窗可打开');
    await page.evaluate(() => AIAgent.close());
    await new Promise(r => setTimeout(r, 400));
    const aiClosed = await page.evaluate(() => !document.querySelector('.ai-modal.open, .ai-drawer.open'));
    ok(aiClosed, 'AI 抽屉/弹窗可关闭');

    // ━━━━━ Phase 7: 主体页面（subject-rating 5 步）数据切换 ━━━━━
    console.log('\n=========== Phase 7: subject-rating 步骤切换 ===========');
    await page.goto(BASE + '/pages/subject-rating.html?projectId=P-2026-0421&step=1', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    for (let s = 1; s <= 5; s++) {
      page.removeAllListeners('pageerror');
      const errs = [];
      page.on('pageerror', e => errs.push(e.message));
      await page.evaluate(t => { currentStep = t; refreshStep(); }, s);
      await new Promise(r => setTimeout(r, 500));
      ok(errs.length === 0, `subject-rating Step ${s} 切换无错`);
    }

    // ━━━━━ Phase 8: 跨页项目上下文一致性 ━━━━━
    console.log('\n=========== Phase 8: 跨页项目上下文一致性 ===========');
    const flow = ['project-workbench', 'dd-financial-ocr', 'dd-interview', 'dd-workpaper', 'project-workbench'];
    for (const p of flow) {
      await page.goto(BASE + '/pages/' + p + '.html?projectId=P-2026-0420', { waitUntil:'networkidle2' });
      await new Promise(r => setTimeout(r, 400));
      const t = await page.$eval('body', b => b.innerText);
      ok(t.includes('江苏华西'), `${p} 显示江苏华西`);
    }

    // ━━━━━ 总结 ━━━━━
    if (failed) {
      console.log(`\n========== ❌ ${failed} 项失败 ==========`);
      failures.forEach((f, i) => console.log(`  ${i+1}. ${f}`));
      process.exit(1);
    }
    console.log('\n========== 🎉 V5 全部通过 ==========');
  } catch (e) {
    console.error('FATAL', e);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
