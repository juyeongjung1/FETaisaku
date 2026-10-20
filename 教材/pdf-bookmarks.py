"""本文の見出しを保ちながら、配布PDFのブックマークを整理する。"""
import json
import sys
from pathlib import Path
from pypdf import PdfReader, PdfWriter
from pypdf.generic import Fit, NameObject

pdf = Path(sys.argv[1])
navigation = json.loads(Path(sys.argv[2]).read_text(encoding='utf8'))
pages = navigation['pages']
reader = PdfReader(pdf)
writer = PdfWriter()
writer.clone_document_from_reader(reader)
writer.root_object.pop(NameObject('/Outlines'), None)


def add(destination, parent=None, title=None):
    return writer.add_outline_item(
        title or destination.title,
        reader.get_destination_page_number(destination),
        parent=parent,
        fit=Fit(destination.typ, destination.dest_array[2:]),
        is_open=title == 'はじめに',
    )


def add_children(items, parent):
    current = parent
    for item in items:
        if isinstance(item, list):
            add_children(item, current)
        else:
            current = add(item, parent)


front_pages = {pages[ident] for ident in ('course-goals', 'course-overview', 'course-guide')}
introduction = None
current = None
for item in reader.outline:
    if isinstance(item, list):
        if current is not None:
            add_children(item, current)
        continue
    number = reader.get_destination_page_number(item) + 1
    current = None
    if number in (1, pages['colophon']):
        continue
    if number in front_pages:
        if introduction is None:
            introduction = add(item, title='はじめに')
        current = add(item, introduction)
    elif ''.join(item.title.split()).startswith('目次') and number < pages['chapter-0']:
        if '続き' not in item.title:
            current = add(item, title='目次')
    else:
        title = '参考資料' if number == pages['references'] else None
        current = add(item, title=title)

with pdf.open('wb') as stream:
    writer.write(stream)
print('ブックマーク：前付け3項目を「はじめに」にまとめ、表紙・奥付・目次の続き項目を除外。')
