/* =====================================================================
 *  CCASCEA · 通用布局：顶栏 + 分组侧栏（含二级 header）+ 主区
 *  入口：mountLayout(activeKey, renderMain)
 * ===================================================================== */
(function () {

  /* ============== 最近项目记忆（lastProjectId）==============
   * 写：任意页面 URL 含 ?projectId=X 且 X 在 projects 中存在时
   * 读：侧栏「项目工作台」菜单 + project-workbench.html 无 projectId 时的回落
   * 目标：让"项目工作台"作为侧栏焦点入口，跟随用户最近活跃项目，不再静默选第一个
   * ===================================================== */
  const LAST_PROJECT_KEY = 'ccascea_last_project';
  function rememberCurrentProject() {
    try {
      const id = new URLSearchParams(location.search).get('projectId');
      if (!id) return;
      const list = (window.MockData && window.MockData.projects) || [];
      if (list.find(p => p.id === id)) {
        localStorage.setItem(LAST_PROJECT_KEY, id);
      }
    } catch (_) {}
  }
  function getLastProjectId() {
    try {
      const id = localStorage.getItem(LAST_PROJECT_KEY);
      if (!id) return null;
      const list = (window.MockData && window.MockData.projects) || [];
      return list.find(p => p.id === id) ? id : null;
    } catch (_) { return null; }
  }
  window.getLastProjectId = getLastProjectId;

  function findActive(activeKey) {
    return (window.AppConfig.routes.find(r => r.key === activeKey)) || window.AppConfig.routes[0];
  }
  function findGroupOf(activeKey) {
    for (const g of window.AppConfig.routeGroups) {
      if (g.items.find(it => it.key === activeKey)) return g;
    }
    return window.AppConfig.routeGroups[0];
  }

  function buildSidebar(activeKey) {
    const groups = window.AppConfig.routeGroups;
    const activeGroup = findGroupOf(activeKey);

    const groupsHtml = groups.map(g => {
      const expanded = g.key === activeGroup.key;
      const items = g.items.map(it => {
        if (it.type === 'header') {
          // 二级分组小标题（不可点击）
          return `<div class="px-4 py-1.5 text-[10px] text-muted/80 font-semibold tracking-wider uppercase border-l-2 border-transparent">${it.label}</div>`;
        }
        const isActive = it.key === activeKey;
        // 「项目工作台」：动态注入最近项目 projectId + 显示主体简称作为副标识
        let href = it.href;
        let suffixHtml = '';
        if (it.key === 'project-workbench') {
          const lastId = getLastProjectId();
          if (lastId) {
            href = `project-workbench.html?projectId=${lastId}`;
            const last = ((window.MockData && window.MockData.projects) || []).find(p => p.id === lastId);
            if (last && last.subject) {
              const short = last.subject.length > 8 ? last.subject.slice(0, 8) + '…' : last.subject;
              suffixHtml = `<span class="block text-[10px] text-muted/80 font-normal mt-0.5 truncate">最近：${short}</span>`;
            }
          } else {
            // 无最近项目 → 引导用户先去"我的项目"选一个
            href = 'project-intake.html';
            suffixHtml = `<span class="block text-[10px] text-muted/80 font-normal mt-0.5">请先选择项目</span>`;
          }
        }
        const cls = isActive
          ? 'block pl-9 pr-4 py-1.5 text-xs bg-brand-50 text-brand-700 font-medium border-l-2 border-brand-600'
          : 'block pl-9 pr-4 py-1.5 text-xs text-ink/75 hover:bg-bg border-l-2 border-transparent';
        return `<a href="${href}" class="${cls}">${it.label}${suffixHtml}</a>`;
      }).join('');
      return `
        <div class="sidebar-group ${expanded ? 'expanded' : ''}" data-group="${g.key}">
          <button onclick="toggleSidebarGroup('${g.key}')" class="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-ink/85 hover:bg-bg border-l-2 ${expanded?'border-brand-600/40':'border-transparent'}">
            <span class="tracking-wide">${g.label}</span>
            <svg class="w-3 h-3 text-muted transition-transform sidebar-chevron" style="${expanded?'':'transform:rotate(-90deg)'}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M19 9l-7 7-7-7"/></svg>
          </button>
          <div class="sidebar-items overflow-hidden ${expanded ? '' : 'hidden'}">${items}</div>
        </div>
      `;
    }).join('');

    return `
      <aside id="ccascea-sidebar" class="w-60 flex-shrink-0 bg-white border-r border-border flex flex-col" style="min-height:calc(100vh - 56px)">
        <nav class="flex-1 py-2 overflow-y-auto">${groupsHtml}</nav>
        <div class="px-4 py-3 border-t border-border text-[10px] text-muted">
          ${window.AppConfig.meta.appShort} · ${window.AppConfig.meta.version}
          <div class="text-[10px] mt-0.5">${window.AppConfig.meta.legalBasis}</div>
        </div>
      </aside>
    `;
  }

  window.toggleSidebarGroup = function (key) {
    const el = document.querySelector(`.sidebar-group[data-group="${key}"]`);
    if (!el) return;
    const items = el.querySelector('.sidebar-items');
    const chev = el.querySelector('.sidebar-chevron');
    if (!items) return;
    const willOpen = items.classList.contains('hidden');
    items.classList.toggle('hidden', !willOpen);
    el.classList.toggle('expanded', willOpen);
    if (chev) chev.style.transform = willOpen ? '' : 'rotate(-90deg)';
  };

  function buildHeader(activeKey) {
    const active = findActive(activeKey);
    const group  = findGroupOf(activeKey);
    const u = (window.MockData && window.MockData.currentUser) || { name:'演示账号', role:'分析师' };
    return `
      <header class="bg-white border-b border-border h-14 flex items-center px-4 gap-4 sticky top-0 z-30">
        <a href="workbench.html" class="flex items-center gap-2">
          <div class="w-7 h-7 rounded grad-deep-blue flex items-center justify-center text-white font-bold text-xs">CC</div>
          <div class="leading-tight hidden md:block">
            <div class="text-sm font-semibold">${window.AppConfig.meta.appName}</div>
            <div class="text-[10px] text-muted">${window.AppConfig.meta.company} · ${window.AppConfig.meta.appShort}</div>
          </div>
        </a>
        <nav class="text-xs text-muted hidden md:flex items-center gap-1 ml-3">
          <a href="workbench.html" class="hover:text-brand-600">工作台</a>
          <span>/</span>
          <span class="text-muted">${group.label}</span>
          <span>/</span>
          <span class="text-ink font-medium">${active.label}</span>
        </nav>

        <div class="flex-1"></div>

        <button onclick="window.AIAgent && window.AIAgent.toggle()" class="text-xs px-3 py-1.5 grad-deep-blue text-white rounded-md flex items-center gap-1 hover:opacity-90" title="智能助手">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M9.75 9.75h.01M14.25 9.75h.01M9 16h6m-3-12a9 9 0 100 18 9 9 0 000-18z"/></svg>
          AI 助手
        </button>

        <button onclick="toast('您有 3 条新预警','info')" class="relative text-muted hover:text-ink p-1.5" title="通知">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
          <span class="absolute top-0 right-0 w-2 h-2 bg-danger rounded-full"></span>
        </button>

        <div class="flex items-center gap-2 pl-3 border-l border-border">
          <div class="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold">${(u.name || 'U').slice(0,1)}</div>
          <div class="leading-tight hidden lg:block">
            <div class="text-xs font-medium">${u.name}</div>
            <div class="text-[10px] text-muted">${u.role || ''}</div>
          </div>
          <button onclick="confirmDialog({title:'退出登录?',content:'<p class=&quot;text-sm&quot;>确定要退出当前账号？</p>',okText:'退出',cancelText:'取消',danger:true}).then(ok=>{if(ok)location.href='login.html'})" class="text-muted hover:text-danger p-1" title="退出">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          </button>
        </div>
      </header>
    `;
  }

  /* ============== 项目上下文（PROJECT CONTEXT） ============== */
  // 从 URL ?projectId= 解析当前项目；找不到时返回 null
  function getCurrentProject() {
    try {
      const id = new URLSearchParams(location.search).get('projectId');
      if (!id) return null;
      const list = (window.MockData && window.MockData.projects) || [];
      return list.find(p => p.id === id) || null;
    } catch (e) { return null; }
  }
  window.getCurrentProject = getCurrentProject;

  // 工具页是否需要显示项目上下文（项目工作台、项目列表、跨项目页面 不需要）
  function shouldShowProjectContext(activeKey) {
    const exempt = [
      // 项目驱动主入口（项目本身的页）
      'workbench', 'project-workbench', 'projects', 'project-intake', 'reports', 'home', 'login', '404',
      // 跨项目视图（全公司维度，绝不应显示单一项目的上下文）
      'cockpit', 'account-manager', 'committee-workbench', 'committee-agenda',
      'tracking', 'credit-repair-sync', 'industry-scan', 'monitoring-report', 'quality-checks',
      // 知识与标准（与项目无关）
      'methodology-rag', 'methodology-version', 'public-credit-catalog',
      'industry-research', 'compliance-rules', 'investor-service',
      // 系统
      'system', 'audit-log', 'openapi'
    ];
    if (exempt.includes(activeKey)) return false;
    return !!getCurrentProject();
  }

  // 项目上下文顶部固定栏
  function buildProjectContextBar(activeKey) {
    const p = getCurrentProject();
    if (!p) return '';
    const stage = (p.stages || []).find(s => s.id === p.currentStage) || {};
    const stageNum = (p.stages || []).findIndex(s => s.id === p.currentStage) + 1;
    const totalStages = (p.stages || []).length || 12;
    const lead = (p.team && p.team[0]) || {};
    const leadName = typeof lead === 'object' ? lead.name : lead;
    const labels = (p._subject && p._subject.creditLabels) || [];
    // 项目切换器选项
    const list = (window.MockData && window.MockData.projects) || [];
    const switcherOpts = list.map(x =>
      `<option value="${x.id}" ${x.id === p.id ? 'selected' : ''}>${x.subject} · ${x.id}</option>`
    ).join('');
    // 当前页路径名
    const curPage = location.pathname.split('/').pop().replace('.html','');
    return `
      <div class="bg-gradient-to-r from-brand-50/80 via-brand-50/30 to-white border-b border-brand-200/60 px-6 py-2 sticky top-[56px] z-30 backdrop-blur" style="margin-left:240px;width:calc(100% - 240px);box-sizing:border-box">
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <div class="flex items-center gap-2 text-xs text-muted">
            <a href="project-intake.html" class="hover:text-brand-600">我的项目</a>
            <span>›</span>
            <a href="project-workbench.html?projectId=${p.id}" class="text-brand-700 font-medium hover:underline">${p.subject}</a>
            <span class="text-muted/70 num">(${p.id})</span>
            <span>›</span>
            <span class="text-ink/70">${stage.name || '—'}</span>
            <span>›</span>
            <span class="text-ink font-medium">${(window.AppConfig && window.AppConfig.routes.find(r=>r.key===activeKey) || {}).label || curPage}</span>
          </div>
          <div class="flex items-center gap-3 flex-wrap">
            <div class="flex items-center gap-1 text-[11px]">
              <span class="text-muted">阶段</span>
              <strong class="text-brand-700">${stageNum}/${totalStages} ${stage.name || ''}</strong>
              ${stage.progress !== undefined ? `<span class="text-muted">·</span><span class="num">${stage.progress}%</span>` : ''}
            </div>
            <span class="text-[11px] px-2 py-0.5 rounded-full border bg-white border-border text-muted">组长：${leadName || '—'}</span>
            <select onchange="if(this.value){const u=new URL(location);u.searchParams.set('projectId',this.value);location.href=u.toString();}"
                    class="text-xs px-2 py-1 border border-border rounded-md bg-white focus:outline-none focus:border-brand-600">
              ${switcherOpts}
            </select>
            <a href="project-workbench.html?projectId=${p.id}" class="text-xs px-3 py-1 bg-brand-600 text-white rounded-md hover:bg-brand-700">返回工作台</a>
          </div>
        </div>
      </div>
    `;
  }
  window.buildProjectContextBar = buildProjectContextBar;

  /* ============== 公开入口 ============== */
  window.mountLayout = function (activeKey, renderMain) {
    const app = document.getElementById('app');
    if (!app) return;
    // 在渲染前记忆当前 URL 的 projectId（合法时），保证侧栏「项目工作台」跟随上次活跃项目
    rememberCurrentProject();
    const mainHtml = (typeof renderMain === 'function') ? renderMain() : (renderMain || '');
    const showCtx = shouldShowProjectContext(activeKey);
    const ctxBar  = showCtx ? buildProjectContextBar(activeKey) : '';
    app.innerHTML = `
      ${buildHeader(activeKey)}
      ${ctxBar}
      <div class="flex" style="min-height:calc(100vh - 56px)">
        ${buildSidebar(activeKey)}
        <main class="flex-1 min-w-0 px-6 py-5 max-w-[1480px] mx-auto" id="main">${mainHtml}</main>
      </div>
    `;
  };
})();
