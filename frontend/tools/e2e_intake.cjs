/**
 * E2E test for new project intake form.
 * Tests 3 real-world scenarios:
 *   ① 内蒙古自治区政府再融资一般债券（地方政府）
 *   ② 西安航空城建设发展(集团)有限公司绿色企业债（城投+绿债+双评级）
 *   ③ 南京钢铁联合有限公司主体评级（工商企业回归）
 */
const puppeteer = require('puppeteer-core');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = 'http://127.0.0.1:8000/pages/project-intake.html';

async function expect(cond, label) {
  console.log((cond ? '  ✅ ' : '  ❌ FAIL: ') + label);
  if (!cond) global.__failed = (global.__failed || 0) + 1;
}

// Helper: select + dispatch change explicitly
async function selectChange(page, sel, val) {
  await page.evaluate((s, v) => {
    const el = document.querySelector(s);
    el.value = v;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, sel, val);
}

// Helper: capture validation errors for diagnostics
async function dumpErr(page, prefix) {
  const txt = await page.$eval('#if-error', el =>
    el.classList.contains('hidden') ? null : el.textContent
  ).catch(() => null);
  if (txt) console.log('  · 校验错误：' + txt.replace(/\s+/g, ' ').slice(0, 300));
}

async function fillScenario1(page) {
  console.log('\n=== ① 内蒙古地方政府再融资一般债券 ===');
  await page.click('button[onclick="openIntakeModal()"]');
  await page.waitForSelector('#if-kind', { timeout: 5000 });

  // 主体类别 → 地方政府
  await selectChange(page, '#if-kind', 'gov');
  await new Promise(r => setTimeout(r, 200));

  // 行业字段应已切换为"省 / 自治区 / 直辖市"等
  const industryOpts = await page.$$eval('#if-industry option', opts => opts.map(o => o.textContent));
  await expect(industryOpts.some(o => o.includes('省 / 自治区')), '行业字段切换为省/自治区选项');

  await page.type('#if-subject', '2026 年内蒙古自治区政府再融资一般债券（二期）');
  await page.type('#if-issuer', '内蒙古自治区人民政府');
  await page.type('#if-client', '内蒙古自治区财政厅');
  await page.$eval('#if-due', el => el.value = '2026-04-14');
  await page.select('#if-industry', 'GOV-PROV');
  await page.select('#if-market', 'IBM');
  await page.select('#if-business', 'first');

  // 取消主体评级，勾选债项评级
  await page.click('#if-do-subject');
  await page.click('#if-do-bond');
  await new Promise(r => setTimeout(r, 200));

  // 债项面板应展开
  const bondVisible = await page.$eval('#if-bond-section', el => !el.classList.contains('hidden'));
  await expect(bondVisible, '债项面板可见');

  // 债项类型应有"地方政府再融资一般债券"
  const bondOpts = await page.$$eval('#if-bond-type option', opts => opts.map(o => o.textContent));
  await expect(bondOpts.some(o => o.includes('地方政府再融资一般债券')), '债项类型含"地方政府再融资一般债券"');

  await selectChange(page, '#if-bond-type', 'GOV-GEN-RE');
  await page.type('#if-amount', '50');
  await page.type('#if-tenor', '7');
  await page.type('#if-coupon', '2.85');
  await page.type('#if-use', '偿还内蒙古自治区到期一般债券本金');
  await page.select('#if-guarantee', 'NONE');

  // 选择方法学
  await page.evaluate(() => {
    const m = document.querySelector('.if-method[data-code="FERC-LGOV-V04-202309"]');
    if (m) m.click();
  });

  await page.click('button[onclick="submitIntakeForm()"]');
  await new Promise(r => setTimeout(r, 600));
  await dumpErr(page);
  const errVisible = await page.$eval('#if-error', el => !el.classList.contains('hidden')).catch(() => false);
  await expect(!errVisible, '提交无校验错误');

  // 验证项目已写入 (应该有 toast)
  const newCount = await page.$eval('table tbody', tb => tb.querySelectorAll('tr').length);
  console.log(`  · 当前项目清单 ${newCount} 行`);
}

async function fillScenario2(page) {
  console.log('\n=== ② 西安航空城绿色企业债（城投+绿债+双评级）===');
  await page.click('button[onclick="openIntakeModal()"]');
  await page.waitForSelector('#if-kind', { timeout: 5000 });

  // 主体类别 → 城投
  await page.select('#if-kind', 'lgfv');
  await new Promise(r => setTimeout(r, 200));

  await page.type('#if-subject', '西安航空城建设发展(集团)有限公司2024年面向专业投资者公开发行绿色企业债券(第一期)');
  await page.type('#if-issuer', '西安航空城建设发展(集团)有限公司');
  await page.type('#if-client', '西安航空城建设发展(集团)有限公司');
  await page.$eval('#if-due', el => el.value = '2024-01-03');
  await page.select('#if-industry', 'LGFV-PARK');
  await page.select('#if-market', 'EXG-SH');
  await page.select('#if-business', 'first');

  // 双评级：保持主体勾选 + 勾选债项
  await page.click('#if-do-bond');
  await new Promise(r => setTimeout(r, 200));

  // 债项类型 → 绿色企业债券（城投）
  await selectChange(page, '#if-bond-type', 'LGFV-ENT-GREEN');
  await new Promise(r => setTimeout(r, 200));

  // 绿债面板应展开
  const greenVisible = await page.$eval('#if-green-section', el => !el.classList.contains('hidden'));
  await expect(greenVisible, '绿债面板可见（选了绿色企业债券）');

  await page.type('#if-amount', '1.60');
  await page.type('#if-tenor', '7');
  await page.type('#if-coupon', '3.85');
  await page.select('#if-repay', '分次还本（如每年等额）');
  await page.type('#if-use', '1.008亿元用于西安航空基地节能降碳项目；0.592亿元用于补充流动资金');
  await page.select('#if-guarantee', 'FULL-GAR');
  await page.type('#if-guarantor', '陕西信用增进投资股份有限公司');
  await page.select('#if-guarantor-grade', 'AAA');

  // 绿债字段
  await page.select('#if-green-cat', '2.1');
  await page.select('#if-green-assurer', 'CCXI');
  await page.select('#if-green-level', '中绿');
  await page.select('#if-green-grade', 'G-2');

  // 方法学
  await page.evaluate(() => {
    const codes = ['FERC-CTOY-V05-202207', 'FERC-WBZC-V01-202204', 'FERC-GREEN-V03-202401'];
    codes.forEach(c => {
      const m = document.querySelector(`.if-method[data-code="${c}"]`);
      if (m) m.click();
    });
  });

  // 项目组：增选有 5+ 年经验的城投/绿金分析师
  await page.evaluate(() => {
    const names = ['尹丽丽', '李羽歌'];
    names.forEach(n => {
      const m = document.querySelector(`.if-team[data-name="${n}"]`);
      if (m && !m.checked) m.click();
    });
  });

  await page.click('button[onclick="submitIntakeForm()"]');
  await new Promise(r => setTimeout(r, 600));
  await dumpErr(page);
  const errVisible = await page.$eval('#if-error', el => !el.classList.contains('hidden')).catch(() => false);
  await expect(!errVisible, '双评级 + 绿债提交无校验错误');
}

async function fillScenario3(page) {
  console.log('\n=== ③ 南京钢铁联合主体评级（工商回归）===');
  await page.click('button[onclick="openIntakeModal()"]');
  await page.waitForSelector('#if-kind', { timeout: 5000 });

  // 默认 corp，行业默认 C31 钢铁
  await page.type('#if-subject', '南京钢铁联合有限公司');
  await page.type('#if-client', '南京钢铁联合有限公司');
  await page.$eval('#if-due', el => el.value = '2026-06-30');
  await page.select('#if-market', 'EXG-SH');
  await page.select('#if-business', 'continuous');

  await page.evaluate(() => {
    const m = document.querySelector('.if-method[data-code="FERC-STEEL-V03-202311"]');
    if (m) m.click();
  });

  await page.click('button[onclick="submitIntakeForm()"]');
  await new Promise(r => setTimeout(r, 600));
  await dumpErr(page);
  const errVisible = await page.$eval('#if-error', el => !el.classList.contains('hidden')).catch(() => false);
  await expect(!errVisible, '工商主体评级提交无校验错误');
}

async function testValidation(page) {
  console.log('\n=== ④ 校验测试：不勾任何评级类型 ===');
  await new Promise(r => setTimeout(r, 600));
  // 直接调用 JS 函数避免 click 时序问题
  await page.evaluate(() => openIntakeModal());
  await page.waitForSelector('#if-kind', { timeout: 8000 });
  await page.type('#if-subject', '校验测试主体');
  await page.$eval('#if-due', el => el.value = '2026-12-31');
  await page.click('#if-do-subject'); // 取消主体勾选 → 现在两项都未勾
  await page.click('button[onclick="submitIntakeForm()"]');
  await new Promise(r => setTimeout(r, 300));
  const errText = await page.$eval('#if-error', el => el.textContent).catch(() => '');
  await expect(errText.includes('至少勾选'), '校验：未勾选评级类型应报错');
  // 关闭模态
  await page.evaluate(() => closeModal());
  await new Promise(r => setTimeout(r, 300));
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  try {
    const page = await browser.newPage();
    page.on('pageerror', err => console.error('  ⚠ PAGE ERROR:', err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') console.error('  ⚠ CONSOLE ERROR:', msg.text());
    });
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 20000 });
    console.log('页面已加载：', URL);

    await fillScenario1(page);
    await fillScenario2(page);
    await fillScenario3(page);
    await testValidation(page);

    const finalCount = await page.$eval('table tbody', tb => tb.querySelectorAll('tr').length);
    console.log(`\n最终项目清单：${finalCount} 行`);

    // 数据完整性验证 - 检查刚写入的项目
    const written = await page.evaluate(() => {
      return MockData.projects.slice(0, 3).map(p => ({
        id: p.id,
        docId: p.docId,
        subject: (p.subject || '').slice(0, 40),
        kind: p.kind,
        market: p.market,
        ratingTypes: p.ratingTypes,
        bondType: p.bond ? p.bond.type : null,
        green: p.green,
        teamSize: p.team ? p.team.length : 0,
        methods: p.methods ? p.methods.map(m => m.code) : []
      }));
    });
    console.log('\n=== 数据完整性 ===');
    written.forEach((p, i) => {
      console.log(`[${i + 1}] ${p.id} · ${p.docId}`);
      console.log(`     主体：${p.subject}...`);
      console.log(`     类别：${p.kind} · 市场：${p.market}`);
      console.log(`     评级：${p.ratingTypes.join(' + ')}`);
      console.log(`     债项：${p.bondType || '—'}`);
      console.log(`     绿债：${p.green ? `${p.green.catalog} / ${p.green.assurer} / ${p.green.depth} / ${p.green.grade}` : '—'}`);
      console.log(`     项目组：${p.teamSize} 人 · 方法学：${p.methods.length} 项`);
    });

    if (global.__failed) {
      console.log(`\n❌ ${global.__failed} 个断言失败`);
      process.exit(1);
    } else {
      console.log('\n🎉 全部断言通过');
    }
  } finally {
    await browser.close();
  }
})().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
