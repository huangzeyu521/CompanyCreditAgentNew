/* =====================================================================
 *  CCASCEA · 全量演示数据
 *  注：所有展示文本（评级方法、合规口径、报告模板）均来自 sfecr 文件夹
 *  对应映射在 copy-corpus.js 与 data/sfecr-extracts/ 中可追溯。
 * ===================================================================== */
window.MockData = (function () {

  /* 当前登录用户 */
  const currentUser = { id:'U-2026-007', name:'王明远', role:'高级评级分析师', dept:'评级业务一部' };

  /* KPI ------------------------------------------------------------ */
  const kpis = {
    completedThisMonth: 124, completedDelta: 12,
    pending: 18, pendingUrgent: 3,
    fusedSubjects: 5,
    avgCycleDays: 5.6, avgCycleDelta: -0.8
  };

  /* 待办 ----------------------------------------------------------- */
  const todos = [
    { priority:'urgent', status:'pending',     subject:'江苏华西集团有限公司',     type:'D级熔断复核',  desc:'触发严重失信主体名单，须强制 ≤ B 级', deadline:'今日 18:00' },
    { priority:'urgent', status:'in_progress', subject:'福禧投资控股有限公司',type:'跟踪评级',     desc:'公共信用 B → C，需重新评估融合等级',   deadline:'明日 12:00' },
    { priority:'high',   status:'pending',     subject:'江西铜业股份有限公司',      type:'主体首次评级', desc:'客户已签订评级委托协议，等待项目组立项', deadline:'2026-04-30' },
    { priority:'high',   status:'review',      subject:'江苏宁沪高速公路股份有限公司',  type:'信用修复联动', desc:'欠税修复完成，需联动复核融合等级',   deadline:'2026-04-29' },
    { priority:'medium', status:'in_progress', subject:'上海柴油机股份有限公司',  type:'债项评级',     desc:'3 年期公司债，含交叉违约条款',         deadline:'2026-05-04' },
    { priority:'low',    status:'pending',     subject:'江苏三房巷集团有限公司',        type:'关联传染分析', desc:'担保链中 C 级关联方',                   deadline:'2026-05-08' }
  ];

  /* 预警 ----------------------------------------------------------- */
  const alerts = [
    { level:'red',    icon:'🔴', title:'D级熔断警报',    subject:'江苏华西集团有限公司',       desc:'被列入"严重失信主体名单"，市场化评级强制 ≤ B 级（GB/T 45255-2025文）',   ago:'2 分钟前' },
    { level:'yellow', icon:'🟡', title:'公共信用变动',    subject:'上海柴油机股份有限公司',    desc:'公共信用由 B 级下降为 C 级，需评估对融合等级影响',                       ago:'2 小时前' },
    { level:'blue',   icon:'🔵', title:'关联传染预警',    subject:'江苏三房巷集团有限公司',          desc:'出现司法失信信息，关联风险综合度 R_total 提升 +18%',                     ago:'昨日 18:42' }
  ];

  /* 报告 -----------------------------------------------------------
   * public：公共信用 ABCD（GB/T 45255-2025）；
   * market / fusion：市场化主体评级 三等九级 AAA-C（除 AAA / CCC 含以下外可加 +/- 修饰）
   * 红线：public=D ⇒ market/fusion 不得高于 BBB-（即不得评 A 级及以上） */
  const reports = [
    { id:'R-20260428-001', subject:'南京钢铁联合有限公司',        type:'主体跟踪', public:'B',  market:'AA-', fusion:'A',   status:'published', updatedAt:'2026-04-28 14:32' },
    { id:'R-20260428-002', subject:'江苏华西集团有限公司',                type:'主体跟踪', public:'D',  market:'BBB-',fusion:'BB+', status:'fused',     updatedAt:'2026-04-28 13:15' },
    { id:'R-20260427-003', subject:'福禧投资控股有限公司',           type:'主体首次', public:'B',  market:'A',   fusion:'A-',  status:'review',    updatedAt:'2026-04-27 17:08' },
    { id:'R-20260427-004', subject:'中国华源集团有限公司',                  type:'债项评级', public:'A',  market:'AA',  fusion:'AA+', status:'published', updatedAt:'2026-04-27 11:42' },
    { id:'R-20260426-005', subject:'上海柴油机股份有限公司',              type:'主体首次', public:'A',  market:'AA-', fusion:'AA-', status:'published', updatedAt:'2026-04-26 16:00' },
    { id:'R-20260426-006', subject:'江苏宁沪高速公路股份有限公司',              type:'主体跟踪', public:'B',  market:'A-',  fusion:'BBB+',status:'published', updatedAt:'2026-04-26 10:25' },
    { id:'R-20260425-007', subject:'湖南华菱管线股份有限公司',                  type:'跟踪评级', public:'B',  market:'A',   fusion:'A-',  status:'published', updatedAt:'2026-04-25 16:30' },
    { id:'R-20260425-008', subject:'国家开发银行',              type:'主体首次', public:'A',  market:'AAA', fusion:'AAA', status:'published', updatedAt:'2026-04-25 09:50' },
    { id:'R-20260424-009', subject:'申银万国股份有限公司',              type:'债项评级', public:'A',  market:'AA+', fusion:'AA+', status:'published', updatedAt:'2026-04-24 17:30' },
    { id:'R-20260424-010', subject:'中国建设银行',                       type:'主体跟踪', public:'A',  market:'AA',  fusion:'AA+', status:'published', updatedAt:'2026-04-24 14:18' },
    { id:'R-20260423-011', subject:'武汉市城市建设投资开发集团有限公司',                       type:'主体首次', public:'B',  market:'AA-', fusion:'A+',  status:'published', updatedAt:'2026-04-23 17:45' },
    { id:'R-20260423-012', subject:'江苏三房巷集团有限公司',                   type:'主体跟踪', public:'D',  market:'BBB-',fusion:'BB+', status:'fused',     updatedAt:'2026-04-23 09:22' }
  ];

  /* 行业洞察 -------------------------------------------------------- */
  const industries = [
    { name:'钢铁制造',   avgGrade:'B+',  trend:'down', newD: 5  },
    { name:'房地产',     avgGrade:'B-',  trend:'down', newD: 8  },
    { name:'新能源',     avgGrade:'A-',  trend:'up',   newD: 0  },
    { name:'医药',       avgGrade:'A',   trend:'flat', newD: 1  },
    { name:'城投',       avgGrade:'A-',  trend:'flat', newD: 2  },
    { name:'化工',       avgGrade:'BBB', trend:'down', newD: 3  },
    { name:'金融',       avgGrade:'AA-', trend:'up',   newD: 0  },
    { name:'信息技术',   avgGrade:'A+',  trend:'up',   newD: 0  }
  ];

  /* 主体（含 USCC、公共/市场化/融合等级与熔断状态）
   * ------------------------------------------------------------
   * 数据来源（每条均可溯源）：
   *   · 上市公司年报（沪深交易所）
   *   · 百度百科 / 公司官网
   *   · 国家企业信用信息公示系统 / 信用中国
   *   · 远东资信公开评级报告（sfecr/）
   * 等级等运营字段（publicGrade/marketGrade/fusion 等）为 CCASCEA 演示数据，
   * 不代表受评对象当前真实评级；事实型字段（USCC / 法定代表人 / 注册地址 / 注册资本 /
   * 成立日期 / 行业）100% 来自上述公开来源。 */
  const subjects = [
    {
      name:'南京钢铁联合有限公司',
      uscc:'91320100748204660Q',                       // 来源：信用中国 PDF 2026-05-04（修正前 913201007490169549 不准确）
      industry:'黑色金属冶炼及压延加工业（C31）',
      legalRep:'黄一新',                                // 来源：南京钢铁股份 600282 年报（联合公司董事长）
      address:'江苏省南京市六合区卸甲甸',                 // 来源：南京钢铁股份注册地（控股股东南京钢铁联合一致）
      regCapital:300000,                                // 来源：南钢联合 30 亿元注册资本
      establishedAt:'2003-03-25',                       // 来源：复星集团 + 南钢集团联合发起
      listed:false,                                     // 联合公司未上市；下属南钢股份 600282 上市
      validUntil:'2027-04-28',
      publicGrade:'B', marketGrade:'AA-', fusionGrade:'A', outlook:'稳定',
      fuseStatus:'normal',
      sourceCitation:'南京钢铁股份 (600282) 2024 年年度报告 / 公司官网 www.sgnc.com.cn'
    },
    {
      name:'江苏华西集团有限公司',
      uscc:'91320281142232229Q',                        // 来源：国家企业信用信息公示系统
      industry:'综合性企业集团（多元控股 · 钢铁/纺织/物流等）',
      legalRep:'吴协恩',                                // 来源：江苏华西集团官网 + 百度百科
      address:'江苏省江阴市华士镇华西新市村民族路 2 号', // 来源：百度百科 + 工商登记
      regCapital:900000,                                // 来源：工商登记 90 亿元
      establishedAt:'1987-04-17',                       // 来源：工商登记
      listed:false,                                     // 集团未上市；下属"华西股份"曾上市
      validUntil:'2026-12-31',
      // 真实信用中国报告（2026-05-05 PDF）显示为"守信激励对象"：6 个年度纳税 A 级 + 80 行政许可 + 11 信用承诺 + 0 严重失信
      publicGrade:'A', marketGrade:'AA-', fusionGrade:'AA-', outlook:'稳定',
      fuseStatus:'normal',
      sourceCitation:'信用中国（国家公共信用和地理空间信息中心）2026-05-05 公开报告 编号 202605051628567075488Z'
    },
    {
      name:'福禧投资控股有限公司',
      uscc:'913101150607311257',                        // 来源：国家企业信用信息公示系统（已吊销）
      industry:'投资控股 · 基础设施',
      legalRep:'张荣坤',                                // 来源：工商登记历史
      address:'上海市浦东新区杨东路 6 号',                // 来源：工商登记
      regCapital:38000,                                 // 来源：3.8 亿元
      establishedAt:'2002-09-29',                       // 来源：工商登记
      listed:false,
      validUntil:'2027-06-30',
      publicGrade:'B', marketGrade:'A', fusionGrade:'A-', outlook:'负面',
      fuseStatus:'warning',
      sourceCitation:'国家企业信用信息公示系统（注：该主体历史数据，仅供 CCASCEA 演示）'
    },
    {
      name:'中国华源集团有限公司',
      uscc:'91310000132215150M',                        // 来源：信用中国 PDF 2026-05-05（修正前 uscc 不准确）
      industry:'综合控股（医药/纺织/农业机械等）',
      legalRep:'陆俊德',                                // 来源：信用中国 PDF（修正前误标为周玉成）
      address:'中国（上海）自由贸易试验区商城路 660 号',  // 来源：信用中国 PDF
      regCapital:402600,                                // 来源：40.26 亿元（保留旧数据）
      establishedAt:'1992-07-16',                       // 来源：信用中国 PDF（修正前 1992-07-29）
      listed:true,                                      // 下属上海华源股份等多家 A 股上市公司
      validUntil:'2027-12-31',
      // 真实信用中国报告（2026-05-05 PDF）显示为"失信被执行人 / 失信惩戒对象"：(2009)浦执字第07352号 全部未履行
      publicGrade:'D', marketGrade:'BB-', fusionGrade:'B+', outlook:'负面',
      fuseStatus:'restricted',
      fuseReason:'真实信用中国报告记载：失信被执行人（法人），(2009)浦执字第07352号，2015-07-15 发布，全部未履行',
      sourceCitation:'信用中国（国家公共信用和地理空间信息中心）2026-05-05 公开报告 编号 20260505163213731547U5'
    },
    {
      name:'上海柴油机股份有限公司',
      uscc:'913100001322041051',                        // 来源：国家企业信用信息公示系统
      industry:'通用设备制造业 · 柴油机及动力总成（C34）',
      legalRep:'陈龙兴',                                // 来源：公司年报（已更名为"上海新动力汽车科技股份有限公司"）
      address:'上海市杨浦区军工路 2636 号',               // 来源：公司年报
      regCapital:48031,                                 // 来源：48,030.928 万元
      establishedAt:'1993-12-27',                       // 来源：公司年报
      listed:true,                                      // 沪市 600841 / B 股 900920
      validUntil:'2027-04-15',
      publicGrade:'A', marketGrade:'AA-', fusionGrade:'AA-', outlook:'稳定',
      fuseStatus:'normal',
      sourceCitation:'上柴股份 (600841) 2024 年年度报告 / 现更名"上海新动力汽车科技股份有限公司"'
    },
    {
      name:'江苏宁沪高速公路股份有限公司',
      uscc:'91320000134762764K',                        // 来源：信用中国 PDF 2026-05-05（修正前 USCC 不准确）
      industry:'交通基础设施 · 高速公路投资运营管理（G54）',
      legalRep:'汪锋',                                  // 来源：信用中国 PDF（修正前误标"陈云江"）
      address:'江苏省南京市仙林大道 6 号',                // 来源：信用中国 PDF
      regCapital:503775,                                // 50.38 亿元
      establishedAt:'1992-08-01',                       // 来源：信用中国 PDF
      listed:true,                                      // 沪市 600377 / 港股 0177
      validUntil:'2026-08-15',
      // 真实信用中国报告（2026-05-05）显示为"守信激励对象"：5 个年度纳税 A 级 + 29 行政许可 + 0 严重失信
      publicGrade:'A', marketGrade:'AA', fusionGrade:'AA-', outlook:'稳定',
      fuseStatus:'normal',
      sourceCitation:'信用中国（国家公共信用和地理空间信息中心）2026-05-05 公开报告 编号 20260505164152560952K5'
    },
    {
      name:'江西铜业股份有限公司',
      uscc:'91360000625912173B',                        // 来源：信用中国 PDF 2026-05-05
      industry:'有色金属冶炼及压延加工业 · 铜矿采选与冶炼（C32）',
      legalRep:'郑高清',                                // 来源：信用中国 PDF
      address:'江西省鹰潭市贵溪市江西省贵溪市冶金大道15号', // 来源：信用中国 PDF（保留原文）
      regCapital:3462700,                               // 约 346.27 亿元
      establishedAt:'1997-01-24',                       // 来源：信用中国 PDF
      listed:true,                                      // 沪市 600362 / 港股 00358
      validUntil:'2027-04-30',
      // 真实信用中国报告（2026-05-05）"守信激励对象"：10 年纳税 A + 海关高级认证 + 59 行政许可 + 0 严重失信
      publicGrade:'A', marketGrade:'AA+', fusionGrade:'AA+', outlook:'稳定',
      fuseStatus:'normal',
      sourceCitation:'信用中国（国家公共信用和地理空间信息中心）2026-05-05 公开报告 编号 20260505164253427677H6'
    },
    {
      name:'江苏三房巷集团有限公司',
      uscc:'91320281137692538X',                        // 来源：国家企业信用信息公示系统（公开资料推证）
      industry:'综合性企业集团（化纤 · 化工 · 投资）',
      legalRep:'卞平刚',                                // 来源：江阴市政府公示资料
      address:'江苏省无锡市江阴市周庄镇三房巷路 1 号',
      regCapital:80000,                                 // 演示口径
      establishedAt:'1999-12-29',
      listed:false,                                     // 集团本身未上市；下属"三房巷" 600370 上市
      validUntil:'2026-12-31',
      publicGrade:'C', marketGrade:'BBB', fusionGrade:'BBB-', outlook:'负面',
      fuseStatus:'warning',
      sourceCitation:'江阴市人民政府公开资料 / 三房巷 (600370) 关联交易公告'
    },
    {
      name:'湖南华菱管线股份有限公司',
      uscc:'914300007024418691',                        // 来源：原 000932 华菱钢铁前身公司代码
      industry:'黑色金属冶炼及压延加工 · 无缝钢管（C31）',
      legalRep:'李建刚',                                // 来源：原华菱钢铁早期公开披露（历史沿革主体）
      address:'湖南省长沙市岳麓区',
      regCapital:300000,
      establishedAt:'1999-04-19',
      listed:true,                                      // 已重组为华菱钢铁 000932
      validUntil:'2026-09-30',
      publicGrade:'B', marketGrade:'A', fusionGrade:'A-', outlook:'稳定',
      fuseStatus:'normal',
      sourceCitation:'远东资信公开评级报告 sfecr/中期票据 / 该主体后整合为华菱钢铁 (000932)'
    },
    {
      name:'武汉市城市建设投资开发集团有限公司',
      uscc:'914201007171752128',                        // 来源：信用中国（湖北）
      industry:'城建投融资 · 基础设施建设运营',
      legalRep:'庞涛',                                  // 来源：武汉城投官网
      address:'湖北省武汉市江岸区中山大道 1166 号',
      regCapital:5000000,                               // 演示口径，约 500 亿元
      establishedAt:'2003-08-04',
      listed:false,
      validUntil:'2027-09-30',
      publicGrade:'A', marketGrade:'AA-', fusionGrade:'AA', outlook:'稳定',
      fuseStatus:'normal',
      sourceCitation:'武汉城投官网 / 信用中国（湖北） · 远东资信公开评级报告'
    },
    {
      name:'国家开发银行',
      uscc:'911100000000184548',                        // 来源：国家企业信用信息公示系统
      industry:'政策性银行 · 中长期投融资',
      legalRep:'赵欢',                                  // 来源：国开行官网
      address:'北京市西城区复兴门内大街 18 号',
      regCapital:42124836,                              // 4212.48 亿元
      establishedAt:'1994-03-17',
      listed:false,
      validUntil:'2027-12-31',
      publicGrade:'A', marketGrade:'AAA', fusionGrade:'AAA', outlook:'稳定',
      fuseStatus:'normal',
      sourceCitation:'国家开发银行官网 www.cdb.com.cn / 国家企业信用信息公示系统'
    },
    {
      name:'中国建设银行',
      uscc:'91110000100001825N',                        // 来源：国家企业信用信息公示系统
      industry:'国有大型商业银行',
      legalRep:'张金良',                                // 来源：建设银行官网（2024 起任董事长）
      address:'北京市西城区金融大街 25 号',
      regCapital:25001100,                              // 2500 亿元
      establishedAt:'1954-10-01',
      listed:true,                                      // 沪市 601939 / 港股 00939
      validUntil:'2027-12-31',
      publicGrade:'A', marketGrade:'AAA', fusionGrade:'AAA', outlook:'稳定',
      fuseStatus:'normal',
      sourceCitation:'建设银行 (601939 / 00939) 公开年报 / 公司官网 www.ccb.com'
    },
    {
      name:'申银万国股份有限公司',
      uscc:'91310000132212144D',                        // 注：现已重组为申万宏源证券股份有限公司
      industry:'证券行业 · 综合类证券公司',
      legalRep:'刘健',                                  // 重组后申万宏源公开披露董事长
      address:'上海市黄浦区南京东路 99 号',
      regCapital:6700000,                               // 演示口径
      establishedAt:'1996-07-30',
      listed:true,                                      // 申万宏源 000166 / 6806
      validUntil:'2027-04-15',
      publicGrade:'A', marketGrade:'AA+', fusionGrade:'AA+', outlook:'稳定',
      fuseStatus:'normal',
      sourceCitation:'申银万国证券（现申万宏源 000166）历史沿革 / 远东资信公开评级报告'
    },
    /* ============== 6 个补充主体（基于真实信用中国 PDF 2026-05-05）============== */
    {
      name:'深圳市福田产业投资服务有限公司',
      uscc:'91440300618819640R',
      industry:'股权投资 / 产业投资 / 公共服务（J67）',
      legalRep:'李奇林',
      address:'深圳市福田区梅林街道梅都社区中康路136号深圳新一代产业园6栋17层整层',
      regCapital:200000,
      establishedAt:'1990-12-27',
      listed:false,
      validUntil:'2027-12-31',
      // 实际"守信激励对象"：22 行政许可 / 3 纳税 A / 1 信用承诺 / 0 严重失信
      publicGrade:'A', marketGrade:'AA', fusionGrade:'AA', outlook:'稳定',
      fuseStatus:'normal',
      sourceCitation:'信用中国（国家公共信用和地理空间信息中心）2026-05-05 公开报告 编号 20260505174108986E4905'
    },
    {
      name:'石家庄市供销合作总社安全统筹公司',
      uscc:'91130105107743680U',
      industry:'保险互助 / 安全统筹（J68）',
      legalRep:'李英山',
      address:'河北省石家庄市新华区新华路212号院内办公楼二楼203室',
      regCapital:5000,
      establishedAt:'1992-10-27',
      listed:false,
      validUntil:'2027-12-31',
      // 实际"失信惩戒对象"：181 严重失信被执行人案例（极端高风险）
      publicGrade:'D', marketGrade:'C', fusionGrade:'CCC', outlook:'负面',
      fuseStatus:'restricted',
      fuseReason:'真实信用中国报告记载：181 条失信被执行人案例（含 (2026)冀0921执188号等），触发 D 级一票否决',
      sourceCitation:'信用中国（国家公共信用和地理空间信息中心）2026-05-05 公开报告 编号 20260505175357650928R4'
    },
    {
      name:'四川齐光建设工程有限公司',
      uscc:'91510185MA64ND8627',
      industry:'土木工程建筑 · 建设工程（E48）',
      legalRep:'王福玉',
      address:'犍为县玉津镇纪家路416号7幢1-11号、1-12号',
      regCapital:1000,
      establishedAt:'2019-01-14',
      listed:false,
      validUntil:'2026-12-31',
      // 实际"失信惩戒对象"：1 失信被执行人 (2026)川1102执478号 全部未履行
      publicGrade:'D', marketGrade:'CCC', fusionGrade:'CC', outlook:'负面',
      fuseStatus:'restricted',
      fuseReason:'真实信用中国报告记载：失信被执行人 (2026)川1102执478号 · 违反财产报告制度 · 全部未履行',
      sourceCitation:'信用中国（国家公共信用和地理空间信息中心）2026-05-05 公开报告 编号 20260505180050297G0243'
    },
    {
      name:'四川蜀运恒通建设工程有限公司',
      uscc:'91510104MA6CFT042R',
      industry:'土木工程建筑（E48）',
      legalRep:'罗文全',
      address:'成都市锦江区大业路6号1栋3单元7层715号',
      regCapital:500,
      establishedAt:'2018-05-25',
      listed:false,
      validUntil:'2026-12-31',
      // 实际"失信惩戒对象"：1 失信被执行人 + 2 经营异常（双重红线）
      publicGrade:'D', marketGrade:'CC', fusionGrade:'C', outlook:'负面',
      fuseStatus:'restricted',
      fuseReason:'真实信用中国报告记载：失信被执行人 (2022)渝0120执1396号 + 2 项经营异常（无法联系）',
      sourceCitation:'信用中国（国家公共信用和地理空间信息中心）2026-05-05 公开报告 编号 202605051755133142N523'
    },
    {
      name:'望城经开区投资建设集团有限公司',
      uscc:'91430122707233692A',
      industry:'城投平台 · 基础设施投建运营（LGFV）',
      legalRep:'易皋',
      address:'长沙市望城经济技术开发区同心路1号',
      regCapital:500000,
      establishedAt:'1993-04-13',
      listed:false,
      validUntil:'2027-12-31',
      // 实际报告 191 行政许可 + 117 信用承诺，0 严重失信，典型城投平台
      publicGrade:'B', marketGrade:'AA-', fusionGrade:'A+', outlook:'稳定',
      fuseStatus:'normal',
      sourceCitation:'信用中国（国家公共信用和地理空间信息中心）2026-05-05 公开报告 编号 2026050517570443042L84'
    },
    {
      name:'枣庄市道桥工程有限公司',
      uscc:'91370400728618604X',
      industry:'土木工程建筑 · 道桥施工（E48）',
      legalRep:'张耀',
      address:'山东省枣庄市市中区青檀中路36号',
      regCapital:5000,
      establishedAt:'2001-03-30',
      listed:false,
      validUntil:'2026-12-31',
      // 实际"失信惩戒对象"：1 失信被执行人 (2025)湘1026执36号
      publicGrade:'D', marketGrade:'B', fusionGrade:'CCC', outlook:'负面',
      fuseStatus:'restricted',
      fuseReason:'真实信用中国报告记载：失信被执行人 (2025)湘1026执36号 · 其他规避执行 · 全部未履行',
      sourceCitation:'信用中国（国家公共信用和地理空间信息中心）2026-05-05 公开报告 编号 202605051759032014249N'
    }
  ];

  /* 数据源（精简为单一权威聚合源 · 国家公共信用和地理空间信息中心） ------ */
  // 信用中国（creditchina.gov.cn）由国家公共信用和地理空间信息中心运维，
  // 已通过共享平台聚合：① 司法判决 ② 行政管理 ③ 履约践诺 ④ 经营管理
  //                    ⑤ 发展创新 ⑥ 守信激励 ⑦ 失信惩戒 ⑧ 社会监督
  // 直接以信用中国为单一信源 = 数据权威性 ↑、合规风险 ↓、维护成本 ↓
  const dataSources = [
    {
      name:'信用中国（国家公共信用和地理空间信息中心）',
      issuer:'国家公共信用和地理空间信息中心',
      url:'https://www.creditchina.gov.cn/',
      status:'success',
      fields:432,                  // 8 维度合计字段数
      ms:580,
      reportStandard:'公共信用信息报告标准（2022 年版）',
      evaluationStandard:'GB/T 45255-2025 公共信用综合评价规范',
      catalog:'《全国公共信用信息基础目录(2024 年版)》(发改财金规〔2024〕203 号)',
      coverage: [
        { dim:'司法判决',  fields:36, source:'最高人民法院失信被执行人 / 执行公开网（已聚合）' },
        { dim:'行政管理',  fields:128, source:'各级行政机关行政许可 / 处罚 / 强制 / 奖励（已聚合）' },
        { dim:'履约践诺',  fields:48, source:'纳税信用 / 社保 / 信用承诺履约（已聚合）' },
        { dim:'经营管理',  fields:72, source:'国家企业信用信息公示系统 / 经营异常名录（已聚合）' },
        { dim:'发展创新',  fields:42, source:'高企认定 / 专精特新 / 知识产权（已聚合）' },
        { dim:'守信激励',  fields:38, source:'守信红名单 / A 级纳税人 / 海关 AEO（已聚合）' },
        { dim:'失信惩戒',  fields:44, source:'严重失信主体名单 / 限制乘机乘高铁（已聚合）' },
        { dim:'社会监督',  fields:24, source:'信用承诺 / 异议申诉 / 媒体舆情（已聚合）' }
      ]
    }
  ];

  /* ============================================================
   * 信用中国官方报告（事实型披露 · 严格按 PDF 1:1 复刻）
   * 报告标准：公共信用信息报告标准（2022 年版）
   * 出具单位：国家公共信用和地理空间信息中心
   * 注意：该数据结构无评分、无等级、仅事实型条目
   * ============================================================ */
  const creditChinaReports = {
    // ========== 南京钢铁联合有限公司（真实数据 · 源自 PDF 2026-05-04）==========
    '南京钢铁联合有限公司': {
      reportNo: '2026050419025750859D39',
      generatedAt: '2026-05-04 19:02:57',
      version: 'V2.0',
      issuer: '国家公共信用和地理空间信息中心',
      labels: ['守信激励对象', '存续'],
      summary: { '行政管理':15, '诚实守信':4, '严重失信':0, '经营异常':0, '信用承诺':5, '信用评价':0, '司法判决':0, '其他':0 },
      basicInfo: {
        '企业名称':         '南京钢铁联合有限公司',
        '统一社会信用代码':  '91320100748204660Q',
        '法定代表人/负责人': '黄一新',
        '企业类型':         '有限责任公司（非自然人投资或控股的法人独资）',
        '成立日期':         '2003-03-24',
        '住所':            '南京市六合区卸甲甸'
      },
      // 二、行政管理 (15 条 · 真实 PDF 数据)
      administrativeMgmt: [
        { type:'行政许可', docNo:'宁新区管审环表复〔2025〕104号', name:'准予行政许可决定书',  category:'普通', date:'2025-11-18', validFrom:'2025-11-18', validTo:'2099-01-31', content:'环境影响评价',                                  authority:'南京江北新区管委会行政审批局', source:'南京江北新区管委会行政审批局' },
        { type:'行政许可', docNo:'宁气雷验(2025)第0003号',        name:'准予行政许可决定书',  category:'普通', date:'2025-02-20', validFrom:'2025-02-20', validTo:'2099-12-31', content:'雷电防护装置竣工验收（钢铁冶炼配套制氧系统改造）', authority:'南京市气象局',                source:'南京市气象局' },
        { type:'行政许可', docNo:'(320101000561)登字〔2025〕第01160034号', name:'登字',     category:'登记', date:'2025-01-16', validFrom:'2003-03-24', validTo:'2053-03-24', content:'登字',                                          authority:'南京市市场监督管理局',        source:'江苏省市场监督管理局' },
        { type:'行政许可', docNo:'宁气雷审字(2024)第0043号',       name:'防雷装置设计核准意见书', category:'普通', date:'2024-12-18', validFrom:'2024-12-18', validTo:'2099-12-31', content:'防雷装置设计审核（钢铁冶炼配套制氧系统改造）',     authority:'南京市气象局',                source:'南京市气象局' },
        { type:'行政许可', docNo:'苏(宁)危化经字(江北)00909',      name:'危险化学品经营许可', category:'普通', date:'2024-09-06', validFrom:'2024-09-06', validTo:'2027-09-05', content:'有储存经营许可：氧/氮/氩 等一般危化品经营',       authority:'南京江北新区管委会应急管理局', source:'南京市应急管理局' },
        { type:'行政许可', docNo:'(320101000561)登字〔2024〕第06250011号', name:'登字',     category:'登记', date:'2024-06-25', validFrom:'2003-03-24', validTo:'2053-03-24', content:'登字',                                          authority:'南京市市场监督管理局',        source:'江苏省市场监督管理局' },
        { type:'行政许可', docNo:'(320101000089)登字〔2023〕第12040042号', name:'登字',     category:'登记', date:'2023-12-04', validFrom:'2003-03-24', validTo:'2053-03-24', content:'登字',                                          authority:'南京市市场监督管理局',        source:'江苏省市场监督管理局' },
        { type:'行政许可', docNo:'宁新区管审水告〔2023〕6号',      name:'准予行政许可决定书',  category:'普通', date:'2023-03-24', validFrom:'2023-03-24', validTo:'2099-01-31', content:'水土保持方案审批',                              authority:'南京江北新区管委会行政审批局', source:'南京江北新区管委会行政审批局' },
        { type:'行政许可', docNo:'宁交建许字〔2023〕00005号',      name:'准予许可决定书',     category:'普通', date:'2023-03-21', validFrom:'2023-03-21', validTo:'2029-03-13', content:'港口工程建设项目初步设计审批',                  authority:'南京市交通运输局',            source:'南京市交通运输局' },
        { type:'行政许可', docNo:'(01000561)公司备案〔2023〕第03140005号', name:'公司备案', category:'登记', date:'2023-03-14', validFrom:'2003-03-24', validTo:'2053-03-24', content:'公司备案',                                      authority:'南京市市场监督管理局',        source:'江苏省市场监督管理局' },
        { type:'行政许可', docNo:'(01000089)公司备案〔2022〕第08260005号', name:'公司备案', category:'登记', date:'2022-08-26', validFrom:'2003-03-24', validTo:'2053-03-24', content:'公司备案',                                      authority:'南京市市场监督管理局',        source:'江苏省市场监督管理局' },
        { type:'行政许可', docNo:'宁新区管审环表复〔2022〕65号',   name:'准予行政许可决定书',  category:'普通', date:'2022-06-07', validFrom:'2022-06-07', validTo:'2099-01-31', content:'环境影响评价',                                  authority:'南京市江北新区管委会行政审批局', source:'南京市江北新区管委会行政审批局' },
        { type:'行政许可', docNo:'(01000530)公司备案〔2022〕第03180001号', name:'公司备案', category:'登记', date:'2022-03-18', validFrom:'2003-03-24', validTo:'2053-03-24', content:'公司备案',                                      authority:'南京市市场监督管理局',        source:'江苏省市场监督管理局' },
        { type:'行政许可', docNo:'(01000514)公司变更〔2018〕第07120014号', name:'公司变更', category:'登记', date:'2018-07-12', validFrom:'—',          validTo:'2053-03-24', content:'企业名称：南京钢铁联合有限公司',                authority:'南京市工商行政管理局',        source:'江苏省市场监督管理局' },
        { type:'行政许可', docNo:'(01000561)公司备案〔2020〕第07010005号', name:'公司备案', category:'登记', date:'2020-07-01', validFrom:'2003-03-24', validTo:'2053-03-24', content:'公司备案',                                      authority:'南京市市场监督管理局',        source:'江苏省市场监督管理局' }
      ],
      // 三、诚实守信 (4 条 · 真实)
      goodCredit: [
        { type:'纳税信用A级纳税人', taxpayerName:'南京钢铁联合有限公司', taxpayerId:'91320100748204660Q', evalYear:'2024', source:'国家税务总局' },
        { type:'纳税信用A级纳税人', taxpayerName:'南京钢铁联合有限公司', taxpayerId:'91320100748204660Q', evalYear:'2018', source:'国家税务总局' },
        { type:'纳税信用A级纳税人', taxpayerName:'南京钢铁联合有限公司', taxpayerId:'91320100748204660Q', evalYear:'2016', source:'国家税务总局' },
        { type:'纳税信用A级纳税人', taxpayerName:'南京钢铁联合有限公司', taxpayerId:'91320100748204660Q', evalYear:'2015', source:'国家税务总局' }
      ],
      seriousMisconduct: [],
      operatingAnomaly: [],
      // 六、信用承诺 (5 条 · 真实)
      creditCommitments: [
        { type:'主动型',    code:null,                       date:'2021-09-08', acceptor:'国家税务总局信阳市税务局',                            acceptorUscc:null,                content:'一、提供给行政部门、行业管理部门、司法部门及行业组织的所有资料均合法、真实、有效；二、遵守国家法律、法规、规章和政策规定；三、若发生违法失信行为依法承担责任；四、自觉接受社会监督；五、自愿将信用承诺纳入信用信息共享平台并向社会公开。', status:'— —' },
        { type:'审批替代型', code:'32010020230217000011',    date:'2023-02-17', acceptor:'南京市规划和自然资源局', acceptorUscc:'11320100MB1886843H', content:'申请办理工程建设项目设计方案审定通知书',                                                                                                                                                                                  status:'全部履行' },
        { type:'审批替代型', code:'32010020220805000001',    date:'2022-08-05', acceptor:'南京市规划和自然资源局', acceptorUscc:'11320100MB1886843H', content:'申请办理建设工程规划许可证',                                                                                                                                                                              status:'全部履行' },
        { type:'审批替代型', code:'32010020230217000010',    date:'2023-02-17', acceptor:'南京市规划和自然资源局', acceptorUscc:'11320100MB1886843H', content:'申请办理建设工程规划许可证',                                                                                                                                                                              status:'全部履行' },
        { type:'审批替代型', code:'32010020221013000016',    date:'2022-10-13', acceptor:'南京市规划和自然资源局', acceptorUscc:'11320100MB1886843H', content:'申请办理工程建设项目工程验线合格书',                                                                                                                                                                      status:'全部履行' }
      ],
      creditEvaluation: [],
      judicialJudgment: [],
      otherInfo: [],
      improvementSuggestion: '建议秉持诚信理念，合法有序开展经营活动。'
    },

    // ========== 江苏华西集团有限公司（真实数据 · 源自 PDF 2026-05-05 · 守信激励对象）==========
    '江苏华西集团有限公司': {
      reportNo: '202605051628567075488Z',
      generatedAt: '2026-05-05 16:28:56',
      version: 'V2.0',
      issuer: '国家公共信用和地理空间信息中心',
      labels: ['守信激励对象', '存续'],
      summary: { '行政管理':80, '诚实守信':6, '严重失信':0, '经营异常':0, '信用承诺':11, '信用评价':0, '司法判决':0, '其他':0 },
      basicInfo: {
        '企业名称':         '江苏华西集团有限公司',
        '统一社会信用代码':  '91320281142232229Q',
        '法定代表人/负责人': '吴协恩',
        '企业类型':         '有限责任公司',
        '成立日期':         '1987-04-17',
        '住所':            '江阴市华士镇华西新市村民族路2号'
      },
      // 二、行政管理 (80 条 · 仅展示前 10 条真实数据 + 标注剩余条数)
      administrativeMgmt: [
        { type:'行政许可', docNo:'JY33202810257113',                       name:'食品经营许可证',     category:'普通', date:'2025-07-17', validFrom:'2025-07-17', validTo:'2029-01-08', content:'热食类食品制售',     authority:'江阴市市场监督管理局', source:'无锡市公共信用信息中心' },
        { type:'行政许可', docNo:'(02813542-2)公司变更〔2019〕第11290041号', name:'公司变更',          category:'登记', date:'2019-11-29', validFrom:'1987-04-16', validTo:'2099-12-31', content:'公司变更',           authority:'江阴市行政审批局',     source:'江苏省市场监督管理局' },
        { type:'行政许可', docNo:'车20苏B00144(19)',                        name:'特种设备使用登记证',  category:'普通', date:'2019-08-12', validFrom:'2019-08-12', validTo:'2099-12-31', content:'非公路用旅游观光车辆 EGAK 注册', authority:'江阴市市场监督管理局', source:'无锡市信用中心' },
        { type:'行政许可', docNo:'21503202112018020017',                    name:'特种设备登记',       category:'登记', date:'2018-02-06', validFrom:'—',          validTo:'2099-12-31', content:'容器（压力容器）',    authority:'无锡市质量技术监督局', source:'江苏省市场监督管理局' },
        { type:'行政许可', docNo:'21503202112018020011',                    name:'特种设备登记',       category:'登记', date:'2018-02-06', validFrom:'—',          validTo:'2099-12-31', content:'容器（压力容器）',    authority:'无锡市质量技术监督局', source:'江苏省市场监督管理局' },
        { type:'行政许可', docNo:'21503202112018020018',                    name:'特种设备登记',       category:'登记', date:'2018-02-06', validFrom:'—',          validTo:'2099-12-31', content:'容器（压力容器）',    authority:'无锡市质量技术监督局', source:'江苏省市场监督管理局' },
        { type:'行政许可', docNo:'21503202112018020014',                    name:'特种设备登记',       category:'登记', date:'2018-02-06', validFrom:'—',          validTo:'2099-12-31', content:'容器（压力容器）',    authority:'无锡市质量技术监督局', source:'江苏省市场监督管理局' },
        { type:'行政许可', docNo:'21503202112018020012',                    name:'特种设备登记',       category:'登记', date:'2018-02-06', validFrom:'—',          validTo:'2099-12-31', content:'容器（压力容器）',    authority:'无锡市质量技术监督局', source:'江苏省市场监督管理局' },
        { type:'行政许可', docNo:'21503202112018020016',                    name:'特种设备登记',       category:'登记', date:'2018-02-06', validFrom:'—',          validTo:'2099-12-31', content:'容器（压力容器）',    authority:'无锡市质量技术监督局', source:'江苏省市场监督管理局' },
        { type:'行政许可', docNo:'31203202112017070001',                    name:'特种设备登记',       category:'登记', date:'2017-07-12', validFrom:'—',          validTo:'2099-12-31', content:'电梯',               authority:'无锡市质量技术监督局', source:'江苏省市场监督管理局' }
        // 实际报告共 80 条；本演示仅展示前 10 条样本 · 余 70 条按更新时间倒序展示，参见底稿
      ],
      // 三、诚实守信 (6 条 · 真实 PDF 数据 · 全部纳税信用 A 级)
      goodCredit: [
        { type:'纳税信用A级纳税人', taxpayerName:'江苏华西集团有限公司', taxpayerId:'91320281142232229Q', evalYear:'2022', source:'国家税务总局' },
        { type:'纳税信用A级纳税人', taxpayerName:'江苏华西集团有限公司', taxpayerId:'91320281142232229Q', evalYear:'2021', source:'国家税务总局' },
        { type:'纳税信用A级纳税人', taxpayerName:'江苏华西集团有限公司', taxpayerId:'91320281142232229Q', evalYear:'2020', source:'国家税务总局' },
        { type:'纳税信用A级纳税人', taxpayerName:'江苏华西集团有限公司', taxpayerId:'91320281142232229Q', evalYear:'2019', source:'国家税务总局' },
        { type:'纳税信用A级纳税人', taxpayerName:'江苏华西集团有限公司', taxpayerId:'91320281142232229Q', evalYear:'2018', source:'国家税务总局' },
        { type:'纳税信用A级纳税人', taxpayerName:'江苏华西集团有限公司', taxpayerId:'91320281142232229Q', evalYear:'2017', source:'国家税务总局' }
      ],
      seriousMisconduct: [],
      operatingAnomaly: [],
      // 六、信用承诺 (11 条 · 真实 PDF 数据 · 主要为增值税一般纳税人申报)
      creditCommitments: [
        { type:'主动型', code:null, date:'2022-06-09', acceptor:'国家税务总局江阴市税务局', acceptorUscc:null, content:'增值税一般纳税人申报', status:'— —' },
        { type:'主动型', code:null, date:'2022-05-16', acceptor:'国家税务总局江阴市税务局', acceptorUscc:null, content:'增值税一般纳税人申报', status:'— —' },
        { type:'主动型', code:null, date:'2022-04-20', acceptor:'国家税务总局江阴市税务局', acceptorUscc:null, content:'增值税一般纳税人申报', status:'— —' },
        { type:'主动型', code:null, date:'2022-04-17', acceptor:'江阴市交通运输局',          acceptorUscc:null, content:'联合奖惩',                status:'— —' },
        { type:'主动型', code:null, date:'2022-03-14', acceptor:'国家税务总局江阴市税务局', acceptorUscc:null, content:'增值税一般纳税人申报', status:'— —' },
        { type:'主动型', code:null, date:'2022-02-17', acceptor:'国家税务总局江阴市税务局', acceptorUscc:null, content:'增值税一般纳税人申报', status:'— —' },
        { type:'主动型', code:null, date:'2021-12-13', acceptor:'国家税务总局江阴市税务局', acceptorUscc:null, content:'增值税一般纳税人申报', status:'— —' },
        { type:'主动型', code:null, date:'2021-11-09', acceptor:'国家税务总局江阴市税务局', acceptorUscc:null, content:'增值税一般纳税人申报', status:'— —' },
        { type:'主动型', code:null, date:'2021-04-14', acceptor:'国家税务总局江阴市税务局', acceptorUscc:null, content:'增值税一般纳税人申报', status:'— —' },
        { type:'主动型', code:null, date:'2021-04-13', acceptor:'国家税务总局江阴市税务局', acceptorUscc:null, content:'增值税一般纳税人申报', status:'— —' },
        { type:'主动型', code:null, date:'2021-04-07', acceptor:'国家税务总局江阴市税务局', acceptorUscc:null, content:'增值税一般纳税人申报', status:'— —' }
      ],
      creditEvaluation: [],
      judicialJudgment: [],
      otherInfo: [],
      improvementSuggestion: '建议秉持诚信理念，合法有序开展经营活动。'
    },

    // ========== 中国华源集团有限公司（真实数据 · 源自 PDF 2026-05-05 · 失信惩戒对象）==========
    '中国华源集团有限公司': {
      reportNo: '20260505163213731547U5',
      generatedAt: '2026-05-05 16:32:13',
      version: 'V2.0',
      issuer: '国家公共信用和地理空间信息中心',
      labels: ['失信惩戒对象', '存续'],
      summary: { '行政管理':1, '诚实守信':1, '严重失信':1, '经营异常':0, '信用承诺':0, '信用评价':0, '司法判决':0, '其他':0 },
      basicInfo: {
        '企业名称':         '中国华源集团有限公司',
        '统一社会信用代码':  '91310000132215150M',
        '法定代表人/负责人': '陆俊德',
        '企业类型':         '有限责任公司(外商投资企业与内资合资)',
        '成立日期':         '1992-07-16',
        '住所':            '中国（上海）自由贸易试验区商城路660号'
      },
      // 二、行政管理 (1 条 · 真实 PDF 数据)
      administrativeMgmt: [
        { type:'行政许可', docNo:'(沪税普一)许变准字2021第(837)', name:'增值税防伪税控系统最高开票限额审批', category:'普通', date:'2021-06-04', validFrom:'2021-06-04', validTo:'2099-12-31', content:'增值税防伪税控系统最高开票限额审批', authority:'国家税务总局上海市普陀区税务局', source:'国家税务总局上海市普陀区税务局' }
      ],
      // 三、诚实守信 (1 条 · 真实)
      goodCredit: [
        { type:'纳税信用A级纳税人', taxpayerName:'中国华源集团有限公司', taxpayerId:'91310000132215150M', evalYear:'2020', source:'国家税务总局' }
      ],
      // 四、严重失信 (1 条 · 真实 · 失信被执行人)
      seriousMisconduct: [
        {
          type: '失信被执行人（法人）',
          listType: '失信被执行人名单',
          name: '中国华源集团有限公司',
          orgCode: '132215150',
          court: '上海市浦东新区人民法院',
          province: '上海',
          basisDoc: '（2009）浦民二(商)初字第2521号',
          filingDate: '2009-08-05',
          caseNo: '(2009)浦执字第07352号',
          executionAuthority: '上海市浦东新区人民法院',
          obligation: '一、被告中国华源集团有限公司应支付原告上海傲胜木业有限公司货款人民币 367,530.94 元；二、偿付逾期付款利息（自 2007-02-15 起按央行同期贷款利率计算）；三、加倍支付迟延履行期间债务利息；四、案件受理费 3,743.50 元由被告负担。',
          status: '全部未履行',
          behaviorType: '其他有履行能力而拒不履行生效法律文书确定义务',
          publishedAt: '2015-07-15',
          partiallyExecuted: '— —',
          unexecuted: '— —',
          source: '最高人民法院'
        }
      ],
      operatingAnomaly: [],
      creditCommitments: [],
      creditEvaluation: [],
      judicialJudgment: [],
      otherInfo: [],
      improvementSuggestion: '建议秉持诚信理念，合法有序开展经营活动。'
    },

    // ========== 江苏宁沪高速公路股份有限公司（真实数据 · PDF 2026-05-05 · 守信激励对象）==========
    '江苏宁沪高速公路股份有限公司': {
      reportNo: '20260505164152560952K5',
      generatedAt: '2026-05-05 16:41:52',
      version: 'V2.0',
      issuer: '国家公共信用和地理空间信息中心',
      labels: ['守信激励对象', '存续'],
      summary: { '行政管理':29, '诚实守信':5, '严重失信':0, '经营异常':0, '信用承诺':0, '信用评价':0, '司法判决':0, '其他':0 },
      basicInfo: {
        '企业名称':         '江苏宁沪高速公路股份有限公司',
        '统一社会信用代码':  '91320000134762764K',
        '法定代表人/负责人': '汪锋',
        '企业类型':         '— —',
        '成立日期':         '1992-08-01',
        '住所':            '江苏省南京市仙林大道6号'
      },
      // 二、行政管理 (共 29 条 · 仅展示前 10 条真实)
      administrativeMgmt: [
        { type:'行政许可', docNo:'苏交高速许字〔2026〕00095号', name:'准予许可决定书',           category:'普通', date:'2026-04-22', validFrom:'2026-04-22', validTo:'2026-06-30', content:'高速公路养护作业需要半幅封闭或者中断交通许可',                                  authority:'江苏省交通运输厅',     source:'江苏省交通运输厅' },
        { type:'行政许可', docNo:'苏交高速许字〔2025〕00549号', name:'准予许可决定书',           category:'普通', date:'2025-12-30', validFrom:'2025-12-30', validTo:'2031-12-16', content:'关停高速公路服务区许可',                                                          authority:'江苏省交通运输厅',     source:'江苏省交通运输厅' },
        { type:'行政许可', docNo:'江宁交路许字〔2025〕00013号', name:'准予许可决定书',           category:'普通', date:'2025-12-30', validFrom:'2025-12-30', validTo:'2031-09-05', content:'公路建筑控制区内埋设管线、电缆等设施许可',                                       authority:'南京市江宁区交通运输局', source:'南京市江宁区交通运输局' },
        { type:'行政许可', docNo:'3202912025HB0055',          name:'国有建设用地划拨决定书',    category:'普通', date:'2025-12-29', validFrom:'2025-12-29', validTo:'2099-12-31', content:'江苏宁沪高速无锡梅村服务区配套用房新建工程（一期）国有建设用地使用权', authority:'无锡市自然资源和规划局', source:'无锡市公共信用信息中心' },
        { type:'行政许可', docNo:'苏交高速许字〔2025〕00433号', name:'准予许可决定书',           category:'普通', date:'2025-12-12', validFrom:'2025-12-12', validTo:'2031-10-16', content:'高速公路养护作业需要半幅封闭或者中断交通许可',                                  authority:'江苏省交通运输厅',     source:'江苏省交通运输厅' },
        { type:'行政许可', docNo:'苏交高速许字〔2025〕00377号', name:'准予许可决定书',           category:'普通', date:'2025-12-08', validFrom:'2025-12-08', validTo:'2031-09-19', content:'跨越、穿越公路修建桥梁 / 架设、埋设管道、电缆等设施许可',                       authority:'江苏省交通运输厅',     source:'江苏省交通运输厅' },
        { type:'行政许可', docNo:'常水许可〔2025〕40号',       name:'涉河建设方案行政许可决定',  category:'普通', date:'2025-10-20', validFrom:'2025-10-20', validTo:'2028-10-20', content:'南京至太仓高速公路南京至常州段滆湖服务区改扩建工程涉河建设方案',                authority:'常州市水利局',         source:'常州市信用办' },
        { type:'行政许可', docNo:'苏交高速许字〔2025〕00276号', name:'准予许可决定书',           category:'普通', date:'2025-08-22', validFrom:'2025-08-22', validTo:'2031-07-17', content:'跨越、穿越公路修建桥梁 / 架设、埋设管道、电缆等设施许可',                       authority:'江苏省交通运输厅',     source:'江苏省交通运输厅' },
        { type:'行政许可', docNo:'苏林林地审字〔锡〕〔2025〕101号', name:'江苏省林业局行政许可决定书', category:'普通', date:'2025-07-15', validFrom:'2025-07-15', validTo:'2027-07-15', content:'永久使用林地 0.8727 公顷',                                                       authority:'江苏省林业局',         source:'江苏省林业局' },
        { type:'行政许可', docNo:'苏交高速许字〔2025〕00059号', name:'准予许可决定书',           category:'普通', date:'2025-03-07', validFrom:'2025-03-07', validTo:'—',          content:'高速公路设施类相关许可',                                                         authority:'江苏省交通运输厅',     source:'江苏省交通运输厅' }
        // 实际报告共 29 条；本演示展示前 10 条样本，余 19 条参见底稿
      ],
      // 三、诚实守信 (5 条 · 真实 · 5 个年度纳税 A 级)
      goodCredit: [
        { type:'纳税信用A级纳税人', taxpayerName:'江苏宁沪高速公路股份有限公司', taxpayerId:'91320000134762764K', evalYear:'2024', source:'国家税务总局' },
        { type:'纳税信用A级纳税人', taxpayerName:'江苏宁沪高速公路股份有限公司', taxpayerId:'91320000134762764K', evalYear:'2023', source:'国家税务总局' },
        { type:'纳税信用A级纳税人', taxpayerName:'江苏宁沪高速公路股份有限公司', taxpayerId:'91320000134762764K', evalYear:'2022', source:'国家税务总局' },
        { type:'纳税信用A级纳税人', taxpayerName:'江苏宁沪高速公路股份有限公司', taxpayerId:'91320000134762764K', evalYear:'2021', source:'国家税务总局' },
        { type:'纳税信用A级纳税人', taxpayerName:'江苏宁沪高速公路股份有限公司', taxpayerId:'91320000134762764K', evalYear:'2017', source:'国家税务总局' }
      ],
      seriousMisconduct: [],
      operatingAnomaly: [],
      creditCommitments: [],
      creditEvaluation: [],
      judicialJudgment: [],
      otherInfo: [],
      improvementSuggestion: '建议秉持诚信理念，合法有序开展经营活动。'
    },

    // ========== 江西铜业股份有限公司（真实数据 · PDF 2026-05-05 · 守信激励 + 海关高级认证）==========
    '江西铜业股份有限公司': {
      reportNo: '20260505164253427677H6',
      generatedAt: '2026-05-05 16:42:53',
      version: 'V2.0',
      issuer: '国家公共信用和地理空间信息中心',
      labels: ['守信激励对象', '存续'],
      summary: { '行政管理':59, '诚实守信':11, '严重失信':0, '经营异常':0, '信用承诺':0, '信用评价':0, '司法判决':0, '其他':0 },
      basicInfo: {
        '企业名称':         '江西铜业股份有限公司',
        '统一社会信用代码':  '91360000625912173B',
        '法定代表人/负责人': '郑高清',
        '企业类型':         '股份有限公司(台港澳与境内合资、上市)',
        '成立日期':         '1997-01-24',
        '住所':            '江西省鹰潭市贵溪市江西省贵溪市冶金大道15号',
        '海关注册编号':     '91360000625912173B（鹰潭海关 · 1997-07-09 备案 · 正常）'
      },
      // 二、行政管理 (共 59 条 · 仅展示前 10 条真实 · 主要是德兴市易制毒化学品运输证)
      administrativeMgmt: [
        { type:'行政许可', docNo:'Y36265006111254', name:'运输许可证备案证明', category:'特许', date:'2026-03-30', validFrom:'2026-03-30', validTo:'2026-06-09', content:'运输证（第三类易制毒化学品）', authority:'德兴市公安局', source:'德兴市公安局' },
        { type:'行政许可', docNo:'Y36265006124713', name:'运输许可证备案证明', category:'特许', date:'2026-03-30', validFrom:'2026-03-30', validTo:'2026-06-09', content:'运输证（第三类易制毒化学品）', authority:'德兴市公安局', source:'德兴市公安局' },
        { type:'行政许可', docNo:'Y36265006103156', name:'运输许可证备案证明', category:'特许', date:'2026-03-30', validFrom:'2026-03-30', validTo:'2026-06-09', content:'运输证（第三类易制毒化学品）', authority:'德兴市公安局', source:'德兴市公安局' },
        { type:'行政许可', docNo:'Y36265005766741', name:'运输许可证备案证明', category:'特许', date:'2026-03-26', validFrom:'2026-03-26', validTo:'2026-06-19', content:'运输证（第三类易制毒化学品）', authority:'德兴市公安局', source:'德兴市公安局' },
        { type:'行政许可', docNo:'Y36265005690485', name:'运输许可证备案证明', category:'特许', date:'2026-03-26', validFrom:'2026-03-26', validTo:'2026-06-09', content:'运输证（第三类易制毒化学品）', authority:'德兴市公安局', source:'德兴市公安局' },
        { type:'行政许可', docNo:'Y36265005827201', name:'运输许可证备案证明', category:'特许', date:'2026-03-26', validFrom:'2026-03-26', validTo:'2026-05-23', content:'运输证（第三类易制毒化学品）', authority:'德兴市公安局', source:'德兴市公安局' },
        { type:'行政许可', docNo:'Y36265005636377', name:'运输许可证备案证明', category:'特许', date:'2026-03-25', validFrom:'2026-03-25', validTo:'2026-06-08', content:'运输证（第三类易制毒化学品）', authority:'德兴市公安局', source:'德兴市公安局' },
        { type:'行政许可', docNo:'Y36265005612889', name:'运输许可证备案证明', category:'特许', date:'2026-03-25', validFrom:'2026-03-25', validTo:'2026-06-09', content:'运输证（第三类易制毒化学品）', authority:'德兴市公安局', source:'德兴市公安局' },
        { type:'行政许可', docNo:'Y36265005626585', name:'运输许可证备案证明', category:'特许', date:'2026-03-25', validFrom:'2026-03-25', validTo:'2026-06-09', content:'运输证（第三类易制毒化学品）', authority:'德兴市公安局', source:'德兴市公安局' },
        { type:'行政许可', docNo:'Y36265005612894', name:'运输许可证备案证明', category:'特许', date:'2026-03-25', validFrom:'2026-03-25', validTo:'2026-06-09', content:'运输证（第三类易制毒化学品）', authority:'德兴市公安局', source:'德兴市公安局' }
        // 实际报告共 59 条；本演示展示前 10 条样本（多为德兴市易制毒化学品运输证），余 49 条参见底稿
      ],
      // 三、诚实守信 (11 条 · 真实 · 10 个年度纳税 A 级 + 1 个海关高级认证企业)
      goodCredit: [
        { type:'纳税信用A级纳税人', taxpayerName:'江西铜业股份有限公司', taxpayerId:'91360000625912173B', evalYear:'2024', source:'国家税务总局' },
        { type:'纳税信用A级纳税人', taxpayerName:'江西铜业股份有限公司', taxpayerId:'91360000625912173B', evalYear:'2023', source:'国家税务总局' },
        { type:'纳税信用A级纳税人', taxpayerName:'江西铜业股份有限公司', taxpayerId:'91360000625912173B', evalYear:'2022', source:'国家税务总局' },
        { type:'纳税信用A级纳税人', taxpayerName:'江西铜业股份有限公司', taxpayerId:'91360000625912173B', evalYear:'2021', source:'国家税务总局' },
        { type:'纳税信用A级纳税人', taxpayerName:'江西铜业股份有限公司', taxpayerId:'91360000625912173B', evalYear:'2020', source:'国家税务总局' },
        { type:'纳税信用A级纳税人', taxpayerName:'江西铜业股份有限公司', taxpayerId:'91360000625912173B', evalYear:'2019', source:'国家税务总局' },
        { type:'纳税信用A级纳税人', taxpayerName:'江西铜业股份有限公司', taxpayerId:'91360000625912173B', evalYear:'2018', source:'国家税务总局' },
        { type:'纳税信用A级纳税人', taxpayerName:'江西铜业股份有限公司', taxpayerId:'91360000625912173B', evalYear:'2017', source:'国家税务总局' },
        { type:'纳税信用A级纳税人', taxpayerName:'江西铜业股份有限公司', taxpayerId:'91360000625912173B', evalYear:'2016', source:'国家税务总局' },
        { type:'纳税信用A级纳税人', taxpayerName:'江西铜业股份有限公司', taxpayerId:'91360000625912173B', evalYear:'2015', source:'国家税务总局' },
        { type:'海关高级认证企业',  enterpriseName:'江西铜业股份有限公司', orgCode:'625912173', customsCode:'91360000625912173B', firstRegistered:'1997-07-09', creditLevel:'高级认证', certifiedAt:'2024-07-18', source:'海关总署' }
      ],
      seriousMisconduct: [],
      operatingAnomaly: [],
      creditCommitments: [],
      creditEvaluation: [],
      judicialJudgment: [],
      otherInfo: [],
      improvementSuggestion: '建议秉持诚信理念，合法有序开展经营活动。'
    },

    // ========== 深圳市福田产业投资服务有限公司（守信激励对象 · 国有独资）==========
    '深圳市福田产业投资服务有限公司': {
      reportNo: '20260505174108986E4905',
      generatedAt: '2026-05-05 17:41:08',
      version: 'V2.0',
      issuer: '国家公共信用和地理空间信息中心',
      labels: ['守信激励对象', '存续'],
      summary: { '行政管理':22, '诚实守信':3, '严重失信':0, '经营异常':0, '信用承诺':1, '信用评价':0, '司法判决':0, '其他':0 },
      basicInfo: {
        '企业名称':'深圳市福田产业投资服务有限公司',
        '统一社会信用代码':'91440300618819640R',
        '法定代表人/负责人':'李奇林',
        '企业类型':'有限责任公司(国有独资)',
        '成立日期':'1990-12-27',
        '住所':'深圳市福田区梅林街道梅都社区中康路136号深圳新一代产业园6栋17层整层'
      },
      administrativeMgmt: [
        { type:'行政许可', docNo:'22512038765',     name:'商事变更登记（备案）', category:'登记', date:'2025-11-05', validFrom:'2025-11-05', validTo:'2099-12-31', content:'章程或章程修正案通过日期 / 联系人 / 董事长 / 董事 / 监事 / 总经理', authority:'深圳市市场监督管理局', source:'深圳市市场监督管理局' }
        // 实际报告共 22 条；本演示展示前 1 条样本，余 21 条参见底稿
      ],
      goodCredit: [
        { type:'纳税信用A级纳税人', taxpayerName:'深圳市福田产业投资服务有限公司', taxpayerId:'91440300618819640R', evalYear:'2024', source:'国家税务总局' },
        { type:'纳税信用A级纳税人', taxpayerName:'深圳市福田产业投资服务有限公司', taxpayerId:'91440300618819640R', evalYear:'2023', source:'国家税务总局' },
        { type:'纳税信用A级纳税人', taxpayerName:'深圳市福田产业投资服务有限公司', taxpayerId:'91440300618819640R', evalYear:'2022', source:'国家税务总局' }
      ],
      seriousMisconduct: [],
      operatingAnomaly: [],
      creditCommitments: [
        { type:'主动型', code:null, date:'2024-06-01', acceptor:'深圳市市场监督管理局', acceptorUscc:null, content:'依法合规经营 · 主动接受社会监督', status:'— —' }
      ],
      creditEvaluation: [],
      judicialJudgment: [],
      otherInfo: [],
      improvementSuggestion: '建议秉持诚信理念，合法有序开展经营活动。'
    },

    // ========== 石家庄市供销合作总社安全统筹公司（失信惩戒对象 · 181 严重失信）==========
    '石家庄市供销合作总社安全统筹公司': {
      reportNo: '20260505175357650928R4',
      generatedAt: '2026-05-05 17:53:57',
      version: 'V2.0',
      issuer: '国家公共信用和地理空间信息中心',
      labels: ['失信惩戒对象', '存续'],
      summary: { '行政管理':0, '诚实守信':0, '严重失信':181, '经营异常':0, '信用承诺':1, '信用评价':0, '司法判决':0, '其他':0 },
      basicInfo: {
        '企业名称':'石家庄市供销合作总社安全统筹公司',
        '统一社会信用代码':'91130105107743680U',
        '法定代表人/负责人':'李英山',
        '企业类型':'集体所有制',
        '成立日期':'1992-10-27',
        '住所':'河北省石家庄市新华区新华路212号院内办公楼二楼203室'
      },
      administrativeMgmt: [],
      goodCredit: [],
      // 实际 181 条失信被执行人；展示首条 + 总数说明
      seriousMisconduct: [
        {
          type: '失信被执行人（法人）',
          name: '石家庄市供销合作总社安全统筹公司',
          orgCode: '10774368-0',
          court: '沧县人民法院',
          province: '河北',
          basisDoc: '（2024）冀0921民再2号',
          filingDate: '2026-01-20',
          caseNo: '(2026)冀0921执188号',
          executionAuthority: '沧县人民法院',
          obligation: '被申诉人石家庄市供销合作总社安全统筹公司在第三者责任险的赔偿限额内赔偿申诉人刘宝山 99,477.75 元',
          status: '全部未履行',
          behaviorType: '其他有履行能力而拒不履行生效法律文书确定义务',
          publishedAt: '2026-02-10',
          partiallyExecuted: '— —',
          unexecuted: '— —',
          source: '最高人民法院'
        }
        // 实际报告共 181 条失信被执行人案例（极端高风险）；本演示展示首条样本，余 180 条参见底稿
      ],
      operatingAnomaly: [],
      creditCommitments: [
        { type:'主动型', code:null, date:'2023-09-15', acceptor:'河北省市场监督管理局', acceptorUscc:null, content:'依法经营承诺', status:'— —' }
      ],
      creditEvaluation: [],
      judicialJudgment: [],
      otherInfo: [],
      improvementSuggestion: '建议依法及时履行所有失信被执行人案件确定的义务（181 条），按"信用修复"流程申请修复，恢复信用状态。'
    },

    // ========== 四川齐光建设工程有限公司（失信惩戒对象 · 1 失信）==========
    '四川齐光建设工程有限公司': {
      reportNo: '20260505180050297G0243',
      generatedAt: '2026-05-05 18:00:50',
      version: 'V2.0',
      issuer: '国家公共信用和地理空间信息中心',
      labels: ['失信惩戒对象', '存续'],
      summary: { '行政管理':3, '诚实守信':1, '严重失信':1, '经营异常':0, '信用承诺':1, '信用评价':0, '司法判决':0, '其他':0 },
      basicInfo: {
        '企业名称':'四川齐光建设工程有限公司',
        '统一社会信用代码':'91510185MA64ND8627',
        '法定代表人/负责人':'王福玉',
        '企业类型':'有限责任公司(自然人投资或控股)',
        '成立日期':'2019-01-14',
        '住所':'犍为县玉津镇纪家路416号7幢1-11号、1-12号'
      },
      administrativeMgmt: [
        { type:'行政许可', docNo:'演示样例', name:'公司变更登记', category:'登记', date:'2024-08-15', validFrom:'2024-08-15', validTo:'2099-12-31', content:'股东 / 法定代表人变更', authority:'乐山市市场监督管理局', source:'乐山市市场监督管理局' }
      ],
      goodCredit: [
        { type:'纳税信用A级纳税人', taxpayerName:'四川齐光建设工程有限公司', taxpayerId:'91510185MA64ND8627', evalYear:'2022', source:'国家税务总局' }
      ],
      seriousMisconduct: [
        {
          type: '失信被执行人（法人）',
          name: '四川齐光建设工程有限公司',
          orgCode: 'MA64ND86-2',
          court: '乐山市市中区人民法院',
          province: '四川',
          basisDoc: '（2025）川1102民初4853号',
          filingDate: '2026-02-04',
          caseNo: '(2026)川1102执478号',
          executionAuthority: '乐山市市中区人民法院',
          obligation: '被告四川齐光建设工程有限公司对借款本金 838,000 元、利息及罚息（按央行同期贷款利率计算）+ 律师代理费 20,000 元承担连带清偿责任',
          status: '全部未履行',
          behaviorType: '违反财产报告制度',
          publishedAt: '2026-04-27',
          partiallyExecuted: '— —',
          unexecuted: '— —',
          source: '最高人民法院'
        }
      ],
      operatingAnomaly: [],
      creditCommitments: [
        { type:'主动型', code:null, date:'2022-06-01', acceptor:'犍为县市场监督管理局', acceptorUscc:null, content:'依法经营承诺', status:'— —' }
      ],
      creditEvaluation: [],
      judicialJudgment: [],
      otherInfo: [],
      improvementSuggestion: '建议依法及时履行 (2026)川1102执478号 案件确定的义务，按"信用修复"流程申请修复。'
    },

    // ========== 四川蜀运恒通建设工程有限公司（失信惩戒 + 经营异常）==========
    '四川蜀运恒通建设工程有限公司': {
      reportNo: '202605051755133142N523',
      generatedAt: '2026-05-05 17:55:13',
      version: 'V2.0',
      issuer: '国家公共信用和地理空间信息中心',
      labels: ['失信惩戒对象', '经营异常', '存续'],
      summary: { '行政管理':1, '诚实守信':0, '严重失信':1, '经营异常':2, '信用承诺':0, '信用评价':0, '司法判决':0, '其他':0 },
      basicInfo: {
        '企业名称':'四川蜀运恒通建设工程有限公司',
        '统一社会信用代码':'91510104MA6CFT042R',
        '法定代表人/负责人':'罗文全',
        '企业类型':'有限责任公司(自然人投资或控股)',
        '成立日期':'2018-05-25',
        '住所':'成都市锦江区大业路6号1栋3单元7层715号'
      },
      administrativeMgmt: [
        { type:'行政许可', docNo:'演示样例', name:'公司变更登记', category:'登记', date:'2024-03-01', validFrom:'2024-03-01', validTo:'2099-12-31', content:'股东变更', authority:'成都市锦江区市场监督管理局', source:'成都市锦江区市场监督管理局' }
      ],
      goodCredit: [],
      seriousMisconduct: [
        {
          type: '失信被执行人（法人）',
          name: '四川蜀运恒通建设工程有限公司',
          orgCode: '91510104MA6CFT042R',
          court: '重庆市璧山区人民法院',
          province: '重庆',
          basisDoc: '(2021)渝0120民初9093号',
          filingDate: '2022-04-19',
          caseNo: '(2022)渝0120执1396号',
          executionAuthority: '重庆市璧山区人民法院',
          obligation: '(2021)渝0120民初9093号 民事判决书确定的给付义务',
          status: '全部未履行',
          behaviorType: '有履行能力而拒不履行生效法律文书确定义务',
          publishedAt: '2022-08-17',
          partiallyExecuted: '暂无',
          unexecuted: '暂无',
          source: '最高人民法院'
        }
      ],
      operatingAnomaly: [
        { type:'经营异常名录', listType:'通过登记的住所或者经营场所无法联系', listDate:'2024-10-10', authority:'锦江市场监督管理局', source:'市场监督管理总局' },
        { type:'经营异常名录', listType:'通过登记的住所或者经营场所无法联系', listDate:'2024-10-10', authority:'锦江市场监督管理局', source:'市场监督管理总局' }
      ],
      creditCommitments: [],
      creditEvaluation: [],
      judicialJudgment: [],
      otherInfo: [],
      improvementSuggestion: '建议立即整改：① 联系市场监管部门移出经营异常名录；② 履行 (2022)渝0120执1396号 案件义务 + 信用修复申请。'
    },

    // ========== 望城经开区投资建设集团有限公司（城投 · 191 行政 + 117 信用承诺）==========
    '望城经开区投资建设集团有限公司': {
      reportNo: '2026050517570443042L84',
      generatedAt: '2026-05-05 17:57:04',
      version: 'V2.0',
      issuer: '国家公共信用和地理空间信息中心',
      labels: ['存续'],
      summary: { '行政管理':191, '诚实守信':0, '严重失信':0, '经营异常':0, '信用承诺':100, '信用评价':0, '司法判决':0, '其他':0 },
      basicInfo: {
        '企业名称':'望城经开区投资建设集团有限公司',
        '统一社会信用代码':'91430122707233692A',
        '法定代表人/负责人':'易皋',
        '企业类型':'有限责任公司（非自然人投资或控股的法人独资）',
        '成立日期':'1993-04-13',
        '住所':'长沙市望城经济技术开发区同心路1号'
      },
      administrativeMgmt: [
        { type:'行政许可', docNo:'演示样例', name:'城投基建项目许可', category:'普通', date:'2025-09-15', validFrom:'2025-09-15', validTo:'2030-09-14', content:'望城经开区基础设施建设工程相关行政许可', authority:'望城经济技术开发区', source:'望城经济技术开发区' }
        // 实际报告共 191 条；本演示展示样本，余 190 条参见底稿（典型城投平台高频审批活动）
      ],
      goodCredit: [],
      seriousMisconduct: [],
      operatingAnomaly: [],
      // 真实 117 条信用承诺；展示前 4 条
      creditCommitments: [
        { type:'主动型', code:null, date:'2021-09-29', acceptor:'望城经济技术开发区', acceptorUscc:null, content:'唯品会项目给水管道工程施工，需占用并挖掘金山路道路', status:'— —' },
        { type:'主动型', code:null, date:'2021-06-07', acceptor:'望城经济技术开发区', acceptorUscc:null, content:'腾飞路（郭亮南路-黄桥大道）综合提质改造工程建设工程规划许可', status:'— —' },
        { type:'主动型', code:null, date:'2021-06-04', acceptor:'望城经济技术开发区', acceptorUscc:null, content:'申请普瑞路（三环线-雷高路）提质改造工程设计采购施工总承包（EPC）第一标段项目施工许可', status:'— —' },
        { type:'主动型', code:null, date:'2021-04-02', acceptor:'望城经济技术开发区', acceptorUscc:null, content:'普瑞路（雷高路-三环线段）提质改造工程项目水土保持方案（报告书）审批', status:'— —' }
        // 实际报告共 117 条；本演示展示前 4 条样本，余 113 条参见底稿
      ],
      creditEvaluation: [],
      judicialJudgment: [],
      otherInfo: [],
      improvementSuggestion: '建议秉持诚信理念，合法有序开展经营活动。'
    },

    // ========== 枣庄市道桥工程有限公司（失信惩戒对象 · 国有控股）==========
    '枣庄市道桥工程有限公司': {
      reportNo: '202605051759032014249N',
      generatedAt: '2026-05-05 17:59:03',
      version: 'V2.0',
      issuer: '国家公共信用和地理空间信息中心',
      labels: ['失信惩戒对象', '存续'],
      summary: { '行政管理':6, '诚实守信':1, '严重失信':1, '经营异常':0, '信用承诺':1, '信用评价':0, '司法判决':0, '其他':0 },
      basicInfo: {
        '企业名称':'枣庄市道桥工程有限公司',
        '统一社会信用代码':'91370400728618604X',
        '法定代表人/负责人':'张耀',
        '企业类型':'有限责任公司(国有控股)',
        '成立日期':'2001-03-30',
        '住所':'山东省枣庄市市中区青檀中路36号'
      },
      administrativeMgmt: [
        { type:'行政许可', docNo:'演示样例', name:'建筑工程施工许可证', category:'普通', date:'2024-05-10', validFrom:'2024-05-10', validTo:'2027-05-09', content:'道桥施工资质 / 项目许可', authority:'枣庄市住房和城乡建设局', source:'枣庄市住房和城乡建设局' }
      ],
      goodCredit: [
        { type:'纳税信用A级纳税人', taxpayerName:'枣庄市道桥工程有限公司', taxpayerId:'91370400728618604X', evalYear:'2021', source:'国家税务总局' }
      ],
      seriousMisconduct: [
        {
          type: '失信被执行人（法人）',
          name: '枣庄市道桥工程有限公司',
          orgCode: '91370400728618604X',
          court: '汝城县人民法院',
          province: '湖南',
          basisDoc: '（2024）湘10民终1033号',
          filingDate: '2025-01-07',
          caseNo: '(2025)湘1026执36号',
          executionAuthority: '湖南省郴州市中级人民法院',
          obligation: '驳回上诉，维持原判。二审案件受理费 3,770 元，由李泽南负担。',
          status: '全部未履行',
          behaviorType: '其他规避执行',
          publishedAt: '2025-06-18',
          partiallyExecuted: '暂无',
          unexecuted: '暂无',
          source: '最高人民法院'
        }
      ],
      operatingAnomaly: [],
      creditCommitments: [
        { type:'主动型', code:null, date:'2023-04-20', acceptor:'枣庄市市场监督管理局', acceptorUscc:null, content:'依法经营承诺', status:'— —' }
      ],
      creditEvaluation: [],
      judicialJudgment: [],
      otherInfo: [],
      improvementSuggestion: '建议依法及时履行 (2025)湘1026执36号 案件确定的义务，按"信用修复"流程申请修复。'
    }
  };

  // 派生：基于 publicGrade 自动派生其他主体的报告（合成数据，结构与南京钢铁完全一致）
  function deriveCreditChinaReport(subject) {
    const grade = subject.publicGrade || 'B';
    const labels = subject.creditLabels || [];
    const isHighGrade = grade === 'A' || grade === 'A+';
    const isLowGrade  = grade === 'D' || grade === 'C';
    const baseDate = new Date();
    const yyyy = baseDate.getFullYear();
    const mmdd = String(baseDate.getMonth()+1).padStart(2,'0') + String(baseDate.getDate()).padStart(2,'0');
    const reportNo = yyyy + mmdd + (subject.uscc || '').slice(-9) + 'D' + (subject.uscc || '00').slice(0,2);
    return {
      reportNo,
      generatedAt: yyyy + '-' + String(baseDate.getMonth()+1).padStart(2,'0') + '-' + String(baseDate.getDate()).padStart(2,'0') + ' 09:30:00',
      version: 'V2.0',
      issuer: '国家公共信用和地理空间信息中心',
      labels: labels.length ? [...labels, '存续'] : ['存续'],
      summary: {
        '行政管理': isHighGrade ? 12 : (isLowGrade ? 6 : 9),
        '诚实守信': isHighGrade ? 5 : (isLowGrade ? 0 : 2),
        '严重失信': isLowGrade ? (grade === 'D' ? 2 : 1) : 0,
        '经营异常': isLowGrade ? 1 : 0,
        '信用承诺': isHighGrade ? 6 : (isLowGrade ? 2 : 4),
        '信用评价': 0,
        '司法判决': isLowGrade ? 3 : 0,
        '其他':     0
      },
      basicInfo: {
        '企业名称':              subject.name,
        '统一社会信用代码':       subject.uscc || '—',
        '法定代表人/负责人':      subject.legalRep || '—',
        '企业类型':              '有限责任公司（演示数据）',
        '成立日期':              subject.establishedAt || '—',
        '住所':                  subject.address || '—'
      },
      administrativeMgmt: [
        { type:'行政许可', docNo:'演示样例（详见底稿）', name:'营业执照变更登记', category:'登记', date:'2024-06-15', validFrom:'2024-06-15', validTo:'2099-12-31', content:'公司经营范围 / 注册资本变更', authority:'当地市场监督管理局', source:'当地市场监督管理局' }
      ],
      goodCredit: isHighGrade ? [
        { type:'纳税信用A级纳税人', taxpayerName:subject.name, taxpayerId:subject.uscc, evalYear:'2024', source:'国家税务总局' },
        { type:'纳税信用A级纳税人', taxpayerName:subject.name, taxpayerId:subject.uscc, evalYear:'2023', source:'国家税务总局' }
      ] : (isLowGrade ? [] : [
        { type:'纳税信用A级纳税人', taxpayerName:subject.name, taxpayerId:subject.uscc, evalYear:'2024', source:'国家税务总局' }
      ]),
      seriousMisconduct: isLowGrade && grade === 'D' ? [
        { type:'严重失信主体名单（演示样例）', listType:'被列入严重失信主体名单', listDate:'2025-03-15', reason:'演示样例：重大行政处罚未履行', authority:'当地行政机关', source:'信用中国' }
      ] : [],
      operatingAnomaly: isLowGrade ? [
        { type:'经营异常名录（演示样例）', listType:'通过登记的住所或者经营场所无法联系', listDate:'2024-12-10', authority:'当地市场监督管理局', source:'国家企业信用信息公示系统' }
      ] : [],
      creditCommitments: [
        { type:'主动型', code:null, date:'2024-09-08', acceptor:'当地税务局', acceptorUscc:null, content:'承诺合法合规经营 / 主动接受监督', status:'— —' }
      ],
      creditEvaluation: [],
      judicialJudgment: isLowGrade ? [
        { type:'判决信息（演示样例）', caseNo:'演示样例', caseType:'民事 / 合同纠纷', decisionDate:'2024-08-20', court:'当地人民法院', source:'中国裁判文书网' }
      ] : [],
      otherInfo: [],
      improvementSuggestion: isHighGrade
        ? '建议秉持诚信理念，合法有序开展经营活动。'
        : (isLowGrade
            ? '建议依法及时履行行政处罚 / 司法判决，按"信用修复"流程申请修复，恢复信用状态。'
            : '建议持续保持守信记录，及时履行信用承诺。')
    };
  }

  subjects.forEach(s => {
    s.officialReport = creditChinaReports[s.name] || deriveCreditChinaReport(s);
  });

  /* 白盒化归因（保留作为 Step 3 跨域翻译使用 · 不在 Step 2 显示）
   * 注意：信用中国官方报告无评分；下述扣加分仅供 Step 3 远东内部跨域翻译参考。
   * --------------------------------------------------------------- */
  const attribution = [
    // 行政管理维度（重大处罚）
    { dimension:'行政管理', dimCode:'AM', item:'重大行政处罚 · 环保',
      event:'演示样例：环保处罚事件（金额、文号详见信用中国行政管理 第 X 条）',
      eventDate:'2025-06-18', score:-120,
      legalBasis:'《中华人民共和国大气污染防治法》第 99 条 + GB/T 45255-2025 §6.2 行政管理',
      repairPath:'整改完成 + 公告无再犯 → 满 6 个月可申请信用修复（《行政处罚信息信用修复流程》）' },

    // 履约践诺维度（欠税）
    { dimension:'履约践诺', dimCode:'CT', item:'欠税记录',
      event:'演示样例：欠税事件（金额详见信用中国 第 X 条，已结清）',
      eventDate:'2024-09-30', score:-60,
      legalBasis:'《税收征收管理法》第 32 条 + GB/T 45255-2025 §6.3 履约践诺',
      repairPath:'已结清 + 12 个月无新增 → 可申请信用修复' },

    // 社会监督维度（披露完整性）— 原 ESG 项归入此维度
    { dimension:'社会监督', dimCode:'SO', item:'信息披露完整性',
      event:'演示样例：年报范围三碳排放披露待补充（响应社会公众关注）',
      eventDate:'2025-12-31', score:-30,
      legalBasis:'GB/T 32150 + 沪深交易所披露规则 + GB/T 45255-2025 §6.8 社会监督',
      repairPath:'2026 年报补充披露范围三 + 第三方核证' },

    // 履约践诺维度（正向）
    { dimension:'履约践诺', dimCode:'CT', item:'信用承诺按期履约',
      event:'演示样例：政府采购合同按期履约 + 主动型信用承诺已全部履行',
      eventDate:'2025-12-31', score:+10,
      legalBasis:'《全国信用承诺管理办法》+ GB/T 45255-2025 §6.3 履约践诺',
      repairPath:'保持履约可累计正向激励' },

    // 守信激励维度（A 级纳税人）
    { dimension:'守信激励', dimCode:'TR', item:'A 级纳税信用',
      event:'演示样例：近年纳税信用 A 级（信用中国"诚实守信"栏目可查）',
      eventDate:'2025-12-31', score:+20,
      legalBasis:'《纳税信用管理办法》(国家税务总局公告 2014 年第 40 号) + GB/T 45255-2025 §6.6 守信激励',
      repairPath:'保持 A 级可继续正向加分' },

    // 行政管理维度（正向 — 安全生产无事故）
    { dimension:'行政管理', dimCode:'AM', item:'安全生产无事故',
      event:'演示样例：连续多年无重特大事故（应急管理部记录）',
      eventDate:'2025-12-31', score:+15,
      legalBasis:'《中华人民共和国安全生产法》第 24 条 + GB/T 45255-2025 §6.2 行政管理',
      repairPath:'保持纪录可继续加分' },

    // 经营管理维度（年报合规）
    { dimension:'经营管理', dimCode:'OP', item:'企业年报按期公示',
      event:'演示样例：连续 5 年企业年度报告按期公示，未列入经营异常名录',
      eventDate:'2025-06-30', score:+8,
      legalBasis:'《企业信息公示暂行条例》第 8 条 + GB/T 45255-2025 §6.4 经营管理',
      repairPath:'保持每年 6 月 30 日前完成年报公示' },

    // 发展创新维度（高企）
    { dimension:'发展创新', dimCode:'IN', item:'高新技术企业认定',
      event:'演示样例：通过国家高新技术企业认定（有效期 3 年）',
      eventDate:'2024-12-15', score:+12,
      legalBasis:'《高新技术企业认定管理办法》(国科发火〔2016〕32 号) + GB/T 45255-2025 §6.5 发展创新',
      repairPath:'有效期内继续享受加分；到期前 6 个月需重新申请认定' }
  ];

  /* 跨域翻译规则匹配（PD/LGD 等数值为 CCASCEA 模型示例输出） ------------- */
  const translations = [
    { event:'重大环保处罚（演示样例 · 见底稿 B-014）',        eventScore:-120, industryFactor:'钢铁 ×1.20',
      pdDelta:'+0.85%', lgdDelta:'+1.20%', cashflowImpact:'演示：年现金流 -2.5%（罚款 + 整改投入）',
      action:'下调 1 子级',  actionType:'down' },
    { event:'欠税事件（已结清 · 演示样例）',              eventScore:-60,  industryFactor:'通用 ×1.00',
      pdDelta:'+0.20%', lgdDelta:'+0.10%', cashflowImpact:'演示：已结清，影响有限',
      action:'保持 + 关注', actionType:'keep' },
    { event:'ESG 范围三披露完整性（演示样例）',           eventScore:-30,  industryFactor:'高碳行业 ×1.30',
      pdDelta:'+0.10%', lgdDelta:'-0.05%', cashflowImpact:'演示：对绿色融资资格影响显著',
      action:'+0.5 子级',  actionType:'up' },
    { event:'纳税信用 A 级（演示样例）',                  eventScore:+20,  industryFactor:'通用 ×1.00',
      pdDelta:'-0.15%', lgdDelta:'-0.10%', cashflowImpact:'演示：信用税收优惠正向贡献',
      action:'+0.5 子级',  actionType:'up' },
    { event:'安全生产纪录良好（演示样例）',               eventScore:+15,  industryFactor:'重资产 ×1.10',
      pdDelta:'-0.10%', lgdDelta:'-0.05%', cashflowImpact:'演示：保险费率优惠 0.3%',
      action:'+0.25 子级', actionType:'up' }
  ];

  /* 关联图谱 ------------------------------------------------------- */
  const graph = {
    rTotal: 0.18,
    nodes: [
      { name:'南京钢铁联合',          x: 300, y: 200, color:'#2E74B5' },
      { name:'实控人 自然人 A',        x: 100, y: 100, color:'#16A34A' },
      { name:'母公司 中国华源集团',    x: 200, y: 50,  color:'#4A90E2' },
      { name:'子公司 江苏华西',        x: 500, y: 100, color:'#16A34A' },
      { name:'子公司 江西铜业',        x: 500, y: 200, color:'#F59E0B' },
      { name:'担保方 宁沪高速',        x: 500, y: 300, color:'#DC2626' },
      { name:'保荐机构 申银万国',      x: 100, y: 300, color:'#F59E0B' }
    ],
    links: [
      { source:'母公司 中国华源集团', target:'南京钢铁联合',     label:'控股 65%' },
      { source:'实控人 自然人 A',     target:'母公司 中国华源集团', label:'实际控制' },
      { source:'南京钢铁联合',         target:'子公司 江苏华西',  label:'控股 80%' },
      { source:'南京钢铁联合',         target:'子公司 江西铜业',  label:'控股 100%', warning:true },
      { source:'担保方 宁沪高速',      target:'南京钢铁联合',     label:'担保 5亿', danger:true },
      { source:'保荐机构 申银万国',    target:'南京钢铁联合',     label:'尽调中介' }
    ]
  };

  /* 跟踪订阅 ------------------------------------------------------- */
  // 跟踪订阅 · USCC 严格对齐 subjects[] 权威字段
  const trackingSubscriptions = [
    {
      name:'南京钢铁联合有限公司', uscc:'91320100748204660Q', project:'P-2026-0421',
      alertCount:0, subscribedAt:'2026-04-01',
      lastTrackedAt:'2026-04-28 14:32', nextDueDate:'2027-04-28',
      reportCount:1, latestGrade:'AA-',
      triggeredEvents:[], periodicStatus:'on_track',
      industryRisk:{ name:'C31 钢铁制造', cycle:'下行期', score:'中' }
    },
    {
      name:'福禧投资控股有限公司', uscc:'913101150607311257', project:'P-2026-0418',
      alertCount:2, subscribedAt:'2026-04-05',
      lastTrackedAt:'2026-04-27 16:00', nextDueDate:'2027-04-27',
      reportCount:2, latestGrade:'BBB+',
      triggeredEvents:[
        { eventNo:5, eventName:'资产抵押/质押/出售/转让/重组', triggeredAt:'2026-04-25 10:30', severity:'中', desc:'核心资产抵押新增 6.8 亿' },
        { eventNo:19, eventName:'对外重大担保', triggeredAt:'2026-04-22 14:15', severity:'高', desc:'新增对外担保规模 12 亿，占净资产 28%' }
      ],
      periodicStatus:'on_track',
      industryRisk:{ name:'K70 房地产', cycle:'调整期', score:'高' }
    },
    {
      name:'中国华源集团有限公司', uscc:'91310000132215150M', project:'P-2026-0415',
      alertCount:0, subscribedAt:'2026-04-10',
      lastTrackedAt:'2026-04-15 14:00', nextDueDate:'2027-04-15',
      reportCount:1, latestGrade:'BBB-',
      triggeredEvents:[], periodicStatus:'on_track',
      industryRisk:{ name:'综合控股', cycle:'平稳', score:'中低' }
    },
    {
      name:'上海柴油机股份有限公司', uscc:'913100001322041051', project:'P-2026-0410',
      alertCount:1, subscribedAt:'2026-04-12',
      lastTrackedAt:'2026-04-26 09:30', nextDueDate:'2027-04-26',
      reportCount:1, latestGrade:'A-',
      triggeredEvents:[
        { eventNo:3, eventName:'外部经营条件重大变化', triggeredAt:'2026-04-24 11:00', severity:'中', desc:'公共信用 B → C，需评估融合等级影响' }
      ],
      periodicStatus:'on_track',
      industryRisk:{ name:'I65 信息技术', cycle:'上行期', score:'低' }
    },
    {
      name:'江苏宁沪高速公路股份有限公司', uscc:'91320000134762764K', project:null,
      alertCount:0, subscribedAt:'2026-04-18',
      lastTrackedAt:'2026-04-26 10:25', nextDueDate:'2027-04-26',
      reportCount:1, latestGrade:'BBB+',
      triggeredEvents:[], periodicStatus:'on_track',
      industryRisk:{ name:'F61 交通运输', cycle:'平稳', score:'低' }
    },
    {
      name:'江苏华西集团有限公司', uscc:'91320281142232229Q', project:'P-2026-0420',
      alertCount:5, subscribedAt:'2026-04-20',
      lastTrackedAt:'2026-04-28 16:00', nextDueDate:'2026-10-28',
      reportCount:2, latestGrade:'BBB-',
      triggeredEvents:[
        { eventNo:7, eventName:'重大债务违约', triggeredAt:'2026-04-26 18:00', severity:'高', desc:'关联企业华东建材到期 2.4 亿短债违约' },
        { eventNo:14, eventName:'重大诉讼/仲裁', triggeredAt:'2026-04-25 09:00', severity:'高', desc:'被列入"严重失信主体名单"' },
        { eventNo:1, eventName:'股权结构重大变化', triggeredAt:'2026-04-22 14:00', severity:'中', desc:'控股股东持股变动 -8%' },
        { eventNo:11, eventName:'1/3 以上董事或 2/3 以上监事或董事长/总经理变动', triggeredAt:'2026-04-21 10:00', severity:'中', desc:'CFO 离职' },
        { eventNo:21, eventName:'其他重大影响事项', triggeredAt:'2026-04-20 14:00', severity:'中', desc:'被纳入 D 级红线主体' }
      ],
      periodicStatus:'urgent',
      industryRisk:{ name:'C30 建材制造', cycle:'下行期', score:'高' }
    },
    {
      name:'湖南华菱管线股份有限公司', uscc:'914300007024418691', project:null,
      alertCount:0, subscribedAt:'2026-04-22',
      lastTrackedAt:'2026-04-25 16:30', nextDueDate:'2027-04-25',
      reportCount:1, latestGrade:'A',
      triggeredEvents:[], periodicStatus:'on_track',
      industryRisk:{ name:'C32 有色金属', cycle:'平稳', score:'中' }
    },
    {
      name:'武汉市城市建设投资开发集团有限公司', uscc:'914201007171752128', project:null,
      alertCount:0, subscribedAt:'2026-04-25',
      lastTrackedAt:'2026-04-28 09:00', nextDueDate:'2027-04-28',
      reportCount:1, latestGrade:'A-',
      triggeredEvents:[], periodicStatus:'on_track',
      industryRisk:{ name:'LGFV 城投平台', cycle:'平稳', score:'低' }
    }
  ];

  // 21 类重大事项分类（《跟踪评级制度》第七条）
  const TRACKING_EVENTS_21 = [
    '股权结构重大变化','经营方针/范围重大变化','外部经营条件重大变化','重大合同签订','资产抵押/质押/出售/转让/重组','到期重大债务展期',
    '重大债务违约','大额赔偿责任','净资产 10% 以上重大亏损','一次性免债超阈值','1/3 以上董事或 2/3 以上监事或董事长/总经理变动','董事长/总经理无法履职',
    '减资/合并/分立/解散/破产','重大诉讼/仲裁','涉嫌违法违规被调查或刑事、重大行政处罚','高管涉嫌违法违纪','重大资产被查封/扣押/冻结','主要业务停顿',
    '对外重大担保','募投项目变更','其他重大影响事项'
  ];

  /* 监管报送 ------------------------------------------------------- */
  const regulatoryStats = {
    period:'2026 年第一季度',
    totalRatings: 124, fusedSubjects: 5, repairCases: 18,
    disputeCases: 3, publishedReports: 124, avgCycleDays: 5.6
  };

  /* 系统用户 ------------------------------------------------------- */
  const systemUsers = [
    { id:'U-2026-001', name:'王明远', email:'wangmy@sfecr.example.com', role:'高级评级分析师', dept:'评级业务一部', status:'启用', lastLogin:'2026-04-28 09:12' },
    { id:'U-2026-002', name:'李雨欣', email:'liyx@sfecr.example.com',   role:'评级分析师',     dept:'评级业务二部', status:'启用', lastLogin:'2026-04-28 08:46' },
    { id:'U-2026-003', name:'张志强', email:'zhangzq@sfecr.example.com',role:'评级业务总监',   dept:'评级业务部',   status:'启用', lastLogin:'2026-04-28 09:30' },
    { id:'U-2026-004', name:'陈秋萍', email:'chenqp@sfecr.example.com', role:'合规与风控官',   dept:'合规部',       status:'启用', lastLogin:'2026-04-28 10:01' },
    { id:'U-2026-005', name:'周建华', email:'zhoujh@sfecr.example.com', role:'IT 运维管理员',   dept:'IT 信息技术部', status:'启用', lastLogin:'2026-04-28 06:00' },
    { id:'U-2026-006', name:'刘俊辉', email:'liujh@sfecr.example.com',  role:'数据治理工程师', dept:'数据中心',     status:'启用', lastLogin:'2026-04-27 19:48' },
    { id:'U-2026-007', name:'孙琳琳', email:'sunll@sfecr.example.com',  role:'客户成功',       dept:'客户服务部',   status:'启用', lastLogin:'2026-04-28 09:55' }
  ];

  /* 开放 API ------------------------------------------------------- */
  const apis = [
    { method:'GET',  path:'/v1/subjects/{uscc}',                 desc:'查询主体公共信用画像',   group:'主体查询', calls: 84200, success: 99.9 },
    { method:'GET',  path:'/v1/subjects/{uscc}/grade',           desc:'查询公共信用 ABCD 等级', group:'主体查询', calls: 76300, success: 99.8 },
    { method:'GET',  path:'/v1/subjects/{uscc}/attribution',     desc:'白盒化归因清单',         group:'主体查询', calls: 32100, success: 99.7 },
    { method:'POST', path:'/v1/rating/subject',                  desc:'启动主体评级流程',       group:'评级生产', calls: 12480, success: 99.5 },
    { method:'POST', path:'/v1/rating/bond',                     desc:'启动债项评级流程',       group:'评级生产', calls:  8650, success: 99.6 },
    { method:'POST', path:'/v1/translate/cross-domain',          desc:'跨域风险翻译',           group:'评级生产', calls: 18200, success: 99.4 },
    { method:'GET',  path:'/v1/reports/{id}',                    desc:'获取评级报告',           group:'报告与披露', calls: 22100, success: 99.9 },
    { method:'POST', path:'/v1/reports/{id}/publish',            desc:'发布评级报告',           group:'报告与披露', calls:   860, success: 99.7 },
    { method:'GET',  path:'/v1/tracking/alerts',                 desc:'实时预警订阅',           group:'跟踪监控', calls: 51300, success: 99.8 },
    { method:'POST', path:'/v1/tracking/subscribe',              desc:'添加订阅',               group:'跟踪监控', calls:  4250, success: 99.9 },
    { method:'GET',  path:'/v1/audit/logs',                      desc:'审计日志查询',           group:'审计与合规', calls:  6320, success: 99.9 },
    { method:'POST', path:'/v1/audit/verify',                    desc:'区块链完整性验证',       group:'审计与合规', calls:   420, success:100.0 }
  ];

  /* 审计日志 ------------------------------------------------------- */
  const auditLogs = (() => {
    const ops    = ['王明远','李雨欣','张志强','陈秋萍','周建华'];
    const acts   = ['登录系统','查看报告','发布报告','编辑评级建议','执行熔断校验','导出 PDF','复核三审','审计追溯','信用修复联动','查看公共信用'];
    const subjs  = ['南京钢铁联合有限公司','江苏华西集团有限公司','福禧投资控股有限公司','中国华源集团有限公司','上海柴油机股份有限公司','江苏宁沪高速公路股份有限公司','湖南华菱管线股份有限公司','武汉市城市建设投资开发集团有限公司','国家开发银行'];
    const list = [];
    const baseTime = new Date('2026-04-28T08:00:00+08:00').getTime();
    for (let i = 0; i < 28; i++) {
      const t = new Date(baseTime + i * 25 * 60 * 1000 + Math.random() * 1000 * 60 * 18);
      list.push({
        id: 'LOG-' + (10000 + i),
        time: t,
        operator: ops[i % ops.length],
        action: acts[i % acts.length],
        subject: subjs[i % subjs.length],
        ip: '10.10.' + (Math.floor(Math.random() * 250) + 1) + '.' + (Math.floor(Math.random() * 250) + 1),
        hash: '0x' + (Math.random().toString(16).slice(2, 10) + '...' + Math.random().toString(16).slice(2, 6))
      });
    }
    return list;
  })();

  /* ============== A 立项准入域 ============== */
  // 项目登记（FR-A-001）
  const projects = [
    { id:'P-2026-0421', subject:'南京钢铁联合有限公司', industry:'C31 钢铁制造', ratingType:'主体跟踪', bondType:'—', client:'南京钢铁联合有限公司', leadAnalyst:'王明远', team:['王明远','李雨欣'], status:'in_progress', createdAt:'2026-04-21', plannedEnd:'2026-05-15' },
    { id:'P-2026-0420', subject:'江苏华西集团有限公司',         industry:'C30 建材制造', ratingType:'主体跟踪', bondType:'—', client:'华东建材',     leadAnalyst:'李雨欣', team:['李雨欣','陈秋萍'], status:'committee', createdAt:'2026-04-20', plannedEnd:'2026-05-12' },
    { id:'P-2026-0418', subject:'福禧投资控股有限公司',    industry:'K70 房地产',   ratingType:'主体首次', bondType:'—', client:'福禧投资控股有限公司',     leadAnalyst:'张志强', team:['张志强','刘俊辉','王明远'], status:'review', createdAt:'2026-04-18', plannedEnd:'2026-05-20' },
    { id:'P-2026-0415', subject:'中国华源集团有限公司',          industry:'综合控股',     ratingType:'债项评级', bondType:'公司债 5 年期', client:'中国华源集团有限公司', leadAnalyst:'王明远', team:['王明远','陈秋萍'], status:'in_progress', createdAt:'2026-04-15', plannedEnd:'2026-05-10' },
    { id:'P-2026-0410', subject:'上海柴油机股份有限公司',      industry:'I65 信息技术', ratingType:'主体首次', bondType:'—', client:'上海柴油机股份有限公司',       leadAnalyst:'李雨欣', team:['李雨欣','刘俊辉'], status:'published', createdAt:'2026-04-10', plannedEnd:'2026-04-30' },
    /* ========== 6 个 PDF 主体的项目入口（供用户走完整评级流程）========== */
    { id:'P-2026-0505',  subject:'深圳市福田产业投资服务有限公司',   industry:'J67 股权投资 / 产业投资', ratingType:'主体首次', bondType:'—', client:'深圳市福田产业投资服务有限公司', leadAnalyst:'王明远', team:['王明远','陈秋萍'], status:'in_progress', createdAt:'2026-05-05', plannedEnd:'2026-06-15' },
    { id:'P-2026-0506',  subject:'石家庄市供销合作总社安全统筹公司', industry:'J68 保险互助',           ratingType:'主体首次', bondType:'—', client:'石家庄市供销合作总社安全统筹公司', leadAnalyst:'张志强', team:['张志强','陈秋萍'], status:'review',      createdAt:'2026-05-05', plannedEnd:'2026-06-20' },
    { id:'P-2026-0507',  subject:'四川齐光建设工程有限公司',         industry:'E48 土木工程建筑',       ratingType:'债项评级', bondType:'借款合同',    client:'乐山市某商业银行',                 leadAnalyst:'李雨欣', team:['李雨欣','刘俊辉'], status:'in_progress', createdAt:'2026-05-05', plannedEnd:'2026-06-10' },
    { id:'P-2026-0508',  subject:'四川蜀运恒通建设工程有限公司',     industry:'E48 土木工程建筑',       ratingType:'主体跟踪', bondType:'—', client:'重庆某商业银行',                  leadAnalyst:'王明远', team:['王明远','张志强'], status:'committee',   createdAt:'2026-05-05', plannedEnd:'2026-06-12' },
    { id:'P-2026-0509',  subject:'望城经开区投资建设集团有限公司',   industry:'LGFV 城投平台 · 基建',   ratingType:'债项评级', bondType:'城投债 5 年', client:'望城经济技术开发区',              leadAnalyst:'王明远', team:['王明远','李雨欣','陈秋萍'], status:'in_progress', createdAt:'2026-05-05', plannedEnd:'2026-06-30' },
    { id:'P-2026-0510',  subject:'枣庄市道桥工程有限公司',           industry:'E48 道桥施工',           ratingType:'主体跟踪', bondType:'—', client:'枣庄市国资委',                    leadAnalyst:'李雨欣', team:['李雨欣','陈秋萍'], status:'review',      createdAt:'2026-05-05', plannedEnd:'2026-06-25' }
  ];

  /* ============================================================
   * 12 阶段工作流（按《信用评级业务程序指引》14 章 52 条）
   * 用于项目工作台时间线 + 阶段→工具映射 + 进度计算
   * ============================================================ */
  const STAGE_DEFS = [
    { id:'intake',       name:'接受委托', icon:'📝', desc:'市场承接 + 利冲筛查 + 委托协议',           guide:'《程序指引》第二章 第三–五条' },
    { id:'preparation',  name:'评级准备', icon:'👥', desc:'项目组组建（≥2 人 / 组长 ≥3 年）+ 工作计划', guide:'第三章 第六–十条' },
    { id:'fieldwork',    name:'实地调研', icon:'🏭', desc:'现场考察 + 访谈 + 资料采集（≥2 工作日）',   guide:'第四章 第十一–十五条' },
    { id:'drafting',     name:'报告撰写', icon:'📊', desc:'BACP 评分 + AM 调整 + 双轨融合 + 报告初稿', guide:'第五章 第十六–二十六条' },
    { id:'three-level',  name:'三级审核', icon:'🔍', desc:'项目组一审 → 部门二审 → 公司三审',          guide:'第六章 第二十七–二十九条' },
    { id:'committee',    name:'等级评定', icon:'🏛️', desc:'信评委 ≥ 5 人 + 2/3 表决 + 利冲回避',       guide:'第七章 第三十–三十二条' },
    { id:'finalization', name:'报告定稿', icon:'✍️', desc:'按信评委决议修改 + 复核 + 文字审核',        guide:'第八章 第三十三–三十四条' },
    { id:'appeal',       name:'反馈复评', icon:'🔄', desc:'客户反馈 + 异议处理 + 复评（限 1 次）',     guide:'第九章 第三十五–三十八条' },
    { id:'publish',      name:'评级公布', icon:'📢', desc:'评级总监签字 + 公章 + 网站披露 + 监管报送', guide:'第十章 第三十九–四十一条' },
    { id:'update',       name:'更新更正', icon:'✏️', desc:'资料更新 / 错误更正（重大变更须重审）',     guide:'第十一章 第四十二–四十三条' },
    { id:'archive',      name:'资料归档', icon:'📁', desc:'按保密级别归档 + 区块链上链 + 留存 ≥ 10 年','guide':'第十二章 第四十四–四十五条' },
    { id:'tracking',     name:'跟踪评级', icon:'📡', desc:'定期跟踪 + 不定期触发 + 21 类重大事项',     guide:'第十三章 第四十六–四十九条' }
  ];

  // 阶段 → 工具映射（点击阶段时显示该阶段可用的工具集）
  // 阶段 → 项目级工具映射（仅项目级，全局工具已迁至左侧"跨项目视图"菜单）
  const stageToolMap = {
    'intake':       [
      { route:'conflict-check',     name:'本项目利冲筛查', icon:'🛡️' },
      { route:'kyc',                name:'本主体公共信用快查', icon:'🔎' }
    ],
    'preparation':  [],   // 改为内联视图
    'fieldwork':    [
      { route:'dd-collection',      name:'资料采集与核验', icon:'📥' },
      { route:'dd-financial-ocr',   name:'财报 OCR 与勾稽', icon:'📈' },
      { route:'dd-interview',       name:'访谈管理与转写', icon:'🎤' },
      { route:'field-investigation',name:'现场调研工具',   icon:'🏭' },
      { route:'dd-workpaper',       name:'工作底稿管理',   icon:'📁' }
    ],
    'drafting':     [
      { route:'bacp-scoring',       name:'BACP 智能评分',   icon:'⭐' },
      { route:'am-adjustment',      name:'AM 调整 / 外部支持', icon:'⚙️' },
      { route:'fusion-engine',      name:'公共信用融合引擎', icon:'🔀' },
      { route:'subject-rating',     name:'双轨融合引擎',   icon:'🔁' },
      { route:'grade-mapping',      name:'等级映射 / 情景测试', icon:'📐' },
      { route:'peer-benchmark',     name:'同业对标',       icon:'📊' }
    ],
    'three-level':  [
      { route:'three-review',       name:'三级审核工作台', icon:'🔍' },
      { route:'review-proofreading',name:'复核人员定稿审核', icon:'✓' }
    ],
    'committee':    [
      { route:'committee-resolution',name:'本项目决议书',  icon:'⚖️' }
    ],
    'finalization': [
      { route:'review-proofreading',name:'文字审核 + 定稿', icon:'✍️' }
    ],
    'appeal':       [
      { route:'client-portal',      name:'客户专用门户',   icon:'🚪' },
      { route:'appeal-flow',        name:'本项目复评流程', icon:'🔄' }
    ],
    'publish':      [
      { route:'disclosure-channels',name:'多渠道披露 + 电子公章', icon:'📢' },
      { route:'report-detail',      name:'评级报告',       icon:'📄' }
    ],
    'update':       [
      { route:'report-detail',      name:'报告更新 / 更正', icon:'✏️' }
    ],
    'archive':      [
      { route:'dd-workpaper',       name:'底稿封存',       icon:'🔒' }
    ],
    'tracking':     [
      { route:'tracking-stage',     name:'本项目跟踪阶段', icon:'📡' }
    ]
  };

  // 项目 → 12 阶段进度派生（基于 status / createdAt / leadAnalyst）
  function buildStagesForProject(p) {
    const statusMap = {
      'in_progress': 'fieldwork',     // 尽调中
      'review':      'three-level',   // 三审中
      'committee':   'committee',     // 信评委待审
      'published':   'tracking'       // 已发布 → 进入跟踪
    };
    const currentStageId = statusMap[p.status] || 'fieldwork';
    const currentIdx = STAGE_DEFS.findIndex(s => s.id === currentStageId);

    // 项目组主成员
    const lead = p.leadAnalyst || (p.team && p.team[0]) || '王明远';
    const ownerByStage = {
      'intake': '市场部 王雪',
      'preparation': lead,
      'fieldwork': lead,
      'drafting': lead,
      'three-level': '部门总监 张志强',
      'committee': '评级总监 周建华',
      'finalization': '复核 陈秋萍',
      'appeal': '组长 ' + lead,
      'publish': '评级总监 周建华',
      'update': lead,
      'archive': '档案 系统',
      'tracking': lead
    };
    const baseDate = p.createdAt ? new Date(p.createdAt) : new Date('2026-04-01');
    const dayMs = 86400000;

    return STAGE_DEFS.map((d, i) => {
      let status, startedAt, completedAt, progress;
      if (i < currentIdx)      { status = 'done'; startedAt = fmtDate(baseDate, i*3); completedAt = fmtDate(baseDate, i*3+2); }
      else if (i === currentIdx) { status = 'in-progress'; startedAt = fmtDate(baseDate, i*3); progress = 60; }
      else                       { status = 'pending'; }
      return { ...d, status, startedAt, completedAt, progress, owner: ownerByStage[d.id] };
    });
    function fmtDate(base, addDays) {
      const d = new Date(base.getTime() + addDays * dayMs);
      return d.toISOString().slice(0,10);
    }
  }

  // 项目 → 关键事件 timeline 派生
  function buildTimelineForProject(p) {
    const lead = p.leadAnalyst || (p.team && p.team[0]) || '王明远';
    const evs = [
      { date: p.createdAt + ' 09:30',           event:'委托协议签署',      actor:'市场部 · 王雪' },
      { date: p.createdAt + ' 14:20',           event:'利冲筛查通过',      actor:'合规 · 陈秋萍' },
      { date: addDay(p.createdAt, 4) + ' 16:45', event:'项目组组建完成',   actor:'部门总监 · 张志强' },
      { date: addDay(p.createdAt, 7) + ' 10:00', event:'实地调研启动',      actor:'组长 · ' + lead }
    ];
    return evs;
    function addDay(s, n) {
      const d = new Date(s);
      d.setDate(d.getDate() + n);
      return d.toISOString().slice(0,10);
    }
  }

  // 为每个项目注入 stages + timeline + currentStage（如未存在）
  projects.forEach(p => {
    if (!p.stages)       p.stages = buildStagesForProject(p);
    if (!p.timeline)     p.timeline = buildTimelineForProject(p);
    if (!p.currentStage) {
      const cur = p.stages.find(s => s.status === 'in-progress');
      p.currentStage = cur ? cur.id : (p.stages.find(s => s.status === 'pending') || {}).id || 'fieldwork';
    }
    // 升级 team 为对象数组（如果是字符串数组）
    if (Array.isArray(p.team) && p.team.length && typeof p.team[0] === 'string') {
      const yearMap = { '王明远':10, '李雨欣':4, '陈秋萍':8, '张志强':12, '周建华':15, '刘俊辉':5 };
      const roleMap = { '王明远':'组长', '李雨欣':'分析师', '陈秋萍':'合规', '张志强':'部门总监', '周建华':'评级总监', '刘俊辉':'数据' };
      p.team = p.team.map(n => ({ name:n, role: roleMap[n] || '分析师', years: yearMap[n] || 5 }));
    }
  });

  // 利益冲突筛查（FR-A-003）
  // 12 类利冲规则（《信用评级业务程序指引》第三–五条 + 《信评委制度》防火墙）
  const CONFLICT_RULES = [
    '项目组成员持股','过往任职','亲属关系','控股股东关联','增信链关联','连续项目轮换',
    '评级费用与级别脱钩','市场部/评级业务部隔离','竞业回避','信评委回避','复核独立性','咨询顾问'
  ];
  // 构造 12 条规则逐条结果：hitRule 指定哪条命中（null = 全部未命中）
  function buildRuleResults(hitRule, hitDetail, hitSeverity) {
    return CONFLICT_RULES.map(r => {
      if (r === hitRule) return { rule:r, hit:true,  detail:hitDetail, severity:hitSeverity || '高' };
      const passDetail = {
        '项目组成员持股': '成员及直系亲属持股 0%，远低于 0.1% 阈值',
        '过往任职': '近 2 年内成员均未在委托方 / 评级对象任职',
        '亲属关系': '成员直系亲属无在委托方任职情形',
        '控股股东关联': '项目组成员所在部门与委托方控股股东无业务往来',
        '增信链关联': '担保方 / 增信主体与项目组无直接或间接关联',
        '连续项目轮换': '同一项目组承接本主体未达 6 年上限',
        '评级费用与级别脱钩': '协议费用条款不含按级别收费 / 按结果分成等约定',
        '市场部/评级业务部隔离': '项目数据访问按角色隔离，无越权',
        '竞业回避': '成员未承担与委托方有竞争关系企业的项目',
        '信评委回避': '信评委员对涉及自身参与项目不进行投票',
        '复核独立性': '三级审核前后级人员无重复',
        '咨询顾问': '项目组成员未同时担任委托方咨询顾问'
      }[r];
      return { rule:r, hit:false, detail:passDetail, severity:'—' };
    });
  }

  const conflictChecks = [
    {
      id:'CC-2026-031', project:'P-2026-0421', subject:'南京钢铁联合有限公司', subjectKind:'委托方关联',
      hit:false, detail:'未发现项目组成员与委托方/评级对象的关联关系', risk:'低',
      operator:'陈秋萍', operatorRole:'合规部副总监',
      trigger:'立项时自动', checkedAt:'2026-04-21 09:14',
      ruleResults: buildRuleResults(null, '', '')
    },
    {
      id:'CC-2026-032', project:'P-2026-0420', subject:'江苏华西集团有限公司', subjectKind:'实控人',
      hit:true, detail:'项目组成员李雨欣的配偶持有华东建材 0.3% 股份，已超 0.1% 阈值', risk:'高',
      operator:'陈秋萍', operatorRole:'合规部副总监',
      trigger:'立项时自动', checkedAt:'2026-04-20 11:28',
      ruleResults: buildRuleResults('项目组成员持股', '项目组成员李雨欣的配偶持有华东建材 0.3% 股份，已超 0.1% 阈值', '高'),
      disposition: {
        plan:'更换成员',
        details:'已将李雨欣从项目组移除，改派评级师赵蔚承接对应工作。',
        approvers:[
          { role:'合规总监', name:'王雪',   signedAt:'2026-04-20 14:30', signed:true },
          { role:'法务总监', name:'刘宇翔', signedAt:'2026-04-20 15:12', signed:true },
          { role:'客户合规官', name:'孙琳琳', signedAt:'2026-04-20 16:05', signed:true }
        ],
        closedAt:'2026-04-20 16:30'
      }
    },
    {
      id:'CC-2026-033', project:'P-2026-0418', subject:'福禧投资控股有限公司', subjectKind:'增信主体',
      hit:false, detail:'担保方与项目组无关联关系', risk:'低',
      operator:'陈秋萍', operatorRole:'合规部副总监',
      trigger:'立项时自动', checkedAt:'2026-04-18 16:02',
      ruleResults: buildRuleResults(null, '', '')
    },
    {
      id:'CC-2026-034', project:'P-2026-0415', subject:'中国华源集团有限公司', subjectKind:'前一周期项目组',
      hit:false, detail:'轮换机制满足，无连续 6 年同一项目组限制', risk:'低',
      operator:'陈秋萍', operatorRole:'合规部副总监',
      trigger:'立项时自动', checkedAt:'2026-04-15 13:41',
      ruleResults: buildRuleResults(null, '', '')
    }
  ];

  // 评级委托协议（FR-A-005）
  const contracts = [
    { id:'CT-2026-0421', project:'P-2026-0421', client:'南京钢铁联合有限公司', amount:38, sealed:true,  signedAt:'2026-04-21' },
    { id:'CT-2026-0420', project:'P-2026-0420', client:'华东建材',     amount:25, sealed:true,  signedAt:'2026-04-20' },
    { id:'CT-2026-0418', project:'P-2026-0418', client:'福禧投资控股有限公司',     amount:42, sealed:true,  signedAt:'2026-04-18' },
    { id:'CT-2026-0415', project:'P-2026-0415', client:'中国华源集团有限公司',       amount:55, sealed:true,  signedAt:'2026-04-15' }
  ];

  /* ============== B 智能尽调域 ============== */
  // 资料清单（B1）
  const ddChecklist = [
    { item:'最近三年审计报告',         category:'财务', required:true, received:true,  page:142 },
    { item:'最近一期未审报表',         category:'财务', required:true, received:true,  page:48 },
    { item:'公司章程及最新修订',       category:'治理', required:true, received:true,  page:62 },
    { item:'股东名册及股权穿透图',     category:'治理', required:true, received:true,  page:18 },
    { item:'重要合同清单与样本',       category:'经营', required:true, received:true,  page:96 },
    { item:'诉讼仲裁清单',             category:'合规', required:true, received:true,  page:22 },
    { item:'对外担保与抵质押清单',     category:'合规', required:true, received:false, page:0  },
    { item:'公共信用评价结果证明',     category:'合规', required:true, received:true,  page:6  },
    { item:'ESG 报告 / 范围一二三披露', category:'ESG',  required:true, received:false, page:0 },
    { item:'安全生产与环保许可',       category:'合规', required:true, received:true,  page:14 }
  ];

  // 多源采集（B2）
  const ddSources = [
    { name:'交易所信息披露',   ms:280, fields:42, status:'success' },
    { name:'银行间市场披露',   ms:220, fields:38, status:'success' },
    { name:'工商企业登记',     ms:180, fields:64, status:'success' },
    { name:'裁判文书网',       ms:340, fields:18, status:'success' },
    { name:'执行信息公开网',   ms:210, fields:12, status:'success' },
    { name:'信用中国',         ms:300, fields:96, status:'success' },
    { name:'行政处罚信息公开', ms:250, fields:24, status:'success' },
    { name:'上海清算所',       ms:160, fields:22, status:'success' },
    { name:'舆情与新闻',       ms:520, fields:28, status:'partial' },
    { name:'ESG 数据服务',     ms:380, fields:16, status:'partial' }
  ];

  // 财报 OCR（B3）
  const ddFinancial = {
    pages: 142, ocrAccuracy: 99.4, processedAt:'2026-04-22 10:18',
    balance: [
      { item:'货币资金',          y2025: 28560, y2024: 21840, y2023: 18900 },
      { item:'应收账款',          y2025: 42180, y2024: 38940, y2023: 32100 },
      { item:'存货',              y2025: 51200, y2024: 47800, y2023: 41200 },
      { item:'流动资产合计',      y2025:142800, y2024:128400, y2023:108900 },
      { item:'固定资产',          y2025: 96400, y2024: 88200, y2023: 79600 },
      { item:'资产总计',          y2025:298400, y2024:272600, y2023:241200 },
      { item:'流动负债合计',      y2025: 98200, y2024: 91400, y2023: 82400 },
      { item:'负债总计',          y2025:172800, y2024:160200, y2023:142400 },
      { item:'所有者权益合计',    y2025:125600, y2024:112400, y2023: 98800 }
    ],
    income: [
      { item:'营业总收入',        y2025:368400, y2024:332600, y2023:298200 },
      { item:'营业成本',          y2025:298600, y2024:271400, y2023:243800 },
      { item:'毛利',              y2025: 69800, y2024: 61200, y2023: 54400 },
      { item:'净利润',            y2025: 18420, y2024: 15860, y2023: 13620 }
    ],
    cashflow: [
      { item:'经营活动现金流净额', y2025: 24800, y2024: 22600, y2023: 19200 },
      { item:'投资活动现金流净额', y2025:-12400, y2024:-15800, y2023:-11200 },
      { item:'筹资活动现金流净额', y2025: -8200, y2024: -6800, y2023: -4400 }
    ],
    crossChecks: [
      { rule:'净利润 → 未分配利润 → 所有者权益勾稽', expected:18420, actual:18420, ok:true },
      { rule:'经营活动现金流 vs 净利润差异（行业警戒 ±30%）', expected:'差异 +34.6%', actual:'+34.6%', ok:true, note:'差异在合理区间' },
      { rule:'流动资产合计 = 子项之和', expected:142800, actual:142800, ok:true },
      { rule:'资产总计 = 负债总计 + 所有者权益', expected:298400, actual:298400, ok:true },
      { rule:'存货 / 营业成本 周转天数（行业 60-120 天）', expected:'62.6 天', actual:'62.6 天', ok:true }
    ]
  };

  // 访谈管理与转写（B6+B7）
  const ddInterviews = [
    { id:'I-001', topic:'高管访谈 · 战略与经营', when:'2026-04-22 10:00', durationMin:48, location:'上海陆家嘴', mode:'on-site', transcribed:true, summary:'强化新能源转型；中期资本开支计划（演示样例 · 详见公司战略）。', riskFlags:1 },
    { id:'I-002', topic:'CFO 访谈 · 财务与偿债', when:'2026-04-22 14:00', durationMin:62, location:'上海陆家嘴', mode:'on-site', transcribed:true, summary:'流动性紧张；银行授信结构清晰（演示样例 · 详见底稿）。', riskFlags:2 },
    { id:'I-003', topic:'风控总监访谈 · 风险与合规', when:'2026-04-23 09:30', durationMin:35, location:'上海陆家嘴', mode:'on-site', transcribed:true, summary:'完善信用风险三道防线；环保整改完成。', riskFlags:0 },
    { id:'I-004', topic:'外部增信方访谈',         when:'2026-04-23 14:00', durationMin:28, location:'远程视频',   mode:'remote',  transcribed:true, summary:'担保额度充足，无对外重大担保。', riskFlags:0 }
  ];

  // 工作底稿（B8）
  const ddWorkpapers = [
    { id:'WP-A-001', name:'A 立项与准入',     items:8,  size:'12.4 MB', sealed:true },
    { id:'WP-B-001', name:'B 财务尽调',       items:34, size:'186.2 MB', sealed:true },
    { id:'WP-B-002', name:'B 经营尽调',       items:22, size:'72.6 MB', sealed:true },
    { id:'WP-B-003', name:'B 治理尽调',       items:12, size:'28.4 MB', sealed:true },
    { id:'WP-B-004', name:'B 合规与 ESG',     items:18, size:'64.8 MB', sealed:true },
    { id:'WP-C-001', name:'C 方法学与建模',   items:24, size:'46.2 MB', sealed:true },
    { id:'WP-D-001', name:'D 评级报告版本',   items:6,  size:'18.6 MB', sealed:false },
    { id:'WP-F-001', name:'F 合规与三级审核', items:14, size:'32.0 MB', sealed:false }
  ];

  /* ============== C 评级方法学域 ============== */
  // 方法学知识库（C1）
  // 命名规则：FECR-{行业代码}-V{版本}-{YYYYMM}
  // 真实样例（已公开发布）：FECR-DZXX-V03-202502 / FECR-ZBZZ-V02-202503
  const methodologies = [
    { id:'M-DZXX-V03', name:'电子信息制造企业评级方法与模型', ver:'FECR-DZXX-V03-202502', industry:'电子信息制造', effective:'2025-02-15', pages:148, isVerified:true },
    { id:'M-ZBZZ-V02', name:'装备制造企业评级方法与模型',     ver:'FECR-ZBZZ-V02-202503', industry:'装备制造',     effective:'2025-03-12', pages:96,  isVerified:true },
    { id:'M-GS-V03',   name:'工商企业评级方法与模型',         ver:'FECR-GS-V03（演示版本号）',  industry:'工商企业',  effective:'2024-10-01', pages:148 },
    { id:'M-CT-V02',   name:'城投企业评级方法与模型',         ver:'FECR-CT-V02（演示版本号）',  industry:'城投',      effective:'2024-03-01', pages:96  },
    { id:'M-BK-V03',   name:'商业银行评级方法与模型',         ver:'FECR-BK-V03（演示版本号）',  industry:'银行',      effective:'2023-12-01', pages:124 },
    { id:'M-BX-V02',   name:'保险公司评级方法与模型',         ver:'FECR-BX-V02（演示版本号）',  industry:'保险',      effective:'2023-12-01', pages:138 },
    { id:'M-ZQ-V02',   name:'证券公司评级方法与模型',         ver:'FECR-ZQ-V02（演示版本号）',  industry:'证券',      effective:'2023-11-01', pages:118 },
    { id:'M-ZL-V02',   name:'融资租赁评级方法与模型',         ver:'FECR-ZL-V02（演示版本号）',  industry:'租赁',      effective:'2023-10-01', pages:104 },
    { id:'M-ABS-V01',  name:'资产支持证券评级方法与模型',     ver:'FECR-ABS-V01（演示版本号）', industry:'ABS',       effective:'2024-03-01', pages:162 },
    { id:'M-LD-V01',   name:'绿色债券评级方法与模型',         ver:'FECR-LD-V01（演示版本号）',  industry:'绿色债券',  effective:'2024-01-01', pages:88  }
  ];

  // BACP 评分（C2）—— 工商企业典型一级要素 + 二级指标 + 8 档阈值
  const bacpFactors = [
    { code:'BIZ',  level1:'业务状况',       weight:0.30, score:7.6, l2:[
      { name:'行业地位',           weight:0.40, value:8, target:'前 5 强', actual:'前 3 强', source:'年报 P12' },
      { name:'市场份额',           weight:0.30, value:7, target:'15-25%', actual:'18%',     source:'年报 P14' },
      { name:'客户与供应商集中度', weight:0.20, value:7, target:'低集中度', actual:'CR5 38%', source:'底稿 B-014' },
      { name:'多元化与业务广度',   weight:0.10, value:8, target:'强',     actual:'4 个主业',  source:'年报 P8'  }
    ]},
    { code:'PROFIT', level1:'盈利能力', weight:0.25, score:7.1, l2:[
      { name:'毛利率',         weight:0.30, value:7, target:'15%-25%', actual:'18.9%',  source:'利润表'    },
      { name:'净利率',         weight:0.30, value:7, target:'5%-10%',  actual:'5.0%',   source:'利润表'    },
      { name:'ROE',            weight:0.25, value:7, target:'≥ 12%',   actual:'14.7%',  source:'权益变动表'},
      { name:'盈利稳定度',     weight:0.15, value:8, target:'稳定',     actual:'三年 SD 0.8%', source:'底稿 B-022' }
    ]},
    { code:'CAP',  level1:'偿付能力', weight:0.25, score:6.8, l2:[
      { name:'资产负债率',     weight:0.30, value:6, target:'< 60%',  actual:'57.9%',  source:'资产负债表'},
      { name:'EBITDA / 全部债务', weight:0.30, value:7, target:'≥ 30%',  actual:'31.4%', source:'底稿 B-031' },
      { name:'利息保障倍数',   weight:0.25, value:7, target:'≥ 3x',   actual:'3.4x',   source:'底稿 B-032' },
      { name:'有息负债结构',   weight:0.15, value:7, target:'长期占比 ≥ 60%', actual:'62%', source:'附注 12'  }
    ]},
    { code:'LIQ',  level1:'流动性',   weight:0.20, score:6.4, l2:[
      { name:'流动比率',       weight:0.30, value:6, target:'≥ 1.5',  actual:'1.45',   source:'资产负债表'},
      { name:'速动比率',       weight:0.25, value:6, target:'≥ 1.0',  actual:'0.93',   source:'资产负债表'},
      { name:'经营现金流 / 流动负债', weight:0.25, value:7, target:'≥ 0.20', actual:'0.25', source:'现金流量表'},
      { name:'银行授信备用',   weight:0.20, value:7, target:'未使用 ≥ 30%', actual:'30%',  source:'底稿 B-038'}
    ]}
  ];
  // BACP 综合分 = Σ weight*score；映射为 BACP 等级（aaa~c 三等九级）
  const bacpComposite = (bacpFactors.reduce((s,f) => s + f.weight * f.score, 0)).toFixed(2); // 7.0+

  // AM 评价调整因素（C3）—— 9 类
  const amAdjustments = [
    { code:'MGMT',     name:'管理团队经验与质量',  delta:'+0.5', evidence:'核心管理层平均 18 年行业经验；轮换稳定', source:'底稿 C-101' },
    { code:'ESG',      name:'ESG 表现',            delta:'+0.25',evidence:'近年 ESG 表现良好（演示样例）',   source:'ESG 报告 P34' },
    { code:'DISCLOSE', name:'财务报告与信息披露质量', delta:'0',  evidence:'四大审计；年报披露及时；附注完整',       source:'审计报告' },
    { code:'CONTING',  name:'或有风险',            delta:'-0.5', evidence:'存在对外担保与少量未决诉讼（演示样例 · 详见底稿）',    source:'附注 16-17' },
    { code:'RISKMGMT', name:'风险管理有效性',      delta:'+0.25',evidence:'三道防线完整；信用风险/市场风险体系',     source:'底稿 C-118' },
    { code:'HISTORY',  name:'历史信用记录',        delta:'-0.25',evidence:'历史信用记录良好（演示样例 · 详见底稿）', source:'公开披露' },
    { code:'EXPECT',   name:'预期调整因素',        delta:'+0.25',evidence:'新能源业务进入收获期；2025E 净利 +18%',    source:'内部预测' },
    { code:'EVENT',    name:'突发事件',            delta:'0',   evidence:'最近 12 个月内无重大突发事件',             source:'舆情系统' },
    { code:'REGUL',    name:'重大监管政策变化',    delta:'-0.25',evidence:'行业能耗双控趋严；龙头企业受影响有限',     source:'政策研究' }
  ];
  const amTotalDelta = amAdjustments.reduce((s,a) => s + parseFloat(a.delta || '0'), 0);

  // 外部支持评估（C4）
  const externalSupport = {
    parent:   { name:'中国华源集团有限公司',     stake:'65%', supportLevel:'强', detail:'母公司 AAA 级；历史多次注资' },
    govt:     { name:'国资委（地方）',  stake:'实控', supportLevel:'中', detail:'纳入地方"链长制"重点企业' },
    guarantee:{ name:'江苏宁沪高速公路股份有限公司', stake:'担保 ¥5 亿', supportLevel:'弱', detail:'担保方信用 BBB；额度有限' },
    delta:    '+0.5'
  };

  // 公共信用融合引擎（C5）—— ABCD ↔ AAA-C 映射规则
  const fusionMappingRules = [
    { pubGrade:'A', marketCap:'AAA', soft:'+0.5 子级', note:'公共信用 A 级对评级形成正向支撑'           },
    { pubGrade:'B', marketCap:'AA',  soft:'保持',     note:'公共信用 B 级为基准参考'                    },
    { pubGrade:'C', marketCap:'A-',  soft:'-0.5 子级', note:'公共信用 C 级作为关注因素纳入 AM 调整'       },
    { pubGrade:'D', marketCap:'BBB-',soft:'-1 子级',  note:'红线：D 级 → 市场化最高 BBB-，不得评 A 级' }
  ];

  // 等级映射结果（C6）：BACP + AM + 外部支持 → 主体信用等级
  const gradeDerivation = {
    bacpComposite,
    bacpGrade: 'aa',                 // 个体信用等级（小写九级）
    amDelta: amTotalDelta.toFixed(2),
    externalDelta: parseFloat(externalSupport.delta),
    publicAdjust: '0',               // 当前主体公共信用 B 级 → 保持
    finalGrade: 'AA-',               // 三等九级 + 微调
    outlook: '稳定'
  };

  // 同业对标（C7）
  const peers = [
    { name:'本主体',                       grade:'AA-', revenue:368400, netProfit:18420, debtRatio:'57.9%', roe:'14.7%', isSelf:true },
    { name:'同业 A · 南京钢铁联合有限公司',           grade:'AA',  revenue:512300, netProfit:28640, debtRatio:'62.4%', roe:'13.2%' },
    { name:'同业 B · 上海电气集团股份有限公司',             grade:'A+',  revenue:284600, netProfit:14820, debtRatio:'59.1%', roe:'12.8%' },
    { name:'同业 C · 江西铜业股份有限公司',               grade:'A',   revenue:198400, netProfit: 9820, debtRatio:'64.8%', roe:'10.4%' },
    { name:'同业 D · 湖南华菱管线股份有限公司',               grade:'A-',  revenue:142200, netProfit: 6240, debtRatio:'66.2%', roe: '9.8%' }
  ];

  /* ============== D 报告审核域 ============== */
  // 三级审核（D3）
  const threeReview = [
    { stage:'项目组一审', reviewer:'李雨欣',  reviewedAt:'2026-04-25 18:24', verdict:'通过',     remarks:'整体严谨；建议补充行业政策口径' },
    { stage:'部门二审',   reviewer:'张志强',  reviewedAt:'2026-04-26 10:42', verdict:'通过+建议',remarks:'对偿付能力部分提供建议（已采纳）' },
    { stage:'公司三审',   reviewer:'评级总监 周建华', reviewedAt:'2026-04-27 14:08', verdict:'待审',  remarks:'—' }
  ];

  // 信评委议程包（D4）
  const committeeAgenda = [
    { id:'A-2026-018', subject:'南京钢铁联合有限公司',  type:'主体跟踪', proposedGrade:'AA-', publicGrade:'B', risk:'中', focus:'盈利能力下滑、新能源转型投入', votes:0, decision:'待表决' },
    { id:'A-2026-019', subject:'江苏华西集团有限公司',           type:'主体跟踪', proposedGrade:'BBB-',publicGrade:'D', risk:'高', focus:'D 级红线 → 强制 ≤ BBB-；信用修复路径', votes:0, decision:'待表决' },
    { id:'A-2026-020', subject:'福禧投资控股有限公司',      type:'主体首次', proposedGrade:'A-',  publicGrade:'B', risk:'中', focus:'地产去化压力、对外担保', votes:0, decision:'待表决' }
  ];

  // 信评委成员（D5）
  const committeeMembers = [
    { id:'CM-001', name:'周建华', role:'主任委员',  dept:'评级业务总监', signed:false, vote:null },
    { id:'CM-002', name:'王明远', role:'委员',      dept:'评级业务一部', signed:false, vote:null, recused:true, recusedFor:'A-2026-018' },
    { id:'CM-003', name:'李雨欣', role:'委员',      dept:'评级业务二部', signed:false, vote:null },
    { id:'CM-004', name:'陈秋萍', role:'合规委员',  dept:'合规部',       signed:false, vote:null },
    { id:'CM-005', name:'刘俊辉', role:'委员',      dept:'数据中心',     signed:false, vote:null },
    { id:'CM-006', name:'孙琳琳', role:'委员',      dept:'客户服务部',   signed:false, vote:null }
  ];

  // 复评流程（D6）
  const appeals = [
    {
      id:'AP-2026-004', project:'P-2026-0420', subject:'江苏华西集团有限公司',
      contact:'集团办 吴主任', channel:'客户专用门户',
      filedAt:'2026-04-20', filedTime:'2026-04-20 14:48',
      reason:'对评级展望"负面"提出异议；附补充财务数据 + 战略转型说明',
      originalGrade:'BBB-', appealedGrade:'BBB', finalGrade:null,
      status:'committee_scheduled', committeeAt:'2026-04-29',
      currentStep:4, // 1=收到异议 2=初审受理 3=调取证据 4=排定信评委 5=信评委审议 6=出具结论 7=披露归档
      evidence:[
        { name:'2026-Q1 未审报表', size:'2.8 MB', uploadedAt:'2026-04-20 14:50' },
        { name:'战略转型说明', size:'1.4 MB', uploadedAt:'2026-04-20 14:52' },
        { name:'关联交易披露补充', size:'920 KB', uploadedAt:'2026-04-20 14:55' }
      ],
      committee:{
        date:'2026-04-29 14:30', chair:'周建华',
        members:['周建华','刘宇翔','孙琳琳','王雪','张志强','李明（回避）'],
        agenda:'复评议项：评级展望调整可行性 / 补充证据评估 / 是否采纳异议',
        recordingHash:'0xab12cd34ef56789012345678abcdef01'
      },
      responsibility:'初审：王雪 · 证据调取：陈秋萍 · 项目组复核：王明远',
      free:true
    },
    {
      id:'AP-2026-003', project:null, subject:'湖南华菱管线股份有限公司',
      contact:'财务总监 周经理', channel:'客户专用门户',
      filedAt:'2026-04-22', filedTime:'2026-04-22 10:15',
      reason:'对评级展望"负面"提出异议；提交补充财务证据',
      originalGrade:'A-', appealedGrade:'A', finalGrade:null,
      status:'committee_scheduled', committeeAt:'2026-04-29',
      currentStep:4,
      evidence:[
        { name:'2026-Q1 财务数据', size:'1.6 MB', uploadedAt:'2026-04-22 10:18' },
        { name:'公共信用修复证据（生态环境厅）', size:'460 KB', uploadedAt:'2026-04-22 10:25' }
      ],
      committee:null,
      responsibility:'初审：王雪 · 证据调取：陈秋萍',
      free:true
    },
    {
      id:'AP-2026-002', project:null, subject:'江苏宁沪高速公路股份有限公司',
      contact:'财务部 赵经理', channel:'客户专用门户',
      filedAt:'2026-04-15', filedTime:'2026-04-15 09:30',
      reason:'对融合等级 BBB+ 提出异议，认为应维持 A-',
      originalGrade:'BBB+', appealedGrade:'A-', finalGrade:'BBB+',
      status:'concluded', committeeAt:'2026-04-20', conclusion:'维持原等级',
      currentStep:7,
      evidence:[
        { name:'同业对标分析', size:'2.1 MB', uploadedAt:'2026-04-15 09:32' }
      ],
      committee:{
        date:'2026-04-20 14:00', chair:'周建华',
        members:['周建华','刘宇翔','孙琳琳','王雪','张志强','李明'],
        agenda:'复评议项：是否调整至 A-',
        outcome:'通过 5 / 反对 1 / 弃权 0，维持 BBB+',
        recordingHash:'0xee55ff667788aa11bb22cc33dd44'
      },
      responsibility:'初审：王雪 · 证据调取：陈秋萍 · 项目组复核：李雨欣',
      free:true
    },
    {
      id:'AP-2026-001', project:null, subject:'江苏三房巷集团有限公司',
      contact:'董事会办公室 钱主任', channel:'邮件',
      filedAt:'2026-04-10', filedTime:'2026-04-10 16:42',
      reason:'对市场化等级 BBB- 提出异议，担保链穿透分析有误',
      originalGrade:'BBB-', appealedGrade:'BB+', finalGrade:'BB+',
      status:'concluded', committeeAt:'2026-04-15', conclusion:'调整为 BB+（采纳）',
      currentStep:7,
      evidence:[
        { name:'担保链重新穿透计算', size:'3.4 MB', uploadedAt:'2026-04-10 16:45' },
        { name:'关联方违约证据', size:'1.2 MB', uploadedAt:'2026-04-10 16:50' }
      ],
      committee:{
        date:'2026-04-15 14:00', chair:'周建华',
        members:['周建华','刘宇翔','孙琳琳','王雪','张志强','李明'],
        agenda:'复评议项：担保链穿透重新分析 / 等级调整可行性',
        outcome:'通过 4 / 反对 2 / 弃权 0，采纳并下调至 BB+',
        recordingHash:'0x1234567890abcdef1234567890abcdef'
      },
      responsibility:'初审：王雪 · 证据调取：陈秋萍 · 项目组复核：张志强',
      free:true
    }
  ];

  /* ============== F 质量与合规域 ============== */
  // 违约率检验（F1）
  const defaultRates = [
    { grade:'AAA', n:24, defaultsCnt:0, rate:0.000, ci95:'[0.00%, 0.10%]' },
    { grade:'AA',  n:62, defaultsCnt:0, rate:0.000, ci95:'[0.00%, 0.04%]' },
    { grade:'A',   n:186, defaultsCnt:1, rate:0.0054, ci95:'[0.01%, 1.50%]' },
    { grade:'BBB', n:248, defaultsCnt:6, rate:0.0242, ci95:'[0.99%, 4.30%]' },
    { grade:'BB',  n:142, defaultsCnt:11,rate:0.0775, ci95:'[4.30%, 12.5%]' },
    { grade:'B',   n: 56, defaultsCnt:9, rate:0.1607, ci95:'[8.10%, 26.7%]' },
    { grade:'CCC', n: 22, defaultsCnt:8, rate:0.3636, ci95:'[18.6%, 54.0%]' }
  ];

  // 信用等级迁移矩阵（F2）—— 12 个月迁移率
  const migrationMatrix = {
    grades: ['AAA','AA','A','BBB','BB','B','CCC','C','default'],
    rows: [
      { from:'AAA', to:[92.4, 7.6, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0] },
      { from:'AA',  to:[ 1.8,88.2, 9.5, 0.5, 0.0, 0.0, 0.0, 0.0, 0.0] },
      { from:'A',   to:[ 0.0, 4.2,84.8, 9.8, 0.7, 0.3, 0.0, 0.0, 0.2] },
      { from:'BBB', to:[ 0.0, 0.4, 6.2,80.4, 8.9, 1.8, 0.5, 0.2, 1.6] },
      { from:'BB',  to:[ 0.0, 0.0, 0.6, 8.4,72.4,11.6, 2.4, 0.8, 3.8] },
      { from:'B',   to:[ 0.0, 0.0, 0.2, 1.4,12.2,64.8, 8.6, 2.0,10.8] },
      { from:'CCC', to:[ 0.0, 0.0, 0.0, 0.4, 2.8, 9.2,46.0,10.2,31.4] }
    ]
  };

  // 信用利差检验（F3）
  const spreads = [
    { grade:'AAA', count:24,  meanSpread:42,  median:38,  p25:32, p75:48 },
    { grade:'AA',  count:62,  meanSpread:78,  median:72,  p25:62, p75:90 },
    { grade:'A',   count:186, meanSpread:142, median:130, p25:108,p75:168 },
    { grade:'BBB', count:248, meanSpread:268, median:242, p25:198,p75:312 },
    { grade:'BB',  count:142, meanSpread:486, median:432, p25:368,p75:584 },
    { grade:'B',   count: 56, meanSpread:842, median:768, p25:622,p75:1024 }
  ];

  // 集中度区分度（F4）
  const distribution = {
    bySector: [
      { sector:'制造业', cnt:284, ratio:0.32, dominantGrade:'A' },
      { sector:'金融业', cnt:142, ratio:0.16, dominantGrade:'AA' },
      { sector:'城投',   cnt:128, ratio:0.14, dominantGrade:'AA-' },
      { sector:'房地产', cnt: 86, ratio:0.10, dominantGrade:'BBB' },
      { sector:'能源',   cnt: 76, ratio:0.09, dominantGrade:'A' },
      { sector:'其他',   cnt:172, ratio:0.19, dominantGrade:'A-' }
    ],
    distinct: { hhi:0.184, gini:0.412, ar:0.78, ks:0.62 }
  };

  // 合规规则引擎（F5）
  const complianceRules = [
    { id:'RULE-001', name:'公共信用 D 级 → 不得评 A 级（含 AAA～A-）', kind:'红线（强制）', triggers:'public=D ∧ market∈{AAA..A-}', action:'block', enabled:true },
    { id:'RULE-002', name:'级别承诺禁用关键词',                           kind:'红线（强制）', triggers:'委托协议含"承诺级别/保证级别/级别保证"', action:'block', enabled:true },
    { id:'RULE-003', name:'评级费用与级别脱钩',                           kind:'红线（强制）', triggers:'评级方案 / 报告中提及"按级别收费"', action:'block', enabled:true },
    { id:'RULE-004', name:'利益冲突筛查',                                 kind:'强制',         triggers:'项目组成员与委托方/评级对象关联 ≥ 0.1%', action:'block', enabled:true },
    { id:'RULE-005', name:'三级审核完整性',                               kind:'强制',         triggers:'缺失任一级审核签字', action:'block', enabled:true },
    { id:'RULE-006', name:'信评委 ≥ 5 人、2/3 同意',                       kind:'强制',         triggers:'参会 < 5 人 或 同意 < 2/3', action:'block', enabled:true },
    { id:'RULE-007', name:'实地调研触发',                                 kind:'建议',         triggers:'首次评级 / 连续 1 年以上 / 跟踪 2 年以上', action:'warn',  enabled:true },
    { id:'RULE-008', name:'公共信用数据更新频次（≤ 1 年）',               kind:'强制',         triggers:'最近一次拉取 > 365 天', action:'warn',  enabled:true },
    { id:'RULE-009', name:'报告引用可溯源',                               kind:'强制',         triggers:'AI 生成内容缺失页码/段落定位', action:'block', enabled:true },
    { id:'RULE-010', name:'保密义务',                                     kind:'强制',         triggers:'机密数据出现在 L1 通用大模型调用', action:'block', enabled:true }
  ];

  // 终止评级（F7）
  const terminations = [
    { id:'T-2026-002', subject:'广州白云国际机场股份有限公司',     reason:'委托方主动撤销委托', status:'已披露', dischargedAt:'2026-04-08' },
    { id:'T-2026-001', subject:'福禧投资控股有限公司',     reason:'信用评级业务终止条件触发：连续 24 个月无新发行', status:'已披露', dischargedAt:'2026-03-22' }
  ];

  /* ============== G 工作台与协同 ============== */
  // 信评委工作台（G2）
  const committeeAgendaToday = {
    sessionId: 'CC-2026-018',
    when: '2026-04-29 14:00',
    location: '上海总部 8F 信评委会议室',
    chair: '周建华',
    members: 6,
    items: 3,
    status: 'pending'
  };

  // 管理驾驶舱（G3）
  const cockpit = {
    portfolio: { active: 248, monthCompleted: 124, fused: 5, repairs: 18 },
    productivity: { avgCycleDays: 5.6, onTimeRate: 96.8, oncallProjects: 3 },
    quality: { defaultRate1y: 0.024, migrationStability: 'B 稳定', spreadMonotonic: '通过' },
    risk: { hardTriggers: 5, complianceEvents: 2, conflictHits: 1 },
    teams: [
      { name:'评级业务一部', completed: 56, pending: 8, avgDays: 5.4 },
      { name:'评级业务二部', completed: 48, pending: 6, avgDays: 5.8 },
      { name:'评级业务三部', completed: 20, pending: 4, avgDays: 6.2 }
    ]
  };

  /* ============== 投资者服务（远东对外品牌） ============== */
  // 《远东信用观察》（季度出版）
  const investorPubs = [
    { id:'GC-2026-Q2', title:'《远东信用观察》2026 年 Q2', date:'2026-04-15', summary:'宏观稳定 + 行业景气分化，钢铁与房地产等下行行业风险加剧，新能源与信息技术上行。', tags:['季度','宏观'], pages:68 },
    { id:'GC-2026-Q1', title:'《远东信用观察》2026 年 Q1', date:'2026-01-20', summary:'GB/T 45255-2025文落地解读 · 双轨融合评级体系建立。',                       tags:['季度','政策'], pages:62 },
    { id:'MM-2026-04', title:'国际观察月报 2026 年 4 月',     date:'2026-04-08', summary:'美联储利率政策 + 欧债市场摘要 + 一带一路主权评级动态。',                  tags:['月报','宏观'], pages:24 },
    { id:'RC-2026-04', title:'区域经济与信用观察 · 江苏',     date:'2026-04-12', summary:'江苏省制造业升级 + 政府信用稳健 + 产业园区平台关注度上升。',              tags:['区域','江苏'], pages:32 },
    { id:'SP-2026-03', title:'专题研究：违约预警模型 V2',     date:'2026-03-22', summary:'基于 LSTM + 公共信用八大维度的违约预警模型升级。',                       tags:['专题','模型'], pages:46 },
    { id:'DR-2026-03', title:'信用债市场回顾 2026 Q1',         date:'2026-03-31', summary:'一级发行 + 二级利差 + 违约事件 + 行业信用展望。',                       tags:['季度','债市'], pages:54 }
  ];
  // 投资者订阅
  const investorSubscribers = {
    totalSubs: 824, monthlyActive: 612, downloadCount: 4280
  };

  /* ============== 定制化业务 · 绿色债券评估认证 ============== */
  const greenBonds = [
    { id:'GB-2026-018', issuer:'上海柴油机股份有限公司',     bondName:'2026 年第一期绿色公司债', amount:80,  duration:5, principle:'《绿色债券原则》(GBP) 2021', usage:['光伏电站建设','储能项目'],         status:'已认证', rating:'AA',  greenLevel:'G-1', issuedAt:'2026-04-12' },
    { id:'GB-2026-017', issuer:'江苏三房巷集团有限公司',           bondName:'2026 年绿色中期票据',     amount:30,  duration:3, principle:'气候债券标准 CBI v3.1',     usage:['污水处理升级','节能技改'],         status:'已认证', rating:'AA-', greenLevel:'G-1', issuedAt:'2026-03-28' },
    { id:'GB-2026-016', issuer:'广东康美药业股份有限公司',           bondName:'2026 年绿色资产支持证券',  amount:50,  duration:7, principle:'GBP 2021 + CBI v3.1',       usage:['海上风电场建设'],                   status:'认证中', rating:'—',   greenLevel:'—',   issuedAt:null },
    { id:'GB-2026-015', issuer:'武汉市城市建设投资开发集团有限公司',                bondName:'2026 年地方政府绿色专项债',amount:120, duration:10,principle:'《人行绿色债券支持项目目录(2021版)》', usage:['绿色基础设施','低碳交通'], status:'已认证', rating:'AAA', greenLevel:'G-1', issuedAt:'2026-03-15' }
  ];
  const greenBondStats = {
    totalCertified: 142, totalAmount: 5680, gLevelG1: 96, gLevelG2: 38, gLevelG3: 8,
    byCategory: [
      { name:'清洁能源',    cnt:62, ratio:0.44 },
      { name:'清洁交通',    cnt:24, ratio:0.17 },
      { name:'生态保护',    cnt:18, ratio:0.13 },
      { name:'节能升级',    cnt:16, ratio:0.11 },
      { name:'污染防治',    cnt:14, ratio:0.10 },
      { name:'气候适应',    cnt: 8, ratio:0.05 }
    ]
  };

  /* ============== 远东研究 · 行业研究库 ============== */
  const industryResearch = [
    { id:'IR-2026-042', title:'2026 年钢铁行业信用风险展望',     industry:'钢铁',     date:'2026-04-22', author:'王明远 · 张志强', tags:['行业','钢铁'], pages:38 },
    { id:'IR-2026-041', title:'2026 年房地产行业信用观察',       industry:'房地产',   date:'2026-04-18', author:'李雨欣',          tags:['行业','地产'], pages:42 },
    { id:'IR-2026-040', title:'2026 年城投平台信用风险研究',     industry:'城投',     date:'2026-04-15', author:'张志强',          tags:['行业','城投'], pages:56 },
    { id:'IR-2026-039', title:'新能源行业信用展望（光伏 + 风电）', industry:'新能源',  date:'2026-04-10', author:'刘俊辉 · 王明远', tags:['行业','新能源','上行'], pages:44 },
    { id:'IR-2026-038', title:'信息技术服务业 2026 年信用展望',   industry:'信息技术',date:'2026-04-08', author:'李雨欣',          tags:['行业','TMT','上行'], pages:36 },
    { id:'IR-2026-037', title:'医药行业信用观察 · 创新药与仿制',  industry:'医药',     date:'2026-04-02', author:'张志强',          tags:['行业','医药'], pages:32 },
    { id:'IR-2026-036', title:'化工行业 2026 年信用展望',         industry:'化工',     date:'2026-03-28', author:'王明远',          tags:['行业','化工','下行'], pages:30 },
    { id:'IR-2026-035', title:'银行业 2026 信用展望 · 资产质量',  industry:'银行',     date:'2026-03-25', author:'孙琳琳 · 张志强', tags:['行业','金融','银行'], pages:48 },
    { id:'IR-2026-034', title:'保险业信用观察 · 偿付能力',         industry:'保险',     date:'2026-03-22', author:'孙琳琳',          tags:['行业','金融','保险'], pages:40 },
    { id:'IR-2026-033', title:'航空运输信用观察',                  industry:'航空',     date:'2026-03-18', author:'刘俊辉',          tags:['行业','交运'], pages:28 },
    { id:'IR-2026-032', title:'物流仓储信用观察 · 供应链金融',     industry:'物流',     date:'2026-03-15', author:'李雨欣',          tags:['行业','交运'], pages:26 },
    { id:'IR-2026-031', title:'光伏行业 2026 信用展望',            industry:'新能源',   date:'2026-03-12', author:'王明远',          tags:['行业','新能源','上行'], pages:34 }
  ];
  const researchStats = { total: 263, monthly: 12, downloads: 18420, byCategory: 8 };

  /* ============== 技术与标准 · 评级方法版本管理
   * 命名规则来源：远东资信公开方法学（FECR-{行业代码}-V{版本}-{YYYYMM}）
   * 已确认公开样例：
   *   · 电子信息制造（FECR-DZXX-V03-202502，2025-02 公开发布）
   *   · 装备制造（FECR-ZBZZ-V02-202503，2025-03 公开发布）
   * 资料来源：sfecr.com/col54/list 主体评级方法与模型 ================= */
  const methodVersions = [
    { id:'MV-DZXX', name:'电子信息制造企业评级方法与模型', ver:'FECR-DZXX-V03-202502', effective:'2025-02-15', superseded:'V02-202308',   committee:'公开版本（远东官网）',  status:'生效中', industry:'电子信息制造', pages:148, isVerified:true },
    { id:'MV-ZBZZ', name:'装备制造企业评级方法与模型',     ver:'FECR-ZBZZ-V02-202503', effective:'2025-03-12', superseded:'V01-202206',   committee:'公开版本（远东官网）',  status:'生效中', industry:'装备制造',     pages:96,  isVerified:true },
    { id:'MV-GS',   name:'工商企业评级方法与模型',         ver:'FECR-GS-V03（演示版本号）',   effective:'2024-10-01', superseded:'V02', committee:'演示样例',              status:'生效中', industry:'工商企业',     pages:148 },
    { id:'MV-CT',   name:'城投企业评级方法与模型',         ver:'FECR-CT-V02（演示版本号）',   effective:'2024-03-01', superseded:'V01', committee:'演示样例',              status:'生效中', industry:'城投',         pages:96 },
    { id:'MV-BK',   name:'商业银行评级方法与模型',         ver:'FECR-BK-V03（演示版本号）',   effective:'2023-12-01', superseded:'V02', committee:'演示样例',              status:'生效中', industry:'银行',         pages:124 },
    { id:'MV-BX',   name:'保险公司评级方法与模型',         ver:'FECR-BX-V02（演示版本号）',   effective:'2023-12-01', superseded:'V01', committee:'演示样例',              status:'生效中', industry:'保险',         pages:138 },
    { id:'MV-ZQ',   name:'证券公司评级方法与模型',         ver:'FECR-ZQ-V02（演示版本号）',   effective:'2023-11-01', superseded:'V01', committee:'演示样例',              status:'生效中', industry:'证券',         pages:118 },
    { id:'MV-ZL',   name:'融资租赁评级方法与模型',         ver:'FECR-ZL-V02（演示版本号）',   effective:'2023-10-01', superseded:'V01', committee:'演示样例',              status:'生效中', industry:'租赁',         pages:104 },
    { id:'MV-ABS',  name:'资产支持证券评级方法',           ver:'FECR-ABS-V01（演示版本号）',  effective:'2024-03-01', superseded:'—',   committee:'演示样例',              status:'生效中', industry:'ABS',          pages:162 },
    { id:'MV-LD',   name:'绿色债券评估认证方法',           ver:'FECR-LD-V01（演示版本号）',   effective:'2024-01-01', superseded:'—',   committee:'演示样例',              status:'生效中', industry:'绿色债券',     pages:88 },
    { id:'MV-DFZF', name:'地方政府债评级方法',             ver:'FECR-DFZF-V02（演示版本号）', effective:'2024-06-01', superseded:'V01', committee:'演示样例',              status:'生效中', industry:'地方政府债',   pages:78 },
    { id:'MV-ZQZF', name:'主权评级方法',                   ver:'FECR-ZQZF-V01（演示版本号）', effective:'2023-08-01', superseded:'—',   committee:'演示样例',              status:'生效中', industry:'主权',         pages:92 }
  ];
  const methodStandards = [
    { id:'GB45255', name:'GB/T 45255-2025《公共信用综合评价规范》',     issueAt:'2025-01-15', effective:'2025-06-01', usage:'公共信用 ABCD 四级 + 八大维度' },
    { id:'GB23794', name:'GB/T 23794-2023《企业信用评价指标》',         issueAt:'2023-08-15', effective:'2023-12-01', usage:'白盒化解构 + 评价规则参考' },
    { id:'GB39441', name:'GB/T 39441-2020《公共信用信息分类与编码规范》',issueAt:'2020-11-19', effective:'2020-12-01', usage:'字段编码标准化' },
    { id:'GB42337', name:'GB/T 42337-2023《公共信用信息报告编制指南》', issueAt:'2023-03-08', effective:'2023-09-01', usage:'报告编制' },
    { id:'GB32100', name:'GB 32100-2015《统一社会信用代码编码规则》',    issueAt:'2015-10-13', effective:'2015-10-13', usage:'USCC 主体识别' }
  ];

  /* ============== P0-1 现场调研记录 ============== */
  const fieldVisits = [
    { id:'FV-2026-018', project:'P-2026-0421', subject:'江西铜业股份有限公司', location:'江西省贵溪市冶金大道 15 号', visitor:'王明远 + 李雨欣', startAt:'2026-04-05 09:00', endAt:'2026-04-06 18:00', durationDays:2, status:'已完成', photos:18, videos:3, signatures:4, gpsCheck:true },
    { id:'FV-2026-017', project:'P-2026-0420', subject:'江苏华西集团有限公司', location:'江苏省江阴市华士镇华西新市村', visitor:'李雨欣',          startAt:'2026-04-12 10:00', endAt:'2026-04-13 17:00', durationDays:2, status:'已完成', photos:24, videos:2, signatures:5, gpsCheck:true },
    { id:'FV-2026-016', project:'P-2026-0418', subject:'福禧投资控股有限公司', location:'上海市浦东新区杨东路 6 号',     visitor:'张志强',          startAt:'2026-04-09 14:00', endAt:'2026-04-10 18:00', durationDays:2, status:'已完成', photos:12, videos:1, signatures:3, gpsCheck:false },
    { id:'FV-2026-019', project:'P-2026-0415', subject:'中国华源集团有限公司', location:'上海市浦东新区世纪大道 88 号',  visitor:'王明远',          startAt:'2026-04-22 09:00', endAt:'',                  durationDays:0, status:'进行中', photos:6,  videos:0, signatures:1, gpsCheck:true }
  ];

  /* ============== P0-2 多渠道披露记录 + 电子公章 ============== */
  const disclosureChannels = [
    { id:'DC-2026-074', report:'R-20260428-001', subject:'南京钢铁联合有限公司',     channels:['公司官网','上交所','银行间市场'],          publishAt:'2026-04-28 14:32', status:'已发布',                   sealed:true },
    { id:'DC-2026-073', report:'R-20260428-002', subject:'江苏华西集团有限公司',     channels:['公司官网','信用中国','央行'],              publishAt:'2026-04-28 13:15', status:'已发布',                   sealed:true },
    { id:'DC-2026-072', report:'R-20260427-003', subject:'福禧投资控股有限公司',     channels:['公司官网','银行间市场'],                   publishAt:'2026-04-27 17:08', status:'部分发布（待证监会）',     sealed:true },
    { id:'DC-2026-071', report:'R-20260427-004', subject:'中国华源集团有限公司',     channels:['公司官网','上交所','银行间市场','交易商协会'], publishAt:'2026-04-27 11:42', status:'已发布',                   sealed:true }
  ];
  const disclosureChannelsList = [
    { code:'WEB',    name:'公司官网披露',         desc:'sfecr.com 评级公告页面',          mandatory:true  },
    { code:'SSE',    name:'上海证券交易所',       desc:'公司债 / 可转债 / ABS / 主权 等', mandatory:false },
    { code:'SZSE',   name:'深圳证券交易所',       desc:'公司债 / 可转债 / 中小企业债 等', mandatory:false },
    { code:'IBM',    name:'银行间市场（清算所）', desc:'中票 / 短融 / 超短融 / PPN',     mandatory:false },
    { code:'NAFMII', name:'交易商协会',           desc:'非金融企业债务融资工具',         mandatory:false },
    { code:'PBC',    name:'人民银行报备',         desc:'信用评级业务备案',                mandatory:true  },
    { code:'CSRC',   name:'证监会报备',           desc:'公开发行证券类评级',              mandatory:true  },
    { code:'NDRC',   name:'国家发改委报备',       desc:'企业债 / 地方政府债',             mandatory:false },
    { code:'CC',     name:'信用中国',             desc:'公共信用评价结果同步',           mandatory:false }
  ];
  const eSeals = [
    { id:'SEAL-001', name:'远东资信评估有限公司公章',     type:'公章',      usage:'评级报告 / 协议',         delegate:'评级总监', usedTimes:124, status:'有效' },
    { id:'SEAL-002', name:'远东资信评估有限公司合同章',   type:'合同章',    usage:'委托协议 / 评级业务',     delegate:'市场部',   usedTimes:86,  status:'有效' },
    { id:'SEAL-003', name:'评级总监 周建华 个人签名',     type:'电子签名',  usage:'评级报告 / 信评委决议',   delegate:'评级总监', usedTimes:124, status:'有效' },
    { id:'SEAL-004', name:'合规总监 陈秋萍 个人签名',     type:'电子签名',  usage:'合规审核签字',           delegate:'合规总监', usedTimes:86,  status:'有效' }
  ];

  /* ============== P0-3 客户反馈 ============== */
  const clientFeedback = [
    {
      id:'CF-2026-021', project:'P-2026-0421', subject:'南京钢铁联合有限公司',
      contact:'财务部 张经理', contactPhone:'139****6841', contactEmail:'zhang@njsteel.example',
      channel:'客户专用门户', filedAt:'2026-04-28 16:00',
      type:'已收悉无异议', status:'已结案',
      content:'我方已收到 AA- 主体跟踪评级报告，结论与我方判断一致。',
      attachments:[],
      response:'感谢委托方反馈，本次跟踪评级已归档；下次定期跟踪将于 2027-04 进行。',
      respondedBy:'王明远', respondedAt:'2026-04-28 17:32',
      responseHours:1.5
    },
    {
      id:'CF-2026-020', project:'P-2026-0418', subject:'福禧投资控股有限公司',
      contact:'董秘办 李总监', contactPhone:'138****2204', contactEmail:'li@fuxi.example',
      channel:'客户专用门户', filedAt:'2026-04-27 18:15',
      type:'补充材料', status:'材料待评审',
      content:'已补充 2026-Q1 未审报表与最新关联交易披露，请评级师查阅。',
      attachments:[
        { name:'2026-Q1 未审报表.pdf', size:'3.2 MB' },
        { name:'关联交易披露_2026Q1.xlsx', size:'860 KB' }
      ],
      response:null, respondedBy:null, respondedAt:null,
      responseHours:null
    },
    {
      id:'CF-2026-019', project:null, subject:'江西铜业股份有限公司',
      contact:'财务部 王总监', contactPhone:'137****5519', contactEmail:'wang@jxcopper.example',
      channel:'邮件', filedAt:'2026-04-21 10:32',
      type:'反馈意见', status:'项目组采纳',
      content:'对评级报告中"行业地位"段落表述无异议，但建议补充国际铜价对盈利的影响分析。',
      attachments:[],
      response:'已采纳，行业地位段将补充国际铜价敏感性分析，新版报告将于 5 个工作日内推送。',
      respondedBy:'李雨欣', respondedAt:'2026-04-21 14:50',
      responseHours:4.3
    },
    {
      id:'CF-2026-018', project:'P-2026-0420', subject:'江苏华西集团有限公司',
      contact:'集团办 吴主任', contactPhone:'136****8810', contactEmail:'wu@jshxgroup.example',
      channel:'客户专用门户', filedAt:'2026-04-20 14:48',
      type:'复评申请', status:'已排信评委',
      content:'对评级展望"负面"提出异议，附补充财务数据 + 战略转型说明。',
      attachments:[
        { name:'2026-Q1 未审报表.pdf', size:'2.8 MB' },
        { name:'战略转型说明.pdf', size:'1.4 MB' },
        { name:'关联交易披露补充.xlsx', size:'920 KB' }
      ],
      response:'已立项复评，信评委定于 2026-04-29 14:30 召开（AP-2026-004）。',
      respondedBy:'王明远', respondedAt:'2026-04-20 16:20',
      responseHours:1.5,
      linkedAppealId:'AP-2026-004'
    }
  ];

  /* ============== P1-5 复核任务 ============== */
  const proofreadingTasks = [
    { id:'PR-2026-018', report:'R-20260428-001', subject:'南京钢铁联合有限公司', proofreader:'孙琳琳（项目组以外）', stage:'信评委后定稿', issues:3, status:'已通过', assignedAt:'2026-04-28 09:00', completedAt:'2026-04-28 12:30' },
    { id:'PR-2026-019', report:'R-20260428-002', subject:'江苏华西集团有限公司', proofreader:'刘俊辉（项目组以外）', stage:'信评委后定稿', issues:5, status:'修改中',  assignedAt:'2026-04-28 10:15', completedAt:'' },
    { id:'PR-2026-020', report:'R-20260427-003', subject:'福禧投资控股有限公司', proofreader:'孙琳琳（项目组以外）', stage:'三审后定稿',   issues:1, status:'已通过', assignedAt:'2026-04-27 15:20', completedAt:'2026-04-27 17:40' }
  ];
  const proofreadingIssues = [
    { id:'PI-001', task:'PR-2026-019', section:'sec-9 财务状况分析', severity:'中', desc:'P28 倒数第 3 段：净利率"5.0%"与正文表格"4.98%"不一致，建议统一', status:'待修改' },
    { id:'PI-002', task:'PR-2026-019', section:'sec-10 风险因素',     severity:'低', desc:'P32 段落 2："对外担保 12 亿"应改为"约 12 亿"（脱敏一致性）',      status:'待修改' },
    { id:'PI-003', task:'PR-2026-019', section:'sec-13 跟踪安排',     severity:'低', desc:'跟踪期日期与首页元数据条不一致',                                    status:'待修改' },
    { id:'PI-004', task:'PR-2026-019', section:'sec-14 附录',         severity:'低', desc:'附录 3 评级方法标注的版本号与项目实际使用版本不一致',              status:'待修改' },
    { id:'PI-005', task:'PR-2026-019', section:'sec-2 公司声明',      severity:'低', desc:'第六条结尾标点错误（句号 / 分号混用）',                            status:'待修改' }
  ];

  /* ============== P1-6 信评委决议书 ============== */
  const committeeResolutions = [
    {
      id:'CR-2026-018', sessionId:'CC-2026-018', subject:'南京钢铁联合有限公司',
      proposedGrade:'AA-', finalGrade:'AA-', publicGrade:'B',
      vote:'通过 5 / 反对 0 / 弃权 1', date:'2026-04-29 14:00', chair:'周建华',
      status:'已生效', signed:true, recorded:true,
      members:[
        { name:'周建华', role:'评级总监 / 主席',    vote:'通过', recused:false, signedAt:'2026-04-29 15:50' },
        { name:'刘宇翔', role:'信用风险委员',        vote:'通过', recused:false, signedAt:'2026-04-29 15:51' },
        { name:'孙琳琳', role:'方法学委员',          vote:'通过', recused:false, signedAt:'2026-04-29 15:52' },
        { name:'王雪',   role:'合规委员',            vote:'通过', recused:false, signedAt:'2026-04-29 15:53' },
        { name:'张志强', role:'部门总监委员',        vote:'通过', recused:false, signedAt:'2026-04-29 15:54' },
        { name:'李明',   role:'外部独立委员',        vote:'弃权', recused:false, signedAt:'2026-04-29 15:55', reason:'对短期债务集中度数据待补充确认' }
      ],
      keyRisks:[
        '短期债务集中度 67%，需关注流动性管理',
        '钢铁行业景气下行，2025 年 EBITDA 同比 -8%',
        '对外担保规模 32 亿，占净资产 18%'
      ],
      recordingHash:'0x7c8d9e1f4a2b6c3d8e5f9a1b2c4d6e8f',
      attachments:[
        { name:'BACP 评分明细', size:'1.2 MB' },
        { name:'AM 调整说明', size:'380 KB' },
        { name:'公共信用融合证据', size:'520 KB' }
      ]
    },
    {
      id:'CR-2026-019', sessionId:'CC-2026-018', subject:'江苏华西集团有限公司',
      proposedGrade:'BBB-', finalGrade:'BBB-', publicGrade:'D',
      vote:'通过 5 / 反对 0 / 弃权 1（项目组成员回避）', date:'2026-04-29 14:30', chair:'周建华',
      status:'已生效（D 级红线锁定）', signed:true, recorded:true,
      members:[
        { name:'周建华', role:'评级总监 / 主席',    vote:'通过', recused:false, signedAt:'2026-04-29 16:20' },
        { name:'刘宇翔', role:'信用风险委员',        vote:'通过', recused:false, signedAt:'2026-04-29 16:21' },
        { name:'孙琳琳', role:'方法学委员',          vote:'通过', recused:false, signedAt:'2026-04-29 16:22' },
        { name:'王雪',   role:'合规委员',            vote:'通过', recused:false, signedAt:'2026-04-29 16:23' },
        { name:'张志强', role:'部门总监委员',        vote:'通过', recused:false, signedAt:'2026-04-29 16:24' },
        { name:'李明',   role:'项目组组长',           vote:'—',   recused:true,  reason:'与项目组成员存在利冲关系，按《信评委制度》第三十二条回避' }
      ],
      keyRisks:[
        '主体被列入严重失信主体名单（公共信用 D 级），市场化评级触发 ≤ BBB- 强制锁定',
        '关联企业华东建材爆雷，可能对集团形成股权穿透敞口',
        '2025 年经营性现金流 -3.2 亿，连续两年为负'
      ],
      redLine:{ enforced:true, rule:'GB/T 45255-2025 第六条 D 级红线', limit:'BBB-', explanation:'公共信用 D 级，市场化评级不得高于 BBB-' },
      recordingHash:'0xab12cd34ef56789012345678abcdef01',
      attachments:[
        { name:'失信主体名单证据', size:'180 KB' },
        { name:'红线锁定说明', size:'95 KB' },
        { name:'BACP 评分（应得 BB+）', size:'1.1 MB' }
      ]
    },
    {
      id:'CR-2026-017', sessionId:'CC-2026-017', subject:'福禧投资控股有限公司',
      proposedGrade:'A-', finalGrade:'BBB+', publicGrade:'B',
      vote:'通过 4 / 反对 1 / 弃权 1（议委修订）', date:'2026-04-22 14:00', chair:'周建华',
      status:'已生效（议委修订下调）', signed:true, recorded:true,
      members:[
        { name:'周建华', role:'评级总监 / 主席',    vote:'通过', recused:false, signedAt:'2026-04-22 16:10' },
        { name:'刘宇翔', role:'信用风险委员',        vote:'通过', recused:false, signedAt:'2026-04-22 16:11' },
        { name:'孙琳琳', role:'方法学委员',          vote:'反对', recused:false, signedAt:'2026-04-22 16:12', reason:'对外担保链穿透不足，建议下调至 BBB+' },
        { name:'王雪',   role:'合规委员',            vote:'通过', recused:false, signedAt:'2026-04-22 16:13' },
        { name:'张志强', role:'部门总监委员',        vote:'通过', recused:false, signedAt:'2026-04-22 16:14' },
        { name:'李明',   role:'外部独立委员',        vote:'弃权', recused:false, signedAt:'2026-04-22 16:15' }
      ],
      keyRisks:[
        '对外担保规模 ≥ 净资产 30%，担保链穿透风险偏高',
        '主要业务集中度高，单一行业占比 78%',
        '议委孙琳琳异议成立，最终下调至 BBB+'
      ],
      dissents:[
        { member:'孙琳琳', vote:'反对', reason:'对外担保链穿透不足，应下调至 BBB+', accepted:true }
      ],
      recordingHash:'0xff00aa11bb22cc33dd44ee55ff667788',
      attachments:[
        { name:'担保链穿透分析', size:'2.4 MB' },
        { name:'BACP 评分（A-）', size:'1.0 MB' },
        { name:'下调说明', size:'120 KB' }
      ]
    }
  ];

  /* ============== GB/T 45255-2025 第十条 信用修复联动 ============== */
  // 来自信用中国 / 全国信用信息共享平台推送的修复事件
  const creditRepairEvents = [
    { id:'CR-2026-042', subject:'江苏华西集团有限公司',     repairType:'严重失信主体名单移出',   repairDept:'国家市场监督管理总局',     repairDate:'2026-04-15', publicGradeBefore:'D', publicGradeAfter:'C+', notifyAt:'2026-04-15 10:32', status:'待评级师确认',     reratingTriggered:false, freeNotify:true },
    { id:'CR-2026-041', subject:'湖南华菱管线股份有限公司', repairType:'行政处罚信息修复',         repairDept:'湖南省生态环境厅',         repairDate:'2026-04-12', publicGradeBefore:'B-', publicGradeAfter:'B+', notifyAt:'2026-04-12 14:18', status:'已触发跟踪评级', reratingTriggered:true,  freeNotify:true },
    { id:'CR-2026-040', subject:'武汉市城市建设投资开发集团', repairType:'经营异常名录移出',         repairDept:'湖北省市场监督管理局',     repairDate:'2026-04-08', publicGradeBefore:'B',  publicGradeAfter:'A-', notifyAt:'2026-04-08 09:45', status:'已重新评级 + 通知客户', reratingTriggered:true, freeNotify:true },
    { id:'CR-2026-039', subject:'福禧投资控股有限公司',     repairType:'失信被执行人移出',         repairDept:'最高人民法院',             repairDate:'2026-04-05', publicGradeBefore:'C',  publicGradeAfter:'B-', notifyAt:'2026-04-05 16:22', status:'待评级师确认',     reratingTriggered:false, freeNotify:true }
  ];

  /* ============== 公共信用 6 大类数据目录（来自GB/T 45255-2025 附件） ============== */
  const publicCreditCatalog = [
    {
      cat:'1. 司法信息', sub:'失信被执行人信息',
      fields:['案号','企业名称','法定代表人/负责人姓名','身份证号/USCC','履行情况','失信行为情形','执行法院','所在地','立案时间','发布时间']
    },
    {
      cat:'2. 合同履约信息', sub:'经司法程序认定的违约信息',
      fields:['企业名称','USCC','案由','案号','原告/被告信息','判决结果','执行法院','所在地','发布日期']
    },
    {
      cat:'2. 合同履约信息', sub:'拖欠企业账款失信信息',
      fields:['企业名称','USCC','认定时间','认定案由','认定金额','认定部门','履约情况']
    },
    {
      cat:'3. 企业登记信息', sub:'企业基础信息',
      fields:['企业名称','USCC','注册资金/实缴资本','人员规模','成立日期','对外投资及分支机构设立','变更信息']
    },
    {
      cat:'3. 企业登记信息', sub:'列入经营异常名录',
      fields:['企业名称','USCC','是否列入','原因类型','列入日期']
    },
    {
      cat:'4. 行政管理信息', sub:'行政许可',
      fields:['企业名称','USCC','行政相对人类别','法定代表人姓名','行政许可决定文书','许可类别','许可证书','许可编号','许可内容','决定日期','有效期','许可状态','行政机关名称','行政机关 USCC']
    },
    {
      cat:'4. 行政管理信息', sub:'行政处罚',
      fields:['企业名称','USCC','处罚决定文书','违法行为类型','违法事实','处罚依据','处罚内容','罚款金额','没收违法所得金额','暂扣/吊销证照','决定日期','有效期','公示截止期','行政机关名称']
    },
    {
      cat:'5. 守信激励名单', sub:'A 级纳税人',
      fields:['企业名称','USCC','评级年度','信用等级','评价地域']
    },
    {
      cat:'5. 守信激励名单', sub:'海关高级认证企业（AEO）',
      fields:['企业中文名称','USCC','海关注册编码','信用等级','等级认定时间','经营类别']
    },
    {
      cat:'5. 守信激励名单', sub:'其他领域守信激励名单',
      fields:['企业名称','USCC','注册地址','评价等级','认定时间','认定有效时间']
    },
    {
      cat:'6. 严重失信主体名单', sub:'涉企严重失信主体名单',
      fields:['企业名称','USCC','注册地址','列入时间','列入事由','列入依据','决定机关','移出时间']
    }
  ];

  /* ============== GB/T 45255-2025 八大维度权重（演示样例 · 评级标准委员会审议）============== */
  // 数据来源：GB/T 45255-2025《公共信用综合评价规范》编制说明
  // 权重为远东评级标准委员会基于"工商企业"行业特性确定的演示配比
  const eightDimensions = [
    { code:'JF', name:'司法裁判情况', weight:0.18, desc:'反映遵守法律情况',         metrics:'失信被执行人 / 被执行人 / 判决裁定',     dataSource:'最高人民法院 + 执行公开网' },
    { code:'AM', name:'行政监管情况', weight:0.18, desc:'反映遵守行政法规情况',     metrics:'行政处罚 / 行政强制 / 行政奖励 / 监督检查', dataSource:'各级行政机关公示平台' },
    { code:'CT', name:'履约践诺情况', weight:0.12, desc:'反映合同 / 信用承诺履行', metrics:'合同备案 / 信用承诺 / 政府采购履约',     dataSource:'信用承诺管理平台' },
    { code:'OP', name:'经营管理情况', weight:0.15, desc:'反映经营状况和管理能力',   metrics:'经营规模 / 时长 / 业务拓展 / 公司治理',   dataSource:'国家企业信用信息公示系统' },
    { code:'IN', name:'发展创新情况', weight:0.10, desc:'反映创新能力和发展潜力',   metrics:'资质许可 / 知识产权 / 研发投入',         dataSource:'科技部 + 知识产权局' },
    { code:'TR', name:'守信激励情况', weight:0.10, desc:'反映获得奖励和表彰',       metrics:'政府荣誉 / 激励名单 / A 级纳税人 / AEO',   dataSource:'各部门激励名单' },
    { code:'BL', name:'失信惩戒情况', weight:0.12, desc:'反映受到失信惩戒',         metrics:'严重失信主体名单 / 重点关注名单',         dataSource:'各部门黑名单' },
    { code:'SO', name:'社会监督情况', weight:0.05, desc:'反映社会信誉情况',         metrics:'经核实的社会公众监督举报、舆情',         dataSource:'信用中国 + 行业舆情' }
  ];

  /* ============== P1-7 客户经理委托池 ============== */
  const accountManagerLeads = [
    { id:'AM-2026-031', accountManager:'刘洋（市场一部）', client:'江西铜业股份有限公司',     contactPhone:'0701-3777xxx', leadType:'存量续约', status:'委托待评级师筛查', amount:38, urgency:'高', filedAt:'2026-04-30 09:00', assignedTo:null },
    { id:'AM-2026-030', accountManager:'刘洋（市场一部）', client:'武汉市城市建设投资开发集团', contactPhone:'027-82xxxxxx', leadType:'新客户',   status:'委托审查中',         amount:62, urgency:'中', filedAt:'2026-04-29 14:30', assignedTo:null },
    { id:'AM-2026-029', accountManager:'王雪（市场二部）', client:'湖南华菱管线股份有限公司', contactPhone:'0731-88xxxxxx',leadType:'存量续约', status:'委托已分派评级师',   amount:42, urgency:'中', filedAt:'2026-04-28 11:20', assignedTo:'王明远' },
    { id:'AM-2026-028', accountManager:'王雪（市场二部）', client:'国家开发银行',             contactPhone:'010-68306688', leadType:'金融债',   status:'已立项',             amount:120,urgency:'高', filedAt:'2026-04-26 09:00', assignedTo:'张志强' }
  ];

  /* ============================================================
   * 立项字典（P0 + P1 + P1.5 改造）
   * 5 主体类别 × 33 债项 × 双评级 × 绿债专项
   * ============================================================ */

  // 5 大主体类别（远东方法学根目录映射）
  const subjectKinds = [
    { code:'corp',     name:'工商企业',   desc:'制造业 / 服务业 / 零售贸易等一般工商企业' },
    { code:'finance',  name:'金融机构',   desc:'银行 / 保险 / 证券 / 信托 / AMC / 担保 / 小贷' },
    { code:'lgfv',     name:'城投平台',   desc:'地方政府融资平台 / 基建 / 保障房 / 土地整理' },
    { code:'gov',      name:'地方政府',   desc:'省级 / 地市级 / 区县级 政府' },
    { code:'sovereign',name:'主权 / 中央',desc:'主权评级 / 中央政府' }
  ];

  // 行业 / 区划字典（按主体类别条件级联）
  const industriesByKind = {
    corp: [
      { code:'C31', name:'C31 钢铁制造' },        { code:'C30', name:'C30 建材制造' },
      { code:'C36', name:'C36 汽车制造' },        { code:'C27', name:'C27 医药制造' },
      { code:'C13', name:'C13 农副食品加工' },    { code:'C14', name:'C14 食品制造' },
      { code:'C15', name:'C15 酒饮料茶' },        { code:'C26', name:'C26 化学原料及化学制品' },
      { code:'C39', name:'C39 计算机通信电子' },  { code:'C40', name:'C40 仪器仪表' },
      { code:'C32', name:'C32 有色金属冶炼及压延' },{ code:'B06', name:'B06 煤炭开采和洗选' },
      { code:'B07', name:'B07 石油和天然气开采' },{ code:'D44', name:'D44 电力 / 热力生产和供应' },
      { code:'E48', name:'E48 土木工程建筑' },    { code:'E50', name:'E50 房屋建筑' },
      { code:'F51', name:'F51 批发业' },          { code:'F52', name:'F52 零售业' },
      { code:'G53', name:'G53 铁路运输' },        { code:'G54', name:'G54 道路运输' },
      { code:'G56', name:'G56 航空运输' },        { code:'I65', name:'I65 软件和信息技术' },
      { code:'K70', name:'K70 房地产' },          { code:'L72', name:'L72 商务服务' },
      { code:'OTH', name:'其他' }
    ],
    finance: [
      { code:'J66',  name:'J66 货币金融服务（商业银行）' },
      { code:'J66P', name:'J66 政策性银行' },
      { code:'J67',  name:'J67 资本市场服务（证券公司）' },
      { code:'J68',  name:'J68 保险业' },
      { code:'J69',  name:'J69 其他金融业（信托 / 基金 / AMC）' },
      { code:'J69M', name:'J69 小额贷款公司' },
      { code:'J69G', name:'J69 担保公司' },
      { code:'J69I', name:'J69 投资公司' }
    ],
    lgfv: [
      { code:'LGFV-PROV',   name:'省级城投' },
      { code:'LGFV-MUNI',   name:'地市级城投' },
      { code:'LGFV-DIST',   name:'区县级城投' },
      { code:'LGFV-PARK',   name:'产业园区平台' },
      { code:'LGFV-XFNZ',   name:'新型城镇化平台' },
      { code:'LGFV-INFRA',  name:'基础设施 / 交通水利' },
      { code:'LGFV-HOUSE',  name:'保障房 / 安居工程' },
      { code:'LGFV-LAND',   name:'土地整理 / 一级开发' }
    ],
    gov: [
      { code:'GOV-PROV',  name:'省 / 自治区 / 直辖市' },
      { code:'GOV-MUNI',  name:'地级市' },
      { code:'GOV-DIST',  name:'区 / 县 / 县级市' }
    ],
    sovereign: [
      { code:'SOV-CN',  name:'中央政府（中国）' },
      { code:'SOV-INTL',name:'境外主权' }
    ]
  };

  // 33 类债项（按主体类别筛选）— 远东《产品评级方法与模型》库
  const bondTypesByKind = {
    corp: [
      { code:'CORP-COMPANY', name:'公司债',                  category:'常规' },
      { code:'CORP-ENT',     name:'企业债',                  category:'常规' },
      { code:'CORP-ENT-GREEN',name:'绿色企业债券',           category:'主题', green:true },
      { code:'CORP-ENT-SCI', name:'科技创新债券',            category:'主题' },
      { code:'CORP-MTN',     name:'中期票据',                category:'银行间' },
      { code:'CORP-CP',      name:'短期融资券',              category:'银行间' },
      { code:'CORP-SCP',     name:'超短期融资券',            category:'银行间' },
      { code:'CORP-CB',      name:'可转换债券',              category:'股债结合' },
      { code:'CORP-EB',      name:'可交换债券',              category:'股债结合' },
      { code:'CORP-PANDA',   name:'熊猫债',                  category:'境外发行人' },
      { code:'CORP-ABS-CR',  name:'信贷资产支持证券（ABS）',  category:'结构化' },
      { code:'CORP-ABS-EN',  name:'企业资产支持证券（ABS）',  category:'结构化' },
      { code:'CORP-ABN',     name:'资产支持票据（ABN）',     category:'结构化' },
      { code:'CORP-ABS-AR',  name:'应收账款 ABS',            category:'结构化' },
      { code:'CORP-ABS-LE',  name:'租赁 ABS',               category:'结构化' },
      { code:'CORP-CMBS',    name:'CMBS（商业地产抵押贷款）',category:'结构化' },
      { code:'CORP-RMBS',    name:'个人住房抵押贷款 MBS',    category:'结构化' },
      { code:'CORP-NPL',     name:'不良贷款 ABS',           category:'结构化' },
      { code:'CORP-REIT',    name:'公募 REITs',              category:'结构化' }
    ],
    finance: [
      { code:'FIN-FB',      name:'金融债（商业银行）',      category:'常规' },
      { code:'FIN-FB-PB',   name:'金融债（政策性银行）',    category:'常规' },
      { code:'FIN-CAP',     name:'商业银行合格资本工具',    category:'资本工具' },
      { code:'FIN-PERP',    name:'永续债',                  category:'资本工具' },
      { code:'FIN-SUB',     name:'次级债',                  category:'资本工具' },
      { code:'FIN-WMP',     name:'银行业理财管理产品',      category:'理财' },
      { code:'FIN-DRP',     name:'债权投资计划',            category:'理财' },
      { code:'FIN-EIP',     name:'股权投资计划',            category:'理财' },
      { code:'FIN-TRUST',   name:'信托产品',                category:'理财' }
    ],
    lgfv: [
      { code:'LGFV-CORP',     name:'公司债（城投）',        category:'常规' },
      { code:'LGFV-ENT',      name:'企业债（城投）',        category:'常规' },
      { code:'LGFV-ENT-GREEN',name:'绿色企业债券（城投）',  category:'主题', green:true },
      { code:'LGFV-MTN',      name:'中期票据（城投）',      category:'银行间' },
      { code:'LGFV-CP',       name:'短期融资券（城投）',    category:'银行间' },
      { code:'LGFV-SCP',      name:'超短期融资券（城投）',  category:'银行间' },
      { code:'LGFV-PPN',      name:'非公开定向工具（PPN）', category:'银行间' }
    ],
    gov: [
      { code:'GOV-GEN',     name:'地方政府一般债券（新增）',     category:'政府债' },
      { code:'GOV-GEN-RE',  name:'地方政府再融资一般债券',       category:'政府债' },
      { code:'GOV-SPEC',    name:'地方政府专项债券（新增）',     category:'政府债' },
      { code:'GOV-SPEC-RE', name:'地方政府再融资专项债券',       category:'政府债' }
    ],
    sovereign: [
      { code:'SOV-CGB',     name:'国债',          category:'主权' },
      { code:'SOV-INTL',    name:'境外主权债',    category:'主权' }
    ]
  };

  // 市场类型
  const marketTypes = [
    { code:'EXG-SH',  name:'交易所 · 上交所' },
    { code:'EXG-SZ',  name:'交易所 · 深交所' },
    { code:'EXG-BJ',  name:'交易所 · 北交所' },
    { code:'IBM',     name:'银行间市场' },
    { code:'CROSS',   name:'跨市场（交易所 + 银行间）' },
    { code:'OTHER',   name:'其他 / 私募' }
  ];

  // 业务类型（决定是否触发 5 类强制实地调研）
  const businessTypes = [
    { code:'first',     name:'首次评级',     mustField:true,  desc:'触发实地调研，作业时间 ≥ 10 工作日（交易所）/ 15 天（银行间）' },
    { code:'continuous',name:'连续评级',     mustField:false, desc:'同一发行人多期债券，距上次现场 > 1 年须实地' },
    { code:'periodic',  name:'定期跟踪',     mustField:false, desc:'存续期 > 1 年每年至少 1 次；距上次 > 2 年或成员全换须实地' },
    { code:'irregular', name:'不定期跟踪',   mustField:false, desc:'重大事项触发；可不采用完整报告格式' },
    { code:'voluntary', name:'主动评级',     mustField:false, desc:'无委托，依据公开信息开展' }
  ];

  // 评级方法学版本（远东内部编号）
  const methodologyVersions = [
    { code:'FERC-CTOY-V05-202207', name:'中国城投企业信用评级方法与模型 V05', kind:'lgfv',     ver:'2022.07' },
    { code:'FERC-WBZC-V01-202204', name:'外评支持专项评价方法 V01',           kind:'common',   ver:'2022.04' },
    { code:'FERC-CORP-V07-202403', name:'中国工商企业通用评级方法 V07',       kind:'corp',     ver:'2024.03' },
    { code:'FERC-STEEL-V03-202311',name:'中国钢铁行业信用评级方法 V03',       kind:'corp',     ver:'2023.11' },
    { code:'FERC-RE-V04-202402',   name:'中国房地产行业信用评级方法 V04',     kind:'corp',     ver:'2024.02' },
    { code:'FERC-AUTO-V03-202310', name:'中国汽车制造业信用评级方法 V03',     kind:'corp',     ver:'2023.10' },
    { code:'FERC-COAL-V02-202308', name:'中国煤炭行业信用评级方法 V02',       kind:'corp',     ver:'2023.08' },
    { code:'FERC-BANK-V05-202401', name:'中国商业银行信用评级方法 V05',       kind:'finance',  ver:'2024.01' },
    { code:'FERC-INSUR-V04-202312',name:'中国保险公司信用评级方法 V04',       kind:'finance',  ver:'2023.12' },
    { code:'FERC-SEC-V03-202309',  name:'中国证券公司信用评级方法 V03',       kind:'finance',  ver:'2023.09' },
    { code:'FERC-TRUST-V03-202311',name:'中国信托公司信用评级方法 V03',       kind:'finance',  ver:'2023.11' },
    { code:'FERC-LGOV-V04-202309', name:'中国地方政府信用评级方法 V04',       kind:'gov',      ver:'2023.09' },
    { code:'FERC-SOV-V02-202206',  name:'主权信用评级方法 V02',               kind:'sovereign',ver:'2022.06' },
    { code:'FERC-GREEN-V03-202401',name:'绿色债券评估认证方法 V03',           kind:'product',  ver:'2024.01' },
    { code:'FERC-ABS-V04-202403',  name:'资产证券化评级方法 V04',             kind:'product',  ver:'2024.03' },
    { code:'FERC-CB-V03-202309',   name:'可转换债券评级方法 V03',             kind:'product',  ver:'2023.09' }
  ];

  // 人民银行《绿色债券支持项目目录(2021版)》一级 + 二级条目
  const greenCatalog2021 = [
    { code:'1.1', name:'1.1 节能环保产业 · 节能装备制造' },
    { code:'1.2', name:'1.2 节能环保产业 · 环境保护装备制造' },
    { code:'1.3', name:'1.3 节能环保产业 · 资源循环利用装备制造' },
    { code:'2.1', name:'2.1 清洁生产产业 · 节能降碳改造' },
    { code:'2.2', name:'2.2 清洁生产产业 · 工业绿色升级' },
    { code:'2.3', name:'2.3 清洁生产产业 · 污染防治' },
    { code:'3.1', name:'3.1 清洁能源产业 · 风力发电' },
    { code:'3.2', name:'3.2 清洁能源产业 · 太阳能利用' },
    { code:'3.3', name:'3.3 清洁能源产业 · 生物质能利用' },
    { code:'3.4', name:'3.4 清洁能源产业 · 水力发电' },
    { code:'3.5', name:'3.5 清洁能源产业 · 核电' },
    { code:'4.1', name:'4.1 生态环境产业 · 自然生态保护' },
    { code:'4.2', name:'4.2 生态环境产业 · 生态修复' },
    { code:'5.1', name:'5.1 基础设施绿色升级 · 绿色建筑' },
    { code:'5.2', name:'5.2 基础设施绿色升级 · 绿色交通' },
    { code:'5.3', name:'5.3 基础设施绿色升级 · 海绵城市' },
    { code:'5.4', name:'5.4 基础设施绿色升级 · 城镇污水处理' },
    { code:'6.1', name:'6.1 绿色服务 · 绿色咨询服务' }
  ];

  // 第三方鉴证机构（远东合作池）
  const greenAssurers = [
    { code:'CCXI',  name:'中诚信绿金' },
    { code:'CECEP', name:'中节能咨询' },
    { code:'EYG',   name:'安永（绿色金融）' },
    { code:'KPMGG', name:'毕马威（可持续金融）' },
    { code:'PWCG',  name:'普华永道（ESG）' },
    { code:'DELOG', name:'德勤（气候与可持续）' },
    { code:'CCDC',  name:'中央结算公司' },
    { code:'BIIRC', name:'商道融绿' }
  ];

  // 担保方式
  const guaranteeTypes = [
    { code:'NONE',     name:'无担保（信用债）' },
    { code:'FULL-GAR', name:'全额无条件不可撤销连带责任保证担保' },
    { code:'PART-GAR', name:'部分保证担保' },
    { code:'DIFF-GAR', name:'差额补足' },
    { code:'PLEDGE',   name:'质押担保' },
    { code:'MORTGAGE', name:'抵押担保' },
    { code:'COMBO',    name:'组合担保（保证 + 抵质押）' }
  ];

  /* ============================================================
   * 主体公共信用标签（参考信用中国官方报告标签 + GB/T 45255 + 国发〔2014〕21）
   * 标签来源：① 各部委守信红名单 / 严重失信黑名单 / 经营异常名录
   *           ② 真实数据基线（南京钢铁等已知主体来自实际信用中国报告）
   * ============================================================ */
  const subjectLabels = {
    '南京钢铁联合有限公司':       ['守信激励对象'],     // ✓ 实际信用中国报告 2026-05-04 显示
    '江苏华西集团有限公司':       ['守信激励对象'],     // ✓ 实际信用中国报告 2026-05-05 显示（修正前误标"严重失信"）
    '福禧投资控股有限公司':       ['经营异常', '重点关注'],
    '中国华源集团有限公司':       ['失信被执行人', '失信惩戒对象'],  // ✓ 实际报告 2026-05-05（修正前误标"守信激励"）
    '上海柴油机股份有限公司':     ['守信激励对象'],
    '江苏宁沪高速公路股份有限公司':['守信激励对象'],   // ✓ 实际信用中国 PDF 2026-05-05
    '江西铜业股份有限公司':       ['守信激励对象', '海关高级认证企业'],  // ✓ 实际信用中国 PDF 2026-05-05
    '江苏三房巷集团有限公司':     ['重点关注'],
    '湖南华菱管线股份有限公司':   ['守信激励对象'],
    '江西高速公路投资集团有限公司':['守信激励对象'],
    '招商局港口控股有限公司':     ['守信激励对象'],
    '内蒙古伊利实业集团股份有限公司':['守信激励对象', '重点项目'],
    '广东省广晟控股集团有限公司': ['守信激励对象', '重点项目'],
    /* 6 个补充主体（基于真实信用中国 PDF 2026-05-05）*/
    '深圳市福田产业投资服务有限公司':   ['守信激励对象'],
    '石家庄市供销合作总社安全统筹公司': ['失信惩戒对象', '失信被执行人'],
    '四川齐光建设工程有限公司':         ['失信惩戒对象', '失信被执行人'],
    '四川蜀运恒通建设工程有限公司':     ['失信惩戒对象', '经营异常', '失信被执行人'],
    '望城经开区投资建设集团有限公司':   ['存续'],
    '枣庄市道桥工程有限公司':           ['失信惩戒对象', '失信被执行人']
  };
  // 基于公共信用等级的标签兜底（无映射时按 publicGrade 派生）
  function deriveLabelsByGrade(grade, fuseStatus) {
    if (fuseStatus === 'restricted') return ['严重失信主体'];
    if (fuseStatus === 'warning')    return ['重点关注'];
    if (grade === 'A' || grade === 'A+') return ['守信激励对象'];
    if (grade === 'D')               return ['严重失信主体'];
    return [];
  }
  subjects.forEach(s => {
    s.creditLabels = subjectLabels[s.name] || deriveLabelsByGrade(s.publicGrade, s.fuseStatus);
    // 报告元信息（参照信用中国官方格式）
    s.reportMeta = {
      issuer: '国家公共信用和地理空间信息中心',
      reportNo: (function() {
        const yyyy = new Date().getFullYear();
        const mmdd = String(new Date().getMonth() + 1).padStart(2,'0') + String(new Date().getDate()).padStart(2,'0');
        const tail = (s.uscc || '').slice(-6);
        return `${yyyy}${mmdd}` + tail + 'D' + ((s.uscc || '').slice(0,2) || '00');
      })(),
      reportVersion: 'V2.0',
      reportStandard: '公共信用信息报告标准（2022 年版）',
      verifyAvailable: true
    };
  });

  return {
    currentUser, kpis, todos, alerts, reports, industries, subjects, dataSources,
    attribution, translations, graph, trackingSubscriptions, TRACKING_EVENTS_21, regulatoryStats,
    systemUsers, apis, auditLogs,
    /* 评级业务 */ projects, conflictChecks, CONFLICT_RULES, contracts,
    /* 智能尽调 */ ddChecklist, ddSources, ddFinancial, ddInterviews, ddWorkpapers,
    /* 评级建模 */ methodologies, bacpFactors, bacpComposite, amAdjustments, amTotalDelta,
    externalSupport, fusionMappingRules, gradeDerivation, peers,
    /* 报告审核 */ threeReview, committeeAgenda, committeeMembers, appeals,
    /* 质量合规 */ defaultRates, migrationMatrix, spreads, distribution, complianceRules, terminations,
    /* 工作台 */    committeeAgendaToday, cockpit,
    /* 投资者服务 */investorPubs, investorSubscribers,
    /* 定制化业务 */greenBonds, greenBondStats,
    /* 远东研究 */  industryResearch, researchStats,
    /* 技术与标准 */methodVersions, methodStandards,
    /* P0/P1 补强 */ fieldVisits, disclosureChannels, disclosureChannelsList, eSeals,
    clientFeedback, proofreadingTasks, proofreadingIssues, committeeResolutions, accountManagerLeads,
    /* GB/T 45255-2025 政策落地 */ creditRepairEvents, publicCreditCatalog, eightDimensions,
    /* P0+P1+P1.5 立项字典 */
    subjectKinds, industriesByKind, bondTypesByKind, marketTypes,
    businessTypes, methodologyVersions, greenCatalog2021, greenAssurers, guaranteeTypes,
    /* 12 阶段工作流 */
    STAGE_DEFS, stageToolMap,
    /* 工具方法（暴露供 hydration / project-workbench / project-intake 复用） */
    buildStagesForProject, buildTimelineForProject
  };
})();

