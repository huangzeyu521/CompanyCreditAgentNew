# -*- coding: utf-8 -*-
"""批量升级 33 个页面的 AI 按钮：注入业务上下文 + 任务化提示词 + 专属场景"""
import os, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
os.chdir(os.path.join(os.path.dirname(__file__), '..', 'pages'))

UPGRADES = {}

# bacp-scoring
UPGRADES['bacp-scoring.html'] = (
'''function askAIBACP() {
  AIAgent.setScene('kb-rag');
  AIAgent.send('请按"工商企业评级方法 V03" BACP 模型解释 4 个一级要素的权重设计与 8 档阈值打分逻辑。');
}''',
'''function askAIBACP() {
  // 注入 BACP 评分上下文，让 AI 替评级师做"逐要素诊断 + 优化建议"
  const factors = MockData.bacpFactors;
  const composite = MockData.bacpComposite;
  const ctx = '【当前主体】南京钢铁联合有限公司（钢铁制造 C31）\\n' +
              '【BACP 综合得分】' + composite + '/8 → 个体等级 aa\\n' +
              '【4 一级要素】\\n' +
              factors.map(f => '· ' + f.level1 + '（权重' + (f.weight*100).toFixed(0) + '%）：' + f.score.toFixed(1) + '/8 · 二级指标 ' + f.l2.length + ' 项').join('\\n') + '\\n' +
              '【行业 P50 基准】6.4 / 8（钢铁制造行业中位）';
  AIAgent.setScene('bacp-explain');
  AIAgent.send('请基于上述当前 BACP 评分明细，对该主体逐要素诊断：① 识别得分异常的二级指标（与行业 P50 偏离 ≥ 1 子级）② 给出每个一级要素的优化建议 ③ 推荐最终个体信用等级 ④ 引用《信用评级方法规则》对应章节。', ctx);
}''')

# am-adjustment
UPGRADES['am-adjustment.html'] = (
'''function askAIAM() {
  AIAgent.setScene('kb-rag');
  AIAgent.send('请按远东《工商企业评级方法 V03》解释 AM 9 类调整因素的设计逻辑与典型评分案例。');
}''',
'''function askAIAM() {
  const am = MockData.amAdjustments;
  const total = MockData.amTotalDelta.toFixed(2);
  const ext = MockData.externalSupport;
  const ctx = '【当前主体】南京钢铁联合有限公司\\n【AM 9 类调整明细】\\n' +
              am.map(a => '· ' + a.name + '：建议 ' + a.delta + ' 子级（' + a.evidence + '）').join('\\n') + '\\n' +
              '【AM 合计】' + (parseFloat(total)>0?'+':'') + total + ' 子级\\n' +
              '【外部支持】' + ext.parent.name + '（' + ext.parent.supportLevel + '支持）+ ' + ext.govt.name + '（' + ext.govt.supportLevel + '）+ ' + ext.guarantee.name + '（' + ext.guarantee.supportLevel + '）';
  AIAgent.setScene('am-explain');
  AIAgent.send('请基于以上 AM 调整明细：① 逐项点评调整方向与幅度合理性 ② 识别 TOP3 影响最大的因素 ③ 评级师可调整的建议（哪些因素应上调/下调）+ 调整理由 ④ 引用《信用评级方法规则》对应章节。', ctx);
}''')

