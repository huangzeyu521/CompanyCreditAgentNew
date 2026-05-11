"""Read full content of named PDFs and save to UTF-8 text files."""
import os
import sys
import io
import pdfplumber

ROOT = r'D:\MyAIProject\CompanyCreditAgentNew\materials\sfecr'
OUT_DIR = os.path.dirname(__file__)


def read_pdf(path):
    parts = []
    try:
        with pdfplumber.open(path) as pdf:
            for i, page in enumerate(pdf.pages):
                t = page.extract_text() or ''
                parts.append(f'\n----- 第 {i+1} 页 -----\n{t}')
    except Exception as e:
        parts.append(f'[ERR: {e}]')
    return '\n'.join(parts)


def main():
    # args: [folder relative path] [pdf filename] [output stem]
    rel_folder = sys.argv[1]
    pdf_name = sys.argv[2]
    stem = sys.argv[3]
    src = os.path.join(ROOT, rel_folder, pdf_name)
    if not os.path.exists(src):
        print(f'NOT FOUND: {src}')
        sys.exit(1)
    txt = read_pdf(src)
    out = os.path.join(OUT_DIR, f'sfecr_{stem}.txt')
    with io.open(out, 'w', encoding='utf-8') as f:
        f.write(f'源文件：{src}\n')
        f.write('=' * 80 + '\n')
        f.write(txt)
    print(f'OK saved -> {out}  ({len(txt)} chars)')


if __name__ == '__main__':
    main()
