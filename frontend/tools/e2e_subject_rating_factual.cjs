/**
 * E2E: subject-rating.html 三行修复
 *  L769 (改): 「公共信用等级」→「公共信用综合评价」+ 「按 GB/T 45255-2025 综合评价 · 非信用中国官方」副标
 *  L808 (改): textarea 内容明确"GB/T 45255-2025 + 信用中国披露的失信被执行/严重失信/经营异常事实条目"
 *  L946 (删): 移除虚构「公共信用评分：X/1000」AI 上下文 dump，改为 8 大类事实条目计数
 */
const puppeteer = require('puppeteer-core');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = 'http://127.0.0.1:8000';
let failed = 0;
function ok(c, l) { console.log((c ? '  ✅ ' : '  ❌ FAIL: ') + l); if (!c) failed++; }

(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args:['--no-sandbox'] });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message.slice(0,200)));

  // ━━━━ Phase 1: Step 5 三等级对比卡 + 副标更正（中国华源 D 级）━━━━
  console.log('\n=== Phase 1: Step 5 公共信用综合评价副标 ===');
  errs.length = 0;
  await page.goto(BASE + '/pages/subject-rating.html?subject=' + encodeURIComponent('中国华源集团有限公司') + '&step=5', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 600));
  let txt = await page.$eval('body', b => b.innerText);
  ok(errs.length === 0, '无 JS 错误');
  // 标题改名
  ok(txt.includes('公共信用综合评价'), 'L769 标题改为「公共信用综合评价」');
  ok(!txt.match(/公共信用等级\n/) && !/<div class="text-xs text-muted mb-1">公共信用等级<\/div>/.test(await page.content()), 'L769 已不再用旧标题');
  // 副标说明
  ok(txt.includes('按 GB/T 45255-2025'), 'L769 副标含「按 GB/T 45255-2025」');
  ok(txt.includes('非信用中国官方'), 'L769 副标明示「非信用中国官方」');
  // 三卡解释段
  ok(txt.includes('信用中国本身不打分'), '解释段明示信用中国不打分');
  ok(txt.includes('远东资信') && txt.includes('GB/T 45255-2025'), '解释段说明远东按 GB/T 45255-2025 评出');

  // ━━━━ Phase 2: textarea 内容更正 ━━━━
  console.log('\n=== Phase 2: textarea 评级理由内容更正 ===');
  const textareaContent = await page.evaluate(() => {
    const tas = [...document.querySelectorAll('textarea')];
    return tas.map(t => t.value).join('\n');
  });
  ok(textareaContent.includes('GB/T 45255-2025'), 'L808 textarea 明确引用 GB/T 45255-2025');
  ok(textareaContent.includes('信用中国披露'), 'L808 textarea 提及信用中国披露事实条目');
  ok(textareaContent.includes('失信被执行') || textareaContent.includes('严重失信主体名单'), 'L808 textarea 列举具体事实类型');
  // 中国华源是 D 级，应触发 isFused 文案
  ok(textareaContent.includes('GB/T 45255-2025 第六条'), 'L808 D 级文案引用第六条');
  ok(textareaContent.includes('BBB-'), 'L808 D 级锁定上限 BBB-（之前错误说 ≤ B）');

  // ━━━━ Phase 3: AI 上下文 dump 不含虚构评分 ━━━━
  console.log('\n=== Phase 3: AI 上下文 dump 修正 ===');
  // 通过 evaluate 直接执行 buildContext-style 逻辑（拦截 AIAgent.send 调用），或检查全局函数
  // 这里采用更稳妥方式：点击"AI 助手解读"按钮触发，然后检查 AIAgent 最后一次 send 的 context 参数
  const captured = await page.evaluate(() => {
    // 拦截 AIAgent.send 捕获 context
    if (!window.AIAgent) return null;
    const orig = window.AIAgent.send;
    let lastCtx = null;
    window.AIAgent.send = function (msg, ctx) { lastCtx = ctx; };
    if (typeof askAIForCurrentStep === 'function') {
      try { askAIForCurrentStep(); } catch (_) {}
    }
    window.AIAgent.send = orig;
    return lastCtx;
  });
  ok(captured !== null, 'AI 上下文已捕获');
  if (captured) {
    ok(!captured.includes('/1000'), 'L946 不再含「/1000」虚构评分');
    ok(!captured.match(/公共信用评分：\d+/), 'L946 不再含「公共信用评分：数字」字段');
    ok(captured.includes('信用中国官方标签'), 'L946 含信用中国官方标签');
    ok(captured.includes('行政管理') && captured.includes('诚实守信') && captured.includes('严重失信'), 'L946 8 大类事实条目计数渲染');
    ok(captured.includes('GB/T 45255-2025') && captured.includes('非信用中国官方'), 'L946 明确说明 GB/T 45255-2025 vs 信用中国');
  }

  // ━━━━ Phase 4: 其它主体也走新逻辑（南京钢铁 - 守信激励）━━━━
  console.log('\n=== Phase 4: 南京钢铁同样的修正 ===');
  await page.goto(BASE + '/pages/subject-rating.html?subject=' + encodeURIComponent('南京钢铁联合有限公司') + '&step=5', { waitUntil:'networkidle2' });
  await new Promise(r => setTimeout(r, 600));
  txt = await page.$eval('body', b => b.innerText);
  ok(txt.includes('公共信用综合评价'), '南京钢铁 step 5 也改标题');
  ok(txt.includes('非信用中国官方'), '南京钢铁 step 5 也明示');

  if (failed) { console.log(`\n❌ ${failed} 项失败`); process.exit(1); }
  console.log('\n🎉 subject-rating 三行修复全部通过');
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
