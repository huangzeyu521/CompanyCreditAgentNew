"""Extract first-page titles from sfecr PDFs to build a navigable index."""
import os
import subprocess
import json
import sys

ROOT = r'D:\MyAIProject\CompanyCreditAgentNew\materials\sfecr'

TARGETS = [
    '业务制度',
    '内控制度',
    '主体评级方法与模型',
    '产品评级方法与模型',
    '注册申请文件（2025年度信息更新）',
    '政策法规',
    '合规运行报告',
    '质量检验报告',
    '信息披露',
]


def extract_first_page_text(path):
    """Extract first page text via pdftotext."""
    try:
        out = subprocess.run(
            ['pdftotext', '-f', '1', '-l', '1', '-layout', path, '-'],
            capture_output=True, timeout=15, text=False
        )
        if out.returncode != 0:
            return ''
        # try utf-8, then gbk
        for enc in ('utf-8', 'gbk', 'gb18030'):
            try:
                return out.stdout.decode(enc)
            except UnicodeDecodeError:
                continue
        return out.stdout.decode('utf-8', errors='ignore')
    except Exception as e:
        return f'[ERR: {e}]'


def first_meaningful_lines(text, n=8):
    lines = []
    for raw in text.split('\n'):
        s = raw.strip()
        if not s:
            continue
        # skip page-number-only lines
        if s.isdigit():
            continue
        # skip very short noise
        if len(s) < 2:
            continue
        lines.append(s)
        if len(lines) >= n:
            break
    return lines


def index_folder(folder_name):
    folder = os.path.join(ROOT, folder_name)
    if not os.path.isdir(folder):
        return []
    out = []
    for fn in sorted(os.listdir(folder)):
        if not fn.lower().endswith('.pdf'):
            continue
        path = os.path.join(folder, fn)
        txt = extract_first_page_text(path)
        lines = first_meaningful_lines(txt)
        out.append({
            'file': fn,
            'first_lines': lines
        })
    return out


def main():
    target = sys.argv[1] if len(sys.argv) > 1 else None
    result = {}
    for f in TARGETS:
        if target and target not in f:
            continue
        print(f'>>> {f}', flush=True)
        items = index_folder(f)
        result[f] = items
        for it in items:
            title = it['first_lines'][0] if it['first_lines'] else '(empty)'
            print(f"  {it['file']:<32} | {title[:60]}")
    out_path = os.path.join(os.path.dirname(__file__), 'sfecr_index.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print(f'\n✓ saved → {out_path}')


if __name__ == '__main__':
    main()
