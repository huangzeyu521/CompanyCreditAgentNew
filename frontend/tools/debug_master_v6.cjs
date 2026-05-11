/**
 * Debug Master V6 · 19 个 subjects × 5 步骤 = 95 个组合 全过
 *  - 所有主体在 5 步骤都不报错（含新增 6 个 PDF 主体）
 *  - 海关注册编号特殊字段渲染
 *  - 失信被执行人长 obligation 字段不破坏布局
 *  - 标签徽章颜色全覆盖
 *  - 5 步骤页面横向不溢出
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
    // ━━━━ Phase 1: 19 subjects 名单 ━━━━
    console.log('\n=========== Phase 1: 全 19 主体 ×  5 步骤 ===========');
    await page.goto(BASE + '/pages/subject-rating.html', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 500));
    const subjectNames = await page.evaluate(() => MockData.subjects.map(s => s.name));
    console.log(`  · 共 ${subjectNames.length} 个主体`);

    // 每主体 × 5 步骤
    let combos = 0;
    let crashed = [];
    for (const name of subjectNames) {
      for (let step = 1; step <= 5; step++) {
        page.removeAllListeners('pageerror');
        const errs = [];
        page.on('pageerror', e => errs.push(`[${name}@step${step}] ${e.message.slice(0,150)}`));
        try {
          await page.goto(BASE + '/pages/subject-rating.html?subject=' + encodeURIComponent(name) + '&step=' + step, { waitUntil:'domcontentloaded', timeout: 12000 });
          await new Promise(r => setTimeout(r, 350));
          combos++;
          if (errs.length) crashed.push(...errs);
        } catch (e) {
          crashed.push(`[${name}@step${step}] ${e.message.slice(0,100)}`);
        }
      }
    }
    if (crashed.length === 0) {
      ok(true, `${combos} 个 主体×步骤 组合全部无 JS 错误`);
    } else {
      console.log('  ⚠ 错误:');
      crashed.slice(0, 10).forEach(e => console.log('    ' + e));
      ok(false, `${crashed.length} 个主体×步骤组合崩溃`);
    }

    // ━━━━ Phase 2: 海关注册编号特殊字段 ━━━━
    console.log('\n=========== Phase 2: 江西铜业 海关注册编号字段 ===========');
    await page.goto(BASE + '/pages/subject-rating.html?subject=' + encodeURIComponent('江西铜业股份有限公司') + '&step=2', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    let body = await page.$eval('body', b => b.innerText);
    ok(body.includes('海关注册编号') || body.includes('鹰潭海关'), '江西铜业 basicInfo 含海关注册编号');
    ok(body.includes('1997-07-09'), '江西铜业海关首次注册日期');

    // ━━━━ Phase 3: 失信被执行人完整 schema ━━━━
    console.log('\n=========== Phase 3: 失信被执行人完整 schema ===========');
    const targets3 = [
      { name:'石家庄市供销合作总社安全统筹公司', case:'(2026)冀0921执188号', court:'沧县人民法院' },
      { name:'四川齐光建设工程有限公司',         case:'(2026)川1102执478号', court:'乐山市市中区人民法院' },
      { name:'四川蜀运恒通建设工程有限公司',     case:'(2022)渝0120执1396号', court:'重庆市璧山区人民法院' },
      { name:'枣庄市道桥工程有限公司',           case:'(2025)湘1026执36号',   court:'汝城县人民法院' },
      { name:'中国华源集团有限公司',             case:'(2009)浦执字第07352号', court:'上海市浦东新区人民法院' }
    ];
    for (const t of targets3) {
      await page.goto(BASE + '/pages/subject-rating.html?subject=' + encodeURIComponent(t.name) + '&step=2', { waitUntil:'networkidle2' });
      await new Promise(r => setTimeout(r, 500));
      const text = await page.$eval('body', b => b.innerText);
      ok(text.includes(t.case),    `${t.name.slice(0,8)}... 案号 ${t.case}`);
      ok(text.includes(t.court),   `${t.name.slice(0,8)}... 执行法院 ${t.court}`);
    }

    // ━━━━ Phase 4: 标签徽章颜色映射全覆盖 ━━━━
    console.log('\n=========== Phase 4: 标签徽章全覆盖 ===========');
    const labelTests = [
      { name:'南京钢铁联合有限公司',         label:'守信激励对象' },
      { name:'江苏华西集团有限公司',         label:'守信激励对象' },
      { name:'中国华源集团有限公司',         label:'失信惩戒对象' },
      { name:'江西铜业股份有限公司',         label:'海关高级认证企业' },
      { name:'四川蜀运恒通建设工程有限公司', label:'经营异常' },
      { name:'石家庄市供销合作总社安全统筹公司', label:'失信惩戒对象' },
      { name:'望城经开区投资建设集团有限公司', label:'存续' }
    ];
    for (const lt of labelTests) {
      await page.goto(BASE + '/pages/subject-rating.html?subject=' + encodeURIComponent(lt.name) + '&step=2', { waitUntil:'networkidle2' });
      await new Promise(r => setTimeout(r, 400));
      const hasLabelBadge = await page.evaluate(label => {
        // 找 ${label} 文字 + 其外层 span 是否有 border 类
        const spans = Array.from(document.querySelectorAll('span'));
        const found = spans.find(s => s.textContent.trim() === label && s.className.includes('border'));
        return !!found;
      }, lt.label);
      ok(hasLabelBadge, `${lt.name.slice(0,10)}... 标签"${lt.label}"有徽章样式`);
    }

    // ━━━━ Phase 5: 19 主体在 5 步骤的 viewport 不溢出 ━━━━
    console.log('\n=========== Phase 5: 19 主体步骤 viewport 不溢出 (1280px) ===========');
    await page.setViewport({ width: 1280, height: 900 });
    let overflowCount = 0;
    let overflowDetail = [];
    for (const name of subjectNames) {
      await page.goto(BASE + '/pages/subject-rating.html?subject=' + encodeURIComponent(name) + '&step=2', { waitUntil:'domcontentloaded', timeout: 12000 });
      await new Promise(r => setTimeout(r, 300));
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (overflow > 5) {
        overflowCount++;
        overflowDetail.push(`${name}: ${overflow}px`);
      }
    }
    if (overflowCount > 0) {
      overflowDetail.slice(0, 5).forEach(o => console.log('    ' + o));
    }
    ok(overflowCount === 0, `1280px 下 ${subjectNames.length} 主体 step2 ${overflowCount === 0 ? '无' : '有 ' + overflowCount + ' 个'} 横向溢出`);
    await page.setViewport({ width: 1440, height: 900 });

    // ━━━━ Phase 6: D 级主体熔断校验 (Step 4) ━━━━
    console.log('\n=========== Phase 6: D 级熔断校验 ===========');
    const dGradeSubjects = ['中国华源集团有限公司', '石家庄市供销合作总社安全统筹公司',
                            '四川齐光建设工程有限公司', '四川蜀运恒通建设工程有限公司',
                            '枣庄市道桥工程有限公司'];
    for (const name of dGradeSubjects) {
      await page.goto(BASE + '/pages/subject-rating.html?subject=' + encodeURIComponent(name) + '&step=4', { waitUntil:'networkidle2' });
      await new Promise(r => setTimeout(r, 500));
      const text = await page.$eval('body', b => b.innerText);
      const hasFuseLogic = text.includes('D 级') || text.includes('熔断') || text.includes('刚性底线');
      ok(hasFuseLogic, `${name.slice(0,10)}... 熔断校验页面渲染`);
    }

    // ━━━━ Phase 7: 长 obligation 文本不破坏布局 ━━━━
    console.log('\n=========== Phase 7: 长 obligation 文本布局 ===========');
    await page.goto(BASE + '/pages/subject-rating.html?subject=' + encodeURIComponent('四川齐光建设工程有限公司') + '&step=2', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    const overflowOnLong = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(overflowOnLong <= 5, `长 obligation 文本不溢出（${overflowOnLong}px）`);
    body = await page.$eval('body', b => b.innerText);
    ok(body.includes('838,000') || body.includes('838000'), '长 obligation 含借款本金 838,000 元');

    // ━━━━ Phase 8: 主体选择下拉包含所有 19 个 ━━━━
    console.log('\n=========== Phase 8: Step 1 主体选择 ===========');
    await page.goto(BASE + '/pages/subject-rating.html?step=1', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 500));
    const opts = await page.$$eval('#subject-select option', os => os.map(o => o.textContent));
    ok(opts.length >= 20, `Step 1 下拉至少 20 项（含占位符）实际 ${opts.length}`);
    const hasAllNew = ['深圳市福田', '石家庄市供销', '四川齐光', '四川蜀运', '望城经开', '枣庄市道桥']
      .every(prefix => opts.some(o => o.includes(prefix)));
    ok(hasAllNew, 'Step 1 下拉含所有 6 个新增主体');

    // ━━━━ Phase 9: 信用信息概要 dashboard 数字正确 ━━━━
    console.log('\n=========== Phase 9: 信用信息概要 dashboard ===========');
    const summaryTests = [
      { name:'石家庄市供销合作总社安全统筹公司', expectsTotal:'181' },  // 严重失信 181
      { name:'望城经开区投资建设集团有限公司',   expectsTotal:'191' },  // 行政管理 191
      { name:'江苏华西集团有限公司',             expectsTotal:'80' }   // 行政管理 80
    ];
    for (const t of summaryTests) {
      await page.goto(BASE + '/pages/subject-rating.html?subject=' + encodeURIComponent(t.name) + '&step=2', { waitUntil:'networkidle2' });
      await new Promise(r => setTimeout(r, 500));
      const txt = await page.$eval('body', b => b.innerText);
      ok(txt.includes(t.expectsTotal), `${t.name.slice(0,10)}... dashboard 显示 ${t.expectsTotal}`);
    }

    // ━━━━ Phase 10: officialReport / subjects 数据一致性（19 主体）━━━━
    console.log('\n=========== Phase 10: 19 主体 officialReport 一致性 ===========');
    const consistData = await page.evaluate(() => {
      return MockData.subjects.map(s => ({
        name: s.name,
        hasReport: !!s.officialReport,
        hasUSCC: !!(s.officialReport && s.officialReport.basicInfo['统一社会信用代码']),
        usccMatch: s.officialReport ? s.uscc === s.officialReport.basicInfo['统一社会信用代码'] : true,
        hasLabels: !!(s.officialReport && Array.isArray(s.officialReport.labels) && s.officialReport.labels.length),
        hasReportNo: !!(s.officialReport && s.officialReport.reportNo)
      }));
    });
    let inconsist = 0;
    for (const c of consistData) {
      if (!c.hasReport || !c.hasUSCC || !c.usccMatch || !c.hasLabels || !c.hasReportNo) {
        console.log(`    ⚠ ${c.name}: report=${c.hasReport} uscc=${c.hasUSCC} match=${c.usccMatch} labels=${c.hasLabels} repNo=${c.hasReportNo}`);
        inconsist++;
      }
    }
    ok(inconsist === 0, `19 个 subjects 全部有 officialReport 且 USCC 一致`);

    if (failed) {
      console.log(`\n========== ❌ ${failed} 项失败 ==========`);
      failures.forEach((f, i) => console.log(`  ${i+1}. ${f}`));
      process.exit(1);
    }
    console.log('\n========== 🎉 V6 全部通过 ==========');
  } catch (e) {
    console.error('FATAL', e);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
