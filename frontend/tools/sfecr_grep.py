"""Grep across all sfecr PDFs (text-extractable ones) for a keyword."""
import os
import sys
import io
import pdfplumber

ROOT = r'D:\MyAIProject\CompanyCreditAgentNew\materials\sfecr'

def main():
    keyword = sys.argv[1] if len(sys.argv) > 1 else '西安航空'
    out_path = os.path.join(os.path.dirname(__file__), 'sfecr_grep_result.txt')
    hits = []

    for root, dirs, files in os.walk(ROOT):
        for fn in files:
            if not fn.lower().endswith('.pdf'):
                continue
            full = os.path.join(root, fn)
            # Skip large files for first pass (>5MB)
            try:
                if os.path.getsize(full) > 8 * 1024 * 1024:
                    continue
                with pdfplumber.open(full) as pdf:
                    pages_with_hit = []
                    for i, page in enumerate(pdf.pages):
                        t = page.extract_text() or ''
                        if keyword in t:
                            # Capture context
                            idx = t.find(keyword)
                            start = max(0, idx - 100)
                            end = min(len(t), idx + 300)
                            pages_with_hit.append((i+1, t[start:end].replace('\n', ' / ')))
                            if len(pages_with_hit) >= 3:
                                break
                    if pages_with_hit:
                        rel = os.path.relpath(full, ROOT)
                        hits.append((rel, pages_with_hit))
                        print(f'HIT: {rel}', flush=True)
            except Exception as e:
                pass

    with io.open(out_path, 'w', encoding='utf-8') as f:
        f.write(f'关键词：{keyword}\n')
        f.write(f'命中文件：{len(hits)} 份\n\n')
        for rel, pages in hits:
            f.write('=' * 100 + '\n')
            f.write(f'{rel}\n')
            f.write('=' * 100 + '\n')
            for pg, ctx in pages:
                f.write(f'  [P{pg}] {ctx}\n')
            f.write('\n')
    print(f'\nOK saved -> {out_path}')


if __name__ == '__main__':
    main()
