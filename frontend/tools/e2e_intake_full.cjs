/**
 * 全链路 E2E：新建项目 → 表格显示 → 跨页导航
 * 覆盖 3 个真实场景 + 表格 polymorphic 渲染 + localStorage 持久化 + 跨页导航
 */
const puppeteer = require('puppeteer-core');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = 'http://127.0.0.1:8000';

let failed = 0;
function ok(cond, label) {
  console.log((cond ? '  ✅ ' : '  ❌ FAIL: ') + label);
  if (!cond) failed++;
}

async function selectChange(page, sel, val) {
  await page.evaluate((s, v) => {
    const el = document.querySelector(s);
    el.value = v;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, sel, val);
}

async function createProject(page, scenario) {
  await page.evaluate(() => openIntakeModal());
  await page.waitForSelector('#if-kind', { timeout: 8000 });

  await selectChange(page, '#if-kind', scenario.kind);
  await new Promise(r => setTimeout(r, 200));
  await page.type('#if-subject', scenario.subject);
  if (scenario.issuer) await page.type('#if-issuer', scenario.issuer);
  if (scenario.client) await page.type('#if-client', scenario.client);
  await page.$eval('#if-due', (el, v) => el.value = v, scenario.due);
  await selectChange(page, '#if-industry', scenario.industry);
  await selectChange(page, '#if-market', scenario.market);
  await selectChange(page, '#if-business', scenario.business);
  if (scenario.toggleSubject) await page.click('#if-do-subject');
  if (scenario.doBond) {
    await page.click('#if-do-bond');
    await new Promise(r => setTimeout(r, 200));
    await selectChange(page, '#if-bond-type', scenario.bondType);
    await new Promise(r => setTimeout(r, 200));
    if (scenario.amount) await page.type('#if-amount', scenario.amount);
    if (scenario.tenor) await page.type('#if-tenor', scenario.tenor);
    if (scenario.coupon) await page.type('#if-coupon', scenario.coupon);
    if (scenario.use) await page.type('#if-use', scenario.use);
    if (scenario.guarantee) await selectChange(page, '#if-guarantee', scenario.guarantee);
    if (scenario.guarantor) await page.type('#if-guarantor', scenario.guarantor);
    if (scenario.guarantorGrade) await selectChange(page, '#if-guarantor-grade', scenario.guarantorGrade);
    if (scenario.greenCat) {
      await selectChange(page, '#if-green-cat', scenario.greenCat);
      await selectChange(page, '#if-green-assurer', scenario.greenAssurer);
    }
  }
  // 方法学
  if (scenario.methods) {
    await page.evaluate((codes) => {
      codes.forEach(c => {
        const m = document.querySelector(`.if-method[data-code="${c}"]`);
        if (m && !m.checked) m.click();
      });
    }, scenario.methods);
  }
  // 项目组扩展（绿债场景需 4 人）
  if (scenario.extraTeam) {
    await page.evaluate((names) => {
      names.forEach(n => {
        const m = document.querySelector(`.if-team[data-name="${n}"]`);
        if (m && !m.checked) m.click();
      });
    }, scenario.extraTeam);
  }
  await page.click('button[onclick="submitIntakeForm()"]');
  await new Promise(r => setTimeout(r, 700));
  const errVisible = await page.$eval('#if-error', el => !el.classList.contains('hidden')).catch(() => false);
  return !errVisible;
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: 'new',
    args: ['--no-sandbox']
  });
  try {
    const page = await browser.newPage();
    page.on('pageerror', err => console.error('  ⚠ PAGE ERROR:', err.message));

    // 清空 localStorage 起干净状态
    await page.goto(BASE + '/pages/project-intake.html', { waitUntil: 'networkidle2' });
    await page.evaluate(() => { try { localStorage.clear(); } catch(_){} });

    // 重新进入页面
    await page.goto(BASE + '/pages/project-intake.html', { waitUntil: 'networkidle2' });
    console.log('页面已加载');

    // === 场景 1：西安航空城（城投+绿债+双评级）===
    console.log('\n=== ① 创建西安航空城绿色企业债 ===');
    const ok1 = await createProject(page, {
      kind: 'lgfv',
      subject: '西安航空城建设发展(集团)有限公司2024年面向专业投资者公开发行绿色企业债券(第一期)',
      issuer: '西安航空城建设发展(集团)有限公司',
      client: '西安航空城建设发展(集团)有限公司',
      due: '2024-01-03',
      industry: 'LGFV-PARK',
      market: 'EXG-SH',
      business: 'first',
      doBond: true,
      bondType: 'LGFV-ENT-GREEN',
      amount: '1.60', tenor: '7', coupon: '3.85',
      use: '1.008亿元用于西安航空基地节能降碳项目；0.592亿元用于补充流动资金',
      guarantee: 'FULL-GAR', guarantor: '陕西信用增进投资股份有限公司', guarantorGrade: 'AAA',
      greenCat: '2.1', greenAssurer: 'CCXI',
      methods: ['FERC-CTOY-V05-202207', 'FERC-WBZC-V01-202204', 'FERC-GREEN-V03-202401'],
      extraTeam: ['尹丽丽', '李羽歌']
    });
    ok(ok1, '西安航空城项目创建成功');

    // === 表格渲染检查 ===
    await new Promise(r => setTimeout(r, 500));
    const firstRow = await page.evaluate(() => {
      const tr = document.querySelector('table tbody tr');
      return Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim());
    });
    console.log('  · 第一行：', firstRow.slice(0, 6).join(' | '));
    ok(!firstRow.some(c => c.includes('undefined')), '表格无 undefined 列');
    ok(firstRow[2].includes('产业园') || firstRow[2].includes('城投') || firstRow[2].includes('LGFV'), '行业列显示中文（不是裸代码）');
    ok(firstRow[3].includes('主体评级') && firstRow[3].includes('债项评级'), '评级类型显示"主体评级 + 债项评级"');
    ok(firstRow[4].includes('绿色企业债') || firstRow[4].includes('绿色'), '债项列显示"绿色企业债券"');
    ok(/\d+\s*人/.test(firstRow[5]), '项目组列显示人数');

    // === 场景 2：内蒙古地方政府债 ===
    console.log('\n=== ② 创建内蒙古地方政府再融资一般债券 ===');
    await new Promise(r => setTimeout(r, 600));
    const ok2 = await createProject(page, {
      kind: 'gov',
      subject: '2026 年内蒙古自治区政府再融资一般债券（二期）',
      issuer: '内蒙古自治区人民政府',
      client: '内蒙古自治区财政厅',
      due: '2026-04-14',
      industry: 'GOV-PROV',
      market: 'IBM',
      business: 'first',
      toggleSubject: true,  // 取消主体勾选
      doBond: true,
      bondType: 'GOV-GEN-RE',
      amount: '50', tenor: '7', coupon: '2.85',
      use: '偿还内蒙古自治区到期一般债券本金',
      guarantee: 'NONE',
      methods: ['FERC-LGOV-V04-202309']
    });
    ok(ok2, '内蒙古政府债项目创建成功');

    // === 场景 3：南京钢铁主体评级 ===
    console.log('\n=== ③ 创建南京钢铁主体评级 ===');
    await new Promise(r => setTimeout(r, 600));
    const ok3 = await createProject(page, {
      kind: 'corp',
      subject: '南京钢铁联合有限公司',
      client: '南京钢铁联合有限公司',
      due: '2026-06-30',
      industry: 'C31',
      market: 'EXG-SH',
      business: 'continuous',
      methods: ['FERC-STEEL-V03-202311']
    });
    ok(ok3, '南京钢铁项目创建成功');

    // === localStorage 持久化检查 ===
    const saved = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('ccascea_user_projects') || '[]').length
    );
    console.log('  · localStorage 已保存项目数：', saved);
    ok(saved === 3, 'localStorage 持久化 3 个项目');

    // === 跨页导航：刷新 + 跳到 subject-rating ===
    console.log('\n=== ④ 跨页导航测试：西安航空城 → subject-rating ===');
    // 找到西安航空城那行的"进入"链接
    const xianHref = await page.$$eval('table tbody tr', trs => {
      for (const tr of trs) {
        const txt = tr.innerText;
        if (txt.includes('西安航空城')) {
          const a = tr.querySelector('a');
          return a ? a.getAttribute('href') : null;
        }
      }
      return null;
    });
    console.log('  · 西安航空城链接：', xianHref);
    ok(!!xianHref, '西安航空城行有"进入"链接');

    await page.goto(BASE + '/pages/' + xianHref, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 800));

    // 验证 subject-rating 页面真的加载了西安航空城（通过下拉框选中项）
    const dropdownSelected = await page.evaluate(() => {
      const sel = document.querySelector('select[onchange*="switchSubject"], select#subjectSelector, select');
      if (sel && sel.options && sel.selectedIndex >= 0) {
        return sel.options[sel.selectedIndex].textContent;
      }
      return null;
    });
    // 备份方案：扫描页面里是否出现西安航空城字样
    const bodyText = await page.$eval('body', b => b.innerText);
    console.log('  · subject-rating 下拉选中：', (dropdownSelected || '').slice(0, 80));
    const onPageHasXian = bodyText.includes('西安航空城');
    const onPageHasNanjing = /南京钢铁/.test(bodyText) && !bodyText.includes('西安航空城');
    ok(onPageHasXian, 'subject-rating 页面正确加载西安航空城');
    ok(!onPageHasNanjing, '没有错误回退到南京钢铁');

    // === 刷新页面后数据仍在（localStorage 持久化）===
    console.log('\n=== ⑤ 刷新后数据持久化测试 ===');
    await page.goto(BASE + '/pages/project-intake.html', { waitUntil: 'networkidle2' });
    const afterReload = await page.$$eval('table tbody tr', trs => trs.length);
    console.log('  · 刷新后项目清单行数：', afterReload);
    ok(afterReload >= 3 + 5, '刷新后用户新建的 3 项目仍在（不被旧 mock 数据覆盖）');

    if (failed) {
      console.log(`\n❌ ${failed} 项失败`);
      process.exit(1);
    } else {
      console.log('\n🎉 全部断言通过');
    }
  } catch (e) {
    console.error('FATAL:', e);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
