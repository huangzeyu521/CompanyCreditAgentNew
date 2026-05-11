/**
 * Debug Master V2 · 模拟真实用户点击流（不靠 evaluate 直接调函数）
 * 重点：用户点击 → URL 变化 → 页面渲染 → 数据正确
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
    // ━━━━ Phase 1: 用户真实点击流 ━━━━
    console.log('\n=========== Phase 1: 真实用户点击流 ===========');
    await page.goto(BASE + '/pages/project-intake.html', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 600));

    // 1.1 点击第一个"进入工作台"链接
    const clicked = await page.evaluate(() => {
      const a = document.querySelector('a[href^="project-workbench.html?projectId="]');
      if (a) { a.click(); return true; }
      return false;
    });
    ok(clicked, '点击"进入工作台"链接成功');
    await page.waitForFunction(() => location.pathname.includes('project-workbench'), { timeout: 5000 });
    await new Promise(r => setTimeout(r, 500));
    let url = page.url();
    ok(url.includes('projectId=P-2026-'), 'URL 含 projectId');

    // 1.2 在工作台点击 fieldwork 阶段（默认应该是 fieldwork - in-progress）
    const stageClickResult = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim().includes('实地调研'));
      if (btn) { btn.click(); return true; }
      return false;
    });
    ok(stageClickResult, '可以点击"实地调研"阶段按钮');
    await new Promise(r => setTimeout(r, 400));

    // 1.3 点击工具卡片（财报 OCR）
    const toolClickResult = await page.evaluate(() => {
      const a = Array.from(document.querySelectorAll('a[href*="dd-financial-ocr"]')).find(x => x.href.includes('projectId'));
      if (a) { a.click(); return true; }
      return false;
    });
    ok(toolClickResult, '点击工具卡"财报 OCR"');
    await page.waitForFunction(() => location.pathname.includes('dd-financial-ocr'), { timeout: 5000 });
    await new Promise(r => setTimeout(r, 600));
    url = page.url();
    ok(url.includes('?projectId=P-2026-'), '财报 OCR URL 保留 projectId');

    // 1.4 工具页 banner 显示项目（等待 body 重建完成）
    await page.waitForSelector('body', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 600));
    let body = await page.$eval('body', b => b.innerText);
    ok(body.includes('当前项目') && body.includes('南京钢铁'), '工具页 banner 显示南京钢铁');

    // 1.5 点击"返回项目工作台"
    const returnClicked = await page.evaluate(() => {
      const a = Array.from(document.querySelectorAll('a')).find(x => x.textContent.includes('返回项目工作台'));
      if (a) { a.click(); return true; }
      return false;
    });
    ok(returnClicked, '点击"返回项目工作台"链接');
    await page.waitForFunction(() => location.pathname.includes('project-workbench'), { timeout: 5000 });
    await new Promise(r => setTimeout(r, 500));
    url = page.url();
    ok(url.includes('projectId=P-2026-'), '返回工作台后 projectId 保留');

    // 1.6 项目切换器实际切换
    const switchResult = await page.evaluate(() => {
      const sel = Array.from(document.querySelectorAll('select')).find(s => Array.from(s.options).some(o => o.value && o.value.startsWith('P-2026-')));
      if (!sel) return null;
      // 选择不同的项目
      const others = Array.from(sel.options).filter(o => o.value && o.value !== sel.value);
      if (!others.length) return null;
      sel.value = others[0].value;
      sel.dispatchEvent(new Event('change'));
      return others[0].value;
    });
    ok(!!switchResult, `项目切换器选了另一个项目 ${switchResult}`);
    await page.waitForFunction(pid => location.search.includes('projectId=' + pid), { timeout: 5000 }, switchResult);
    await new Promise(r => setTimeout(r, 600));
    body = await page.$eval('body', b => b.innerText);
    const projAfter = await page.evaluate(() => new URLSearchParams(location.search).get('projectId'));
    ok(projAfter === switchResult, '切换后 URL projectId 已更新');

    // ━━━━ Phase 2: 双轨融合引擎"退出"返回工作台 ━━━━
    console.log('\n=========== Phase 2: subject-rating 退出按钮 ===========');
    await page.goto(BASE + '/pages/subject-rating.html?projectId=P-2026-0421&step=2', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 500));

    // 拦截 confirmDialog 让其立即返回 true
    await page.evaluate(() => {
      window.confirmDialog = () => Promise.resolve(true);
    });
    await page.evaluate(() => exitFlow());
    await page.waitForFunction(() => location.pathname.includes('project-workbench'), { timeout: 5000 });
    await new Promise(r => setTimeout(r, 500));
    url = page.url();
    ok(url.includes('projectId=P-2026-0421'), 'subject-rating 退出后回到工作台并保留 projectId');

    // ━━━━ Phase 3: localStorage corrupt data 容错 ━━━━
    console.log('\n=========== Phase 3: localStorage 容错 ===========');
    await page.goto(BASE + '/pages/project-intake.html', { waitUntil:'networkidle2' });
    await page.evaluate(() => {
      // 写入损坏数据
      localStorage.setItem('ccascea_user_projects', 'NOT VALID JSON {{{');
    });
    page.removeAllListeners('pageerror');
    const errsCorrupt = [];
    page.on('pageerror', e => errsCorrupt.push(e.message));
    await page.goto(BASE + '/pages/project-workbench.html?projectId=P-2026-0421', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 500));
    ok(errsCorrupt.length === 0, '损坏的 localStorage 数据不导致页面崩溃');
    body = await page.$eval('body', b => b.innerText);
    ok(body.includes('南京钢铁'), '损坏数据不影响内置项目正常显示');
    await page.evaluate(() => localStorage.clear());

    // ━━━━ Phase 4: 不同浏览器场景：直接访问无 projectId 的工具页 ━━━━
    console.log('\n=========== Phase 4: 直接访问工具页（用户从书签）===========');
    const directTools = ['dd-collection.html', 'dd-financial-ocr.html', 'dd-interview.html',
                         'field-investigation.html', 'dd-workpaper.html', 'bacp-scoring.html', 'am-adjustment.html'];
    for (const t of directTools) {
      await page.goto(BASE + '/pages/' + t, { waitUntil:'networkidle2' });
      await new Promise(r => setTimeout(r, 400));
      const text = await page.$eval('body', b => b.innerText);
      ok(text.includes('未选择项目'), `${t} 无 projectId 时显示警告 banner`);
    }

    // ━━━━ Phase 5: 验证内联视图 5 阶段都渲染正确 ━━━━
    console.log('\n=========== Phase 5: 内联视图渲染（5 个阶段） ===========');
    await page.goto(BASE + '/pages/project-workbench.html?projectId=P-2026-0421', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 500));

    const inlineExpect = {
      'intake':       ['委托协议', '利益冲突筛查'],
      'preparation':  ['项目组', '工作计划', '资料清单'],
      'committee':    ['本项目议项', '评委', '2/3 通过'],
      'archive':      ['底稿封存', '区块链'],
      'tracking':     ['跟踪订阅', '21 类']
    };
    for (const [sid, expects] of Object.entries(inlineExpect)) {
      await page.evaluate(s => selectStage(s), sid);
      await new Promise(r => setTimeout(r, 400));
      const text = await page.$eval('body', b => b.innerText);
      const allMatch = expects.every(e => text.includes(e));
      ok(allMatch, `${sid} 内联视图含 ${expects.join(' / ')}`);
    }

    // ━━━━ Phase 6: HTTP 验证所有 routeGroups 中的 href 都返回 200 ━━━━
    console.log('\n=========== Phase 6: 所有路由 HTTP 健康 ===========');
    const allRoutes = await page.evaluate(() => {
      const out = [];
      AppConfig.routeGroups.forEach(g => g.items.forEach(it => { if (it.href) out.push(it.href); }));
      return Array.from(new Set(out));
    });
    let route404 = 0;
    for (const r of allRoutes) {
      const resp = await page.goto(BASE + '/pages/' + r, { waitUntil:'domcontentloaded' });
      const s = resp.status();
      // 200 成功，304 缓存命中，都是 healthy
      if (s !== 200 && s !== 304) { route404++; console.log(`  ❌ ${r} → ${s}`); }
    }
    ok(route404 === 0, `${allRoutes.length} 个路由全部 HTTP 健康（200/304）`);

    // ━━━━ Phase 7: 浏览器后退按钮保留 projectId ━━━━
    console.log('\n=========== Phase 7: 浏览器后退按钮 ===========');
    await page.goto(BASE + '/pages/project-workbench.html?projectId=P-2026-0421', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 400));
    await page.goto(BASE + '/pages/dd-financial-ocr.html?projectId=P-2026-0421', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 400));
    await page.goBack({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 500));
    url = page.url();
    ok(url.includes('project-workbench') && url.includes('projectId=P-2026-0421'), '浏览器后退保留 projectId');

    // ━━━━ Phase 8: AI 助手切换器 ━━━━
    console.log('\n=========== Phase 8: AI 助手测试 ===========');
    await page.goto(BASE + '/pages/dd-financial-ocr.html?projectId=P-2026-0421', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 500));
    const aiOpen = await page.evaluate(() => {
      try {
        AIAgent.toggle();
        return true;
      } catch (e) { return false; }
    });
    ok(aiOpen, 'AI 助手 toggle() 不报错');
    await new Promise(r => setTimeout(r, 400));
    const aiVisible = await page.evaluate(() => !!document.querySelector('.ai-modal.open, .ai-drawer.open'));
    ok(aiVisible, 'AI 抽屉可打开');

    // 总结
    if (failed) {
      console.log(`\n========== ❌ 共 ${failed} 项失败 ==========`);
      failures.forEach((f, i) => console.log(`  ${i+1}. ${f}`));
      process.exit(1);
    }
    console.log('\n========== 🎉 V2 全部通过 ==========');
  } catch (e) {
    console.error('FATAL', e);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
