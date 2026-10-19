"""生成PDFの問題数・目次・タグ漏れを検査し、目視用画像を生成する。"""
import json
import re
import subprocess
import sys
import unicodedata
from html import unescape
from pathlib import Path
import pdfplumber
from pypdf import PdfReader
from PIL import Image, ImageOps, ImageDraw

root = Path(__file__).resolve().parent.parent
work = root / 'tmp/pdfs'
pdf = work / 'textbook.pdf'
reader = PdfReader(pdf)
pages = [p.extract_text() for p in reader.pages]
all_text = '\n'.join(pages)
navigation = json.loads((work / 'navigation.json').read_text(encoding='utf8'))
destinations = {name.lstrip('/'): reader.get_destination_page_number(destination) + 1
                for name, destination in reader.named_destinations.items()}
assert navigation['count'] == len(pages), '組版記録とPDFのページ数が一致しません'
assert navigation['pages'] == destinations, '組版記録とPDFのリンク先が一致しません'
toc = {ident: destinations[ident]
       for ident in [*(f'chapter-{n}' for n in range(9)), 'answers', 'roadmap']}
html = (work / 'textbook-rendered.html').read_text(encoding='utf8')


def compact(value):
    return re.sub(r'\s+', '', unicodedata.normalize('NFKC', value))


def without_footer(text):
    text = unicodedata.normalize('NFKC', text)
    text = re.sub(r'(?m)^アルゴリズム入門[^\S\r\n]*[｜|][^\S\r\n]*\d+[^\S\r\n]*(?:\r?\n|$)', '', text)
    return compact(text)


def html_text(value):
    return unescape(re.sub(r'<[^>]+>', '', value))


def front_section(ident):
    section = re.search(rf'<section\b[^>]*\bid="{re.escape(ident)}"[^>]*>(.*?)</section>', html, re.S)
    assert section, ('表紙まわりのHTMLがありません', ident)
    return section.group(1)


def assert_page_content(fragment, number, label):
    blocks = [html_text(content) for _, content in
              re.findall(r'<(h[1-6]|p|li|td|th|strong|small|span)\b[^>]*>(.*?)</\1>', fragment, re.S)]
    assert blocks, ('検査する内容がありません', label)
    for block in blocks:
        if compact(block):
            assert compact(block) in compact(pages[number - 1]), (label + 'の内容を1ページに収めてください', number, block)


cover = re.search(r'<div class="cover">(.*?)</div>', html, re.S)
assert cover, '表紙のHTMLがありません'
assert_page_content(cover.group(1), 1, '表紙')
book_title = '擬似言語とAIで学ぶアルゴリズム入門'
assert compact(book_title) in compact(pages[0]), '表紙に教材名が必要です'

front_ids = ('course-goals', 'course-overview', 'course-guide')
front_pages = [destinations[ident] for ident in front_ids]
assert front_pages == [2, 3, 4], '目標・概要・教材の使い方を表紙直後に1ページずつ配置してください'
front_html = {ident: front_section(ident) for ident in front_ids}
for ident, number in zip(front_ids, front_pages):
    assert_page_content(front_html[ident], number, ident)
assert sum(len(re.findall(r'class="slide-card"', fragment)) for fragment in front_html.values()) == 2, '目標・概要のスライド枠は各1枚必要です'
for ident in front_ids[:2]:
    assert len(re.findall(r'class="slide-card"', front_html[ident])) == 1, ('スライド枠を1枚配置してください', ident)
