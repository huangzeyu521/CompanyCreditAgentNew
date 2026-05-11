/**
 * E2E V3：清洗 stageToolMap + 阶段内联视图 + 跨项目引导
 *  ① 全局级污染删除：account-manager / committee-agenda / audit-log / tracking / monitoring-report / project-intake 不再出现
 *  ② preparation 阶段无独立工具，但有内联视图（项目组+工作计划+资料清单）
 *  ③ intake / committee / archive / tracking 阶段都有内联视图
 *  ④ 跨项目引导提示存在
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
    await page.goto(BASE + '/pages/project-workbench.html?projectId=P-2026-0421', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 600));

    // ───── ① stageToolMap 已清洗 ─────
    console.log('\n=== ① stageToolMap 全局级污染已删除 ===');
    const map = await page.evaluate(() => MockData.stageToolMap);

    // intake 不应有 project-intake
    const intakeRoutes = (map.intake || []).map(t => t.route);
    ok(!intakeRoutes.includes('project-intake'), 'intake 不再含 project-intake（项目列表）');
    ok(intakeRoutes.includes('conflict-check'), 'intake 保留 conflict-check');
    ok(intakeRoutes.includes('kyc'),            'intake 保留 kyc');

    // preparation 应清空
    const prepRoutes = (map.preparation || []).map(t => t.route);
    ok(!prepRoutes.includes('account-manager'), 'preparation 不再含 account-manager（全局委托池）');
    ok(!prepRoutes.includes('project-intake'),  'preparation 不再含 project-intake');
    ok(prepRoutes.length === 0,                 'preparation 工具集为空（改为内联视图）');

    // committee 不应有 committee-agenda
    const commRoutes = (map.committee || []).map(t => t.route);
    ok(!commRoutes.includes('committee-agenda'), 'committee 不再含 committee-agenda（全局议程汇总）');
    ok(commRoutes.includes('committee-resolution'), 'committee 保留 committee-resolution');

    // archive 不应有 audit-log
    const archRoutes = (map.archive || []).map(t => t.route);
    ok(!archRoutes.includes('audit-log'),  'archive 不再含 audit-log（全局审计）');
    ok(archRoutes.includes('dd-workpaper'), 'archive 保留 dd-workpaper');

    // tracking 不应有 tracking 或 monitoring-report
    const trackRoutes = (map.tracking || []).map(t => t.route);
    ok(!trackRoutes.includes('tracking'),          'tracking 不再含 tracking（全局 21 类监控）');
    ok(!trackRoutes.includes('monitoring-report'), 'tracking 不再含 monitoring-report（全局监管报送）');
    ok(trackRoutes.includes('tracking-stage'),     'tracking 保留 tracking-stage');

    // ───── ② 内联视图：preparation 阶段 ─────
    console.log('\n=== ② preparation 内联视图 ===');
    await page.evaluate(() => selectStage('preparation'));
    await new Promise(r => setTimeout(r, 400));
    let body = await page.$eval('body', b => b.innerText);
    ok(body.includes('项目组') && body.includes('工作计划') && body.includes('资料清单'),
       'preparation 内联展示：项目组 + 工作计划 + 资料清单');
    ok(body.includes('满足《程序指引》第七条'), 'preparation 引用第七条合规校验');
    ok(!body.includes('客户经理协同'), 'preparation 不再显示客户经理协同');

    // ───── ③ 内联视图：intake 阶段 ─────
    console.log('\n=== ③ intake 内联视图 ===');
    await page.evaluate(() => selectStage('intake'));
    await new Promise(r => setTimeout(r, 400));
    body = await page.$eval('body', b => b.innerText);
    ok(body.includes('委托协议') && body.includes('利益冲突筛查'), 'intake 内联展示：委托协议 + 利益冲突筛查');

    // ───── ④ 内联视图：committee 阶段 ─────
    console.log('\n=== ④ committee 内联视图 ===');
    await page.evaluate(() => selectStage('committee'));
    await new Promise(r => setTimeout(r, 400));
    body = await page.$eval('body', b => b.innerText);
    ok(body.includes('本项目议项') && body.includes('评委'), 'committee 内联展示：本项目议项 + 评委');
    ok(body.includes('2/3 通过'), 'committee 显示 2/3 投票规则');
    ok(!body.includes('信评委议程包'), 'committee 不再显示信评委议程包(汇总)');

    // ───── ⑤ 内联视图：archive 阶段 ─────
    console.log('\n=== ⑤ archive 内联视图 ===');
    await page.evaluate(() => selectStage('archive'));
    await new Promise(r => setTimeout(r, 400));
    body = await page.$eval('body', b => b.innerText);
    ok(body.includes('底稿封存') && body.includes('区块链'), 'archive 内联展示：底稿封存清单 + 区块链 hash');
    // 检查阶段工具区不再链接到 audit-log.html（sidebar 不算）
    const archHrefs = await page.$$eval('main a, #step-content a, .grid a', as => as.map(a => a.getAttribute('href') || ''));
    const hasAuditLogLink = archHrefs.some(h => h && h.startsWith('audit-log.html'));
    ok(!hasAuditLogLink, 'archive 阶段工具区不再链接 audit-log.html（已下放到全局视图）');

    // ───── ⑥ 内联视图：tracking 阶段 ─────
    console.log('\n=== ⑥ tracking 内联视图 ===');
    await page.evaluate(() => selectStage('tracking'));
    await new Promise(r => setTimeout(r, 400));
    body = await page.$eval('body', b => b.innerText);
    ok(body.includes('跟踪订阅') && body.includes('21 类'), 'tracking 内联展示：跟踪订阅 + 21 类事项告警');
    ok(body.includes('当前无 21 类重大事项告警'), 'tracking 显示告警状态');

    // ───── ⑦ 跨项目视图引导 ─────
    console.log('\n=== ⑦ 跨项目视图引导提示 ===');
    // 切换到任一阶段都应有该提示
    for (const sid of ['intake', 'preparation', 'fieldwork', 'committee', 'archive', 'tracking']) {
      await page.evaluate(s => selectStage(s), sid);
      await new Promise(r => setTimeout(r, 300));
      const t = await page.$eval('body', b => b.innerText);
      const hasGuide = t.includes('跨项目视图') && t.includes('全公司');
      ok(hasGuide, `${sid} 阶段卡底部有"跨项目视图"引导`);
    }

    if (failed) { console.log(`\n❌ ${failed} 项失败`); process.exit(1); }
    console.log('\n🎉 全部断言通过');
  } finally { await browser.close(); }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
