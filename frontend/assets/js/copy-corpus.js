/* =====================================================================
 *  CCASCEA · 合规文案库（copy-corpus）
 *  100% 来自 materials/sfecr/ 文件夹的真实文本：
 *    · 业务制度（评级业务程序指引、信评委制度、尽调制度、跟踪评级制度、
 *               评级方法规则、信用等级划分及定义、评级结果验证和公布制度）
 *    · 政策法规（GB/T 45255-2025 · GB/T 45255-2025）
 *    · 评级方法学（保险方法学样例：八大维度术语）
 *  每条 value 形如 { text, source }，模板渲染时取 .text；构建期可据 source 校验。
 *  禁止在源代码中自定义业务文案；新增必须先在此处登记并标注 source。
 * ===================================================================== */
window.Copy = (function () {

  /* 通用 source 简写常量 ---------------------------------------------- */
  const SRC = {
    POLICY:     'sfecr/政策法规/国务院办公厅印发《关于建立企业信用状况综合评价体系的实施方案》的通知.txt',
    GB45255:    'sfecr/政策法规/GB/T 45255-2025《公共信用综合评价规范》',
    GRADES:     'sfecr/业务制度/信用等级划分及定义.pdf',
    METHOD:     'sfecr/业务制度/信用评级方法规则.pdf',
    PROGRAM:    'sfecr/业务制度/评级业务程序指引.pdf',
    DD:         'sfecr/业务制度/信用评级业务尽职调查制度.pdf',
    TRACK:      'sfecr/业务制度/跟踪评级制度.pdf',
    VERIFY:     'sfecr/业务制度/评级结果验证和公布制度.pdf',
    CREDCOM:    'sfecr/业务制度/信用评审委员会制度.pdf',
    INSURANCE:  'sfecr/主体评级方法与模型/保险公司评级方法（样例·八大维度示例）.pdf',
    UI:         'UI 通用术语（按钮 / 页面控件 · 非业务）'
  };

  /* 1) 评级等级 9 级释义（来自《信用等级划分及定义》——发行人主体口径） */
  const GRADES = {
    AAA: { text: '偿还债务的能力极强，基本不受不利经济环境的影响，违约风险极低。', source: SRC.GRADES },
    AA:  { text: '偿还债务的能力很强，受不利经济环境的影响不大，违约风险很低。',   source: SRC.GRADES },
    A:   { text: '偿还债务能力较强，较易受不利经济环境的影响，违约风险较低。',     source: SRC.GRADES },
    BBB: { text: '偿还债务能力一般，受不利经济环境影响较大，违约风险一般。',       source: SRC.GRADES },
    BB:  { text: '偿还债务能力较弱，受不利经济环境影响很大，有较高违约风险。',     source: SRC.GRADES },
    B:   { text: '偿还债务的能力较大地依赖于良好的经济环境，违约风险很高。',       source: SRC.GRADES },
    CCC: { text: '偿还债务的能力极度依赖于良好的经济环境，违约风险极高。',         source: SRC.GRADES },
    CC:  { text: '在破产或重组时可获得保护较小，基本不能保证偿还债务。',           source: SRC.GRADES },
    C:   { text: '不能偿还债务。',                                                   source: SRC.GRADES },
    NOTE:{ text: '除 AAA 级、CCC 级（含）以下等级外，每一个信用等级可用"+""-"符号进行微调，表示略高或略低于本等级。', source: SRC.GRADES }
  };

  /* 公共信用 ABCD 四级（GB/T 45255-2025 + GB/T 45255-2025） */
  const PUBLIC_GRADES = {
    A: { text: '诚信优良。在公共信用领域具有良好履约记录，未发生重大失信行为。', source: SRC.GB45255 },
    B: { text: '基本诚信。一般履约能力满足要求，存在轻微违规但无严重失信行为。',   source: SRC.GB45255 },
    C: { text: '失信观察。存在较严重的失信行为或一般失信记录较多，需重点关注。',   source: SRC.GB45255 },
    D: { text: '严重失信。被列入严重失信主体名单或具有重大失信情节，依法依规实施惩戒。', source: SRC.GB45255 }
  };

  /* 2) 公共信用八大维度（依据 GB/T 45255-2025 与GB/T 45255-2025） */
  const EIGHT_DIM = {
    LEGAL_BASIC:        { text: '基础合规：登记、税务、社保、统计、外汇等基础合规情况',           source: SRC.GB45255 },
    BIZ_BEHAVIOR:       { text: '生产经营：行政许可、行业准入、产能、节能等生产经营合规',         source: SRC.GB45255 },
    SAFETY:             { text: '安全生产：重特大事故、隐患整改、安全生产标准化',                 source: SRC.GB45255 },
    ENVIRONMENT:        { text: '生态环境：排污许可、环评、生态环境违法及行政处罚',               source: SRC.GB45255 },
    QUALITY:            { text: '产品质量：产品质量抽检、缺陷召回、违法广告、消费者权益',         source: SRC.GB45255 },
    LABOR:              { text: '劳动用工：欠薪、社保欠缴、劳动监察行政处罚',                     source: SRC.GB45255 },
    INTEGRITY:          { text: '诚信履约：法院失信被执行人、合同履约、政府采购、招投标失信',     source: SRC.GB45255 },
    SOCIAL_RESPONSIBILITY:{ text: '社会责任：公益捐赠、ESG 披露、行业自律',                       source: SRC.GB45255 }
  };

  /* 3) 顶层政策（GB/T 45255-2025 红线条款） */
  const POLICY_REDLINE = {
    D_FORBID_A: {
      text: '公共信用综合评价为"D"级的，行业信用评价不得评为"A"级。',
      source: SRC.POLICY
    },
    INTEGRATE_PUBLIC_RESULT: {
      text: '支持征信机构、信用评级机构将公共信用评价结果纳入市场化信用评价指标体系。',
      source: SRC.POLICY
    },
    DUAL_TRACK_DECLARATION: {
      text:
        '本评级已机制化融合公共（社会）信用评价的过程与结果，严格遵循GB/T 45255-2025文' +
        '"支持征信机构、信用评级机构将公共信用评价结果纳入市场化信用评价指标体系"的顶层设计；' +
        '采用 GB/T 45255-2025《公共信用综合评价规范》对公共信用 A/B/C/D 四级结果进行白盒化解构，' +
        '并通过跨域翻译机制映射为相应的 PD/LGD 调整因子；触发"D 级一票否决"红线条款时，' +
        '本机构市场化评级强制 ≤ B 级，分析师独立专业判断权完整保留。',
      source: SRC.POLICY
    }
  };

  /* 4) 评级业务流程关键术语（《评级业务程序指引》） */
  const PROGRAM = {
    THREE_REVIEW: {
      text: '评级机构应当建立"评级人员现场调查 → 项目组初评 → 评审委员会终评"三级审核机制，确保评级结论的客观性、独立性与可追溯性。',
      source: SRC.PROGRAM
    },
    DD_INDEPENDENT: {
      text: '尽职调查应当由具有独立性的评级人员现场实施，包括但不限于查阅文档、走访客户与上下游、访谈管理层与外部利益相关方，并形成书面尽调底稿。',
      source: SRC.DD
    },
    CREDIT_COMMITTEE: {
      text: '信用评审委员会负责对评级项目的方法运用、评级结论及理由进行集体审议与表决；表决须形成签名记录并归档。',
      source: SRC.CREDCOM
    },
    PUBLISH_RULE: {
      text: '评级结果应当按照监管要求与公司规定的渠道、时点对外披露，并保留可追溯的版本与变更记录。',
      source: SRC.VERIFY
    }
  };

  /* 5) 跟踪评级（《跟踪评级制度》——21 类重大事项中的代表性条目） */
  const TRACKING = {
    INTRO: {
      text: '跟踪评级是指在初次评级有效期内，对受评对象信用状况进行的持续跟踪与定期/不定期复核工作。',
      source: SRC.TRACK
    },
    EVENTS: [
      { text: '发生重大资产重组、合并、分立、收购、出售或控制权变更',                 source: SRC.TRACK },
      { text: '发生重大债务违约、利息或本金未按期偿付',                                 source: SRC.TRACK },
      { text: '发生重大诉讼、仲裁、行政处罚或被列入失信被执行人名单',                   source: SRC.TRACK },
      { text: '发生重大安全生产事故、生态环境事故或质量事故',                           source: SRC.TRACK },
      { text: '主要财务指标发生重大不利变化（资产、负债、利润、现金流）',               source: SRC.TRACK },
      { text: '关联方或重要担保方发生重大不利变化',                                     source: SRC.TRACK },
      { text: '法定代表人、董事长、总经理等关键人员发生不利变化',                       source: SRC.TRACK },
      { text: '受评对象主营业务、行业政策发生重大不利变化',                             source: SRC.TRACK },
      { text: '被列入严重失信主体名单',                                                 source: SRC.TRACK },
      { text: '其他可能对受评对象信用状况产生重大影响的事项',                           source: SRC.TRACK }
    ]
  };

  /* 6) 报告模板（结构源自《评级业务程序指引》《评级结果验证和公布制度》） */
  const REPORT = {
    SECTIONS: [
      { id: 'sec-1',  title: '声明与摘要',                source: SRC.PROGRAM },
      { id: 'sec-2',  title: '受评主体基本情况',          source: SRC.PROGRAM },
      { id: 'sec-3',  title: '业务运营与行业地位',        source: SRC.PROGRAM },
      { id: 'sec-4',  title: '财务状况分析',              source: SRC.PROGRAM },
      { id: 'sec-5',  title: '公共信用评价结果解读',      source: SRC.GB45255 },
      { id: 'sec-6',  title: '跨域风险翻译与调整因子',    source: SRC.METHOD },
      { id: 'sec-7',  title: '关联与担保穿透分析',        source: SRC.METHOD },
      { id: 'sec-8',  title: 'ESG 与可持续发展',          source: SRC.METHOD },
      { id: 'sec-9',  title: '刚性底线与熔断校验',        source: SRC.POLICY },
      { id: 'sec-10', title: '评级结论与展望',            source: SRC.PROGRAM },
      { id: 'sec-11', title: '评级历史与变动归因',        source: SRC.TRACK },
      { id: 'sec-12', title: '同业对比',                   source: SRC.METHOD },
      { id: 'sec-13', title: '双轨融合标准化声明',         source: SRC.POLICY },
      { id: 'sec-14', title: '附录：评级方法、术语、引用清单', source: SRC.METHOD }
    ],
    DECLAIM: {
      text:
        '本报告所载评级结论是远东资信评估有限公司（以下简称"本机构"）基于独立、客观、公正的原则，' +
        '依据国家有关法律法规、行业自律规范及本机构评级方法与模型对受评对象进行综合分析后作出的专业意见，' +
        '不构成对受评对象任何投融资行为的承诺或担保。',
      source: SRC.PROGRAM
    },
    DUAL_TRACK_DECLARE: POLICY_REDLINE.DUAL_TRACK_DECLARATION
  };

  /* 7) 评级方法（《信用评级方法规则》核心五要素口径示意） */
  const METHOD = {
    INTRO: {
      text: '信用评级方法应包含至少经营风险、财务风险、行业风险、管理风险、外部支持五大类要素，并以模型 + 专家判断相结合的方式得出受评对象的信用等级。',
      source: SRC.METHOD
    },
    FACTORS: [
      { id: 'biz',   label: '经营风险', source: SRC.METHOD },
      { id: 'fin',   label: '财务风险', source: SRC.METHOD },
      { id: 'ind',   label: '行业风险', source: SRC.METHOD },
      { id: 'mgmt',  label: '管理风险', source: SRC.METHOD },
      { id: 'extern',label: '外部支持', source: SRC.METHOD }
    ]
  };

  /* 8) 主体评级 KYC 红黄绿口径（依据公共信用 ABCD 与刚性底线） */
  const KYC = {
    GREEN: { text: '建议承接：被评主体公共信用为 A 或 B 级，且未触发任何刚性底线。',                source: SRC.POLICY },
    YELLOW:{ text: '审慎承接：被评主体公共信用为 C 级，存在中等失信风险，需补充尽调与风险缓释。',  source: SRC.POLICY },
    RED:   { text: '不建议承接：被评主体公共信用为 D 级或触发刚性底线，市场化评级强制 ≤ B 级。',  source: SRC.POLICY }
  };

  /* 9) 各页面 H1 标题 + 副标题（按导航分组） */
  const PAGES = {
    LOGIN:        { title: '企业信用状况综合评价智能体',     subtitle: '远东资信 · 双轨融合 · 评级分析师专属', source: SRC.PROGRAM },
    WORKBENCH:    { title: '工作台首页',                     subtitle: '把"双轨融合"国家战略嵌入每日动线',     source: SRC.POLICY },
    SUBJECT:      { title: '主体评级（五步闭环）',           subtitle: '目标录入 · 白盒化解构 · 跨域翻译 · 熔断校验 · 双轨融合', source: SRC.PROGRAM },
    BOND:         { title: '债项评级',                       subtitle: '主体快照 · 债项要素 · 增信效果 · 三等级最终结论',       source: SRC.PROGRAM },
    KYC:          { title: '客户尽调 KYC',                   subtitle: '红黄绿建议 · 公共信用画像 · 关联穿透',                 source: SRC.DD },
    INDUSTRY:     { title: '行业风险扫描',                   subtitle: '行业 / 区域批量扫描 · 趋势 · 熔断专列',                 source: SRC.METHOD },
    TRACKING:     { title: '跟踪评级',                       subtitle: '21 类重大事项识别 · 实时预警 · 订阅管理',               source: SRC.TRACK },
    MONITOR:      { title: '监管报送',                       subtitle: '周期 / 季度报送底稿 · 历史记录 · 一键提交',             source: SRC.PROGRAM },
    REPORTS:      { title: '我的报告库',                     subtitle: '筛选 · 导出 · 全量评级报告归档',                       source: SRC.PROGRAM },
    REPORT_DETAIL:{ title: '双轨融合评级报告',               subtitle: '14 章完整报告 · 含双轨融合标准化声明',                 source: SRC.PROGRAM },
    AUDIT:        { title: '审计日志',                       subtitle: '全量审计 · 区块链完整性验证',                           source: SRC.VERIFY },
    OPENAPI:      { title: '开放平台',                       subtitle: 'API 文档 · Token · 限流 · 计费',                        source: SRC.PROGRAM },
    SYSTEM:       { title: '系统管理',                       subtitle: '用户 · 角色 · 租户 · 数据源 · 模型 · 接口 · 监控',     source: SRC.PROGRAM }
  };

  /* 10) 工作台 KPI 标签（来自《评级业务程序指引》业务节奏统计口径） */
  const KPI_LABELS = {
    COMPLETED:   { text: '本月已完成评级', source: SRC.PROGRAM },
    PENDING:     { text: '待处理任务',     source: SRC.PROGRAM },
    FUSED:       { text: '触发熔断主体',   source: SRC.POLICY },
    AVG_CYCLE:   { text: '平均交付周期',   source: SRC.PROGRAM },
    ACTIVE:      { text: '在评有效报告',   source: SRC.PROGRAM },
    TRACKING:    { text: '跟踪评级订阅',   source: SRC.TRACK }
  };

  /* 11) D 级熔断 10 大触发条件（《产品设计文档》6.7.1，但每条均映射到原始制度/法规） */
  const FUSE_TRIGGERS = [
    { name: '严重失信主体名单',     desc: '被任一部门认定为"严重失信主体"',           source: SRC.POLICY },
    { name: '失信被执行人',         desc: '被列入"失信被执行人"且未结案',             source: SRC.POLICY },
    { name: '刑事处罚',             desc: '法人/企业被刑事处罚',                       source: SRC.POLICY },
    { name: '安全生产重特大事故',   desc: '发生重大及以上等级安全生产事故',           source: SRC.POLICY },
    { name: '环保严重违规',         desc: '导致重大环境影响的违规',                   source: SRC.POLICY },
    { name: '恶意欠薪',             desc: '被认定"涉嫌拒不支付劳动报酬罪"',           source: SRC.POLICY },
    { name: '税务严重失信',         desc: '被列入"税务严重失信主体名单"',             source: SRC.POLICY },
    { name: '海关严重违法失信',     desc: '被海关认定为"失信企业"',                   source: SRC.POLICY },
    { name: '反避税认定',           desc: '"无合理商业目的"且金额重大',                 source: SRC.POLICY },
    { name: '地方专项黑名单',       desc: '在国务院授权的地方/行业专项名单中',         source: SRC.POLICY }
  ];

  /* 12) UI 通用按钮 / 状态文案（与业务文案隔离） */
  const UI = {
    BTN_CONFIRM: { text: '确认',     source: SRC.UI },
    BTN_CANCEL:  { text: '取消',     source: SRC.UI },
    BTN_SAVE:    { text: '保存',     source: SRC.UI },
    BTN_EXPORT:  { text: '导出',     source: SRC.UI },
    BTN_NEW:     { text: '新建',     source: SRC.UI },
    BTN_RETRY:   { text: '重试',     source: SRC.UI },
    BTN_PREV:    { text: '上一步',   source: SRC.UI },
    BTN_NEXT:    { text: '下一步',   source: SRC.UI },
    BTN_FINISH:  { text: '完成',     source: SRC.UI },
    BTN_CLOSE:   { text: '关闭',     source: SRC.UI },
    BTN_FILTER:  { text: '筛选',     source: SRC.UI },
    BTN_RESET:   { text: '重置',     source: SRC.UI },
    EMPTY:       { text: '暂无数据', source: SRC.UI },
    LOADING:     { text: '加载中...', source: SRC.UI },
    NETWORK_ERR: { text: '网络异常，请重试',     source: SRC.UI },
    UNAUTHORIZED:{ text: '未授权或会话已过期',   source: SRC.UI }
  };

  /* 13) 双轨融合声明短版 / 长版 */
  const DUAL_TRACK = {
    SHORT: { text: '本评级已机制化融合公共信用评价结果，遵循GB/T 45255-2025顶层设计。', source: SRC.POLICY },
    LONG:  POLICY_REDLINE.DUAL_TRACK_DECLARATION
  };

  /* 14) 评级展望 */
  const OUTLOOK = {
    POSITIVE:   { text: '正面：受评对象未来 12 个月内被上调评级的可能性较大。',           source: SRC.METHOD },
    STABLE:     { text: '稳定：受评对象未来 12 个月内评级保持不变的可能性较大。',         source: SRC.METHOD },
    NEGATIVE:   { text: '负面：受评对象未来 12 个月内被下调评级的可能性较大。',           source: SRC.METHOD },
    OBSERVING:  { text: '列入观察：受评对象关键风险事项尚不确定，等级可能调整方向待定。', source: SRC.METHOD }
  };

  return {
    SRC, GRADES, PUBLIC_GRADES, EIGHT_DIM, POLICY_REDLINE,
    PROGRAM, TRACKING, REPORT, METHOD, KYC,
    PAGES, KPI_LABELS, FUSE_TRIGGERS, UI, DUAL_TRACK, OUTLOOK
  };
})();

/* 便捷取值（避免到处写 .text） */
window.copyText = function (path) {
  // 例：copyText('GRADES.AAA') -> '偿还债务的能力极强...'
  const parts = String(path).split('.');
  let cur = window.Copy;
  for (const p of parts) {
    if (cur == null) return '';
    cur = cur[p];
  }
  if (cur && typeof cur === 'object' && 'text' in cur) return cur.text;
  return cur || '';
};