goal_list = re.search(r'<ul class="course-goals-list">(.*?)</ul>', front_html['course-goals'], re.S)
assert goal_list, '研修の目標一覧がありません'
course_goals = [html_text(value) for value in re.findall(r'<li(?:\s[^>]*)?>(.*?)</li>', goal_list.group(1), re.S)]
assert len(course_goals) == 5, '研修の目標は5項目必要です'
assert all(compact(pages[front_pages[0] - 1]).count(compact(goal)) == 1 for goal in course_goals), '目標は同じページ内で繰り返さず、補足説明を添えてください'
chapter_list = re.search(r'<ol class="course-chapter-list">(.*?)</ol>', front_html['course-overview'], re.S)
assert chapter_list, '研修の概要の章一覧がありません'
overview_chapters = [compact(html_text(value)) for value in re.findall(r'<li(?:\s[^>]*)?>(.*?)</li>', chapter_list.group(1), re.S)]
assert overview_chapters == [compact(chapter['title']) for chapter in navigation['chapters']], '研修の概要に第0〜8章を順番に掲載してください'
assert all(compact(pages[front_pages[1] - 1]).count(title) == 1 for title in overview_chapters), '概要の章一覧は同じページ内で繰り返さないでください'

colophon_page = destinations['colophon']
assert colophon_page == len(pages) and colophon_page % 2 == 1, '奥付はPDF最終ページかつ奇数ページにしてください'
assert destinations['book-index'] < colophon_page, '索引を奥付より前に配置してください'
assert_page_content(front_section('colophon'), colophon_page, '奥付')
assert compact(book_title) in compact(pages[-1]), '奥付に教材名が必要です'
assert compact('2026年10月19日　第1版　発行') in compact(pages[-1]), '奥付の発行日・版を確認してください'
for number in (1, colophon_page):
    text = compact(pages[number - 1])
    assert 'コースコード' not in text and not re.search(r'(?:PRC0048G|JAC0080G)', text), ('表紙・奥付にコースコードを載せないでください', number)
    assert not re.search(r'アルゴリズム[入⼊][門⾨][｜|]\d+', text), ('表紙・奥付の通常フッターを非表示にしてください', number)


assert len(navigation['chapters']) == len(navigation['blanks']) == 9
blank_pages = []
for chapter, has_blank in zip(navigation['chapters'], navigation['blanks']):
    ident, number = chapter['id'], chapter['number']
    page_number = destinations[ident]
    assert page_number % 2 == 0, ('章開きは偶数ページに配置してください', ident, page_number)
    opener = re.search(rf'<section class="chapter-opening" id="{re.escape(ident)}">(.*?)</section>', html, re.S)
    assert opener, ('章開きのHTMLがありません', ident)
    goals = [unescape(re.sub(r'<[^>]+>', '', value))
             for value in re.findall(r'<li(?:\s[^>]*)?>(.*?)</li>', opener.group(1), re.S)]
    assert len(goals) == 3, ('章の目標は3項目必要です', ident)
    opener_text = compact(pages[page_number - 1])
    assert compact(chapter['title']) in opener_text and '章の目標' in opener_text, ('章開きの見出し', ident)
    assert all(compact(goal) in opener_text for goal in goals), ('章の目標を扉1ページに収めてください', ident)
    body_pages = [page for target, page in destinations.items()
                  if target.startswith(f'section-{number}-') or target.startswith(f'question-{number}-')]
    assert body_pages and min(body_pages) == page_number + 1, ('章本文は扉の次ページから開始してください', ident)
    if has_blank:
        blank_pages.append(page_number - 1)
        assert without_footer(pages[page_number - 2]) == compact('（空白ページ）'), ('調整用の空白ページ', ident)
assert isinstance(navigation['colophonBlank'], bool), '奥付用の空白ページの記録がありません'
if navigation['colophonBlank']:
    blank_pages.append(colophon_page - 1)
    assert without_footer(pages[colophon_page - 2]) == compact('（空白ページ）'), '奥付直前の調整用空白ページを確認してください'
assert [number for number, text in enumerate(pages, 1) if compact('（空白ページ）') in compact(text)] == blank_pages, '必要な調整用空白以外の空白ページがあります'
assert all(without_footer(text) for text in pages), '意図しない白紙ページがあります'