# fusion-engine
UPGRADES['fusion-engine.html'] = (
'''function askAIFusion() {
  AIAgent.setScene('cross-domain-translate');
  AIAgent.send('请按 SRS §3.8 解释公共信用融合引擎的硬性约束、软性参考调整规则，以及八大维度如何融入 BACP / AM。');
}''',
'''function askAIFusion() {
  const dims = MockData.eightDimensions;
  const ctx = '【八大维度权重】\\n' +
              dims.map(d => '· ' + d.name + ' ' + (d.weight*100).toFixed(0) + '% · ' + d.metrics).join('\\n') + '\\n' +
              '【当前主体】南京钢铁联合有限公司 · 公共信用 B 级\\n【红线状态】未触发 D 级硬性约束';
  AIAgent.setScene('cross-domain-translate');
  AIAgent.send('请基于上述八大维度配置，逐一翻译公共信用扣分项 → BACP/AM 调整因子：① 列出每个维度的扣 / 加分事件 ② 行业敏感系数 ③ PD/LGD 调整数值或区间 ④ 现金流年化影响 ⑤ 评级师采纳/否决/修改建议（含理由）。', ctx);
}''')

# peer-benchmark
UPGRADES['peer-benchmark.html'] = (
'''function askAIPeer() {
  AIAgent.setScene('peer-compare');
  AIAgent.send('请基于钢铁行业 5 家可比同业的财务数据，输出 80 字内投资人友好摘要 + 同业对比的 3 个关键洞察。');
}''',
'''function askAIPeer() {
  const peers = MockData.peers;
  const ctx = '【可比同业 5 家财务数据】\\n' +
              peers.map(p => '· ' + p.name + '：' + p.grade + ' 级 / 营收 ' + fmtNum(p.revenue) + '万 / 净利 ' + fmtNum(p.netProfit) + '万 / 资产负债率 ' + p.debtRatio + ' / ROE ' + p.roe).join('\\n');
  AIAgent.setScene('peer-compare');
  AIAgent.send('请基于以上同业数据：① 财务结构差异（资产负债率 / 毛利率 / 现金流 / 利润率）逐项对比 ② 评级差异原因（同行业 vs 本主体）③ 行业地位判断（前 X% / 中位 / 后 X%）④ 投资人友好型摘要（80 字内）⑤ 给评级师的 3 条决策建议。', ctx);
}''')

# committee-agenda
UPGRADES['committee-agenda.html'] = (
'''function askAIAgenda() {
  AIAgent.setScene('committee-agenda');
  AIAgent.send('请基于本次议程 3 个议项，输出每个议项的"5 分钟决策包"摘要。');
}''',
'''function askAIAgenda() {
  const a = MockData.committeeAgenda;
  const ctx = '【本期信评委议项】\\n' +
              a.map(it => '· ' + it.id + ' ' + it.subject + '：' + it.type + ' · 拟定 ' + it.proposedGrade + ' · 公共信用 ' + it.publicGrade + ' · 风险 ' + it.risk + ' · 关注：' + it.focus).join('\\n');
  AIAgent.setScene('committee-agenda');
  AIAgent.send('请基于本次 3 个议项：① 每个议项 5 分钟决策包（主体+行业+评级类型+拟定等级+关键风险 3 条+关键缓释 3 条+合规提醒+投票建议项）② 红线议项专项提醒 ③ 委员关注重点。', ctx);
}''')

# three-review
UPGRADES['three-review.html'] = (
'''function askAIReview() {
  AIAgent.setScene('three-review-diff');
  AIAgent.send('请检测三级审核中各级结论的差异并给出审议建议。');
}''',
'''function askAIReview() {
  const tr = MockData.threeReview;
  const ctx = '【当前三级审核状态】\\n' +
              tr.map(s => '· ' + s.stage + '（' + s.reviewer + '）：' + s.verdict + ' · ' + s.remarks).join('\\n') + '\\n' +
              '【三审待签】评级总监 周建华 待审';
  AIAgent.setScene('three-review-diff');
  AIAgent.send('请基于上述三级审核现状：① 列出各级结论的差异点（等级 / 展望 / 关键论据）② 差异原因分类（方法运用 / 数据更新 / 合规判断 / 主观分歧）③ 给出 3 条三审审议建议（针对争议焦点）④ 引用《信用评审委员会制度》对应条款。', ctx);
}''')

