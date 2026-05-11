"""OCR a scanned PDF using qwen-vl-max via DashScope OpenAI-compatible API.
We render PDF pages to images, base64 them, and ask the model to extract Chinese text.
"""
import os
import sys
import io
import base64
import json
import urllib.request
import fitz

API_KEY = 'sk-c3eb88a1b7734b1f95b1df957b120dde'
ENDPOINT = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
# Try qwen-vl-max which supports vision
MODEL = 'qwen-vl-max'


def render_pages(pdf_path, max_pages=6, dpi=150, start=0):
    """Render N pages starting from index `start` to PNG bytes."""
    doc = fitz.open(pdf_path)
    n = min(max_pages, len(doc) - start)
    out = []
    for i in range(start, start + n):
        pg = doc[i]
        mat = fitz.Matrix(dpi/72, dpi/72)
        pix = pg.get_pixmap(matrix=mat)
        png_bytes = pix.tobytes('png')
        out.append(png_bytes)
    doc.close()
    return out


def ocr_via_api(png_bytes_list, prompt):
    content = [{'type': 'text', 'text': prompt}]
    for b in png_bytes_list:
        b64 = base64.b64encode(b).decode('ascii')
        content.append({
            'type': 'image_url',
            'image_url': {'url': 'data:image/png;base64,' + b64}
        })
    body = json.dumps({
        'model': MODEL,
        'messages': [{'role': 'user', 'content': content}],
        'temperature': 0.1,
        'max_tokens': 3000
    }).encode('utf-8')

    req = urllib.request.Request(
        ENDPOINT, data=body,
        headers={
            'Authorization': 'Bearer ' + API_KEY,
            'Content-Type': 'application/json'
        },
        method='POST'
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return data['choices'][0]['message']['content']
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='ignore')[:1000]
        return f'[HTTP {e.code}] {body}'
    except Exception as e:
        return f'[ERR] {e}'


def main():
    pdf_path = sys.argv[1]
    pages = int(sys.argv[2]) if len(sys.argv) > 2 else 6
    out = sys.argv[3] if len(sys.argv) > 3 else 'ocr_output.txt'
    start = int(sys.argv[4]) if len(sys.argv) > 4 else 0

    print(f'Rendering {pages} pages from {pdf_path} starting at {start}...')
    images = render_pages(pdf_path, max_pages=pages, dpi=70, start=start)
    print(f'Rendered {len(images)} pages, total {sum(len(b) for b in images)/1024:.1f} KB')

    prompt = (
        '请逐页OCR提取以下评级报告 PDF 扫描页中的中文文字内容，按页输出。'
        '重点提取：标题、债券名称、发行人、评级结果、评级时间、评级观点、'
        '主要数据指标（注册资本、总资产、负债率、营业收入、净利润等）、'
        '债券期限、发行规模、票面利率、担保方式、募集资金用途、跟踪评级安排。'
        '保留原文的数字与单位，输出为纯文本。'
    )
    result = ocr_via_api(images, prompt)
    with io.open(os.path.join(os.path.dirname(__file__), out), 'w', encoding='utf-8') as f:
        f.write(result)
    print(f'OK saved -> {out}  ({len(result)} chars)')


if __name__ == '__main__':
    main()