# PDFに印刷された参照数字と、実際にクリックできるリンク先を同時に検査する。
links = []
with pdfplumber.open(pdf) as document:
    for number, (page, rendered) in enumerate(zip(reader.pages, document.pages), 1):
        if (number >= toc['chapter-0'] and number < destinations['book-index']) or number >= colophon_page:
            continue
        for reference in page.get('/Annots', []):
            annotation = reference.get_object()
            destination = annotation.get('/Dest', annotation.get('/A', {}).get('/D'))
            if annotation.get('/Subtype') != '/Link' or not isinstance(destination, str):
                continue
            ident = destination.lstrip('/')
            assert ident in destinations, ('無効なPDFリンク先', number, ident)
            x0, y0, x1, y1 = map(float, annotation['/Rect'])
            top, bottom = rendered.height - y1, rendered.height - y0
            bbox = (max(0, x0 - 1), max(0, top - 1), min(rendered.width, x1 + 1), min(rendered.height, bottom + 1))
            printed = compact(rendered.crop(bbox).extract_text() or '')
            link = {'page': number, 'id': ident, 'text': printed}
            if number >= destinations['book-index']:
                middle = rendered.width / 2
                left, right = (0, middle) if x0 < middle else (middle, rendered.width)
                row = rendered.crop((left, max(0, top - 1), right, min(rendered.height, bottom + 1))).extract_text() or ''
                link['term'] = compact(re.sub(r'[\d\s,、]+$', '', row))
                assert printed.lstrip(',、') == str(destinations[ident]), ('索引の参照数字とリンク先が一致しません', link)
            links.append(link)

toc_links = [link for link in links if link['page'] < toc['chapter-0']]
assert len(navigation['toc']) == 96, '目次には前付け3項目と奥付を含む96項目が必要です'
assert len(toc_links) == len(navigation['toc']), '目次の行数とPDFリンク数が一致しません'
assert all(sum(entry['id'] == ident for entry in navigation['toc']) == 1 for ident in (*front_ids, 'colophon')), '目次に目標・概要・使い方・奥付を1項目ずつ掲載してください'
assert sorted({link['page'] for link in toc_links}) == [5, 6, 7], '目次を前付けの次の3ページに収めてください'
for entry in navigation['toc']:
    matches = [link for link in toc_links if link['id'] == entry['id']]
    assert len(matches) == 1, ('目次リンク', entry)
    expected = compact(entry['label']) + str(destinations[entry['id']])
    assert matches[0]['text'] == expected, ('目次の項目名・ページ番号', entry, matches[0])

index_entries = [entry for group in navigation['index'] for entry in group['entries']]
index_links = [link for link in links if destinations['book-index'] <= link['page'] < colophon_page]
assert len(index_entries) == 67, '索引は67項目必要です'
assert {link['term'] for link in index_links} == {compact(entry['term']) for entry in index_entries}, '索引の項目とPDFの行が一致しません'
for entry in index_entries:
    matches = [link for link in index_links if link['term'] == compact(entry['term'])]
    assert all(link['id'] in entry['refs'] for link in matches), ('索引のリンク先', entry, matches)
    assert {destinations[link['id']] for link in matches} == {destinations[ident] for ident in entry['refs']}, ('索引の参照ページ', entry, matches)
    assert len({link['page'] for link in matches}) == 1, ('索引の1項目を改ページで分割しないでください', entry)
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
report = []
for number, text in enumerate(pages, 1):
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
print(json.dumps({'pages': len(pages), 'toc': toc, 'chapter_openings': [toc[f'chapter-{n}'] for n in range(9)],
                  'blank_pages': blank_pages, 'toc_entries': len(navigation['toc']), 'index_entries': len(index_entries),
                  'front_pages': dict(zip(front_ids, front_pages)), 'colophon_page': colophon_page,
                  'split_answer_figures': [p['page'] for p in report if p['flows'] and not p['answers']]}, ensure_ascii=False))

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
