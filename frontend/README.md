# 企业信用状况综合评价智能体（CCASCEA）· 前端

> 远东资信评估有限公司 · 双轨融合 · 评级分析师专属智能体
> V1.0 · 2026-04-28 · 严格遵循国办发〔2026〕8 号文 + GB/T 45255-2025

## 1. 一句话简介

把"双轨融合"国家战略嵌入评级分析师的每日动线——五步闭环工作流（目标录入 → 白盒化解构 → 跨域翻译 → 熔断校验 → 双轨融合报告），辅以 qwen3.6-max-preview 大模型双增强（思考过程可视化 + 12 个内置专业提示词）。

## 2. 启动方式（零构建）

```bash
# 进入 frontend 根目录
cd frontend

# 启动静态 HTTP 服务（任何静态服务都行，python 自带最快）
python -m http.server 8000

# 浏览器访问
# http://localhost:8000/pages/login.html  （登录入口）
# http://localhost:8000/pages/workbench.html  （直接进入工作台）
```

无需 Node 构建、无需 npm 安装；Tailwind 通过 CDN 注入；ECharts 同样。

## 3. 目录结构

```
frontend/
├── README.md                          # 本文件
├── docs/                              # 过程沉淀文件
│   ├── 01_原型设计风格规范手册.md
│   ├── 02_前端需求全量清单.md
│   ├── 03_前端设计方案.md
│   ├── 04_开发执行方案.md
│   └── 05_测试报告.md
├── pages/                             # 14 个 HTML 页面
│   ├── login.html
│   ├── workbench.html
│   ├── subject-rating.html
│   ├── bond-rating.html
│   ├── kyc.html
│   ├── industry-scan.html
│   ├── tracking.html
│   ├── monitoring-report.html
│   ├── reports.html
│   ├── report-detail.html
│   ├── audit-log.html
│   ├── openapi.html
│   ├── system.html
│   └── 404.html
├── assets/
│   ├── css/
│   │   └── theme.css                  # 自定义 utility 与组件类
│   ├── js/
│   │   ├── tailwind.config.js         # Tailwind CDN 运行时配置
│   │   ├── config.js                  # API key、模型、路由表
│   │   ├── mock-data.js               # MockData 全量数据
│   │   ├── copy-corpus.js             # 100% 来自 sfecr 的合规文案库
│   │   ├── common.js                  # gradeBadge/toast/modal/fmt 等
│   │   ├── layout.js                  # mountLayout（顶栏+侧栏+主体）
│   │   ├── prompts.js                 # 12 个内置专业 System Prompt
│   │   └── ai-agent.js                # qwen 大模型客户端 + 思考过程引擎
│   └── img/                           # 装饰矢量
└── data/
    └── sfecr-extracts/                # 从 sfecr 抽取的合规文本片段
```

## 4. 核心页面（14 个）

| 路由 | 用途 |
|------|------|
| `pages/login.html` | 登录页（账号密码 / 企业 SSO） |
| `pages/workbench.html` | 工作台首页 · KPI、五步入口、待办、报告、预警 |
| `pages/subject-rating.html` | 主体评级（五步闭环）· **集成 AI 助手按钮** |
| `pages/bond-rating.html` | 债项评级 |
| `pages/kyc.html` | 客户尽调 KYC（红黄绿） |
| `pages/industry-scan.html` | 行业风险扫描 |
| `pages/tracking.html` | 跟踪评级 · 21 类重大事项 + 订阅 + 实时预警 |
| `pages/monitoring-report.html` | 监管报送 |
| `pages/reports.html` | 我的报告库 |
| `pages/report-detail.html` | 双轨融合评级报告（14 章） |
| `pages/audit-log.html` | 审计日志 + 区块链验证 |
| `pages/openapi.html` | 开放平台 |
| `pages/system.html` | 系统管理（7 Tab） |
| `pages/404.html` | 404 |

## 5. 大模型双增强能力

### 5.1 思考过程可视化（核心 UX）

- 抽屉式 AI 助手：右上角 "AI 助手" 按钮 → 浮出右侧抽屉。
- 6 步标准化思考链时间轴（每步带描述 + 步号 + 当前/已完成态）：
  1. 解析任务
  2. 匹配方法学/制度
  3. 拉取公共信用（八大维度）
  4. 跨域翻译/打分
  5. 合规与红线核查
  6. 生成结论与溯源
- 进度条同步推进 0–100%。
- 流式逐字打字效果；网络异常自动重试 2 次，失败给 toast + 错误卡。

### 5.2 内置专业提示词工程

