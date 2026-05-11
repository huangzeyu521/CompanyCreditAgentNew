/**
 * E2E：第二步严格按信用中国官方报告（无评分 / 无雷达 / 8 章节）
 *  ① 删除：740/1000 公共信用评分、行业 P50 对标分、雷达图、指标拆分卡、扣分清单
 *  ② 保留：报告头 + 信用信息概要(8 类计数) + 8 章节明细 + 信用状况提升建议 + 报告说明
 *  ③ 南京钢铁真实数据：行政管理 15 / 诚实守信 4 / 信用承诺 5
 */
const puppeteer = require('puppeteer-core');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = 'http://127.0.0.1:8000';

let failed = 0;
function ok(cond, label) {
  console.log((cond ? '  ✅ ' : '  ❌ FAIL: ') + label);
  if (!cond) failed++;
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args:['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    page.on('pageerror', e => console.error('  ⚠ PAGE ERROR:', e.message));

    // ───────── 第二步加载南京钢铁 ─────────
    console.log('\n=== ① 第二步加载南京钢铁（应该是真实 PDF 数据）===');
    await page.goto(BASE + '/pages/subject-rating.html?subject=南京钢铁联合有限公司&step=2', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 800));

    const text = await page.$eval('body', b => b.innerText);

    // ───────── ① 评分元素全部移除 ─────────
    console.log('\n=== ② 评分元素全部移除 ===');
    ok(!/740\s*\/\s*1000/.test(text),                         '不再有 "740/1000" 评分');
    ok(!/公共信用评分（演示）/.test(text),                       '不再有 "公共信用评分（演示）"');
    ok(!/失分\s*\d+/.test(text),                              '不再有 "失分 XXX"');
    ok(!/基准\s*1000/.test(text),                              '不再有 "基准 1000"');
    ok(!/行业\s*P50\s*对标/.test(text),                          '不再有 "行业 P50 对标"');
    ok(!text.includes('八维评分雷达'),                           '不再有 "八维评分雷达"');
    ok(!text.includes('指标拆分 · 8 大一级维度'),                  '不再有 "指标拆分 · 8 大一级维度"');
    ok(!text.includes('白盒化归因清单'),                          '不再有 "白盒化归因清单"');
    ok(!/共扣\s*-?\d+\s*分/.test(text),                          '不再有 "共扣 X 分"');
    ok(!text.includes('修复路径'),                                '不再有"修复路径"列');
    // DOM 层面：radar 容器不应存在
    const hasRadar = await page.$('#radar');
    ok(!hasRadar, 'DOM 中无 #radar 容器');

    // ───────── ② 报告头 + 信用信息概要 ─────────
    console.log('\n=== ③ 报告头与信用信息概要 ===');
    ok(text.includes('公共信用信息报告'),                          '出现"公共信用信息报告"标题');
    ok(text.includes('版本号 V2.0'),                               '版本号 V2.0');
    ok(text.includes('国家公共信用和地理空间信息中心'),              '出具单位正确');
    ok(text.includes('守信激励对象'),                              '主体标签"守信激励对象"');
    ok(text.includes('91320100748204660Q'),                       'USCC 显示正确（来自 PDF）');
    ok(text.includes('黄一新'),                                    '法定代表人正确（来自 PDF）');
    ok(text.includes('2003-03-24'),                               '成立日期正确（来自 PDF）');
    ok(text.includes('南京市六合区卸甲甸'),                          '住所正确（来自 PDF）');
    ok(text.includes('信用信息概要'),                              '出现"信用信息概要"标题');
    ok(text.includes('2026050419025750859D39'),                   '报告编号来自真实 PDF');

    // ───────── ③ 8 章节计数与真实数据 ─────────
    console.log('\n=== ④ 8 章节计数与真实数据匹配 PDF ===');
    // 概要里应有 行政管理 15 / 诚实守信 4 / 严重失信 0 / 经营异常 0 / 信用承诺 5 / 信用评价 0 / 司法判决 0 / 其他 0
    const dashCounts = await page.evaluate(() => {
      const r = MockData.subjects.find(s => s.name === '南京钢铁联合有限公司').officialReport;
      return r.summary;
    });
    ok(dashCounts['行政管理'] === 15, `行政管理 15 条（实际 ${dashCounts['行政管理']}）`);
    ok(dashCounts['诚实守信'] === 4,  `诚实守信 4 条（实际 ${dashCounts['诚实守信']}）`);
    ok(dashCounts['严重失信'] === 0,  `严重失信 0 条（实际 ${dashCounts['严重失信']}）`);
    ok(dashCounts['经营异常'] === 0,  `经营异常 0 条（实际 ${dashCounts['经营异常']}）`);
    ok(dashCounts['信用承诺'] === 5,  `信用承诺 5 条（实际 ${dashCounts['信用承诺']}）`);
    ok(dashCounts['司法判决'] === 0,  `司法判决 0 条（实际 ${dashCounts['司法判决']}）`);

    // ───────── ④ 章节标题齐全 ─────────
    console.log('\n=== ⑤ 8 大章节标题齐全 ===');
    const sections = [
      '一、', '登记注册基础信息',
      '二、', '行政管理信息',
      '三、', '诚实守信相关荣誉信息',
      '四、', '严重失信主体名单信息',
      '五、', '经营（活动）异常名录',
      '六、', '信用承诺信息',
      '七、', '信用评价信息',
      '八、', '司法判决及执行信息',
      '九、', '其他信息',
      '十、', '信用状况提升建议'
    ];
    for (const s of sections) {
      ok(text.includes(s), `章节包含 "${s}"`);
    }

    // ───────── ⑤ 真实条目内容（行政许可 / 纳税信用 A 级 / 信用承诺）─────────
    console.log('\n=== ⑥ 真实条目内容（节选自 PDF）===');
    ok(text.includes('宁新区管审环表复〔2025〕104号'), '行政许可文书号 1（来自 PDF 第 1 条）');
    ok(text.includes('环境影响评价'),                  '行政许可内容"环境影响评价"');
    ok(text.includes('危险化学品经营许可'),             '行政许可"危化品经营"');
    ok(text.includes('纳税信用A级纳税人'),             '诚实守信"纳税信用 A 级"');
    ok(text.includes('国家税务总局'),                  '数据来源国家税务总局');
    ok(/评价年度.*2024/s.test(text),                   '纳税年度 2024');
    ok(/评价年度.*2018/s.test(text),                   '纳税年度 2018');
    ok(text.includes('国家税务总局信阳市税务局'),       '主动型信用承诺受理单位（PDF 真实）');
    ok(text.includes('南京市规划和自然资源局'),         '审批替代型信用承诺受理单位（PDF 真实）');
    ok(text.includes('全部履行'),                      '承诺履行状态"全部履行"');

    // ───────── ⑥ 信用状况提升建议（PDF 原话）─────────
    console.log('\n=== ⑦ 信用状况提升建议（与 PDF 一致）===');
    ok(text.includes('建议秉持诚信理念，合法有序开展经营活动'), '提升建议原文（来自 PDF 第十章）');

    // ───────── ⑦ 报告说明 ─────────
    console.log('\n=== ⑧ 报告说明（信用中国免责声明）===');
    ok(text.includes('客观中立'), '报告说明含"客观中立"');
    ok(text.includes('不主动编辑或修改信息的内容'), '报告说明含"不主动编辑或修改"');
    ok(text.includes('不进行评分或等级评定') || /不.*评分/.test(text), '明确说明"不进行评分或等级评定"');
    ok(text.includes('信用信息异议申诉'), '报告说明含"信用信息异议申诉"');
    ok(text.includes('行政处罚信息信用修复'), '报告说明含"行政处罚信息信用修复"');

    if (failed) {
      console.log(`\n❌ ${failed} 项失败`);
      process.exit(1);
    } else {
      console.log('\n🎉 全部断言通过');
    }
  } finally {
    await browser.close();
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
