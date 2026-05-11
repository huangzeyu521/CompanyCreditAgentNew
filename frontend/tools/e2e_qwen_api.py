"""
CCASCEA · 真实 API E2E 验证
直接调用 qwen3-max-preview 的 SSE 流式接口，
验证：
  1. API 联通性（HTTPS + 认证）
  2. SSE 流式响应可被正常解析
  3. 模型遵守 [STEP-N] 思考链标记规范
  4. 模型在不同场景下能注入业务数据并给出可执行结论
"""
import json
import time
import sys
import urllib.request
import urllib.error

API_KEY = 'sk-c3eb88a1b7734b1f95b1df957b120dde'
ENDPOINT = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
MODEL = 'qwen3-max-preview'

# 与 prompts.js 一致的核心思考链注入
CORE_INJECTION = """
你的输出必须严格按以下 6 步思考链进行，并且**必须**用 [STEP-1]..[STEP-6] 标记每一步开头：
[STEP-1] 解析任务（摘取用户意图与边界）
[STEP-2] 匹配方法学/制度（远东评级方法学 + 公司制度）
[STEP-3] 拉取公共信用（GB/T 45255-2025 八大维度）
[STEP-4] 跨域翻译/打分（PD/LGD 映射）
[STEP-5] 合规与红线核查（D 级熔断 + 三级审核）
[STEP-6] 生成结论与溯源（最终建议 + 引用清单）
"""

# 测试用例 1：BACP 评分智能解读（带业务上下文）
CASE_BACP = {
    'scene': 'BACP 评分智能解读',
    'system': '你是远东资信评级师助手，精通 BACP 三层方法学。' + CORE_INJECTION,
    'user': '请解读以下 BACP 评分明细并给出 3 项可执行的优化建议：\n'
            '· 经营模式 78（基准 P50=72）\n'
            '· 行业地位 82（基准 P75=80）\n'
            '· 公司治理 65（基准 P50=70，低于基准）\n'
            '· 财务质量 71（基准 P50=70）\n'
            '主体：南京钢铁联合有限公司（USCC: 91320100250571846X，钢铁行业，中诚信 AA+）\n'
            '请按 6 步思考链给出综合解读 + 优化建议。'
}

# 测试用例 2：跨域风险翻译
CASE_TRANSLATE = {
    'scene': '跨域风险翻译',
    'system': '你是远东资信评级师助手。' + CORE_INJECTION,
    'user': '主体：广州天河制造（演示样例）。'
            '其公共信用八大维度中，"行政管理"维度本季度新增 2 起一般行政处罚（合计扣 5 分）。'
            '请按"GB/T 45255-2025 → PD/LGD"翻译规则，量化对该主体内部评级 PD 的边际影响，'
            '并判断是否触发 D 级熔断红线。'
}


# 测试用例 3：立项阶段（验证刚升级的弱提示词页面）
CASE_INTAKE = {
    'scene': '立项阶段合规建议',
    'system': '你是远东资信评级师助手。' + CORE_INJECTION,
    'user': '当前在办项目（节选）：\n'
            '· PJ-2026-018 · 南京钢铁联合有限公司 · 阶段=立项 · 评级师=未分派 · 利冲状态=未筛查\n'
            '· PJ-2026-019 · 江苏华西集团 · 阶段=立项 · 评级师=张明 · 利冲状态=已筛查\n'
            '请按"立项 6 大动作 + 项目组组建合规校验 + 利冲风险预警"三段式给出建议，'
            '引用《信用评级业务程序指引》第十二至十五条。'
}

# 测试用例 4：绿色债券（验证刚升级的弱提示词页面）
CASE_GREEN_BOND = {
    'scene': '绿色债券组合认证建议',
    'system': '你是远东资信绿色金融专家。' + CORE_INJECTION,
    'user': '当前绿色债券（节选）：\n'
            '· GB-2026-007 · 国家电投 · 募投=陆上风电 · 当前认证=待评 · 募集 25 亿\n'
            '· GB-2026-008 · 中铁建 · 募投=城际轨道 · 当前认证=G-2 · 募集 80 亿\n'
            '请按 GBP 2021 / CBI v3.1 / 人行绿色目录(2021版)，逐单建议 G-1/G-2/G-3 等级，'
            '并识别 3 个最易触发"洗绿"质疑的共性风险点。'
}


