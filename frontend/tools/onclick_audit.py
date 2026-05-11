"""Audit all onclick handlers across pages."""
import re, os, sys, io

# 强制 stdout 用 utf-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

all_files = []
for f in os.listdir('frontend/pages'):
    if not f.endswith('.html'):
        continue
    with open('frontend/pages/'+f, encoding='utf-8') as fp:
        src = fp.read()
    onclicks = set(re.findall(r'onclick="([a-zA-Z_$][\w$]*)\(', src))
    defined = set(re.findall(r'function\s+([a-zA-Z_$][\w$]*)\s*\(', src))
    all_files.append((f, onclicks, defined))

GLOBALS = set()
for j in ['common.js','layout.js','ai-agent.js','prompts.js']:
    p = f'frontend/assets/js/{j}'
    if not os.path.exists(p):
        continue
    with open(p, encoding='utf-8') as fp:
        s = fp.read()
    GLOBALS |= set(re.findall(r'window\.([a-zA-Z_$][\w$]*)\s*=', s))
    GLOBALS |= set(re.findall(r'function\s+([a-zA-Z_$][\w$]*)\s*\(', s))

BUILTIN = {
    'alert','confirm','prompt','closeModal','openModal','toast','confirmDialog',
    'history','location','window','event','console','setTimeout','setInterval',
    'AIAgent','MockData','MockDataPersist','toggleSidebarGroup','mountLayout',
    'getCurrentProject','buildProjectContextBar','renderInlineView','selectStage',
    'gradeBadge','publicGradeBadge','fmtNum','renderStepIndicator'
}

missing_per_file = []
for f, used, defined in all_files:
    avail = defined | GLOBALS | BUILTIN
    missing = used - avail
    if missing:
        missing_per_file.append((f, sorted(missing)))

if missing_per_file:
    print(f'WARNING: {len(missing_per_file)} pages have undefined onclick handlers:')
    for f, m in missing_per_file[:30]:
        print(f'  {f}: {m}')
else:
    print('OK: all onclick handlers defined')
