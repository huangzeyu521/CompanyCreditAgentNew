/* =====================================================================
 *  CCASCEA · 通用工具函数：徽章 / Toast / Modal / 数字格式化
 * ===================================================================== */

/* ---------- 评级等级徽章 -------------------------------------------
 * 远东资信主体信用等级：三等九级（AAA、AA、A、BBB、BB、B、CCC、CC、C），
 * 除 AAA 与 CCC（含）以下外，每级可加 +/- 修饰，共 19 个微调等级。
 * D 仅作为公共信用 ABCD 四级中的"严重失信"标识，不属于市场化主体信用等级。
 * 公共信用 ABCD 通过 isPublic 标记。
 * ----------------------------------------------------------------- */
const MARKET_GRADES_TIER = {
  // 投资级（投资性强）：AAA / AA / A 全 7 微调
  invest: ['AAA','AA+','AA','AA-','A+','A','A-'],
  // 投机级（投机性强）：BBB / BB / B 全 9 微调
  speculate: ['BBB+','BBB','BBB-','BB+','BB','BB-','B+','B','B-'],
  // 高违约：CCC / CC / C （CCC 含以下不加 +/-）
  highrisk: ['CCC','CC','C']
};
const PUBLIC_GRADES_LIST = ['A+','A','A-','B+','B','B-','C+','C','C-','D'];

function isMarketInvestGrade(g) { return MARKET_GRADES_TIER.invest.includes(g); }
function isMarketSpecGrade(g)   { return MARKET_GRADES_TIER.speculate.includes(g); }
function isMarketHighRisk(g)    { return MARKET_GRADES_TIER.highrisk.includes(g); }

function getGradeColorClass(g, opts) {
  if (!g) return 'bg-bg text-muted border-border';
  const isPublic = opts && opts.isPublic;
  if (isPublic) {
    // 公共信用 ABCD：A=success, B=warning, C=orange, D=danger
    const head = String(g).charAt(0);
    if (head === 'A') return 'bg-success/10 text-success border-success/30';
    if (head === 'B') return 'bg-warning/10 text-warning border-warning/30';
    if (head === 'C') return 'bg-orange-100 text-orange-600 border-orange-300';
    if (head === 'D') return 'bg-danger/10 text-danger border-danger/40';
    return 'bg-bg text-muted border-border';
  }
  // 市场化等级
  if (isMarketInvestGrade(g))  return 'bg-success/10 text-success border-success/30';
  if (isMarketSpecGrade(g))    return 'bg-warning/10 text-warning border-warning/30';
  if (isMarketHighRisk(g))     return 'bg-danger/10 text-danger border-danger/40';
  // 公共信用 D 也用 danger
  if (g === 'D') return 'bg-danger/10 text-danger border-danger/40';
  return 'bg-bg text-muted border-border';
}
function getGradeBgClass(g, opts) {
  const cls = getGradeColorClass(g, opts);
  // 转换为 bg-only 版本
  return cls.replace(/text-\S+\s?/, '').replace(/border-\S+\/?\d*/g, m => 'border ' + m);
}
function getGradeColorClassText(g, opts) {
  const isPublic = opts && opts.isPublic;
  if (isPublic) {
    const head = String(g).charAt(0);
    if (head === 'A') return 'text-success';
    if (head === 'B') return 'text-warning';
    if (head === 'C') return 'text-orange-600';
    if (head === 'D') return 'text-danger';
    return 'text-muted';
  }
  if (isMarketInvestGrade(g)) return 'text-success';
  if (isMarketSpecGrade(g))   return 'text-warning';
  if (isMarketHighRisk(g))    return 'text-danger';
  if (g === 'D') return 'text-danger';
  return 'text-muted';
}
function getGradeSemantic(g) {
  // 远东资信《信用等级划分及定义》主体信用等级释义（精简版）
  return ({
    AAA:'偿债能力极强', AA:'偿债能力很强', A:'偿债能力较强',
    BBB:'偿债能力一般', BB:'偿债能力较弱', B:'高度依赖良好经济环境',
    CCC:'极度依赖良好经济环境', CC:'基本不能保证偿债', C:'不能偿债',
    NR:'未分级'
  })[g] || '';
}
function getPublicGradeSemantic(g) {
  // GB/T 45255-2025 + GB/T 45255-2025 公共信用等级释义
  const head = String(g).charAt(0);
  return ({ A:'诚信优良（优级）', B:'基本诚信（良级）', C:'失信观察（中级）', D:'严重失信（差级）' })[head] || '';
}
function gradeBadge(grade, opts) {
  if (!grade) return '<span class="text-muted text-xs">—</span>';
  const o = opts || {};
  const cls = getGradeColorClass(grade, o);
  const sizeCls = o.large ? 'large' : '';
  const html = `<span class="grade-badge ${sizeCls} ${cls}" title="${o.isPublic ? getPublicGradeSemantic(grade) : getGradeSemantic(grade)}">${grade}</span>`;
  if (o.withFuse) {
    return `<span class="inline-flex items-center gap-1">${html}<span class="w-1.5 h-1.5 rounded-full bg-danger pulse-dot" title="D级熔断"></span></span>`;
  }
  return html;
}
/* 公共信用专用 badge（与市场化等级区分） */
function publicGradeBadge(grade, opts) {
  return gradeBadge(grade, Object.assign({ isPublic: true }, opts || {}));
}
function fusionBadge(grade) {
  return `
    <div class="text-center w-24 py-3 px-2 rounded-lg bg-gradient-to-br from-yellow-50 to-amber-100 border-2 border-gold glow-gold">
      <div class="text-[10px] text-gold font-semibold">★ 双轨融合</div>
      <div class="num text-2xl font-bold text-gold mt-1">${grade}</div>
      <div class="text-[10px] text-muted">最终等级</div>
    </div>
  `;
}

