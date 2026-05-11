"""Read 南京钢铁联合有限公司.pdf credit report into UTF-8 file."""
import io
import fitz
import os

PDF = r'D:\MyAIProject\CompanyCreditAgentNew\materials\南京钢铁联合有限公司.pdf'
OUT = os.path.join(os.path.dirname(__file__), 'njsteel_report.txt')


def main():
    doc = fitz.open(PDF)
    print(f'Pages: {len(doc)}', flush=True)
    parts = []
    image_only_pages = []
    for i, p in enumerate(doc):
        txt = p.get_text() or ''
        if not txt.strip():
            image_only_pages.append(i + 1)
        parts.append(f'\n========== 第 {i+1} 页 ==========\n{txt}')
    with io.open(OUT, 'w', encoding='utf-8') as f:
        f.write('\n'.join(parts))
    print(f'Saved -> {OUT}')
    print(f'Image-only pages (need OCR): {image_only_pages}')


if __name__ == '__main__':
    main()
