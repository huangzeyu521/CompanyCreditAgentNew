"""Extract remaining 6 信用中国 PDFs."""
import io, os, fitz

PDFS = [
    (r'D:\MyAIProject\CompanyCreditAgentNew\materials\深圳市福田产业投资服务有限公司.pdf', 'futian.txt'),
    (r'D:\MyAIProject\CompanyCreditAgentNew\materials\石家庄市供销合作总社安全统筹公司.pdf', 'shijiazhuang.txt'),
    (r'D:\MyAIProject\CompanyCreditAgentNew\materials\四川齐光建设工程有限公司.pdf', 'sichuanqg.txt'),
    (r'D:\MyAIProject\CompanyCreditAgentNew\materials\四川蜀运恒通建设工程有限公司.pdf', 'sichuanshy.txt'),
    (r'D:\MyAIProject\CompanyCreditAgentNew\materials\望城经开区投资建设集团有限公司.pdf', 'wangcheng.txt'),
    (r'D:\MyAIProject\CompanyCreditAgentNew\materials\枣庄市道桥工程有限公司.pdf', 'zaozhuang.txt')
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
        parts.append(f'\n=== Page {i+1} ===\n{txt}')
    out = os.path.join(OUT_DIR, out_name)
    with io.open(out, 'w', encoding='utf-8') as f:
        f.write('\n'.join(parts))
    print(f'{os.path.basename(pdf_path)}: {len(doc)} pages, image-only: {image_only} -> {out_name}')
    doc.close()
