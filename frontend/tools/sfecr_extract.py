"""Extract titles from sfecr PDFs using pdfplumber, write to UTF-8 file (avoid console mojibake)."""
import os
import sys
import json
import pdfplumber
import io

ROOT = r'D:\MyAIProject\CompanyCreditAgentNew\materials\sfecr'

TARGETS = [
    '业务制度',
    '内控制度',
    '主体评级方法与模型',
    '产品评级方法与模型',
    '注册申请文件（2025年度信息更新）',
    '政策法规',
]


def first_page_text(path):
    try:
        with pdfplumber.open(path) as pdf:
            if not pdf.pages:
                return ''
            txt = pdf.pages[0].extract_text() or ''
            return txt
    except Exception as e:
        return f'[ERR: {e}]'


def first_n_meaningful(text, n=10):
    out = []
    for raw in text.split('\n'):
        s = raw.strip()
        if not s or s.isdigit() or len(s) < 2:
            continue
        out.append(s)
        if len(out) >= n:
            break
    return out


def main():
    target_filter = sys.argv[1] if len(sys.argv) > 1 else None
    out_path = os.path.join(os.path.dirname(__file__), 'sfecr_titles.txt')
    json_path = os.path.join(os.path.dirname(__file__), 'sfecr_titles.json')
    summary = {}

    with io.open(out_path, 'w', encoding='utf-8') as f:
        for folder in TARGETS:
            if target_filter and target_filter not in folder:
                continue
            full = os.path.join(ROOT, folder)
            if not os.path.isdir(full):
                continue
            f.write('\n' + '=' * 100 + '\n')
            f.write(f'文件夹：{folder}\n')
            f.write('=' * 100 + '\n')
            entries = []
            for fn in sorted(os.listdir(full)):
                if not fn.lower().endswith('.pdf'):
                    continue
                path = os.path.join(full, fn)
                txt = first_page_text(path)
                lines = first_n_meaningful(txt)
                title = lines[0] if lines else '(empty)'
                f.write(f'\n[{fn}]\n')
                for ln in lines[:6]:
                    f.write(f'  {ln}\n')
                entries.append({'file': fn, 'title': title, 'lines': lines})
            summary[folder] = entries

    with io.open(json_path, 'w', encoding='utf-8') as jf:
        json.dump(summary, jf, ensure_ascii=False, indent=2)

    print(f'OK saved -> {out_path}')
    print(f'OK saved -> {json_path}')


if __name__ == '__main__':
    main()