# review-stage
UPGRADES['review-stage.html'] = (
'''function askAIReview() {
  AIAgent.setScene('three-review-diff');
  AIAgent.send('请按《信用评级业务程序指引》第十八至四十三条详细解释三级审核 + 信评委 + 复评 + 报告定稿 + 公布归档的完整流程。');
}''',
'''function askAIReview() {
  const tr = MockData.threeReview;
  const agenda = MockData.committeeAgenda;
  const ctx = '【报告与审核阶段进度】\\n三级审核：' + tr.filter(x=>x.verdict.includes('通过')).length + '/' + tr.length + ' 通过\\n本期信评委议项：' + agenda.length + ' 项 · D 级红线：' + agenda.filter(x=>x.publicGrade==='D').length + ' 项';
  AIAgent.setScene('three-review-diff');
  AIAgent.send('请基于当前阶段进度：① 待办事项 TOP5 + 优先级 ② 三级审核可能的争议点预警 ③ 信评委议项中的 D 级红线锁定校验 ④ 评级总监签字前的合规检查清单。', ctx);
}''')

# credit-repair-sync
UPGRADES['credit-repair-sync.html'] = (
'''function askAIRepair() {
  AIAgent.setScene('repair-path');
  AIAgent.send('请按国办发〔2026〕8 号第十条 + 国办发〔2025〕22 号信用修复制度，详细解释信用修复联动机制及评级师的处置流程。');
}''',
'''function askAIRepair() {
  const events = MockData.creditRepairEvents;
  const pending = events.filter(e => e.status === '待评级师确认');
  const ctx = '【本月修复事件】' + events.length + ' 项\\n【待评级师确认】' + pending.length + ' 项\\n' +
              pending.map(e => '· ' + e.subject + '（' + e.repairType + '）' + e.publicGradeBefore + '→' + e.publicGradeAfter).join('\\n');
  AIAgent.setScene('repair-path');
  AIAgent.send('请基于以上修复事件：① 逐条评估对评级的实际影响（建议立即重评 / 计入下次跟踪 / 不影响）② "谁认定谁修复"原则核对 ③ 重新评级建议子级 ④ 给客户的免费通知模板（80 字内）⑤ 引用国办发〔2026〕8 号第十、十一条。', ctx);
}''')

# public-credit-catalog
UPGRADES['public-credit-catalog.html'] = (
'''function askAICatalog() {
  AIAgent.setScene('pub-credit-attribute');
  AIAgent.send('请详细解读 GB/T 45255-2025 八大维度的指标含义、采集规则、与评级 BACP/AM 的对接逻辑。');
}''',
'''function askAICatalog() {
  const dims = MockData.eightDimensions;
  const cat = MockData.publicCreditCatalog;
  const ctx = '【GB/T 45255-2025 八大维度】\\n' +
              dims.map(d => '· ' + d.name + '（权重' + (d.weight*100).toFixed(0) + '%）· ' + d.metrics).join('\\n') + '\\n' +
              '【6 大类共享字段】共 ' + cat.length + ' 个子类、' + cat.reduce((s,x)=>s+x.fields.length,0) + ' 个字段';
  AIAgent.setScene('pub-credit-attribute');
  AIAgent.send('请基于以上八大维度配置：① 解读每个维度的核心评分逻辑 ② 与远东 BACP/AM 的指标级映射（哪个维度→哪个 BACP 一级要素 / 哪个 AM 调整因素）③ 各维度的权重合理性评估 ④ 给评级师的"如何在评级建模中正确应用八大维度"的 5 条建议。', ctx);
}''')

