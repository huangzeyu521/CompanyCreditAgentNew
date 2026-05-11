/* =====================================================================
 *  CCASCEA · AI 助手（双增强）
 *    1) 思考过程可视化：流式 SSE + 6 步标准化思考链 + 兜底节流推进
 *    2) 内置专业 System Prompt（12 场景）
 *  接口：DashScope OpenAI 兼容协议（chat/completions, stream=true, SSE）
 *  公开方法：
 *    AIAgent.open()       打开右侧抽屉
 *    AIAgent.close()      关闭抽屉
 *    AIAgent.toggle()     切换
 *    AIAgent.setScene(k)  切换场景 key
 *    AIAgent.send(input,context)  发送一次问询
 *    AIAgent.invoke(opts) 程序化调用（不打开抽屉，回调式 API）
 * ===================================================================== */
window.AIAgent = (function () {

  /* ------------ 状态 ------------ */
  const state = {
    sceneKey: 'kb-rag',     // 默认通用知识库 RAG
    isOpen: false,
    busy: false,
    abortCtrl: null,
    history: [],            // 会话上下文 (用户与助手 messages)
    sessionLog: []          // 调用日志（最近 N 次）
  };

  /* ------------ DOM 引用（懒加载） ------------ */
  let drawerEl = null;       // 内部仍命名 drawerEl 以保持公共 API 兼容（实际为 modal）
  let maskEl   = null;
  let outputEl = null;
  let stepsEl  = null;
  let inputEl  = null;
  let sceneSelectEl = null;

  /* ------------ 入口：弹窗构建 ------------ */
  function ensureDrawer() {
    if (drawerEl) return drawerEl;

    // 遮罩
    maskEl = document.createElement('div');
    maskEl.className = 'ai-mask';
    maskEl.addEventListener('click', close);
    document.body.appendChild(maskEl);

    drawerEl = document.createElement('div');
    drawerEl.className = 'ai-modal';
    drawerEl.setAttribute('role', 'dialog');
    drawerEl.setAttribute('aria-modal', 'true');
    drawerEl.setAttribute('aria-label', 'CCASCEA AI 智能助手');
    drawerEl.innerHTML = renderModalHTML();
    document.body.appendChild(drawerEl);

    outputEl       = drawerEl.querySelector('#ai-output');
    stepsEl        = drawerEl.querySelector('#ai-steps');
    inputEl        = drawerEl.querySelector('#ai-input');
    sceneSelectEl  = drawerEl.querySelector('#ai-scene');

    drawerEl.querySelector('#ai-close').addEventListener('click', close);
    drawerEl.querySelector('#ai-clear').addEventListener('click', clearAll);
    drawerEl.querySelector('#ai-copy').addEventListener('click', copyOutput);
    drawerEl.querySelector('#ai-bottom').addEventListener('click', scrollToBottom);
    drawerEl.querySelector('#ai-send').addEventListener('click', () => sendFromUI());
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) sendFromUI();
    });
    sceneSelectEl.addEventListener('change', () => setScene(sceneSelectEl.value));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.isOpen) close();
    });

    return drawerEl;
  }

  function renderModalHTML() {
    const scenes = (window.Prompts && window.Prompts.SCENES) || [];
    const steps  = (window.Prompts && window.Prompts.THINKING_STEPS) || [];
    const opts = scenes.map(s =>
      `<option value="${s.key}" ${s.key === state.sceneKey ? 'selected' : ''}>${s.label}</option>`
    ).join('');
    const stepsHtml = steps.map(st => `
      <div class="ai-step" data-step="${st.id}">
        <div class="ai-step-dot">${st.id}</div>
        <div class="ai-step-body">
          <div class="ai-step-label">${st.label}</div>
          <div class="ai-step-desc">${st.desc}</div>
        </div>
      </div>
    `).join('');

    return `
      <header class="ai-modal-header">
        <div class="ai-modal-avatar">AI</div>
        <div class="ai-modal-title">
          <div class="ai-modal-title-main">CCASCEA 智能助手</div>
          <div class="ai-modal-title-sub">
            <span class="ai-tag">qwen3-max-preview</span>
            <span>双轨融合 · 6 步可视化思考链 · 17 场景内置提示词工程</span>
          </div>
        </div>
        <button id="ai-clear" class="ai-modal-header-btn" title="清空会话">清空</button>
        <button id="ai-close" class="ai-modal-close" aria-label="关闭">&times;</button>
      </header>

      <div class="ai-modal-scene">
        <label>场景</label>
        <select id="ai-scene">${opts}</select>
      </div>

      <div class="ai-modal-body">
        <aside class="ai-thinking-pane">
          <div class="ai-thinking-title">思考链 · 6 步</div>
          <div id="ai-steps" class="ai-step-list">${stepsHtml}</div>
          <div class="ai-progress-block">
            <div class="ai-progress-label">
              <span>整体进度</span>
              <span class="num"><span id="ai-progress-val">0%</span></span>
            </div>
            <div class="ai-progress-track"><div id="ai-progress-bar" class="ai-progress-bar"></div></div>
          </div>
        </aside>

        <div class="ai-output-wrap">
          <div id="ai-output" class="ai-output-pane prose-ai">
            <div style="color:#94A3B8; font-size:13px; line-height:1.8;">
              👋 您好，我是 <strong style="color:#1F497D">CCASCEA 智能助手</strong>。<br><br>
              请在底部输入问题，或在上方下拉框切换专业场景。我会按"解析任务 → 匹配方法学 → 拉取公共信用 → 跨域翻译 → 合规核查 → 生成结论"<strong>6 步思考链</strong>实时输出，并在左侧同步显示推理进度。
            </div>
          </div>
          <div class="ai-status-bar">
            <span id="ai-status">就绪</span>
            <div class="ai-tools">
              <button id="ai-bottom" title="跳到结尾">↓ 底部</button>
              <button id="ai-copy" title="复制输出">复制</button>
            </div>
          </div>
        </div>
      </div>

      <div class="ai-modal-footer">
        <div class="ai-input-row">
          <textarea id="ai-input" rows="2" placeholder="输入您的问题，例如：请基于当前主体快照给出 3 条评级建议..."></textarea>
          <button id="ai-send" class="ai-send-btn">
            <span>发送</span>
            <span style="font-size:14px">→</span>
          </button>
        </div>
        <div class="ai-input-hint">Ctrl/Cmd + Enter 快速发送 · Esc 关闭对话框 · 点击外部遮罩关闭</div>
      </div>
    `;
  }

  function copyOutput() {
    if (!outputEl) return;
    const text = (outputEl.innerText || '').trim();
    if (!text) { window.toast && toast('暂无内容可复制', 'warning'); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => window.toast && toast('已复制 ' + text.length + ' 字到剪贴板', 'success'),
        () => fallbackCopy(text)
      );
    } else {
      fallbackCopy(text);
    }
  }
  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); window.toast && toast('已复制', 'success'); }
    catch (_) { window.toast && toast('复制失败', 'warning'); }
    document.body.removeChild(ta);
  }

  function scrollToBottom() {
    if (!outputEl) return;
    outputEl.scrollTop = outputEl.scrollHeight;
  }

  /* ------------ 弹窗控制 ------------ */
  function open() {
    ensureDrawer();
    requestAnimationFrame(() => {
      drawerEl.classList.add('open');
      if (maskEl) maskEl.classList.add('open');
      document.body.classList.add('ai-modal-locked');
    });
    state.isOpen = true;
  }
  function close() {
    if (drawerEl) drawerEl.classList.remove('open');
    if (maskEl) maskEl.classList.remove('open');
    document.body.classList.remove('ai-modal-locked');
    state.isOpen = false;
  }
  function toggle() { state.isOpen ? close() : open(); }

  /* ------------ 场景控制 ------------ */
  function setScene(key) {
    state.sceneKey = key;
    if (sceneSelectEl) sceneSelectEl.value = key;
    setStatus('已切换到场景：' + ((window.Prompts.SCENES.find(s => s.key === key) || {}).label || key));
  }

  /* ------------ 思考步骤 UI ------------ */
  function setStep(stepId, status /* active|done|pending */) {
    if (!stepsEl) return;
    const els = stepsEl.querySelectorAll('.ai-step');
    els.forEach(el => {
      const id = parseInt(el.dataset.step);
      el.classList.remove('active', 'done');
      if (id < stepId) el.classList.add('done');
      else if (id === stepId) el.classList.add(status === 'done' ? 'done' : 'active');
    });
    const total = els.length || 6;
    const ratio = Math.min(1, stepId / total);
    const bar = document.getElementById('ai-progress-bar');
    const val = document.getElementById('ai-progress-val');
    if (bar) bar.style.width = (ratio * 100).toFixed(0) + '%';
    if (val) val.textContent = (ratio * 100).toFixed(0) + '%';
  }
  function resetSteps() {
    setStep(0, 'pending');
  }

  function setStatus(msg) {
    const el = document.getElementById('ai-status');
    if (el) el.textContent = msg;
  }
  function appendOutput(chunk) {
    if (!outputEl) return;
    // 首次输出清掉欢迎语
    if (outputEl.dataset.empty !== 'no') {
      outputEl.innerHTML = '';
      outputEl.dataset.empty = 'no';
    }
    // 仅当用户已在底部 80px 内才自动滚动，避免打断用户阅读上文
    const nearBottom = (outputEl.scrollHeight - outputEl.scrollTop - outputEl.clientHeight) < 80;
    const span = document.createElement('span');
    span.textContent = chunk;
    outputEl.appendChild(span);
    if (nearBottom) outputEl.scrollTop = outputEl.scrollHeight;
  }
  function setOutput(html) {
    if (!outputEl) return;
    outputEl.innerHTML = html;
    outputEl.dataset.empty = 'yes';
  }
  function clearAll() {
    if (!outputEl) return;
    outputEl.innerHTML = '<div style="color:#94A3B8; font-size:13px; line-height:1.8;">✓ 会话已清空。请重新提问。</div>';
    outputEl.dataset.empty = 'yes';
    state.history = [];
    resetSteps();
    setStatus('就绪');
  }

  /* ------------ 调用核心 ------------ */
  /**
   * 程序化调用（带回调），可直接被页面在抽屉外使用
   * @param {Object} opts
   * @param {string} opts.scene  场景 key
   * @param {string} opts.userInput  用户输入
   * @param {string} [opts.context]  额外上下文（如所选主体的快照）
   * @param {(stepId:number)=>void} [opts.onPhase]
   * @param {(text:string)=>void} [opts.onDelta]
   * @param {(full:string)=>void} [opts.onDone]
   * @param {(err:Error)=>void} [opts.onError]
   * @returns {()=>void} 取消函数
   */
  function invoke(opts) {
    const scene = opts.scene || state.sceneKey;
    const messages = window.Prompts.buildMessages(scene, opts.userInput || '', opts.context || '');
    const cfg = window.AppConfig.llm;

    // DLP 关键词拦截
    const dlp = (window.AppConfig.privacy.dlpBlocklist || []);
    const userText = (opts.userInput || '') + ' ' + (opts.context || '');
    for (const w of dlp) {
      if (w && userText.includes(w)) {
        const err = new Error('DLP 拦截：检测到敏感关键词 "' + w + '"，本次调用已阻断');
        if (opts.onError) opts.onError(err);
        return () => {};
      }
    }
    if (!cfg.apiKey) {
      const err = new Error('未配置 API key（AppConfig.llm.apiKey）');
      if (opts.onError) opts.onError(err);
      return () => {};
    }

    // 思考链：兜底节流——若模型不输出 [STEP-X] 标记，则按时间推进
    let currentStep = 0;
    const fallbackMs = window.AppConfig.privacy.thinkingFallbackStepMs || 1800;
    const fallbackTimer = setInterval(() => {
      if (currentStep < 5) {
        currentStep += 1;
        if (opts.onPhase) opts.onPhase(currentStep);
      }
    }, fallbackMs);

    // STEP 标记解析（出现 [STEP-N] 时立即推进到 N）
    function parseStepMarkers(chunk) {
      const re = /\[STEP-(\d)\b/g;
      let m;
      while ((m = re.exec(chunk)) !== null) {
        const n = parseInt(m[1]);
        if (n > currentStep && n <= 6) {
          currentStep = n;
          if (opts.onPhase) opts.onPhase(currentStep);
        }
      }
    }

    let fullText = '';
    let retried = 0;
    const ctrl = new AbortController();
    state.abortCtrl = ctrl;

    async function run() {
      try {
        const body = {
          model: cfg.model,
          messages,
          stream: true,
          temperature: cfg.temperature,
          top_p: cfg.topP,
          max_tokens: cfg.maxTokens
        };
        const resp = await fetch(cfg.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + cfg.apiKey,
            'Accept': 'text/event-stream'
          },
          body: JSON.stringify(body),
          signal: ctrl.signal
        });
        if (!resp.ok) {
          const txt = await resp.text();
          throw new Error('HTTP ' + resp.status + ': ' + txt.slice(0, 300));
        }
        if (!resp.body) throw new Error('当前浏览器不支持流式响应');

        const reader = resp.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buf = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          // 按 \n\n 切 SSE 帧
          let idx;
          while ((idx = buf.indexOf('\n\n')) !== -1) {
            const frame = buf.slice(0, idx);
            buf = buf.slice(idx + 2);
            for (const line of frame.split('\n')) {
              const t = line.trim();
              if (!t.startsWith('data:')) continue;
              const payload = t.slice(5).trim();
              if (!payload) continue;
              if (payload === '[DONE]') continue;
              try {
                const obj = JSON.parse(payload);
                const delta = obj?.choices?.[0]?.delta?.content
                          ||  obj?.choices?.[0]?.message?.content
                          ||  '';
                if (delta) {
                  fullText += delta;
                  parseStepMarkers(delta);
                  if (opts.onDelta) opts.onDelta(delta);
                }
              } catch (e) {
                // ignore JSON parse glitch
              }
            }
          }
        }

        clearInterval(fallbackTimer);
        if (currentStep < 6) {
          currentStep = 6;
          if (opts.onPhase) opts.onPhase(6);
        }
        if (opts.onDone) opts.onDone(fullText);
        recordLog({ scene, ok: true, len: fullText.length, ts: Date.now() });
      } catch (err) {
        clearInterval(fallbackTimer);
        if (err.name === 'AbortError') {
          if (opts.onError) opts.onError(new Error('已取消'));
          return;
        }
        if (retried < cfg.retryTimes) {
          retried++;
          await sleep(cfg.retryDelayMs);
          return run();
        }
        if (opts.onError) opts.onError(err);
        recordLog({ scene, ok: false, err: String(err && err.message), ts: Date.now() });
      }
    }
    run();
    return () => { try { ctrl.abort(); } catch (_) {} clearInterval(fallbackTimer); };
  }

  /* ------------ UI 发送 ------------ */
  function sendFromUI() {
    if (state.busy) {
      toast('请等待当前任务完成', 'warning');
      return;
    }
    const text = (inputEl.value || '').trim();
    if (!text) {
      toast('请输入内容', 'warning');
      return;
    }
    inputEl.value = '';
    send(text);
  }

  function send(userInput, context) {
    open();
    state.busy = true;
    setOutput('');
    resetSteps();
    setStep(1, 'active');
    // 发送即立即显示进度提示（用户友好性增强）
    const sceneLabel = (window.Prompts.SCENES.find(s => s.key === state.sceneKey) || {}).label || state.sceneKey;
    setStatus('已发送 → 已激活场景：' + sceneLabel + ' · 思考中...');
    if (outputEl) {
      const safeInput = (userInput || '').slice(0, 120) + (userInput && userInput.length > 120 ? '…' : '');
      outputEl.innerHTML =
        '<div style="border:1px solid #BFDBFE; background:linear-gradient(135deg,#EFF6FF,#FFFFFF); border-radius:12px; padding:16px 18px;">' +
          '<div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">' +
            '<span style="display:inline-block; width:8px; height:8px; border-radius:999px; background:#16A34A; box-shadow:0 0 0 3px rgba(22,163,74,.2); animation: aiPulseDot 1.4s infinite;"></span>' +
            '<strong style="font-size:13px; color:#1F497D;">qwen3-max-preview 已接收任务</strong>' +
          '</div>' +
          '<div style="font-size:12px; color:#475569; line-height:1.7;">' +
            '<div><span style="color:#94A3B8;">场景：</span><strong style="color:#1F497D;">' + sceneLabel + '</strong></div>' +
            '<div style="margin-top:4px;"><span style="color:#94A3B8;">输入：</span>' + safeInput + '</div>' +
            (context ? '<div style="margin-top:4px;"><span style="color:#94A3B8;">上下文：</span>已注入业务数据 <strong>' + context.length + '</strong> 字符</div>' : '') +
            '<div style="margin-top:10px; padding-top:10px; border-top:1px dashed #BFDBFE; color:#0F766E;">⚙️ 正在按 6 步思考链分阶段流式输出，请稍候…</div>' +
          '</div>' +
        '</div>';
      outputEl.dataset.empty = 'yes';
    }
    // 醒目 toast 提示
    toast('🤖 AI 正在为您思考（场景：' + sceneLabel + '）', 'info', 2500);

    const startTs = Date.now();
    let firstDeltaReceived = false;
    const cancel = invoke({
      scene: state.sceneKey,
      userInput,
      context,
      onPhase: (n) => {
        setStep(n, n === 6 ? 'done' : 'active');
        const stepLabel = (window.Prompts.THINKING_STEPS[n - 1] || {}).label || ('步骤 ' + n);
        setStatus(`正在执行：[STEP-${n}] ${stepLabel}`);
      },
      onDelta: (delta) => {
        if (!firstDeltaReceived) {
          firstDeltaReceived = true;
          // 首字节响应 → 清空"已接收"提示，开始流式输出
          if (outputEl) outputEl.innerHTML = '';
          const ttft = ((Date.now() - startTs) / 1000).toFixed(1);
          setStatus('首字节响应 ' + ttft + 's · 流式输出中...');
        }
        appendOutput(delta);
      },
      onDone: (full) => {
        state.busy = false;
        setStep(6, 'done');
        const total = ((Date.now() - startTs) / 1000).toFixed(1);
        setStatus('✓ 完成 · 总耗时 ' + total + 's · 输出 ' + full.length + ' 字');
        toast('🎯 AI 已完成（' + total + 's，' + full.length + ' 字）', 'success', 3000);
      },
      onError: (err) => {
        state.busy = false;
        setStatus('✗ 失败：' + err.message);
        appendOutput('\n\n[错误] ' + err.message);
        toast('AI 调用失败：' + err.message, 'danger', 4000);
      }
    });
    state.abortCtrl = { abort: cancel };
  }

  /* ------------ 工具 ------------ */
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
  function recordLog(entry) {
    state.sessionLog.push(entry);
    const max = (window.AppConfig.privacy.sessionLogMax) || 200;
    if (state.sessionLog.length > max) state.sessionLog.shift();
  }

  /* ------------ 公开 API ------------ */
  return {
    open, close, toggle, setScene, send, invoke,
    isOpen: () => state.isOpen,
    history: () => state.history.slice(),
    log:     () => state.sessionLog.slice()
  };
})();