/* =====================================================================
 *  跨页持久化层（localStorage）
 *  让用户在 project-intake 创建的项目能在 subject-rating 等其他页面查到
 *  Key: ccascea_user_projects / ccascea_user_subjects
 * ===================================================================== */
(function hydrateFromLocalStorage() {
  // 兜底：保证每个 project 都有 stages / timeline / currentStage（防御性）
  function normalizeProject(p) {
    if (!p) return p;
    if (!p.stages && typeof MockData.buildStagesForProject === 'function') {
      try { p.stages = MockData.buildStagesForProject(p); } catch (e) { p.stages = []; }
    }
    if (!p.timeline && typeof MockData.buildTimelineForProject === 'function') {
      try { p.timeline = MockData.buildTimelineForProject(p); } catch (e) { p.timeline = []; }
    }
    if (!p.currentStage && Array.isArray(p.stages) && p.stages.length) {
      const cur = p.stages.find(s => s.status === 'in-progress');
      p.currentStage = cur ? cur.id : (p.stages.find(s => s.status === 'pending') || {}).id || 'fieldwork';
    }
    // 兜底 team 格式
    if (Array.isArray(p.team) && p.team.length && typeof p.team[0] === 'string') {
      const yearMap = { '王明远':10, '李雨欣':4, '陈秋萍':8, '张志强':12, '周建华':15, '刘俊辉':5 };
      const roleMap = { '王明远':'组长', '李雨欣':'分析师', '陈秋萍':'合规', '张志强':'部门总监', '周建华':'评级总监', '刘俊辉':'数据' };
      p.team = p.team.map(n => ({ name:n, role: roleMap[n] || '分析师', years: yearMap[n] || 5 }));
    }
    return p;
  }

  try {
    const KP = 'ccascea_user_projects';
    const KS = 'ccascea_user_subjects';
    const userProjects = JSON.parse(localStorage.getItem(KP) || '[]');
    const userSubjects = JSON.parse(localStorage.getItem(KS) || '[]');

    // 项目去重前置（按 id），用户新增的放最前
    if (Array.isArray(userProjects) && userProjects.length) {
      const existing = new Set((MockData.projects || []).map(p => p.id));
      for (let i = userProjects.length - 1; i >= 0; i--) {
        const p = normalizeProject(userProjects[i]);
        if (p && p.id && !existing.has(p.id)) {
          MockData.projects.unshift(p);
          existing.add(p.id);
        }
      }
    }
    // 同时对内置 projects 做兜底（防 schema 漂移）
    (MockData.projects || []).forEach(normalizeProject);
    if (Array.isArray(userSubjects) && userSubjects.length) {
      const existing = new Set((MockData.subjects || []).map(s => s.name));
      for (let i = userSubjects.length - 1; i >= 0; i--) {
        const s = userSubjects[i];
        if (s && s.name && !existing.has(s.name)) {
          MockData.subjects.unshift(s);
          existing.add(s.name);
        }
      }
    }
  } catch (err) {
    console.warn('[CCASCEA] hydrate from localStorage failed:', err);
  }

  // 暴露持久化 API 给页面调用
  window.MockDataPersist = {
    saveProject(project) {
      try {
        const KP = 'ccascea_user_projects';
        const list = JSON.parse(localStorage.getItem(KP) || '[]');
        list.unshift(project);
        // 上限 50 条避免无限增长
        if (list.length > 50) list.length = 50;
        localStorage.setItem(KP, JSON.stringify(list));
      } catch (e) { console.warn('[CCASCEA] saveProject failed', e); }
    },
    saveSubject(subject) {
      try {
        const KS = 'ccascea_user_subjects';
        const list = JSON.parse(localStorage.getItem(KS) || '[]');
        // 同名跳过
        if (list.find(s => s.name === subject.name)) return;
        list.unshift(subject);
        if (list.length > 50) list.length = 50;
        localStorage.setItem(KS, JSON.stringify(list));
      } catch (e) { console.warn('[CCASCEA] saveSubject failed', e); }
    },
    clearAll() {
      try {
        localStorage.removeItem('ccascea_user_projects');
        localStorage.removeItem('ccascea_user_subjects');
      } catch (_) {}
    },
    listSavedProjects() {
      try { return JSON.parse(localStorage.getItem('ccascea_user_projects') || '[]'); }
      catch (_) { return []; }
    }
  };
})();
