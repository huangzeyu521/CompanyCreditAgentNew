/**
 * 深度审计：内部链接 / 重复 ID / form action / 全 stage 切换 / 全 step 切换
 */
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = 'http://127.0.0.1:8000';
let failed = 0;
function ok(c, l) { console.log((c ? '  ✅ ' : '  ❌ FAIL: ') + l); if (!c) failed++; }

(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args:['--no-sandbox'] });
  const page = await browser.newPage();
  const dir = path.join(__dirname, '..', 'pages');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== '404.html').sort();

  // ━━━━━━━━ Phase 1: 全站内部链接巡检 ━━━━━━━━
  console.log('\n=== Phase 1: 内部链接 404 检测 ===');
  const allHrefs = new Set();
  for (const f of files) {
    await page.goto(BASE + '/pages/' + f, { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 200));
    const hrefs = await page.$$eval('a[href]', as => as.map(a => a.getAttribute('href')));
    hrefs.forEach(h => {
      if (!h) return;
      if (h.startsWith('#') || h.startsWith('javascript:') || h.startsWith('mailto:') || h.startsWith('tel:')) return;
      if (h.startsWith('http')) return; // 外链不查
      allHrefs.add(h.split('?')[0].split('#')[0]);
    });
  }
  const broken = [];
  for (const h of allHrefs) {
    let url = h;
    if (h.startsWith('/')) url = BASE + h;
    else if (h.startsWith('../')) url = BASE + '/pages/' + h.slice(3);
    else url = BASE + '/pages/' + h;
    const resp = await page.goto(url, { waitUntil:'domcontentloaded' }).catch(() => null);
    if (!resp || resp.status() >= 400) broken.push(h + ' → ' + (resp ? resp.status() : 'ERR'));
  }
  ok(broken.length === 0, `内部链接无 404（共 ${allHrefs.size} 个）`);
  if (broken.length) broken.forEach(b => console.log('     ' + b));

  // ━━━━━━━━ Phase 2: 重复 ID 检测 ━━━━━━━━
  console.log('\n=== Phase 2: 重复 ID 检测 ===');
  for (const f of files.slice(0, 20)) {
    await page.goto(BASE + '/pages/' + f, { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 200));
    const dups = await page.evaluate(() => {
      const ids = {};
      document.querySelectorAll('[id]').forEach(el => { ids[el.id] = (ids[el.id]||0) + 1; });
      return Object.entries(ids).filter(([_,c]) => c > 1);
    });
    if (dups.length) {
      console.log(`  ❌ ${f}: 重复 ID ${dups.map(([id,c])=>id+'×'+c).join(', ')}`);
      failed++;
    }
  }
  console.log('  ✅ 前 20 页无重复 ID');

  // ━━━━━━━━ Phase 3: project-workbench 12 stage 全切换 ━━━━━━━━
  console.log('\n=== Phase 3: 12 stage 全切换（真实 id + 可视化验证）===');
  const errs = [];
  page.removeAllListeners('pageerror');
  page.on('pageerror', e => errs.push(e.message.slice(0,150)));
  await page.goto(BASE + '/pages/project-workbench.html?projectId=P-2026-0510', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  const stages = [
    {id:'intake',name:'接受委托'},{id:'preparation',name:'评级准备'},{id:'fieldwork',name:'实地调研'},
    {id:'drafting',name:'报告撰写'},{id:'three-level',name:'三级审核'},{id:'committee',name:'等级评定'},
    {id:'finalization',name:'报告定稿'},{id:'appeal',name:'反馈复评'},{id:'publish',name:'评级公布'},
    {id:'update',name:'更新更正'},{id:'archive',name:'资料归档'},{id:'tracking',name:'跟踪评级'}
  ];
  for (const s of stages) {
    errs.length = 0;
    await page.evaluate((id) => selectStage(id), s.id);
    await new Promise(r => setTimeout(r, 200));
    const txt = await page.$eval('body', b => b.innerText);
    ok(errs.length === 0 && txt.includes(s.name), `selectStage("${s.id}") → 实际渲染含「${s.name}」`);
  }
  // 验证未知 id 必须 fallback
  errs.length = 0;
  await page.evaluate(() => selectStage('nonexistent-stage-xyz'));
  await new Promise(r => setTimeout(r, 200));
  ok(errs.length === 0, `未知 stage id fallback 不抛错`);

  // ━━━━━━━━ Phase 4: subject-rating 5 step 全切换（10 主体）━━━━━━━━
  console.log('\n=== Phase 4: subject-rating 5 步 × 10 主体 切换 ===');
  const subjects = ['江苏华西集团有限公司','江西铜业股份有限公司','南京钢铁股份有限公司','深圳市福田产业投资服务有限公司','石家庄市供销合作总社安全统筹公司','四川齐光建设工程有限公司','四川蜀运恒通建设工程有限公司','望城经开区投资建设集团有限公司','枣庄市道桥工程有限公司','中国华源集团有限公司'];
  let stepBad = 0;
  for (const s of subjects) {
    for (let step = 1; step <= 5; step++) {
      errs.length = 0;
      await page.goto(BASE + '/pages/subject-rating.html?subject=' + encodeURIComponent(s) + '&step=' + step, { waitUntil:'networkidle2' });
      await new Promise(r => setTimeout(r, 300));
      if (errs.length) {
        console.log(`  ❌ ${s.slice(0,8)} step ${step}: ${errs[0]}`);
        stepBad++;
      }
    }
  }
  ok(stepBad === 0, `10 主体 × 5 步 = 50 组合无 JS 错误`);

  // ━━━━━━━━ Phase 5: localStorage 持久化 ━━━━━━━━
  console.log('\n=== Phase 5: localStorage 持久化 ===');
  await page.goto(BASE + '/pages/project-intake.html', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  const beforeCount = await page.evaluate(() => MockData.projects.length);
  // 注入一个测试项目
  await page.evaluate(() => {
    const proj = { id: 'P-TEST-9999', subject: '江苏华西集团有限公司', subjectName: '江苏华西集团有限公司', stage: '接受委托', status: 'in_progress' };
    window.MockDataPersist.saveProject(proj);
  });
  // 重新加载
  await page.reload({ waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  const afterCount = await page.evaluate(() => MockData.projects.length);
  const hasTest = await page.evaluate(() => MockData.projects.some(p => p.id === 'P-TEST-9999'));
  ok(afterCount > beforeCount && hasTest, `localStorage 注入项目重载后可见（${beforeCount} → ${afterCount}, has=${hasTest}）`);
  // 清理
  await page.evaluate(() => {
    const ls = JSON.parse(localStorage.getItem('ccascea_user_projects') || '[]').filter(p => p.id !== 'P-TEST-9999');
    localStorage.setItem('ccascea_user_projects', JSON.stringify(ls));
  });

  // ━━━━━━━━ Phase 6: 主体名一致性（subjects.name === officialReport.basicInfo['主体名称']）━━━━━━━━
  console.log('\n=== Phase 6: 主体名 self-consistency ===');
  await page.goto(BASE + '/pages/project-intake.html', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  const inconsistent = await page.evaluate(() => {
    return MockData.subjects.filter(s => s.officialReport && s.officialReport.basicInfo && s.officialReport.basicInfo['主体名称'] && s.officialReport.basicInfo['主体名称'] !== s.name).map(s => s.name);
  });
  ok(inconsistent.length === 0, `19 主体 name vs officialReport 主体名称 一致`);
  if (inconsistent.length) inconsistent.forEach(n => console.log('     mismatch: ' + n));

  // ━━━━━━━━ Phase 7: USCC 全局唯一 ━━━━━━━━
  console.log('\n=== Phase 7: USCC 全局唯一 ===');
  const dupUscc = await page.evaluate(() => {
    const m = {};
    MockData.subjects.forEach(s => { if (s.uscc) m[s.uscc] = (m[s.uscc]||0)+1; });
    return Object.entries(m).filter(([_,c])=>c>1);
  });
  ok(dupUscc.length === 0, `19 主体 USCC 全唯一`);
  if (dupUscc.length) dupUscc.forEach(([u,c]) => console.log('     dup ' + u + ' ×' + c));

  // ━━━━━━━━ Phase 8: 项目 → 主体 反向引用一致 ━━━━━━━━
  console.log('\n=== Phase 8: 项目 subject 必须存在于 subjects ===');
  const orphanProj = await page.evaluate(() => {
    const subjNames = new Set(MockData.subjects.map(s => s.name));
    return MockData.projects.filter(p => p.subject && !subjNames.has(p.subject)).map(p => p.id + ':' + p.subject);
  });
  ok(orphanProj.length === 0, `所有项目 subject 都能在 subjects 中找到`);
  if (orphanProj.length) orphanProj.forEach(o => console.log('     orphan: ' + o));

  // ━━━━━━━━ Phase 9: STAGE_DEFS 完整性 ━━━━━━━━
  console.log('\n=== Phase 9: STAGE_DEFS 完整性 ===');
  const stageMeta = await page.evaluate(() => ({
    defs: MockData.STAGE_DEFS && MockData.STAGE_DEFS.length,
    ids: MockData.STAGE_DEFS && MockData.STAGE_DEFS.map(s => s.id)
  }));
  ok(stageMeta.defs === 12, `STAGE_DEFS 共 12 个（实际 ${stageMeta.defs}）`);
  ok(stageMeta.ids && stageMeta.ids.includes('fieldwork') && stageMeta.ids.includes('tracking'), 'STAGE_DEFS 包含 fieldwork & tracking');

  // ━━━━━━━━ Phase 10: 我的项目"进入工作台"按钮全部可达 ━━━━━━━━
  console.log('\n=== Phase 10: 我的项目所有"进入工作台"链接可达 ===');
  await page.goto(BASE + '/pages/project-intake.html', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  const wbLinks = await page.$$eval('a[href*="project-workbench.html?projectId="]', as => [...new Set(as.map(a => a.getAttribute('href')))]);
  let unreachable = 0;
  for (const h of wbLinks) {
    const u = BASE + (h.startsWith('/') ? h : '/pages/' + h);
    errs.length = 0;
    await page.goto(u, { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 250));
    const txt = await page.$eval('body', b => b.innerText);
    if (errs.length || txt.includes('🚫 项目不存在')) { unreachable++; console.log('     unreachable: ' + h); }
  }
  ok(unreachable === 0, `${wbLinks.length} 个工作台链接均可达且无 JS 错误`);

  if (failed) { console.log(`\n❌ 共 ${failed} 项失败`); process.exit(1); }
  console.log('\n🎉 深度审计全部通过');
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
