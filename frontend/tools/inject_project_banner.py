"""Inject project banner into 6 tool pages (after data-source declaration block)."""
import io, os, re

ROOT = r'D:\MyAIProject\CompanyCreditAgentNew\frontend\pages'
PAGES = [
    'dd-collection.html',
    'dd-interview.html',
    'field-investigation.html',
    'dd-workpaper.html',
    'bacp-scoring.html',
    'am-adjustment.html'
]

BANNER = """    ${(function(){
      const p = (typeof getCurrentProject === 'function') ? getCurrentProject() : null;
      if (!p) {
        return `<div class="bg-warning/10 border border-warning/30 rounded-md px-4 py-3 mb-4 text-sm text-warning flex items-center gap-2">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M12 9v2m0 4h.01m-6.93 1h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 17c-.77 1.33.19 3 1.73 3z"/></svg>
          <strong>未选择项目</strong>：当前数据为通用演示，建议从 <a href="project-intake.html" class="text-brand-600 hover:underline font-medium">"我的项目"</a> 进入指定项目，查看该项目的数据。
        </div>`;
      }
      return `<div class="bg-brand-50/60 border border-brand-200 rounded-md px-4 py-3 mb-4 flex items-center justify-between flex-wrap gap-2">
        <div class="text-sm">
          <span class="text-muted">当前项目：</span>
          <strong class="text-brand-700">${p.subject}</strong>
          <span class="text-xs text-muted ml-2">(${p.id} · ${p.industry || '—'})</span>
        </div>
        <a href="project-workbench.html?projectId=${p.id}" class="text-xs text-brand-600 hover:underline">← 返回项目工作台</a>
      </div>`;
    })()}

"""

# 锚点：数据声明 div 结束的那个 </div> 之后插入 banner
# 数据声明 block 通常以这一行开头：
#   <span><strong class="text-ink">数据声明：</strong>
# 然后在它的 </span></div> 之后插入

ANCHOR_RE = re.compile(
    r'(<span><strong class="text-ink">数据声明：</strong>.*?</span>\s*</div>\s*\n)',
    re.DOTALL
)

ok_cnt = 0
skip_cnt = 0
for fn in PAGES:
    path = os.path.join(ROOT, fn)
    if not os.path.exists(path):
        print(f'[NOT FOUND] {fn}')
        continue
    with io.open(path, encoding='utf-8') as f:
        src = f.read()
    if 'getCurrentProject' in src:
        print(f'[SKIP - already has banner] {fn}')
        skip_cnt += 1
        continue
    new_src, n = ANCHOR_RE.subn(r'\1' + BANNER, src, count=1)
    if n != 1:
        print(f'[ANCHOR NOT FOUND] {fn} - inserting at body start')
        # fallback: insert right after first <body> tag's first content
        new_src = src.replace('function renderMain() {', 'function renderMain() {\n  // FIX: project banner anchor not found, manual placement needed', 1)
        ok_cnt += 0
        continue
    with io.open(path, 'w', encoding='utf-8') as f:
        f.write(new_src)
    print(f'[OK] {fn}')
    ok_cnt += 1

print(f'\n共注入 {ok_cnt} / {len(PAGES)} 个页面（跳过 {skip_cnt} 个已存在的）')