def call_sse(case, max_wait_sec=60):
    """调用 SSE 流式接口并解析。返回 (full_text, step_markers, ttft, total_time)。"""
    body = json.dumps({
        'model': MODEL,
        'stream': True,
        'temperature': 0.3,
        'top_p': 0.9,
        'max_tokens': 1500,
        'messages': [
            {'role': 'system', 'content': case['system']},
            {'role': 'user', 'content': case['user']}
        ]
    }).encode('utf-8')

    req = urllib.request.Request(
        ENDPOINT,
        data=body,
        headers={
            'Authorization': 'Bearer ' + API_KEY,
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream'
        },
        method='POST'
    )

    full_text = ''
    step_markers = []
    start_ts = time.time()
    ttft = None

    try:
        with urllib.request.urlopen(req, timeout=max_wait_sec) as resp:
            buf = b''
            for raw in resp:
                buf += raw
                while b'\n\n' in buf:
                    frame, buf = buf.split(b'\n\n', 1)
                    for line in frame.decode('utf-8', errors='ignore').split('\n'):
                        line = line.strip()
                        if not line.startswith('data:'):
                            continue
                        payload = line[5:].strip()
                        if not payload or payload == '[DONE]':
                            continue
                        try:
                            obj = json.loads(payload)
                        except json.JSONDecodeError:
                            continue
                        choices = obj.get('choices') or []
                        if not choices:
                            continue
                        delta = choices[0].get('delta') or {}
                        chunk = delta.get('content') or ''
                        if chunk:
                            if ttft is None:
                                ttft = time.time() - start_ts
                            full_text += chunk
        total_time = time.time() - start_ts
        # 解析整段文本里所有 [STEP-N] 标记，避免 SSE 跨帧分裂导致的漏检
        for n in range(1, 7):
            if '[STEP-{}'.format(n) in full_text and n not in step_markers:
                step_markers.append(n)
        return full_text, sorted(step_markers), ttft, total_time
    except urllib.error.HTTPError as e:
        body_text = e.read().decode('utf-8', errors='ignore')[:500]
        raise RuntimeError('HTTP {}: {}'.format(e.code, body_text))


def run_case(case):
    print('=' * 80)
    print('场景：{}'.format(case['scene']))
    print('System：{} 字符 / User：{} 字符'.format(len(case['system']), len(case['user'])))
    print('-' * 80)
    try:
        text, steps, ttft, total = call_sse(case)
    except Exception as e:
        print('[FAIL] {}'.format(e))
        return False

    pass_ttft = ttft is not None and ttft < 10
    pass_len = len(text) >= 200
    pass_steps = len(steps) >= 4

    print('TTFT  : {:.2f}s    {}'.format(ttft or -1, 'PASS' if pass_ttft else 'FAIL (>10s)'))
    print('Total : {:.2f}s'.format(total))
    print('Length: {} chars  {}'.format(len(text), 'PASS' if pass_len else 'FAIL (<200)'))
    print('Steps : {}/6 命中 {}     {}'.format(len(steps), steps, 'PASS' if pass_steps else 'FAIL (<4)'))
    print('-' * 80)
    print('输出预览（前 600 字符）：')
    print(text[:600] + ('...' if len(text) > 600 else ''))
    print('=' * 80)
    return pass_ttft and pass_len and pass_steps


def main():
    print('CCASCEA · qwen3-max-preview 真实 API E2E 验证')
    print('Endpoint: {}'.format(ENDPOINT))
    print('Model   : {}'.format(MODEL))
    print()
    results = []
    for case in [CASE_BACP, CASE_TRANSLATE, CASE_INTAKE, CASE_GREEN_BOND]:
        results.append(run_case(case))
        print()
    passed = sum(1 for r in results if r)
    print('=' * 80)
    print('总结：{} / {} 用例通过'.format(passed, len(results)))
    print('=' * 80)
    sys.exit(0 if passed == len(results) else 1)


if __name__ == '__main__':
    main()