12 个场景化 System Prompt（覆盖远东评级业务全链路），全部内嵌：
- 国办发〔2026〕8 号 + GB/T 45255-2025 + GB/T 23794-2023 法规框架
- 远东《信用评级业务程序指引》《信评委制度》《尽调制度》《跟踪评级制度》《评级方法规则》《信用等级划分及定义》
- 公共信用 ABCD ↔ 市场化 AAA-D 映射规则
- D 级一票否决红线
- 三级审核流程

调用：
```js
// 程序化调用（页面任意位置）
AIAgent.invoke({
  scene: 'rating-draft',          // 12 选 1
  userInput: '请撰写主体评级初稿',
  context: '【主体快照】...',
  onPhase: (n) => console.log('step', n),
  onDelta: (txt) => console.log(txt),
  onDone:  (full) => console.log(full),
  onError: (e) => console.error(e)
});

// 或一键打开抽屉 + 发送
AIAgent.setScene('fuse-explain');
AIAgent.send('请解释 D 级熔断', '【主体快照】...');
```

### 5.3 主体评级页面集成（subject-rating.html）

- 顶部 "AI 智能助手 · 当前步骤" 按钮：根据当前步骤自动选择最匹配场景：
  - 步 1 → kb-rag（通用知识库 RAG）
  - 步 2 → pub-credit-attribute（八大维度归因）
  - 步 3 → cross-domain-translate（跨域翻译）
  - 步 4 → fuse-explain（熔断校验解释）
  - 步 5 → rating-draft（评级初稿撰写）
- 自动注入被评主体快照（USCC、行业、公共信用、市场化等级、熔断状态）。

## 6. 文案合规

- 前端**所有业务文案**均来自 `assets/js/copy-corpus.js`，每条 `{text, source}` 形式：
  ```js
  Copy.GRADES.AAA       // { text: '偿还债务的能力极强...', source: 'sfecr/业务制度/信用等级划分及定义.pdf' }
  Copy.PUBLIC_GRADES.D  // { text: '严重失信...', source: 'sfecr/政策法规/GB/T 45255-2025...' }
  Copy.POLICY_REDLINE.D_FORBID_A  // 国办发〔2026〕8 号红线条款原文
  ```
- 抽取来源：`materials/sfecr/` 下业务制度（评级业务程序指引、信评委制度、尽调制度、跟踪评级制度、评级方法规则、信用等级划分、评级结果验证和公布制度）+ 政策法规（国办发〔2026〕8 号 + GB/T 45255-2025）+ 主体评级方法学（八大维度示例）。
- 提取的文本片段保留在 `data/sfecr-extracts/` 中，便于审计与回溯。
- UI 通用按钮（确认 / 取消 / 保存 / 导出）单独在 `Copy.UI.*` 命名空间，与业务文案隔离。

## 7. 关键技术与版本

| 类别 | 选型 | 版本 |
|------|------|------|
| HTML | 标准 HTML5 | — |
| 样式 | Tailwind CSS | 3.x（CDN） |
| 图表 | ECharts | 5.4.3（CDN） |
| 大模型 | DashScope OpenAI 兼容协议 SSE | qwen3.6-max-preview |
| JS | 原生 ES2020 | — |
| 启动 | python http.server | 3.x |

不引入任何构建器（Webpack / Vite / esbuild）、不引入框架（React / Vue），保持与原型零构建一致。

## 8. 重要约束

1. API Key（`AppConfig.llm.apiKey`）目前直接落在前端，仅适用于本地 / 内网演示；生产环境必须移到后端代理（参见 PDD §10.3）。
2. 前端 DLP 关键词列表会拦截发送至大模型的内部文本（"机密"、"内部档案" 等）。
3. 浏览器要求：Chrome / Edge / Firefox / Safari 最新两版本；最低分辨率 1366×768。

## 9. 兼容性 & 可访问性

- PC 主流分辨率（1366×768、1440×900、1920×1080）全部经测试。
- 中文字体优先 PingFang SC / 微软雅黑；数字 SF Mono / Consolas。
- 表单 label 与 aria-label 完整；ESC 关闭弹窗。

## 10. 进一步资料

- `docs/01_原型设计风格规范手册.md` —— 配色、字体、组件、布局、交互全规范
- `docs/02_前端需求全量清单.md` —— 14 页 + 通用 + 大模型 + 文案合规
- `docs/03_前端设计方案.md` —— 技术栈、目录、流程
- `docs/04_开发执行方案.md` —— 25 个细颗粒开发步骤
- `docs/05_测试报告.md` —— 全量测试与缺陷修复记录