# tracking-stage
UPGRADES['tracking-stage.html'] = (
'''function askAITracking() {
  AIAgent.setScene('track-events');
  AIAgent.send('请按《跟踪评级制度》第七条详细列出 21 类重大事项的判定标准与不定期跟踪触发逻辑。');
}''',
'''function askAITracking() {
  const subs = MockData.trackingSubscriptions;
  const alerts = MockData.alerts;
  const ctx = '【订阅主体】' + subs.length + ' 家\\n【近期预警】' + alerts.length + ' 条（红 ' + alerts.filter(a=>a.level==='red').length + ' / 黄 ' + alerts.filter(a=>a.level==='yellow').length + ' / 蓝 ' + alerts.filter(a=>a.level==='blue').length + '）\\n【重点关注主体】' + alerts.map(a=>a.subject).join(' / ');
  AIAgent.setScene('track-events');
  AIAgent.send('请基于以上订阅与预警态势：① 列出本期可能命中 21 类重大事项的主体 ② 给出每个主体的事件分类 + 等级影响判断（上调/不变/下调/列入观察）③ 建议触发的跟踪动作（定期 / 不定期 / 立即专项）④ 给客户经理的 3 句话沟通要点。', ctx);
}''')

# dd-collection
UPGRADES['dd-collection.html'] = (
'''function askAIDD() {
  AIAgent.setScene('kb-rag');
  AIAgent.send('请按《信用评级业务尽职调查制度》给出工商企业首次评级的标准资料清单与访谈提纲生成逻辑。', '当前页面：智能尽调 · 资料采集与核验');
}''',
'''function askAIDD() {
  const list = MockData.ddChecklist;
  const sources = MockData.ddSources;
  const ctx = '【当前资料清单】' + list.length + ' 项 · 已收 ' + list.filter(x=>x.received).length + ' 项\\n' +
              '【待补资料】' + (list.filter(x=>!x.received).map(x=>x.item).join(' / ') || '无') + '\\n' +
              '【数据源调用】' + sources.length + ' 个 · 异常 ' + sources.filter(s=>s.status!=='success').length + ' 个';
  AIAgent.setScene('dd-checklist-gen');
  AIAgent.send('请基于上述尽调资料状态：① 评估当前资料完整性（哪些缺失项最关键）② 给出待补资料的催办优先级 + 客户经理沟通话术 ③ 异常数据源（生态环境部 / ESG）的备选采集方案 ④ 实地调研建议（针对待核验异常项）⑤ 引用《尽职调查制度》对应条款。', ctx);
}''')

# dd-financial-ocr
UPGRADES['dd-financial-ocr.html'] = (
'''function askAIFin() {
  AIAgent.setScene('kb-rag');
  AIAgent.send('请按远东《工商企业评级方法》给出三表勾稽关键检查点与异常解读。', '当前页面：财报 OCR + 三表勾稽');
}''',
'''function askAIFin() {
  const fin = MockData.ddFinancial;
  const inc = fin.income.find(x=>x.item.includes('营业总收入'))||{y2025:0};
  const np  = fin.income.find(x=>x.item.includes('净利润'))||{y2025:0};
  const ctx = '【财报概况】OCR 处理 ' + fin.pages + ' 页 · 准确率 ' + fin.ocrAccuracy + '%\\n' +
              '【关键财务】营收 2025 ' + fmtNum(inc.y2025) + '万 / 净利润 ' + fmtNum(np.y2025) + '万\\n' +
              '【三表勾稽】' + fin.crossChecks.length + ' 项规则 · 异常 ' + fin.crossChecks.filter(c=>!c.ok).length + ' 项';
  AIAgent.setScene('kb-rag');
  AIAgent.send('请基于上述财务数据：① 三表勾稽关键风险点识别（净利润 vs 经营现金流 / 应收账款周转 / 存货周转）② 财务质量诊断（盈利质量 / 现金流质量）③ 与同业的偏离信号 ④ BACP "盈利能力" + "流动性"评分建议得分 ⑤ 引用《工商企业评级方法》。', ctx);
}''')

