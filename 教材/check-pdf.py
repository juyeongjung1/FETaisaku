"""生成PDFの問題数・目次・タグ漏れを検査し、目視用画像を生成する。"""
import json
import re
import subprocess
import sys
from pathlib import Path
from pypdf import PdfReader
from PIL import Image, ImageOps, ImageDraw

root = Path(__file__).resolve().parent.parent
work = root / 'tmp/pdfs'
pdf = work / 'textbook.pdf'
reader = PdfReader(pdf)
pages = [p.extract_text() for p in reader.pages]
all_text = '\n'.join(pages)
assert not re.search(r'<\s*/?\s*(span|strong|small|div|p|br)\b', all_text)
assert '初稿' not in all_text
assert len(re.findall(r'正解：[アイウエ]', all_text)) == 14, '4択問題の正解記号は14問分必要です'
toc = {}
report = []
for number, text in enumerate(pages, 1):
    compact = re.sub(r'\s+', '', text)
    for chapter in range(9):
        heading = re.search(rf'^第{chapter}章[\s　]+[^\n]*', text, re.M)
        if heading and len(re.findall(r'第\d章', text)) == 1:
            toc.setdefault(f'chapter-{chapter}', number)
    if compact.startswith('解答・解説'):
        toc.setdefault('answers', number)
    if compact.startswith('研修後の学習ロードマップ'):
        toc.setdefault('roadmap', number)
    report.append({'page': number, 'characters': len(text), 'head': text[:100],
                   'answers': re.findall(r'演習(\d-[A-F])\s*解答・解説', text),
                   'flows': re.findall(r'演習(\d-[A-F])のフローチャート', text)})
for chapter in range(1, 9):
    for letter in 'ABCDEF':
        ident = f'{chapter}-{letter}'
        assert sum(ident in p['answers'] for p in report) == 1, ('解説', ident)
        assert sum(ident in p['flows'] for p in report) == 1, ('図', ident)
assert len(toc) == 11, toc
choice_questions = 0
for text in pages[:toc['answers'] - 1]:
    if '演習1-E' in text or '演習1-F' in text:
        continue
    count = re.sub(r'\s+', '', text).count('難易度★★★')
    if count:
        assert len(re.findall(r'^[アイウエ](?=\s)', text, re.M)) == 4 * count, '問題と4つの選択肢を同じページに配置してください'
        choice_questions += count
assert choice_questions == 14, '選択式★★★は14問必要です'
(work / 'toc.json').write_text(json.dumps(toc, ensure_ascii=False, indent=2), encoding='utf8')
(work / 'qa.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf8')
(work / 'extracted.txt').write_text(all_text, encoding='utf8')
print(json.dumps({'pages': len(pages), 'toc': toc, 'split_answer_figures': [p['page'] for p in report if p['flows'] and not p['answers']]}, ensure_ascii=False))

if '--render' in sys.argv:
    poppler = Path(sys.argv[sys.argv.index('--render') + 1])
    images = work / 'qa-pages'
    images.mkdir(exist_ok=True)
    subprocess.run([str(poppler), '-scale-to', '700', '-png', str(pdf), str(images / 'p')], check=True)
    files = sorted(images.glob('p-*.png'))[:len(pages)]
    for group in range(0, len(files), 16):
        sheet = Image.new('RGB', (1200, 1760), '#cdd3db')
        for offset, file in enumerate(files[group:group+16]):
            img = Image.open(file).convert('RGB')
            img.thumbnail((286, 410))
            x, y = offset % 4 * 300, offset // 4 * 440
            sheet.paste(img, (x+7, y+22))
            ImageDraw.Draw(sheet).text((x+12,y+4), str(group+offset+1), fill='black')
        sheet.save(work / f'montage-{group//16+1}.jpg', quality=90)
