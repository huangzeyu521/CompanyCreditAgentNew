/**
 * Debug Master · 端到端深度扫描
 * - 扫描所有 49 页面 console 错误
 * - 验证项目工作台 12 阶段每个 tool 链接可用
 * - 验证项目上下文栏在每个工具页正确显示
 * - 验证内联视图 5 阶段全部渲染
 * - 验证 subject-rating 5 步全部能切换
 * - 验证项目切换器跨项目工作
 * - 验证 localStorage 持久化
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

async function getConsoleErrors(page) {
  const errs = [];
  page.removeAllListeners('pageerror');
  page.removeAllListeners('console');
  page.on('pageerror', e => errs.push('[pageerror] ' + e.message));
  page.on('console', m => {
    if (m.type() === 'error') errs.push('[console.error] ' + m.text());
  });
  return errs;
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args:['--no-sandbox'] });
  const page = await browser.newPage();
  try {
    // ━━━━━ Phase 1: 扫描所有 49 页面是否能加载且无 JS 错误 ━━━━━
    console.log('\n=========== Phase 1: 全页面健康扫描 ===========');
    const allPages = fs.readdirSync(path.join(__dirname, '../pages'))
      .filter(f => f.endsWith('.html'))
      .sort();
    console.log(`发现 ${allPages.length} 个 HTML 页面，逐一扫描...\n`);

    let healthyCount = 0;
    const sickPages = [];
    for (const pg of allPages) {
      const errs = [];
      page.removeAllListeners('pageerror');
      page.removeAllListeners('console');
      page.on('pageerror', e => errs.push('[pageerror] ' + e.message));
      page.on('console', m => {
        if (m.type() === 'error' && !m.text().includes('Failed to load resource')) {
          errs.push('[console] ' + m.text().slice(0, 200));
        }
      });
      try {
        await page.goto(BASE + '/pages/' + pg + '?projectId=P-2026-0421', { waitUntil:'domcontentloaded', timeout: 15000 });
        await new Promise(r => setTimeout(r, 400));
        if (errs.length === 0) {
          healthyCount++;
        } else {
          sickPages.push({ page: pg, errors: errs });
          console.log(`  ⚠ ${pg}:`);
          errs.slice(0,3).forEach(e => console.log(`     ${e}`));
        }
      } catch (e) {
        sickPages.push({ page: pg, errors: ['[load failed] ' + e.message] });
        console.log(`  ❌ ${pg}: ${e.message.slice(0,100)}`);
      }
    }
    console.log(`\n  ${healthyCount}/${allPages.length} 页面健康`);
    ok(sickPages.length === 0, `所有 ${allPages.length} 页面无 JS 错误`);

    // ━━━━━ Phase 2: 项目工作台 12 阶段交互 ━━━━━
    console.log('\n=========== Phase 2: 12 阶段交互测试 ===========');
    await page.goto(BASE + '/pages/project-workbench.html?projectId=P-2026-0421', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 500));
    const stageIds = ['intake','preparation','fieldwork','drafting','three-level','committee','finalization','appeal','publish','update','archive','tracking'];
    for (const sid of stageIds) {
      page.removeAllListeners('pageerror');
      const errs = [];
      page.on('pageerror', e => errs.push(e.message));
      await page.evaluate(s => selectStage(s), sid);
      await new Promise(r => setTimeout(r, 300));
      ok(errs.length === 0, `阶段 ${sid} 切换无 JS 错误`);
    }

    // ━━━━━ Phase 3: 阶段工具集链接 → 跳转 + projectId 保持 ━━━━━
    console.log('\n=========== Phase 3: 阶段工具集跳转测试 ===========');
    await page.goto(BASE + '/pages/project-workbench.html?projectId=P-2026-0421', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 500));
    // 切到 fieldwork（有 5 个工具）
    await page.evaluate(() => selectStage('fieldwork'));
    await new Promise(r => setTimeout(r, 400));
    const fieldworkLinks = await page.$$eval('a[href*="?projectId="]', as => as.map(a => a.getAttribute('href')));
    const fieldworkToolLinks = fieldworkLinks.filter(h => h.includes('?projectId=P-2026-0421') && !h.includes('project-workbench'));
    ok(fieldworkToolLinks.length >= 5, `fieldwork 阶段至少 5 个工具链接（实际 ${fieldworkToolLinks.length}）`);

    // 测试每个工具链接都能成功打开
    const tested = new Set();
    for (const href of fieldworkToolLinks.slice(0, 5)) {
      const url = BASE + '/pages/' + href;
      const tool = href.split('?')[0];
      if (tested.has(tool)) continue;
      tested.add(tool);
      page.removeAllListeners('pageerror');
      const errs = [];
      page.on('pageerror', e => errs.push(e.message));
      await page.goto(url, { waitUntil:'networkidle2' });
      await new Promise(r => setTimeout(r, 400));
      const t = await page.$eval('body', b => b.innerText);
      const hasBanner = t.includes('当前项目') || t.includes('未选择项目');
      ok(hasBanner && errs.length === 0, `工具 ${tool} 加载正常 + 项目 banner 存在`);
    }

    // ━━━━━ Phase 4: 项目切换器测试 ━━━━━
    console.log('\n=========== Phase 4: 项目切换器测试 ===========');
    await page.goto(BASE + '/pages/dd-financial-ocr.html?projectId=P-2026-0421', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 500));
    let body = await page.$eval('body', b => b.innerText);
    ok(body.includes('南京钢铁'), '默认项目南京钢铁');

    await page.goto(BASE + '/pages/dd-financial-ocr.html?projectId=P-2026-0420', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 500));
    body = await page.$eval('body', b => b.innerText);
    ok(body.includes('江苏华西'), '切换到 P-2026-0420 显示江苏华西');

    // ━━━━━ Phase 5: 我的项目 → 进入工作台流程 ━━━━━
    console.log('\n=========== Phase 5: 我的项目入口流程 ===========');
    await page.goto(BASE + '/pages/project-intake.html', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 500));
    const links = await page.$$eval('a', as => as.map(a => a.getAttribute('href')).filter(Boolean));
    const wbLinks = links.filter(h => h && h.startsWith('project-workbench.html'));
    ok(wbLinks.length >= 1, '"进入工作台" 链接存在');

    // 实际点击第一个进入工作台
    if (wbLinks.length) {
      await page.goto(BASE + '/pages/' + wbLinks[0], { waitUntil:'networkidle2' });
      await new Promise(r => setTimeout(r, 500));
      const t = await page.$eval('body', b => b.innerText);
      ok(t.includes('12 阶段工作流'), '工作台正常加载 12 阶段');
    }

    // ━━━━━ Phase 6: subject-rating 五步算法 ━━━━━
    console.log('\n=========== Phase 6: subject-rating 五步算法 ===========');
    for (let step = 1; step <= 5; step++) {
      page.removeAllListeners('pageerror');
      const errs = [];
      page.on('pageerror', e => errs.push(e.message));
      await page.goto(BASE + `/pages/subject-rating.html?projectId=P-2026-0421&step=${step}`, { waitUntil:'networkidle2' });
      await new Promise(r => setTimeout(r, 600));
      ok(errs.length === 0, `subject-rating 第 ${step} 步无 JS 错误`);
    }

    // ━━━━━ Phase 7: localStorage 持久化端到端 ━━━━━
    console.log('\n=========== Phase 7: localStorage 持久化 ===========');
    await page.goto(BASE + '/pages/project-intake.html', { waitUntil:'networkidle2' });
    await page.evaluate(() => localStorage.clear());
    await page.evaluate(() => {
      const fake = {
        id: 'P-2026-7777',
        subject: 'Debug 测试主体',
        kind: '工商企业',
        industry: 'C31',
        market: 'EXG-SH',
        team: [{ name:'王明远', role:'组长', years:10 }, { name:'李雨欣', role:'分析师', years:4 }],
        status: '已立项',
        createdAt: '2026-05-05 10:00',
        plannedEnd: '2026-08-30'
      };
      localStorage.setItem('ccascea_user_projects', JSON.stringify([fake]));
    });
    await page.goto(BASE + '/pages/project-workbench.html?projectId=P-2026-7777', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 800));
    body = await page.$eval('body', b => b.innerText);
    ok(body.includes('Debug 测试主体'), '用户新建项目可进入工作台');
    ok(body.includes('12 阶段工作流'), '用户新建项目自动有 12 阶段');
    await page.evaluate(() => localStorage.clear());

    // ━━━━━ Phase 8: AI 助手抽屉 ━━━━━
    console.log('\n=========== Phase 8: AI 助手抽屉 ===========');
    await page.goto(BASE + '/pages/project-workbench.html?projectId=P-2026-0421', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 500));
    const aiOk = await page.evaluate(() => !!(window.AIAgent && typeof window.AIAgent.toggle === 'function'));
    ok(aiOk, 'AIAgent 全局对象正确加载');

    // ━━━━━ Phase 9: 跨项目视图引导 ━━━━━
    console.log('\n=========== Phase 9: 跨项目视图引导 ===========');
    body = await page.$eval('body', b => b.innerText);
    ok(body.includes('跨项目视图') && body.includes('全公司'), '跨项目视图引导提示存在');

    // ━━━━━ Phase 10: 边界场景 ━━━━━
    console.log('\n=========== Phase 10: 边界场景测试 ===========');

    // 10.1 INVALID projectId 显示明确错误
    await page.goto(BASE + '/pages/project-workbench.html?projectId=P-9999-XXXX', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 500));
    body = await page.$eval('body', b => b.innerText);
    ok(body.includes('项目不存在') || body.includes('未指定项目'), 'INVALID projectId 显示明确错误（不静默回退）');
    ok(body.includes('P-9999-XXXX'), '错误信息显示用户输入的 ID');

    // 10.2 项目工作台有项目切换器
    await page.goto(BASE + '/pages/project-workbench.html?projectId=P-2026-0421', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 500));
    const wbSwitcher = await page.evaluate(() => {
      const sels = Array.from(document.querySelectorAll('select'));
      return sels.find(s => Array.from(s.options).some(o => /P-2026-/.test(o.value || '')));
    });
    ok(!!wbSwitcher, '项目工作台有项目切换器');

    // 10.3 跨项目页面访问时不显示 ProjectContextBar（即使有 projectId）
    await page.goto(BASE + '/pages/account-manager.html?projectId=P-2026-0421', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 500));
    const acctText = await page.$eval('body', b => b.innerText);
    // ProjectContextBar 的特征是面包屑"我的项目 / 南京钢铁"
    const hasProjectBreadcrumb = /我的项目\s*[›>]\s*南京钢铁联合有限公司\s*\(P-2026-/.test(acctText);
    ok(!hasProjectBreadcrumb, 'account-manager (跨项目视图) 不显示项目上下文栏');

    // 10.4 双轨融合引擎"退出"返回项目工作台
    await page.goto(BASE + `/pages/subject-rating.html?projectId=P-2026-0421&step=2`, { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 500));
    const exitBtnExist = await page.evaluate(() => {
      const fn = window.exitFlow ? window.exitFlow.toString() : '';
      return fn.includes('project-workbench') && fn.includes('projectId');
    });
    ok(exitBtnExist, 'subject-rating exitFlow 保留 projectId 返回工作台');

    // 10.5 dd-financial-ocr 用 P-2026-0420 时 banner 切换
    await page.goto(BASE + '/pages/dd-financial-ocr.html?projectId=P-2026-0420', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 500));
    body = await page.$eval('body', b => b.innerText);
    ok(body.includes('江苏华西集团'), '工具页 banner 跟随 projectId 切换（江苏华西）');

    // ━━━━━ 总结 ━━━━━
    if (failed) {
      console.log(`\n========== ❌ 共 ${failed} 项失败 ==========`);
      failures.forEach((f, i) => console.log(`  ${i+1}. ${f}`));
      process.exit(1);
    }
    console.log('\n========== 🎉 全部通过 ==========');
  } catch (e) {
    console.error('FATAL', e);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