# dd-interview
UPGRADES['dd-interview.html'] = (
'''function askAIInterview() {
  AIAgent.setScene('kb-rag');
  AIAgent.send('请按《信用评级业务尽职调查制度》给出 CFO 访谈的标准提纲与禁问事项。', '当前页面：访谈管理与录音转写');
}''',
'''function askAIInterview() {
  const list = MockData.ddInterviews;
  const ctx = '【本项目访谈】' + list.length + ' 场 · 已转写 ' + list.filter(i=>i.transcribed).length + ' 场\\n' +
              '【关键风险点标注】' + list.reduce((s,i)=>s+i.riskFlags,0) + ' 处\\n' +
              '【访谈记录】' + list.map(i => '· ' + i.topic + '（' + i.durationMin + '分）：' + i.summary).join('\\n');
  AIAgent.setScene('dd-checklist-gen');
  AIAgent.send('请基于以上访谈内容：① 关键风险点提炼 TOP5（含原文证据）② 受访人观点的可信度评估 ③ 缺失访谈对象建议（哪些岗位还需补充访谈）④ 后续问询提纲建议 ⑤ 评级师可信判断（基于访谈对评级的支持/反对）。', ctx);
}''')

# field-investigation
UPGRADES['field-investigation.html'] = (
'''function askAIField() {
  AIAgent.setScene('kb-rag');
  AIAgent.send('请按《信用评级业务尽职调查制度》第十一条详细解释实地调研的标准动作清单与禁问事项。');
}''',
'''function askAIField() {
  const visits = MockData.fieldVisits;
  const cur = visits.find(v => v.status === '进行中') || visits[0];
  const ctx = '【当前调研】' + cur.subject + ' · ' + cur.location + '\\n' +
              '【进度】GPS 打卡 ' + (cur.gpsCheck?'✓':'✗') + ' · 照片 ' + cur.photos + ' 张 · 录像 ' + cur.videos + ' 条 · 签字 ' + cur.signatures + ' 次\\n' +
              '【调研人员】' + cur.visitor;
  AIAgent.setScene('field-investigation');
  AIAgent.send('请基于以上现场调研进度：① 还需观察的重点（厂区/车间/仓库哪些角度）② 待补拍照清单 ③ 受访人签字遗漏对象 ④ 现场禁问事项再提醒 ⑤ 调研结束前的合规校验 6 项 ⑥ 引用《尽调制度》第十一条。', ctx);
}''')

# methodology-version
UPGRADES['methodology-version.html'] = (
'''function askAIMethod() {
  AIAgent.setScene('kb-rag');
  AIAgent.send('请按《评级方法、模型与程序的生效、改进和定期审查制度》解释方法学版本生效的 6 步流程，以及评级标准委员会的职责。');
}''',
'''function askAIMethod() {
  const ms = MockData.methodVersions;
  const ctx = '【在用方法学】' + ms.length + ' 份\\n【已验证公开样例】' + ms.filter(m=>m.isVerified).length + ' 份';
  AIAgent.setScene('kb-rag');
  AIAgent.send('请基于上述方法学清单：① 各版本与远东评级业务的匹配度评估 ② 即将到期需复审的方法学清单 ③ 行业适用性建议（钢铁/银行/保险等用哪个版本）④ 评级标准委员会下一次审议议程建议 ⑤ 引用《评级方法、模型与程序的生效、改进和定期审查制度》。', ctx);
}''')

# modeling-stage
UPGRADES['modeling-stage.html'] = (
'''function askAIModel() {
  AIAgent.setScene('kb-rag');
  AIAgent.send('请详细解释远东方法学 BACP + AM + 外部支持三层架构的设计逻辑与应用场景。');
}''',
'''function askAIModel() {
  const composite = MockData.bacpComposite;
  const am = MockData.amTotalDelta.toFixed(2);
  const g = MockData.gradeDerivation;
  const ctx = '【当前主体】南京钢铁联合\\n【三层推导】BACP ' + composite + '/8 → 个体 ' + g.bacpGrade + ' → AM ' + (parseFloat(am)>0?'+':'') + am + ' → 外部支持 +' + g.externalDelta + ' → 主体等级 ' + g.finalGrade;
  AIAgent.setScene('rating-draft');
  AIAgent.send('请基于以上三层推导：① 评分链合理性总检（BACP / AM / 外部支持是否相互印证）② 风险关注点 TOP3 ③ 评级展望建议（正面/稳定/负面）④ 与同业可比主体的 1 句话差异 ⑤ 给评级师的最终评级建议（含展望）。', ctx);
}''')

