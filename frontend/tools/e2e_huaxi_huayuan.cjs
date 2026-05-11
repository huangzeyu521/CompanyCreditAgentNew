/**
 * E2E：江苏华西 + 中国华源 真实信用中国 PDF 数据
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
    // ━━━━ 江苏华西（守信激励对象 · 80 行政许可 / 6 纳税 A / 11 信用承诺）━━━━
    console.log('\n=== 江苏华西集团（守信激励对象 · 真实 PDF）===');
    await page.goto(BASE + '/pages/subject-rating.html?projectId=P-2026-0420&step=2', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 800));
    const text = await page.$eval('body', b => b.innerText);
    const data = await page.evaluate(() => {
      const r = MockData.subjects.find(s => s.name === '江苏华西集团有限公司').officialReport;
      return {
        labels: r.labels,
        admin: r.administrativeMgmt.length,
        adminTotal: r.summary['行政管理'],
        good: r.goodCredit.length,
        commit: r.creditCommitments.length,
        misc: r.seriousMisconduct.length,
        reportNo: r.reportNo,
        legalRep: r.basicInfo['法定代表人/负责人'],
        addr: r.basicInfo['住所']
      };
    });
    ok(data.labels.includes('守信激励对象'), '江苏华西标签：守信激励对象（修正前误标"严重失信"）');
    ok(data.adminTotal === 80, `江苏华西行政管理共 80 条（实际 ${data.adminTotal}）`);
    ok(data.admin >= 10,       `江苏华西展示 ≥10 条行政许可（实际 ${data.admin}）`);
    ok(data.good === 6,        `江苏华西诚实守信 6 条（实际 ${data.good}）`);
    ok(data.commit === 11,     `江苏华西信用承诺 11 条（实际 ${data.commit}）`);
    ok(data.misc === 0,        `江苏华西严重失信 0 条`);
    ok(data.reportNo === '202605051628567075488Z', `报告编号匹配 PDF`);
    ok(data.legalRep === '吴协恩', '法定代表人吴协恩');
    ok(data.addr.includes('江阴市华士镇华西新市村民族路2号'), '住所匹配 PDF');
    ok(text.includes('守信激励对象'), 'UI 显示"守信激励对象"标签');
    ok(text.includes('江阴市市场监督管理局'), 'UI 显示真实许可机关');
    ok(text.includes('增值税一般纳税人申报'), 'UI 显示真实信用承诺事由');

    // ━━━━ 中国华源（失信惩戒对象 · 1+1+1+0 · 失信被执行人 ）━━━━
    console.log('\n=== 中国华源集团（失信惩戒对象 · 真实 PDF）===');
    await page.goto(BASE + '/pages/subject-rating.html?projectId=P-2026-0415&step=2', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 800));
    const text2 = await page.$eval('body', b => b.innerText);
    const data2 = await page.evaluate(() => {
      const r = MockData.subjects.find(s => s.name === '中国华源集团有限公司').officialReport;
      return {
        labels: r.labels,
        admin: r.administrativeMgmt.length,
        good: r.goodCredit.length,
        misc: r.seriousMisconduct.length,
        miscFirst: r.seriousMisconduct[0],
        reportNo: r.reportNo,
        legalRep: r.basicInfo['法定代表人/负责人'],
        addr: r.basicInfo['住所']
      };
    });
    ok(data2.labels.includes('失信惩戒对象'), '中国华源标签：失信惩戒对象（修正前误标"守信激励"）');
    ok(data2.admin === 1, `中国华源行政管理 1 条（实际 ${data2.admin}）`);
    ok(data2.good === 1,  `中国华源诚实守信 1 条（2020 年 A 级）`);
    ok(data2.misc === 1,  `中国华源严重失信 1 条（失信被执行人）`);
    ok(data2.miscFirst && data2.miscFirst.caseNo === '(2009)浦执字第07352号', '失信被执行人案号匹配 PDF');
    ok(data2.miscFirst && data2.miscFirst.court === '上海市浦东新区人民法院', '执行法院匹配 PDF');
    ok(data2.miscFirst && data2.miscFirst.status === '全部未履行', '履行状态匹配 PDF');
    ok(data2.miscFirst && data2.miscFirst.publishedAt === '2015-07-15', '发布时间匹配 PDF');
    ok(data2.reportNo === '20260505163213731547U5', '报告编号匹配 PDF');
    ok(data2.legalRep === '陆俊德', '法定代表人陆俊德（修正前误标"周玉成"）');
    ok(data2.addr.includes('商城路660号'), '住所匹配 PDF');
    ok(text2.includes('失信惩戒对象'), 'UI 显示"失信惩戒对象"标签');
    ok(text2.includes('上海市浦东新区人民法院'), 'UI 显示执行法院');
    ok(text2.includes('全部未履行'), 'UI 显示"全部未履行"');
    ok(text2.includes('增值税防伪税控系统最高开票限额审批'), 'UI 显示真实行政许可内容');
    ok(text2.includes('上海傲胜木业'), 'UI 显示完整生效法律文书内容');

    // ━━━━ 主体一致性：subjects[] 与 officialReport 数据对齐 ━━━━
    console.log('\n=== 一致性检验：subjects vs officialReport ===');
    await page.goto(BASE + '/pages/project-intake.html', { waitUntil:'networkidle2' });
    await new Promise(r => setTimeout(r, 500));
    const consist = await page.evaluate(() => {
      return ['江苏华西集团有限公司', '中国华源集团有限公司'].map(name => {
        const s = MockData.subjects.find(x => x.name === name);
        const r = s && s.officialReport;
        return {
          name,
          subjUSCC: s && s.uscc,
          repUSCC: r && r.basicInfo['统一社会信用代码'],
          subjLegalRep: s && s.legalRep,
          repLegalRep: r && r.basicInfo['法定代表人/负责人'],
          subjGrade: s && s.publicGrade,
          subjLabels: s && s.creditLabels,
          repLabels: r && r.labels
        };
      });
    });
    consist.forEach(c => {
      ok(c.subjUSCC === c.repUSCC, `${c.name} USCC subjects=${c.subjUSCC} report=${c.repUSCC}`);
      ok(c.subjLegalRep === c.repLegalRep, `${c.name} 法人 subjects=${c.subjLegalRep} report=${c.repLegalRep}`);
    });
    // 江苏华西应是 A 级守信激励
    const huaxi = consist.find(c => c.name.includes('江苏华西'));
    ok(huaxi.subjGrade === 'A', '江苏华西 publicGrade=A（守信激励对应 A 级）');
    ok(huaxi.subjLabels.includes('守信激励对象'), '江苏华西 creditLabels 含守信激励对象');
    // 中国华源应是 D 级失信惩戒
    const huayuan = consist.find(c => c.name.includes('中国华源'));
    ok(huayuan.subjGrade === 'D', '中国华源 publicGrade=D（失信惩戒对应 D 级）');
    ok(huayuan.subjLabels.includes('失信惩戒对象') || huayuan.subjLabels.includes('失信被执行人'),
       '中国华源 creditLabels 含失信惩戒对象');

    if (failed) { console.log(`\n❌ ${failed} 项失败`); process.exit(1); }
    console.log('\n🎉 全部通过');
  } finally { await browser.close(); }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