/* ---------- 数字与日期 --------------------------------------------- */
function fmtNum(n) {
  if (n === null || n === undefined || n === '') return '—';
  const v = Number(n);
  if (isNaN(v)) return String(n);
  return v.toLocaleString('zh-CN');
}
function fmtDate(d, withTime) {
  if (!d) return '—';
  const date = (d instanceof Date) ? d : new Date(d);
  if (isNaN(date.getTime())) return String(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  if (!withTime) return `${y}-${m}-${dd}`;
  const h  = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  const s  = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${dd} ${h}:${mi}:${s}`;
}

/* ---------- Toast --------------------------------------------------- */
function ensureToastContainer() {
  let c = document.querySelector('.toast-container');
  if (!c) {
    c = document.createElement('div');
    c.className = 'toast-container';
    document.body.appendChild(c);
  }
  return c;
}
function toast(msg, type, duration) {
  type = type || 'info';
  duration = duration || 2200;
  const c = ensureToastContainer();
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  const iconMap = { success:'✓', info:'ℹ', warning:'!', danger:'✕' };
  t.innerHTML = `<span class="text-base font-bold ${({success:'text-success',info:'text-accent',warning:'text-warning',danger:'text-danger'})[type]}">${iconMap[type]||'ℹ'}</span><span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateY(-6px)';
    t.style.transition = 'all .3s';
    setTimeout(() => t.remove(), 320);
  }, duration);
}

/* ---------- Modal --------------------------------------------------- */
function openModal(opts) {
  closeModal();
  const o = Object.assign({ title:'', content:'', footer:'', width:'max-w-2xl', danger:false }, opts || {});
  const mask = document.createElement('div');
  mask.className = 'modal-mask';
  mask.id = '__modal_mask__';
  mask.innerHTML = `
    <div class="modal-box ${o.width}">
      <div class="px-5 py-3.5 border-b border-border flex items-center justify-between">
        <h3 class="text-base font-semibold ${o.danger?'text-danger':''}">${o.title || ''}</h3>
        <button onclick="closeModal()" class="text-muted hover:text-ink text-xl leading-none">&times;</button>
      </div>
      <div class="px-5 py-4">${o.content || ''}</div>
      ${o.footer ? `<div class="px-5 py-3 border-t border-border flex items-center justify-end gap-2">${o.footer}</div>` : ''}
    </div>
  `;
  mask.addEventListener('click', e => { if (e.target === mask) closeModal(); });
  document.body.appendChild(mask);
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  const m = document.getElementById('__modal_mask__');
  if (m) m.remove();
  document.body.style.overflow = '';
}
function confirmDialog(opts) {
  return new Promise(resolve => {
    const o = Object.assign({ title:'确认操作', content:'', okText:'确认', cancelText:'取消', danger:false }, opts || {});
    openModal({
      title: o.title,
      content: o.content,
      danger: o.danger,
      footer: `
        <button onclick="closeModal();window.__confirmCb&&window.__confirmCb(false)" class="px-3 py-1.5 text-sm border border-border rounded hover:bg-bg">${o.cancelText}</button>
        <button onclick="closeModal();window.__confirmCb&&window.__confirmCb(true)"
          class="px-3 py-1.5 text-sm ${o.danger?'bg-danger text-white hover:bg-red-700':'bg-brand-600 text-white hover:bg-brand-700'} rounded">${o.okText}</button>
      `
    });
    window.__confirmCb = v => { window.__confirmCb = null; resolve(v); };
  });
}

/* ---------- 全局 ESC 关闭 modal & 抽屉 ----------------------------- */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
    if (window.AIAgent && typeof window.AIAgent.close === 'function') window.AIAgent.close();
  }
});