# grade-mapping
UPGRADES['grade-mapping.html'] = (
'''function askAIGrade() {
  AIAgent.setScene('kb-rag');
  AIAgent.send('请按远东方法学说明 BACP + AM + 外部支持 → 主体信用等级的推导逻辑，以及四等情景分析的应用。');
}''',
'''function askAIGrade() {
  const g = MockData.gradeDerivation;
  const ctx = '【等级推导】BACP ' + g.bacpComposite + ' → ' + g.bacpGrade + ' + AM ' + (parseFloat(g.amDelta)>0?'+':'') + g.amDelta + ' + 外部 +' + g.externalDelta + ' = 主体等级 ' + g.finalGrade + ' · 展望 ' + g.outlook;
  AIAgent.setScene('rating-draft');
  AIAgent.send('请基于以上等级推导：① 4 档情景测试（基本/乐观/压力/极端压力）下的等级波动 ② 评级敏感度分析（哪个变量变动 1 单位影响最大）③ 与历史评级 / 同业的对照 ④ 评级师可调整的边界（最低 / 最高合理等级）⑤ 引用《信用评级方法规则》。', ctx);
}''')

# project-intake
UPGRADES['project-intake.html'] = (
'''function askAIIntake() {
  AIAgent.setScene('kb-rag');
  AIAgent.send('请按《信用评级业务程序指引》给出新立项的标准动作清单与合规检查清单。', '当前页面：项目登记与立项 · 涉及 FR-A-001/A-002/A-003/A-005/A-006');
}''',
'''function askAIIntake() {
  const projs = MockData.projects;
  const cf = MockData.conflictChecks;
  const ctx = '【在评项目】' + projs.length + ' 项\\n【利冲筛查】' + cf.length + ' 项 · 命中 ' + cf.filter(c=>c.hit).length + ' 项\\n【近期立项】' + projs.slice(0,3).map(p => '· ' + p.id + ' ' + p.subject + ' · ' + p.ratingType).join('\\n');
  AIAgent.setScene('kb-rag');
  AIAgent.send('请基于以上立项现状：① 在评项目按状态分布建议（哪些应优先推进）② 利冲命中项目的处置建议 ③ 项目组组建合规校验（≥2 人/组长 ≥3 年/轮换机制）④ 立项时需完成的 6 项动作清单 ⑤ 引用《程序指引》第十二至十五条。', ctx);
}''')

# conflict-check
UPGRADES['conflict-check.html'] = (
'''function askAIConflict() {
  AIAgent.setScene('kb-rag');
  AIAgent.send('请按《信用评审委员会制度》和《信用评级业务程序指引》解释 12 类利益冲突筛查规则的合规依据与处置流程。');
}''',
'''function askAIConflict() {
  const cf = MockData.conflictChecks;
  const ctx = '【利冲筛查记录】' + cf.length + ' 项\\n' +
              cf.map(c => '· ' + c.id + ' ' + c.subject + ' · ' + c.subjectKind + ' · ' + (c.hit?'✗ 命中':'✓ 未命中') + '（' + c.detail + '）').join('\\n');
  AIAgent.setScene('kb-rag');
  AIAgent.send('请基于以上利冲筛查记录：① 命中项的合规处置建议（更换成员/暂停/豁免）② 豁免审批的三签字条件 ③ 12 类规则中今天命中频率最高的 TOP3 ④ 给项目组的 3 条预防性建议 ⑤ 引用《信评委制度》第三十二条 + 防火墙制度。', ctx);
}''')

