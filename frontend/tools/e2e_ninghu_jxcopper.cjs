/**
 * E2E：宁沪高速 + 江西铜业 真实信用中国 PDF 数据
 */
const puppeteer = require('puppeteer-core');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = 'http://127.0.0.1:8000';
let failed = 0;
function ok(c, l) { console.log((c ? '  ✅ ' : '  ❌ FAIL: ') + l); if (!c) failed++; }

(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args:['--no-sandbox'] });
  const page = await browser.newPage();
  try {
    // ━━━━ 江苏宁沪高速（守信激励对象 · 29 行政许可 / 5 纳税 A）━━━━
    console.log('\n=== 江苏宁沪高速（守信激励对象 · PDF）===');
    await page.goto(BASE + '/pages/subject-rating.html?subject=' + encodeURIComponent('江苏宁沪高速公路股份有限公司') + '&step=2', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 800));
    const text = await page.$eval('body', b => b.innerText);
    const data = await page.evaluate(() => {
      const s = MockData.subjects.find(x => x.name === '江苏宁沪高速公路股份有限公司');
      const r = s.officialReport;
      return {
        subjUSCC: s.uscc,
        subjLegalRep: s.legalRep,
        subjGrade: s.publicGrade,
        subjLabels: s.creditLabels,
        labels: r.labels,
        admin: r.administrativeMgmt.length,
        adminTotal: r.summary['行政管理'],
        good: r.goodCredit.length,
        misc: r.seriousMisconduct.length,
        commit: r.summary['信用承诺'],
        reportNo: r.reportNo,
        legalRep: r.basicInfo['法定代表人/负责人'],
        addr: r.basicInfo['住所']
      };
    });
    ok(data.subjUSCC === '91320000134762764K',                'subjects USCC 已修正为 91320000134762764K');
    ok(data.subjLegalRep === '汪锋',                          'subjects 法人已修正为汪锋');
    ok(data.subjGrade === 'A',                                'subjects publicGrade=A（守信激励）');
    ok(data.subjLabels && data.subjLabels.includes('守信激励对象'), 'subjects creditLabels 含守信激励对象');
    ok(data.labels.includes('守信激励对象'),                   'officialReport 标签：守信激励对象');
    ok(data.adminTotal === 29,                                `行政管理 29 条（实际 ${data.adminTotal}）`);
    ok(data.admin >= 10,                                      `展示 ≥10 条行政许可（实际 ${data.admin}）`);
    ok(data.good === 5,                                       `诚实守信 5 条（实际 ${data.good}）`);
    ok(data.misc === 0,                                       '严重失信 0 条');
    ok(data.commit === 0,                                     '信用承诺 0 条');
    ok(data.reportNo === '20260505164152560952K5',            '报告编号匹配 PDF');
    ok(data.legalRep === '汪锋',                              '法定代表人汪锋');
    ok(data.addr.includes('江苏省南京市仙林大道6号'),         '住所匹配 PDF');
    ok(text.includes('守信激励对象'),                         'UI 显示"守信激励对象"');
    ok(text.includes('江苏省交通运输厅'),                     'UI 显示真实许可机关（江苏省交通运输厅）');
    ok(text.includes('高速公路养护作业需要半幅封闭') || text.includes('高速公路养护'), 'UI 显示真实许可内容');

    // ━━━━ 江西铜业（守信激励 + 海关高级认证 · 59 行政许可 / 11 诚实守信）━━━━
    console.log('\n=== 江西铜业（守信激励 + 海关高级认证 · PDF）===');
    await page.goto(BASE + '/pages/subject-rating.html?subject=' + encodeURIComponent('江西铜业股份有限公司') + '&step=2', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 800));
    const text2 = await page.$eval('body', b => b.innerText);
    const data2 = await page.evaluate(() => {
      const s = MockData.subjects.find(x => x.name === '江西铜业股份有限公司');
      const r = s.officialReport;
      return {
        subjUSCC: s.uscc,
        subjLabels: s.creditLabels,
        labels: r.labels,
        admin: r.administrativeMgmt.length,
        adminTotal: r.summary['行政管理'],
        good: r.goodCredit.length,
        goodTypes: r.goodCredit.map(g => g.type),
        misc: r.seriousMisconduct.length,
        reportNo: r.reportNo,
        legalRep: r.basicInfo['法定代表人/负责人'],
        addr: r.basicInfo['住所'],
        entType: r.basicInfo['企业类型'],
        customs: r.basicInfo['海关注册编号']
      };
    });
    ok(data2.subjUSCC === '91360000625912173B',               'subjects USCC 正确');
    ok(data2.subjLabels && data2.subjLabels.includes('海关高级认证企业'), 'subjects 标签含海关高级认证企业');
    ok(data2.labels.includes('守信激励对象'),                  'officialReport 标签：守信激励对象');
    ok(data2.adminTotal === 59,                               `行政管理 59 条（实际 ${data2.adminTotal}）`);
    ok(data2.admin >= 10,                                     `展示 ≥10 条行政许可（实际 ${data2.admin}）`);
    ok(data2.good === 11,                                     `诚实守信 11 条（实际 ${data2.good}）`);
    ok(data2.goodTypes.filter(t => t === '纳税信用A级纳税人').length === 10, '10 个纳税信用 A 级');
    ok(data2.goodTypes.includes('海关高级认证企业'),          '诚实守信含 1 个海关高级认证企业');
    ok(data2.misc === 0,                                      '严重失信 0 条');
    ok(data2.reportNo === '20260505164253427677H6',           '报告编号匹配 PDF');
    ok(data2.legalRep === '郑高清',                           '法定代表人郑高清');
    ok(data2.entType.includes('股份有限公司') && data2.entType.includes('上市'), '企业类型正确（含"上市"）');
    ok(text2.includes('守信激励对象'),                        'UI 显示"守信激励对象"');
    ok(text2.includes('海关高级认证企业'),                    'UI 显示"海关高级认证企业"');
    ok(text2.includes('德兴市公安局'),                        'UI 显示真实许可机关（德兴市公安局）');
    ok(text2.includes('易制毒化学品') || text2.includes('运输证'), 'UI 显示真实许可内容（易制毒化学品运输证）');
    ok(text2.includes('1997-07-09'),                          'UI 显示海关首次注册日期 1997-07-09');
    ok(text2.includes('高级认证'),                            'UI 显示"高级认证"等级');

    // ━━━━ subjects vs officialReport schema 一致性 ━━━━
    console.log('\n=== 一致性 ===');
    const consist = await page.evaluate(() => {
      return ['江苏宁沪高速公路股份有限公司', '江西铜业股份有限公司'].map(n => {
        const s = MockData.subjects.find(x => x.name === n);
        const r = s && s.officialReport;
        return {
          name: n,
          uscc_match: s && r && s.uscc === r.basicInfo['统一社会信用代码'],
          legalRep_match: s && r && s.legalRep === r.basicInfo['法定代表人/负责人']
        };
      });
    });
    consist.forEach(c => {
      ok(c.uscc_match, `${c.name} subjects.uscc === officialReport.uscc`);
      ok(c.legalRep_match, `${c.name} subjects.legalRep === officialReport.legalRep`);
    });

    if (failed) { console.log(`\n❌ ${failed} 项失败`); process.exit(1); }
    console.log('\n🎉 全部通过');
  } finally { await browser.close(); }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
