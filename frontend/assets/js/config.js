/* =====================================================================
 *  CCASCEA · 应用全局配置
 *  ----------------------------------------------------------------
 *  产品定位：远东资信评级师专属智能助手（不含研究员、投资者、合规官独立入口）
 *  导航逻辑：按"项目阶段流转"组织（《信用评级业务程序指引》第十二至四十六条）
 *  ----------------------------------------------------------------
 *  注意：API key 仅用于本地 / 内网演示，生产必须移到后端代理
 * ===================================================================== */
window.AppConfig = (function () {

  /* ---------- 大模型配置 ---------- */
  const llm = {
    apiKey:   'sk-c3eb88a1b7734b1f95b1df957b120dde',
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    model:    'qwen3-max-preview',
    modelDisplay: 'qwen3.6-max-preview',
    temperature: 0.3,
    topP: 0.85,
    maxTokens: 2048,
    streamTimeoutMs: 60000,
    requestTimeoutMs: 30000,
    retryTimes: 2,
    retryDelayMs: 1500
  };

  /* ---------- 应用元数据 ---------- */
  const meta = {
    appName:     '企业信用状况综合评价智能体',
    appShort:    'CCASCEA',
    company:     '远东资信评估有限公司',
    companyEn:   'SFECR',
    version:     'V1.0',
    releaseDate: '2026-04-28',
    legalBasis:  'GB/T 45255-2025 · GB/T 45255-2025 · 远东资信制度集',
    targetUser:  '远东资信评级师专属智能助手'
  };

  /* ---------- 隐私 / 合规 ---------- */
  const privacy = {
    dlpBlocklist: [ '内部档案', '内部资料', '机密', '绝密', 'INTERNAL ONLY', 'CONFIDENTIAL' ],
    thinkingFallbackStepMs: 1800,
    sessionLogMax: 200
  };

  /* ---------- 路由：5 大业务域 + 评级业务按 5 阶段流转 ----------
   * 每个域的 items 中：
   *   { type:'header', label:'...' }  渲染为非可点击的小标题分组
   *   { key, label, href }            渲染为可点击的菜单项
   *
   * 评级业务 5 阶段对齐《信用评级业务程序指引》:
   *   ① 立项与准入   ← 第十二至十五条 接受委托 + 评级准备
   *   ② 尽职调查    ← 第十六、十七条 实地调研 / 工作底稿
   *   ③ 评级建模    ← 第十七条后段 报告撰写所需建模
   *   ④ 报告与审核  ← 第十八至三十八条 报告 / 三审 / 信评委 / 复评
   *   ⑤ 跟踪评级    ← 第四十四至四十六条 定期 + 不定期跟踪
   *
   * 评级公布与归档（第三十九至四十三条）已合并入"④ 报告与审核"末段
   * （评级师作业视角下"出具→签字→归档"是连续动作）
   */
  const routeGroups = [
    /* ============== 我的工作（项目驱动） ============== */
    {
      key: 'my-work', label: '我的工作',
      items: [
        { key: 'project-intake',     label: '我的项目',         href: 'project-intake.html' },
        { key: 'project-workbench',  label: '项目工作台',       href: 'project-workbench.html' },
        { key: 'workbench',          label: '今日待办',         href: 'workbench.html' },
        { key: 'reports',            label: '我的报告库',       href: 'reports.html' }
      ]
    },
    /* ============== 跨项目视图（全局） ============== */
    {
      key: 'cross-project', label: '跨项目视图',
      items: [
        { key: 'cockpit',             label: '管理驾驶舱',           href: 'cockpit.html' },
        { key: 'account-manager',     label: '客户经理协同（委托池）', href: 'account-manager.html' },
        { key: 'committee-workbench', label: '信评委工作台',         href: 'committee-workbench.html' },
        { key: 'committee-agenda',    label: '信评委议程包（汇总）',  href: 'committee-agenda.html' },
        { key: 'tracking',            label: '21 类重大事项监控',     href: 'tracking.html' },
        { key: 'credit-repair-sync',  label: '信用修复联动',          href: 'credit-repair-sync.html' },
        { key: 'industry-scan',       label: '行业风险扫描',          href: 'industry-scan.html' },
        { key: 'monitoring-report',   label: '监管报送（季度）',      href: 'monitoring-report.html' },
        { key: 'quality-checks',      label: '评级质量检验',          href: 'quality-checks.html' }
      ]
    },
    /* ============== 知识 / 标准 ============== */
    {
      key: 'knowledge', label: '知识与标准',
      items: [
        { key: 'methodology-rag',     label: '方法学知识库（RAG）',     href: 'methodology-rag.html' },
        { key: 'methodology-version', label: '方法版本与生效管理',     href: 'methodology-version.html' },
        { key: 'public-credit-catalog', label: '公共信用数据目录',      href: 'public-credit-catalog.html' },
        { key: 'industry-research',   label: '远东研究中心',           href: 'industry-research.html' },
        { key: 'compliance-rules',    label: '合规规则引擎',           href: 'compliance-rules.html' },
        { key: 'investor-service',    label: '投资者服务（披露）',     href: 'investor-service.html' }
      ]
    },
    /* ============== 工具直达（独立场景）—— 通常从项目工作台进入 ============== */
    {
      key: 'tools-direct', label: '工具直达',
      items: [
        { type:'header', label:'—— 立项 ——' },
        { key: 'intake-stage',        label: '立项与准入',        href: 'intake-stage.html' },
        { key: 'conflict-check',      label: '利益冲突筛查',       href: 'conflict-check.html' },
        { key: 'kyc',                 label: '公共信用快查 KYC',   href: 'kyc.html' },
        { type:'header', label:'—— 尽调 ——' },
        { key: 'dd-stage',            label: '尽职调查',          href: 'dd-stage.html' },
        { key: 'dd-collection',       label: '资料采集与核验',     href: 'dd-collection.html' },
        { key: 'dd-financial-ocr',    label: '财报 OCR 与勾稽',    href: 'dd-financial-ocr.html' },
        { key: 'dd-interview',        label: '访谈管理与转写',     href: 'dd-interview.html' },
        { key: 'field-investigation', label: '现场调研工具',       href: 'field-investigation.html' },
        { key: 'dd-workpaper',        label: '工作底稿管理',       href: 'dd-workpaper.html' },
        { type:'header', label:'—— 建模 ——' },
        { key: 'modeling-stage',      label: '评级建模',          href: 'modeling-stage.html' },
        { key: 'bacp-scoring',        label: 'BACP 智能评分',      href: 'bacp-scoring.html' },
        { key: 'am-adjustment',       label: 'AM 调整 / 外部支持', href: 'am-adjustment.html' },
        { key: 'fusion-engine',       label: '公共信用融合引擎',   href: 'fusion-engine.html' },
        { key: 'subject-rating',      label: '双轨融合引擎（5 步算法）', href: 'subject-rating.html' },
        { key: 'grade-mapping',       label: '等级映射 / 情景测试', href: 'grade-mapping.html' },
        { key: 'peer-benchmark',      label: '同业对标',           href: 'peer-benchmark.html' },
        { type:'header', label:'—— 审核 / 公布 ——' },
        { key: 'review-stage',        label: '报告与审核',        href: 'review-stage.html' },
        { key: 'three-review',        label: '三级审核工作台',     href: 'three-review.html' },
        { key: 'review-proofreading', label: '复核人员定稿审核',   href: 'review-proofreading.html' },
        { key: 'committee-vote',      label: '信评委电子投票',     href: 'committee-vote.html' },
        { key: 'committee-resolution',label: '信评委决议书',       href: 'committee-resolution.html' },
        { key: 'appeal-flow',         label: '复评流程',           href: 'appeal-flow.html' },
        { key: 'client-portal',       label: '客户专用门户',       href: 'client-portal.html' },
        { key: 'disclosure-channels', label: '多渠道披露 + 电子公章', href: 'disclosure-channels.html' },
        { key: 'report-detail',       label: '评级报告（程序指引）', href: 'report-detail.html' },
        { type:'header', label:'—— 跟踪 ——' },
        { key: 'tracking-stage',      label: '跟踪评级阶段',       href: 'tracking-stage.html' },
        { key: 'termination',         label: '终止评级管理',       href: 'termination.html' },
        { type:'header', label:'—— 债项 / 绿债 ——' },
        { key: 'bond-rating',         label: '债项评级',           href: 'bond-rating.html' },
        { key: 'green-bond',          label: '绿色债券评估认证',   href: 'green-bond.html' }
      ]
    },
    /* ============== 系统 ============== */
    {
      key: 'sys', label: '系统',
      items: [
        { key: 'audit-log',           label: '审计日志',           href: 'audit-log.html' },
        { key: 'openapi',             label: '开放平台 OpenAPI',   href: 'openapi.html' },
        { key: 'system',              label: '系统管理',           href: 'system.html' }
      ]
    }
  ];

  // 兼容老代码：扁平化路由（仅取 type !== 'header' 的可点击项）
  const routes = routeGroups.flatMap(g => g.items.filter(it => it.type !== 'header'));

  return { llm, meta, privacy, routeGroups, routes };
})();
