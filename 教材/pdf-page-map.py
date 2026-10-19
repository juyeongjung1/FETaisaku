"""ブラウザーが出力したPDFのリンク先から、実ページ番号を取得する。"""
import json
import sys
from pypdf import PdfReader

reader = PdfReader(sys.argv[1])
pages = {name.lstrip('/'): reader.get_destination_page_number(destination) + 1
         for name, destination in reader.named_destinations.items()}
print(json.dumps({'pages': pages, 'count': len(reader.pages)}, ensure_ascii=False))
