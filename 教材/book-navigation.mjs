import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import indexGroups from './book-index.mjs';

const goals = [
  ['自分の考えと疑問点を整理して、AIに質問できる。', 'AIの返答を教材と照らし合わせ、自分で確かめられる。', '入力する情報に気を付けながら、復習や類題にAIを使える。'],
  ['アルゴリズムを、目的を達成するための手順として説明できる。', '擬似言語の役割と、基本的な記号の意味が分かる。', '順次・選択・繰返しの三つの基本構造を見分けられる。'],
  ['変数・データ型・初期化の役割を説明できる。', '代入の前後で、変数の値がどう変わるかを確かめられる。', '一時的に値を保存して、二つの変数の値を交換できる。'],
  ['処理を上から順に実行し、計算の結果を求められる。', '入力・処理・出力を分けて、プログラムの役割を整理できる。', '必要な値が用意される順に、処理を並べられる。'],
  ['条件の真偽によって、実行する処理を選べる。', '比較演算子と論理演算子を使って、条件を読み取れる。', '境界の値を確かめて、処理の分かれ方を説明できる。'],
  ['whileとforの書き方と、繰り返す範囲を読み取れる。', '初期化・継続条件・更新の役割を説明できる。', '合計・件数・平均の計算や、二重ループの動きを確かめられる。'],
  ['配列の位置と値を区別して、要素を読み取れる。', '繰返しを使って、配列の要素を順に調べられる。', '配列の合計・最大値・最初に一致する位置を求められる。'],
  ['処理を実行する順に、変数の値を表へ記録できる。', '条件の判定と、実行する行・しない行を区別できる。', 'トレース表を使って、自分の解答やAIの説明を確かめられる。'],
  ['変数・選択・繰返し・配列を組み合わせた処理を読み取れる。', '問題に必要な値や条件を整理し、トレースで確かめられる。', '求めた結果と、選んだ解答の理由を説明できる。'],
];

export async function prepareNavigation(page) {
  return page.evaluate(({goals, indexGroups})=>{
    const make=(tag, className, text)=>{
      const node=document.createElement(tag);node.className=className;
      if(text!==undefined) node.textContent=text;
      return node;
    };
    const headings=[...document.querySelectorAll('h1,h2,h3,h4')];
    for(const h of headings) {
      const number=h.textContent.match(/^(\d+(?:\.\d+)+)\s/);
      if(number) h.id='section-'+number[1].replaceAll('.','-');
      const question=h.textContent.match(/^演習(\d-[A-F])\s/);
      if(question) h.id=(h.closest('.answer-section')?'answer-':'question-')+question[1];
    }
    const special={'解説のフローチャートの読み方':'flow-guide', '関数へ値を渡して結果を受け取る':'function-guide', '難しい探索問題は、前提を学んでから取り組む':'search-guide', '参考資料':'references'};
    for(const [text,id] of Object.entries(special)) {
      const h=headings.find(h=>h.textContent===text);
      if(!h) throw new Error('参照先の見出しがありません：'+text);
      h.id=id;
    }
    const chapters=[];
    for(let n=0;n<=8;n++) {
      const anchor=document.getElementById('chapter-'+n);
      const anchorBlock=anchor.parentElement.tagName==='P'?anchor.parentElement:anchor;
      const heading=anchorBlock.nextElementSibling;
      if(anchorBlock.previousElementSibling?.classList.contains('page-break')) anchorBlock.previousElementSibling.remove();
      const opener=make('section','chapter-opening');opener.id=anchor.id;
      const title=heading.textContent;
      anchorBlock.replaceWith(opener);
      opener.append(make('div','chapter-number',n));
      opener.append(heading);
      const aim=make('div','chapter-goals');aim.append(make('h2','','章の目標'));
      const list=make('ul','');for(const goal of goals[n]) list.append(make('li','',goal));
      aim.append(list);opener.append(aim);
      chapters.push({id:opener.id,title,number:n});
    }
    const chapterList=document.querySelector('.course-chapter-list');
    chapterList.replaceChildren(...chapters.map(chapter=>make('li','',chapter.title)));
    const toc=document.getElementById('book-toc');
    const tocEntries=[];
    const row=(id,label,level)=>{
      if(!document.getElementById(id)) throw new Error('参照先がありません：'+id);
      const a=make('a','navigation-row level-'+level);a.href='#'+id;
      a.append(make('span','entry-label',label),make('span','entry-leader',''),make('b','page-reference','000'));
      tocEntries.push({id,label});return a;
    };
    for(let part=0;part<3;part++) {
      const sheet=make('section','toc-page');sheet.id='contents-'+(part+1);
      sheet.append(make('h1','navigation-title',part===0?'目　次':'目次（続き）'));
      if(part===0) {
        const introduction=make('div','toc-group');
        for(const id of ['course-goals','course-overview','course-guide'])
          introduction.append(row(id,document.getElementById(id).querySelector('h1').textContent,1));
        sheet.append(introduction);
      }
      for(const chapter of chapters.slice(part*3,part*3+3)) {
        const group=make('div','toc-group');
        group.append(row(chapter.id,chapter.title,0));
        for(const h of headings.filter(h=>['H2','H3'].includes(h.tagName)&&h.id.startsWith('section-'+chapter.number+'-')))
          group.append(row(h.id,h.textContent,h.tagName==='H2'?1:2));
        if(chapter.number) group.append(row('question-'+chapter.number+'-A',`演習問題（${chapter.number}-A〜${chapter.number}-F）`,1));
        sheet.append(group);
      }
      if(part===2) {
        const group=make('div','toc-group');group.append(row('answers','解答・解説',0));
        for(let n=1;n<=8;n++) group.append(row('answer-'+n+'-A',`第${n}章の解答・解説`,1));
        sheet.append(group);
        for(const [id,title] of [['roadmap','研修後の学習ロードマップ'],['references','参考資料']])
          sheet.append(row(id,title,0));
      }
      toc.append(sheet);
    }
    const index=make('section','book-index');index.id='book-index';
    index.append(make('h1','navigation-title','索　引'));
    index.append(make('p','index-note','用語を説明しているページを示しています。'));
    const columns=make('div','index-columns');
    for(const group of indexGroups) {
      const section=make('section','index-group');section.append(make('h2','',group.heading));
      for(const entry of group.entries) {
        const line=make('div','index-row');line.append(make('span','entry-label',entry.term),make('span','entry-leader',''));
        const refs=make('span','index-references');
        for(const id of entry.refs) {
          if(!document.getElementById(id)) throw new Error('索引の参照先がありません：'+entry.term+' / '+id);
          const a=make('a','page-reference','000');a.href='#'+id;refs.append(a);
        }
        line.append(refs);section.append(line);
      }
      columns.append(section);
    }
    index.append(columns);document.getElementById('colophon').before(index);
    toc.lastElementChild.append(row('book-index','索引',0));
    toc.lastElementChild.append(row('colophon','奥付',0));
    return {toc:tocEntries,index:indexGroups,chapters};
  },{goals,indexGroups});
}