# review-proofreading
UPGRADES['review-proofreading.html'] = (
'''function askAIProofread() {
  AIAgent.setScene('kb-rag');
  AIAgent.send('请按《信用评级业务程序指引》第三十四条解释复核人员文字审核的核心检查点。');
}''',
'''function askAIProofread() {
  const tasks = MockData.proofreadingTasks;
  const issues = MockData.proofreadingIssues;
  const ctx = '【复核任务】' + tasks.length + ' 项 · 已通过 ' + tasks.filter(t=>t.status==='已通过').length + ' · 修改中 ' + tasks.filter(t=>t.status==='修改中').length + '\\n【待修改问题】' + issues.length + ' 个';
  AIAgent.setScene('kb-rag');
  AIAgent.send('请基于以上复核任务：① 修改中报告的问题严重度分类 ② 数字一致性 / 术语规范 / 错别字 / 段落结构 4 类常见问题清单 ③ 给项目组的修改优先级建议 ④ 复核签字前的 10 项检查清单 ⑤ 引用《程序指引》第三十四条。', ctx);
}''')

# account-manager
UPGRADES['account-manager.html'] = (
'''function askAIIntake() {
  AIAgent.setScene('kb-rag');
  AIAgent.send('请按《信用评级业务程序指引》第六条防火墙制度详细解释市场部 → 评级业务部委托流转的合规要求。');
}''',
'''function askAIIntake() {
  const leads = MockData.accountManagerLeads;
  const pending = leads.filter(l => l.status === '委托待评级师筛查');
  const ctx = '【委托池】' + leads.length + ' 项 · 待筛查 ' + pending.length + ' 项\\n' +
              pending.map(l => '· ' + l.id + ' ' + l.client + '（' + l.leadType + '）¥' + l.amount + '万 · ' + l.urgency).join('\\n');
  AIAgent.setScene('kb-rag');
  AIAgent.send('请基于上述委托池：① 待筛查项目的优先级排序（按紧急度 / 金额 / 客户关系）② 每项的 KYC + 利冲风险预判 ③ 防火墙隔离合规校验 ④ 给评级师的分派建议（哪些主体适合哪个评级师）⑤ 引用《程序指引》第六条防火墙制度。', ctx);
}''')

# client-portal
UPGRADES['client-portal.html'] = (
'''function askAIClient() {
  AIAgent.setScene('kb-rag');
  AIAgent.send('请按《程序指引》第三十五至三十八条解释评级结果反馈与复评流程的合规要求与 SLA。');
}''',
'''function askAIClient() {
  const cf = MockData.clientFeedback;
  const ctx = '【客户反馈记录】' + cf.length + ' 条\\n' +
              cf.map(c => '· ' + c.subject + '（' + c.type + '）：' + c.content.slice(0,50) + '...').join('\\n');
  AIAgent.setScene('kb-rag');
  AIAgent.send('请基于以上客户反馈：① 反馈类型分布（无异议/反馈/补料/复评）② 5 工作日 SLA 风险（哪些反馈临近超时）③ 给评级师的回复模板 TOP3（针对常见类型）④ 复评申请的合规处理流程 ⑤ 免费政策提醒（第十一条）⑥ 引用《程序指引》第三十五至三十八条。', ctx);
}''')

stats = 0
for fp, (old, new) in UPGRADES.items():
    if not os.path.exists(fp):
        print(f'[NOT EXIST] {fp}')
        continue
    with open(fp,'r',encoding='utf-8') as f: s = f.read()
    if old not in s:
        print(f'[OLD NOT FOUND] {fp}')
        continue
    s = s.replace(old, new)
    with open(fp,'w',encoding='utf-8') as f: f.write(s)
    print(f'[OK] {fp}')
    stats += 1
print(f'\n共升级 {stats} / {len(UPGRADES)} 个页面')
