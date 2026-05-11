/**
 * E2E V2：完整 doublecheck 验证（含 5 项 fix）
 *  ① 项目工作台 12 阶段
 *  ② 7 个工具页都有项目 banner
 *  ③ subject-rating 支持 ?projectId= 派生主体
 *  ④ localStorage 项目能进工作台（不崩）
 *  ⑤ 用户新建项目带 stages 字段
 */
const puppeteer = require('puppeteer-core');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = 'http://127.0.0.1:8000';

let failed = 0;
function ok(c, l) { console.log((c ? '  ✅ ' : '  ❌ FAIL: ') + l); if (!c) failed++; }

const TOOL_PAGES = [
  'dd-collection.html',
  'dd-financial-ocr.html',
  'dd-interview.html',
  'field-investigation.html',
  'dd-workpaper.html',
  'bacp-scoring.html',
  'am-adjustment.html'
];

(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args:['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    page.on('pageerror', e => console.error('  ⚠ PAGE ERROR:', e.message));

    // ① 项目工作台基础渲染
    console.log('\n=== ① 项目工作台（南京钢铁）===');
    await page.goto(BASE + '/pages/project-workbench.html?projectId=P-2026-0421', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    let body = await page.$eval('body', b => b.innerText);
    ok(body.includes('南京钢铁联合有限公司'), '工作台显示南京钢铁');
    ok(body.includes('12 阶段工作流'), '12 阶段时间线区块');
    const stagesData = await page.evaluate(() => {
      const p = MockData.projects.find(x => x.id === 'P-2026-0421');
      return { hasStages: !!p && Array.isArray(p.stages) && p.stages.length === 12,
               hasTimeline: !!p && Array.isArray(p.timeline),
               currentStage: p && p.currentStage };
    });
    ok(stagesData.hasStages, '南京钢铁有完整 12 阶段');
    ok(stagesData.hasTimeline, '南京钢铁有 timeline');
    ok(!!stagesData.currentStage, '南京钢铁有 currentStage');

    // ② 7 个工具页都有 banner
    console.log('\n=== ② 7 个工具页都有项目 banner ===');
    for (const tp of TOOL_PAGES) {
      await page.goto(BASE + '/pages/' + tp + '?projectId=P-2026-0421', { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 500));
      const t = await page.$eval('body', b => b.innerText);
      const hasBanner = t.includes('当前项目') && t.includes('返回项目工作台');
      ok(hasBanner, `${tp} 显示项目 banner`);
    }

    // ③ subject-rating 接受 ?projectId=
    console.log('\n=== ③ subject-rating 支持 ?projectId= 派生主体 ===');
    await page.goto(BASE + '/pages/subject-rating.html?projectId=P-2026-0420&step=2', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 800));
    body = await page.$eval('body', b => b.innerText);
    ok(body.includes('江苏华西集团'), 'projectId=P-2026-0420 → 显示江苏华西（不再回退到南京钢铁）');

    // ④ 工具页不带 projectId 显示警告
    console.log('\n=== ④ 工具页不带 projectId 显示警告 ===');
    for (const tp of TOOL_PAGES.slice(0, 3)) {
      await page.goto(BASE + '/pages/' + tp, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 400));
      const t = await page.$eval('body', b => b.innerText);
      ok(t.includes('未选择项目'), `${tp} 不带 projectId 显示警告`);
    }

    // ⑤ localStorage 持久化项目正确加载
    console.log('\n=== ⑤ localStorage 用户项目 + 进入工作台 ===');
    await page.goto(BASE + '/pages/project-intake.html', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 400));
    // 模拟用户在 localStorage 写入项目
    await page.evaluate(() => {
      const fakeProject = {
        id: 'P-2026-9999',
        docId: '远东信评（2026）9999 号',
        subject: 'E2E 测试主体',
        kind: '工商企业',
        industry: 'C31',
        market: 'EXG-SH',
        ratingTypes: ['主体评级'],
        team: [{ name:'王明远', role:'组长', years:10 }, { name:'李雨欣', role:'分析师', years:4 }],
        status: '已立项',
        createdAt: '2026-05-04 10:30',
        plannedEnd: '2026-08-30'
      };
      localStorage.setItem('ccascea_user_projects', JSON.stringify([fakeProject]));
    });
    // 重新载入触发 hydration
    await page.goto(BASE + '/pages/project-workbench.html?projectId=P-2026-9999', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    body = await page.$eval('body', b => b.innerText);
    ok(body.includes('E2E 测试主体'), '用户项目能渲染主体名');
    ok(body.includes('12 阶段工作流'), '用户项目能渲染 12 阶段（hydration 自动补 stages）');
    const userStages = await page.evaluate(() => {
      const p = MockData.projects.find(x => x.id === 'P-2026-9999');
      return p && p.stages && p.stages.length;
    });
    ok(userStages === 12, `用户项目自动补 12 阶段（实际 ${userStages}）`);

    // 清理
    await page.evaluate(() => localStorage.removeItem('ccascea_user_projects'));

    if (failed) { console.log(`\n❌ ${failed} 项失败`); process.exit(1); }
    console.log('\n🎉 全部断言通过');
  } finally { await browser.close(); }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