export async function paginateNavigation(page,options,root,temp,navigation) {
  const pdf=path.join(temp,'textbook.pdf');
  const blanks=Array(9).fill(false);
  let previous='',result,colophonBlank=false;
  // 章扉・奥付の偶奇と参照ページが変わらなくなるまで組版し直す。
  for(let pass=1;pass<=6;pass++) {
    await page.pdf({...options,path:pdf});
    result=JSON.parse(execFileSync(process.env.FE_PYTHON||'python',[path.join(root,'pdf-page-map.py'),pdf],{encoding:'utf8'}));
    const pages=result.pages;
    const references=[...navigation.toc.map(entry=>entry.id),...navigation.index.flatMap(group=>group.entries.flatMap(entry=>entry.refs))];
    for(const id of references) assert(pages[id],id+'のPDFリンク先がありません');
    let shift=0;
    const desired=blanks.map((wasBlank,n)=>{
      const withoutBlank=pages['chapter-'+n]+shift-Number(wasBlank);
      const needsBlank=withoutBlank%2===1;
      shift+=Number(needsBlank)-Number(wasBlank);return needsBlank;
    });
    const needsColophonBlank=(pages.colophon+shift-Number(colophonBlank))%2===0;
    const signature=JSON.stringify({pages,blanks:desired,colophonBlank:needsColophonBlank});
    console.log(`組版${pass}回目：${result.count}ページ、章開き ${navigation.chapters.map(ch=>pages[ch.id]).join(' / ')}`);
    if(signature===previous&&blanks.every((blank,n)=>blank===desired[n])&&colophonBlank===needsColophonBlank) {
      assert(navigation.chapters.every(ch=>pages[ch.id]%2===0),'章開きを偶数ページにしてください');
      assert(pages.colophon===result.count&&pages.colophon%2===1,'奥付を最終の奇数ページにしてください');
      return {...navigation,...result,blanks,colophonBlank};
    }
    previous=signature;blanks.splice(0,blanks.length,...desired);colophonBlank=needsColophonBlank;
    await page.evaluate(({pages,blanks,colophonBlank})=>{
      for(const b of document.querySelectorAll('.navigation-row .page-reference')) b.textContent=pages[b.parentElement.hash.slice(1)];
      for(const refs of document.querySelectorAll('.index-references')) {
        const seen=new Set();
        for(const a of refs.children) {
          const number=pages[a.hash.slice(1)];a.textContent=number;a.hidden=seen.has(number);seen.add(number);
        }
      }
      for(let n=0;n<=8;n++) {
        const opener=document.getElementById('chapter-'+n),old=document.getElementById('blank-before-'+n);
        if(blanks[n]&&!old) {
          const blank=document.createElement('div');blank.id='blank-before-'+n;blank.className='parity-blank';
          const label=document.createElement('p');label.textContent='（空白ページ）';blank.append(label);opener.before(blank);
        } else if(!blanks[n]&&old) old.remove();
      }
      const colophon=document.getElementById('colophon'),old=document.getElementById('blank-before-colophon');
      if(colophonBlank&&!old) {
        const blank=document.createElement('div');blank.id='blank-before-colophon';blank.className='parity-blank';
        const label=document.createElement('p');label.textContent='（空白ページ）';blank.append(label);colophon.before(blank);
      } else if(!colophonBlank&&old) old.remove();
    },{pages,blanks,colophonBlank});
  }
  throw new Error('章開き・目次・索引のページ番号が収束しませんでした。');
}
