/**
 * E2E：6 个新增信用中国 PDF 主体
 *  深圳福田 / 石家庄供销 / 四川齐光 / 四川蜀运恒通 / 望城经开 / 枣庄道桥
 */
const puppeteer = require('puppeteer-core');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = 'http://127.0.0.1:8000';
let failed = 0;
function ok(c, l) { console.log((c ? '  ✅ ' : '  ❌ FAIL: ') + l); if (!c) failed++; }

const TARGETS = [
  { name:'深圳市福田产业投资服务有限公司',   reportNo:'20260505174108986E4905',   uscc:'91440300618819640R',  legalRep:'李奇林', label:'守信激励对象', adminTotal:22,  good:3,  misc:0,   commit:1,  abnormal:0 },
  { name:'石家庄市供销合作总社安全统筹公司', reportNo:'20260505175357650928R4',   uscc:'91130105107743680U',  legalRep:'李英山', label:'失信惩戒对象', adminTotal:0,   good:0,  misc:181, commit:1,  abnormal:0 },
  { name:'四川齐光建设工程有限公司',         reportNo:'20260505180050297G0243',   uscc:'91510185MA64ND8627',  legalRep:'王福玉', label:'失信惩戒对象', adminTotal:3,   good:1,  misc:1,   commit:1,  abnormal:0 },
  { name:'四川蜀运恒通建设工程有限公司',     reportNo:'202605051755133142N523',   uscc:'91510104MA6CFT042R',  legalRep:'罗文全', label:'失信惩戒对象', adminTotal:1,   good:0,  misc:1,   commit:0,  abnormal:2 },
  { name:'望城经开区投资建设集团有限公司',   reportNo:'2026050517570443042L84',   uscc:'91430122707233692A',  legalRep:'易皋',   label:'存续',         adminTotal:191, good:0,  misc:0,   commit:100,abnormal:0 },
  { name:'枣庄市道桥工程有限公司',           reportNo:'202605051759032014249N',   uscc:'91370400728618604X',  legalRep:'张耀',   label:'失信惩戒对象', adminTotal:6,   good:1,  misc:1,   commit:1,  abnormal:0 }
];

(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args:['--no-sandbox'] });
  const page = await browser.newPage();
  try {
    for (const t of TARGETS) {
      console.log(`\n=== ${t.name} ===`);
      await page.goto(BASE + '/pages/subject-rating.html?subject=' + encodeURIComponent(t.name) + '&step=2', { waitUntil:'networkidle2' });
      await new Promise(r => setTimeout(r, 600));
      const text = await page.$eval('body', b => b.innerText);
      const data = await page.evaluate(n => {
        const s = MockData.subjects.find(x => x.name === n);
        if (!s) return null;
        const r = s.officialReport;
        return {
          subjUSCC: s.uscc,
          subjLegalRep: s.legalRep,
          subjGrade: s.publicGrade,
          repLabels: r && r.labels,
          repAdmin: r && r.summary['行政管理'],
          repGood: r && r.summary['诚实守信'],
          repMisc: r && r.summary['严重失信'],
          repCommit: r && r.summary['信用承诺'],
          repAbnormal: r && r.summary['经营异常'],
          repNo: r && r.reportNo,
          repLegalRep: r && r.basicInfo['法定代表人/负责人']
        };
      }, t.name);
      ok(!!data,                                `subjects 中找到 ${t.name}`);
      if (!data) continue;
      ok(data.subjUSCC === t.uscc,              `USCC 匹配 PDF (${t.uscc})`);
      ok(data.subjLegalRep === t.legalRep,      `法人 ${t.legalRep}`);
      ok(data.repLabels && data.repLabels.includes(t.label), `标签：${t.label}`);
      ok(data.repAdmin === t.adminTotal,        `行政管理 ${t.adminTotal} 条（实际 ${data.repAdmin}）`);
      ok(data.repGood === t.good,               `诚实守信 ${t.good} 条`);
      ok(data.repMisc === t.misc,               `严重失信 ${t.misc} 条`);
      ok(data.repCommit === t.commit,           `信用承诺 ${t.commit} 条`);
      ok(data.repAbnormal === t.abnormal,       `经营异常 ${t.abnormal} 条`);
      ok(data.repNo === t.reportNo,             `报告编号匹配 PDF`);
      ok(text.includes(t.name),                 `UI 显示主体名`);
      ok(text.includes(t.legalRep),             `UI 显示法人 ${t.legalRep}`);
    }

    if (failed) { console.log(`\n❌ ${failed} 项失败`); process.exit(1); }
    console.log('\n🎉 全部通过');
  } finally { await browser.close(); }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
