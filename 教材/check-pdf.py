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
assert not re.search(r'(?<!\*)\*\*(?!\*)', all_text), '太字の記法が本文に露出しています'
compact_text = re.sub(r'\s+', '', all_text)
for label in ('分かっていること：', '試したこと：', '分からないこと：'):
    assert compact_text.count(label) == 51, ('第0章・全48問・第7章補足・巻末の質問例', label)
    assert '**'+label not in compact_text, ('太字の記法が本文に露出しています', label)
assert '表を添付' not in compact_text, '質問例に表の添付指示が残っています'
assert 'この問題の変数は整数型です' not in compact_text, '変数の宣言を説明文で代用しないでください'
assert '問題4-Aについて質問です' in compact_text
assert 'xmod2＝0」で合っていますか' not in compact_text
assert '空欄①に入る条件式を答えてください' in compact_text
assert 'age≧12andhasTicket＝1' in compact_text
assert compact_text.count('解答欄の項目') == 48, '全48問に解答欄と対応する解答表が必要です'
assert all(re.sub(r'\s+', '', term) in compact_text for term in ('5.2 繰返しの基本構文', 'while：条件が成り立つ間、繰り返す', 'for：回数や範囲が決まっている繰返し', '5.3 繰返しで解く定番の課題', '合計用の変数を繰返しの中で初期化しない'))
assert 'ホワイル' not in compact_text and 'while（ワイル）' in compact_text
assert '回数の目安' not in compact_text, '削除した抽象的な回数の補足が残っています'
assert '初心者の取り組' not in compact_text, '削除した章別の取り組み順が残っています'
assert all(term in compact_text for term in ('5.3.1正しい入力', '5.3.2合計を求める', '5.3.3件数を数える', '5.3.4合計から平均を求める', '5.4.1.1iとjが変わる順を確かめる'))
assert '繰返しもひし形' not in compact_text and 'ループ端（上下一組）' in compact_text
assert compact_text.count('問題：') == 29, '説明用コード全29例の課題が必要です'
assert compact_text.count('このコードの課題：') == 42, '演習のコード全42例の課題が必要です'
assert len(re.findall(r'^表示結果(?:（確認用の入力）)?\s*$', all_text, re.M)) == 34, '説明用20枠・演習14枠の表示結果が必要です'
assert compact_text.count('トレース表（記入用）') == 2, '記入用の表は7-Bと8-Cに配置します'
assert 'トレース表を自分で書くためのヒントがほしいです' in compact_text, '第7章のAI例に表を書くためのヒントを求める内容が必要です'
assert '6.4の最大値' not in compact_text and '6.4のコード' not in compact_text, '最大値の節番号が古いままです'
assert len(re.findall(r'正解：[アイウエ]', all_text)) == 12, '4択問題の正解記号は12問分必要です'
choice_ids = re.findall(r'<div class="choice-table" data-exercise="(\d-[A-F])">', (root / '教材/科目B_擬似言語とAIで学ぶアルゴリズム入門.md').read_text(encoding='utf8'))
assert len(choice_ids) == len(set(choice_ids)) == 12, '選択式は12問必要です'
assert 'class="trace-worksheet"' not in (root / '教材/科目B_擬似言語とAIで学ぶアルゴリズム入門.md').read_text(encoding='utf8'), '記入表は問題内のコード直後へ配置してください'
assert len(re.findall(r'^問題を解く前の確認欄\s*$', all_text, re.M)) == 6, '第8章の各問題に確認欄が必要です'
toc = {}
report = []
for number, text in enumerate(pages, 1):
    compact = re.sub(r'\s+', '', text)
    for chapter in range(9):
        heading = re.search(rf'^第{chapter}章[\s　]+[^\n]*', text, re.M)
        if heading and len(re.findall(r'^第\d章[\s　]+[^\n]*', text, re.M)) == 1:
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
        answer_page = next(p['page'] for p in report if ident in p['answers'])
        flow_page = next(p['page'] for p in report if ident in p['flows'])
        assert answer_page == flow_page, ('解説と図を同じページに配置してください', ident)
        assert '解答欄の項目' in pages[answer_page-1] and re.search(r'^解説\s*$', pages[answer_page-1], re.M), ('解答と解説を分けて同じページに配置してください', ident)
assert len(toc) == 11, toc
assert all('トレース' not in text for text in pages[toc['chapter-0']-1:toc['chapter-7']-1]), 'トレースの説明は第7章で初めて導入してください'
assert all('公開問題への接続' not in text or item['answers'] for text, item in zip(pages, report)), '公開問題への参照を解説と同じページに配置してください'
for chapter in range(1, 9):
    for letter in 'ABCDEF':
        ident = f'{chapter}-{letter}'
        question_pages = [text for text in pages[:toc['answers'] - 1]
                          if re.search(rf'演習{ident}[ 　]', text)]
        assert len(question_pages) == 1, ('問題見出し', ident)
        response_text = question_pages[0]
        if ident == '8-C':
            question_page = pages.index(question_pages[0])
            response_text = pages[question_page+1]
            assert '8-Cの続き｜選択肢と解答欄' in re.sub(r'\s+', '', response_text), '8-Cの選択肢は問題の直後のページへ続けてください'
            assert 'トレース表（記入用）' in question_pages[0], '8-Cのコードと記入表を同じページに配置してください'
            layout_text = reader.pages[question_page].extract_text(extraction_mode='layout')
            assert layout_text.rfind('endfor') < layout_text.index('トレース表（記入用）'), '8-Cの表をコードの後に配置してください'
            assert 'トレース表（記入用）' not in response_text, '8-Cの表は選択肢より前へ配置してください'
        assert f'問題{ident}について質問です' in re.sub(r'\s+', '', response_text), ('問題とAIへの質問例を同じページに配置してください（8-Cは直後の続きページ）', ident)
        if chapter == 8:
            assert '問題を解く前の確認欄' in question_pages[0], ('第8章は各問題に確認欄を配置してください', ident)
        if ident in choice_ids:
            assert len(re.findall(r'^[アイウエ](?=\s)', response_text, re.M)) == 4, ('問題と4つの選択肢を同じページに配置してください（8-Cは直後の続きページ）', ident)
        if ident == '7-B':
            assert 'トレース表（記入用）' in question_pages[0], '7-Bの問題と記入表を同じページに配置してください'
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
