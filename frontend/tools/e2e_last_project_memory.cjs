/**
 * E2E: 「项目工作台」侧栏菜单跟随 lastProjectId
 *  · 访问 ?projectId=X 时写入 localStorage.ccascea_last_project = X
 *  · 侧栏「项目工作台」菜单 href 动态拼 projectId
 *  · 侧栏 label 附"最近：{subject}"副标识
 *  · project-workbench 无 projectId 时不再静默 fallback 到 projects[0]
 *  · 空状态显式提供「继续上次的 {subject}」CTA
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

  // ━━━━━ Phase 1: 首次访问无 lastProjectId · 应显式空状态而非进 projects[0] ━━━━━
  console.log('\n=== Phase 1: 全新会话（无 lastProjectId）===');
  errs.length = 0;
  await page.goto(BASE + '/pages/project-workbench.html', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 400));
  // 清掉残留 lastProjectId 以模拟全新
  await page.evaluate(() => localStorage.removeItem('ccascea_last_project'));
  await page.reload({ waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 400));
  let txt = await page.$eval('body', b => b.innerText);
  ok(errs.length === 0, '无 JS 错误');
  ok(txt.includes('未指定项目'), '显式空状态');
  ok(txt.includes('焦点工作区'), '空状态说明文案');
  ok(txt.includes('前往我的项目') || txt.includes('选择其它项目'), '空状态 CTA 存在');
  // 不应静默 fallback 到 projects[0]
  ok(!txt.includes('12 阶段工作流'), '空状态下不渲染项目工作台主体');
  // 侧栏「项目工作台」菜单应指向 project-intake（无 lastId）
  let wbHref = await page.$$eval('a', as => as.filter(a => a.textContent.includes('项目工作台') && !a.textContent.includes('返回')).map(a => a.getAttribute('href')));
  ok(wbHref.some(h => h === 'project-intake.html'), '侧栏「项目工作台」无 lastId 时指向 project-intake.html');

  // ━━━━━ Phase 2: 访问任意带 projectId 的页面后，lastProjectId 被写入 ━━━━━
  console.log('\n=== Phase 2: 访问 P-2026-0420 后写入 lastProjectId ===');
  errs.length = 0;
  await page.goto(BASE + '/pages/project-workbench.html?projectId=P-2026-0420', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 400));
  let lastId = await page.evaluate(() => localStorage.getItem('ccascea_last_project'));
  ok(lastId === 'P-2026-0420', `localStorage.ccascea_last_project = ${lastId}`);
  ok(errs.length === 0, '无 JS 错误');

  // ━━━━━ Phase 3: 侧栏「项目工作台」href 包含 lastProjectId + 显示"最近：xxx" ━━━━━
  console.log('\n=== Phase 3: 侧栏「项目工作台」动态 href ===');
  // 切到其它页面，再看侧栏
  await page.goto(BASE + '/pages/dashboard.html', { waitUntil:'networkidle2' }).catch(() => {});
  await page.goto(BASE + '/pages/project-intake.html', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 400));
  // 在侧栏找到 「项目工作台」 a 标签
  const wbInfo = await page.evaluate(() => {
    const links = [...document.querySelectorAll('aside a')].filter(a => /项目工作台/.test(a.textContent));
    return links.map(a => ({
      href: a.getAttribute('href'),
      text: a.textContent.replace(/\s+/g,' ').trim()
    }));
  });
  ok(wbInfo.length > 0, '侧栏含「项目工作台」菜单');
  ok(wbInfo.some(x => x.href === 'project-workbench.html?projectId=P-2026-0420'), '侧栏 href 包含 lastProjectId');
  ok(wbInfo.some(x => x.text.includes('最近：') && x.text.includes('江苏华西')), '侧栏 label 显示"最近：江苏华西…"');

  // ━━━━━ Phase 4: 切换访问其它项目，lastProjectId 更新 ━━━━━
  console.log('\n=== Phase 4: 切换到 P-2026-0415，lastProjectId 跟随更新 ===');
  await page.goto(BASE + '/pages/project-workbench.html?projectId=P-2026-0415', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 400));
  lastId = await page.evaluate(() => localStorage.getItem('ccascea_last_project'));
  ok(lastId === 'P-2026-0415', `lastProjectId 更新为 ${lastId}`);
  // 再切到其它页面看侧栏
  await page.goto(BASE + '/pages/project-intake.html', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 400));
  const wbInfo2 = await page.evaluate(() => {
    const links = [...document.querySelectorAll('aside a')].filter(a => /项目工作台/.test(a.textContent));
    return links.map(a => ({ href: a.getAttribute('href'), text: a.textContent.replace(/\s+/g,' ').trim() }));
  });
  ok(wbInfo2.some(x => x.href === 'project-workbench.html?projectId=P-2026-0415'), '侧栏 href 更新为 0415');
  ok(wbInfo2.some(x => x.text.includes('中国华源')), '侧栏 label 更新为中国华源');

  // ━━━━━ Phase 5: 有 lastProjectId 但访问无 projectId 的工作台 → 显式提供"继续上次"CTA ━━━━━
  console.log('\n=== Phase 5: 有 lastId 但无 URL projectId → 显示"继续上次"CTA ===');
  await page.goto(BASE + '/pages/project-workbench.html', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 400));
  txt = await page.$eval('body', b => b.innerText);
  ok(txt.includes('未指定项目'), '显式空状态');
  ok(txt.includes('继续上次') && txt.includes('中国华源'), '提供「继续上次：中国华源」CTA');
  ok(!txt.includes('12 阶段工作流'), '空状态下不渲染工作台主体（不再 fallback 到 projects[0]）');
  // 「继续上次」按钮 href 正确
  const continueHrefs = await page.$$eval('a[href*="project-workbench.html?projectId="]', as => as.map(a => a.getAttribute('href')));
  ok(continueHrefs.some(h => h === 'project-workbench.html?projectId=P-2026-0415'), '「继续上次」按钮 href 正确');

  // ━━━━━ Phase 6: lastProjectId 在非工作台页面也被记录（kyc/conflict-check 等）━━━━━
  console.log('\n=== Phase 6: 工具页 ?projectId= 也会更新 lastProjectId ===');
  await page.goto(BASE + '/pages/conflict-check.html?projectId=P-2026-0418', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 400));
  lastId = await page.evaluate(() => localStorage.getItem('ccascea_last_project'));
  ok(lastId === 'P-2026-0418', '访问 conflict-check?projectId=0418 后 lastId = 0418');

  // 再到其它页面，侧栏「项目工作台」应跟随到 0418
  await page.goto(BASE + '/pages/reports.html', { waitUntil:'networkidle2' }).catch(() => {});
  await new Promise(r => setTimeout(r, 400));
  const wbInfo3 = await page.evaluate(() => {
    const links = [...document.querySelectorAll('aside a')].filter(a => /项目工作台/.test(a.textContent));
    return links.map(a => ({ href: a.getAttribute('href'), text: a.textContent.replace(/\s+/g,' ').trim() }));
  });
  ok(wbInfo3.some(x => x.href === 'project-workbench.html?projectId=P-2026-0418'), '侧栏 href 跟随 conflict-check 的项目');
  ok(wbInfo3.some(x => x.text.includes('福禧')), '侧栏 label 跟随更新为福禧');

  // ━━━━━ Phase 7: 非法 projectId 不应污染 lastProjectId ━━━━━
  console.log('\n=== Phase 7: 非法 projectId 不污染 lastProjectId ===');
  await page.evaluate(() => localStorage.setItem('ccascea_last_project', 'P-2026-0418')); // 设回有效值
  await page.goto(BASE + '/pages/project-workbench.html?projectId=P-NOT-EXIST', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 400));
  lastId = await page.evaluate(() => localStorage.getItem('ccascea_last_project'));
  ok(lastId === 'P-2026-0418', `非法 projectId 不覆盖 lastId（仍为 ${lastId}）`);

  if (failed) { console.log(`\n❌ ${failed} 项失败`); process.exit(1); }
  console.log('\n🎉 最近项目记忆 全部通过');
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
