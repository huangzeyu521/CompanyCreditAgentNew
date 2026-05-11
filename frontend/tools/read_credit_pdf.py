"""Read 信用中国 PDF reports into UTF-8 files."""
import io, os, sys, fitz

PDFS = [
    (r'D:\MyAIProject\CompanyCreditAgentNew\materials\江苏华西集团有限公司.pdf', 'huaxi_report.txt'),
    (r'D:\MyAIProject\CompanyCreditAgentNew\materials\中国华源集团有限公司.pdf', 'huayuan_report.txt')
]
OUT_DIR = os.path.dirname(__file__)


for pdf_path, out_name in PDFS:
    if not os.path.exists(pdf_path):
        print(f'NOT FOUND: {pdf_path}')
        continue
    doc = fitz.open(pdf_path)
    image_only = []
    parts = []
    for i, p in enumerate(doc):
        txt = p.get_text() or ''
        if not txt.strip():
            image_only.append(i + 1)
        parts.append(f'\n========== 第 {i+1} 页 ==========\n{txt}')
    out = os.path.join(OUT_DIR, out_name)
    with io.open(out, 'w', encoding='utf-8') as f:
        f.write('\n'.join(parts))
    print(f'{os.path.basename(pdf_path)}: {len(doc)} pages, image-only: {image_only}, saved -> {out_name}')
    doc.close()