/* =====================================================================
 *  ECharts 全局补丁：解决 Tailwind CDN 异步加载 / Flex 布局重排
 *  导致 echarts.init 时容器尺寸为 0 的渲染空白 bug
 *  -------------------------------------------------------------------
 *  原因：
 *    1. <script src="https://cdn.tailwindcss.com"> 是异步加载
 *    2. Tailwind 在 JS 初始化完成前不会向 DOM 注入 .h-72/.flex-1 等样式
 *    3. mountLayout 注入 DOM 后立即调用 echarts.init，此时容器 width=0
 *    4. echarts 按 0 尺寸渲染 → 看起来"空白"
 *    5. 用户打开 devtools → 触发 viewport 变化 → window resize 监听器
 *       触发 echarts.resize() → 用新尺寸重渲染 → 用户看到"打开控制台才显示"
 *  -------------------------------------------------------------------
 *  解决：用 ResizeObserver 监听每个图表容器的尺寸变化，
 *       任何一次容器尺寸变化（包括 Tailwind CSS 注入后的 reflow）
 *       都会自动触发 echarts.resize()，保证渲染正确尺寸。
 * ===================================================================== */
(function patchECharts() {
  function _patch() {
    if (!window.echarts || window.echarts.__ccascea_patched) return false;
    const _origInit = window.echarts.init;
    window.echarts.init = function (el, theme, opts) {
      const inst = _origInit.call(this, el, theme, opts);
      try {
        if (el instanceof HTMLElement && typeof window.ResizeObserver === 'function') {
          const ro = new ResizeObserver(() => {
            try { inst.resize(); } catch (_) {}
          });
          ro.observe(el);
          // 兜底：100ms / 500ms / 1500ms 三次主动 resize（覆盖极端慢加载）
          [100, 500, 1500].forEach(ms => setTimeout(() => { try { inst.resize(); } catch (_) {} }, ms));
        }
      } catch (_) {}
      return inst;
    };
    window.echarts.__ccascea_patched = true;
    return true;
  }
  // echarts 是 CDN 加载，在 common.js 之后才到位
  if (!_patch()) {
    let tries = 0;
    const id = setInterval(() => {
      tries++;
      if (_patch() || tries > 60) clearInterval(id);  // 6 秒兜底
    }, 100);
  }
})();

/* 暴露到全局 */
window.gradeBadge          = gradeBadge;
window.publicGradeBadge    = publicGradeBadge;
window.fusionBadge         = fusionBadge;
window.getGradeBgClass     = getGradeBgClass;
window.getGradeColorClass  = getGradeColorClass;
window.getGradeColorClassText = getGradeColorClassText;
window.getGradeSemantic    = getGradeSemantic;
window.getPublicGradeSemantic = getPublicGradeSemantic;
window.MARKET_GRADES_TIER  = MARKET_GRADES_TIER;
window.PUBLIC_GRADES_LIST  = PUBLIC_GRADES_LIST;
window.fmtNum              = fmtNum;
window.fmtDate             = fmtDate;
window.toast               = toast;
window.openModal           = openModal;
window.closeModal          = closeModal;
window.confirmDialog       = confirmDialog;

/* 帮助弹窗（多页复用） */
window.openHelpModal = function () {
  openModal({
    title: '五步闭环工作流说明',
    width: 'max-w-2xl',
    content: `
      <div class="space-y-3 text-sm text-ink/85 leading-relaxed">
        <p><span class="font-semibold text-brand-700">第一步 · 目标录入与机制化全域抓取（无感启动）：</span>
        分析师录入主体即触发隐私计算"安全融合舱"+ 合规 API 秒级抓取全量公共信用数据。</p>
        <p><span class="font-semibold text-brand-700">第二步 · 白盒化社会信用逆向解构：</span>
        基于 GB/T 23794-2023 / GB/T 45255-2025，将笼统等级逆向拆解为可追溯的事件级归因清单。</p>
        <p><span class="font-semibold text-brand-700">第三步 · 跨域语系智能翻译 + 知识图谱穿透：</span>
        充当"双轨翻译官"——社会合规扣分 → 偿债 PD/LGD 调整因子；同步穿透实控人/担保链。</p>
        <p><span class="font-semibold text-brand-700">第四步 · 刚性底线核查与自动熔断：</span>
        10 大 D 级触发条件实时核查，GB/T 45255-2025红线"D 级 → 不得评 A 级"硬性拦截。</p>
        <p><span class="font-semibold text-brand-700">第五步 · 人工复判 + 双轨融合报告一键生成：</span>
        分析师定稿融合等级；自动植入双轨融合标准化声明 + 自动归档审计日志。</p>
      </div>
    `,
    footer: `<button onclick="closeModal()" class="px-3 py-1.5 text-sm bg-brand-600 text-white rounded hover:bg-brand-700">我已了解</button>`
  });
};
