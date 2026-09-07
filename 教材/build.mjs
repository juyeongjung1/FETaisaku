import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import exercises from './exercises.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const modules = process.env.FE_NODE_MODULES;
if (!modules) throw new Error('FE_NODE_MODULESにNodeのnode_modulesを指定してください。');
const {instance} = await import(pathToFileURL(path.join(modules,'@viz-js/viz/dist/viz.js')));
const {marked} = await import(pathToFileURL(path.join(modules,'marked/lib/marked.esm.js')));
const {chromium} = await import(pathToFileURL(path.join(modules,'playwright/index.mjs')));
const viz = await instance();
const title = '科目B_擬似言語とAIで学ぶアルゴリズム入門';
const source = path.join(root,`${title}.md`);
const temp = path.resolve(root,'../tmp/pdfs');
await fs.mkdir(temp,{recursive:true});
await fs.mkdir(path.join(root,'images/flowcharts'),{recursive:true});
const escape = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');

function code(steps,depth=0) {
  return steps.flatMap(s => {
    const pad='  '.repeat(depth);
    if(typeof s==='string') return pad+s;
    if(s.variable) return [pad+`for (${s.variable} を ${s.from} から ${s.to} まで 1 ずつ増やす)`,...code(s.body,depth+1),pad+'endfor'];
    if(s.while) return [pad+`while (${s.while})`,...code(s.body,depth+1),pad+'endwhile'];
    return [pad+`if (${s.test})`,...code(s.yes,depth+1),...(s.no.length?[pad+'else',...code(s.no,depth+1)]:[]),pad+'endif'];
  });
}

// 本教材の限定した擬似言語のみを実行する検算器。入力はリポジトリの演習データに限定。
function run(item,input=item.input||{}) {
  const env=structuredClone(input), history=[], output=[];
  let text='', guard=0;
  const snapshot=label=>history.push({label,values:structuredClone(env)});
  const expr=s=>String(s).replace(/([A-Za-z]+)の要素数/g,'$1.length')
    .replace(/([A-Za-z]+)\[([^\]]+)\]/g,'$1[($2)-1]')
    .replaceAll('＋','+').replaceAll('−','-').replaceAll('×','*').replaceAll('÷','/')
    .replaceAll('≧','>=').replaceAll('≦','<=').replaceAll('≠','!==').replaceAll('＝','===').replaceAll('＞','>').replaceAll('＜','<')
    .replace(/\bmod\b/g,'%').replace(/\band\b/g,'&&').replace(/\bor\b/g,'||');
  const value=s=>{const keys=Object.keys(env).filter(k=>/^[A-Za-z]+$/.test(k));return Function(...keys,`return (${expr(s)});`)(...keys.map(k=>env[k]));};
  const execute=steps=>{
    for(const s of steps) {
      if(++guard>2000) throw new Error(`${item.id}:停止しません`);
      if(typeof s==='string') {
        if(s.includes(' ← ')) {
          const [lhs,rhs]=s.split(' ← '); const v=value(rhs);
          const a=lhs.match(/^(\w+)\[(.+)\]$/);
          if(a) {const n=value(a[2]);assert(n>=1&&n<=env[a[1]].length);env[a[1]][n-1]=v;}
          else env[lhs]=v;
          snapshot(s);
        } else if(s.startsWith('表示する(')) output.push(value(s.slice(5,-1)));
        else if(s.startsWith('横に表示する(')) text+=value(s.slice(7,-1));
        else if(s==='改行する()') text+='\n';
        else if(/^処理[①②]$/.test(s)) env[s]=(env[s]||0)+1;
        else throw new Error(`未対応: ${s}`);
      } else if(s.variable) {
        const end=value(s.to);
        for(env[s.variable]=value(s.from);env[s.variable]<=end;env[s.variable]++) {execute(s.body);snapshot(`${s.variable}＝${env[s.variable]}の回を終了`);}
      } else if(s.while) {
        while(value(s.while)) {execute(s.body);snapshot('繰返し一回分を終了');}
      } else execute(value(s.test)?s.yes:s.no);
    }
  };
  execute(item.steps);
  return {env,history,output,text};
}
function verify(item,input,expected) {
  const result=run(item,input);
  for(const [k,v] of Object.entries(expected)) assert.deepEqual(k==='$output'?result.output:k==='$text'?result.text:result.env[k],v,`${item.id}: ${k}`);
  return result;
}
let tests=0;
for(let chapter=1;chapter<=8;chapter++) for(let level=1;level<=3;level++)
  assert.equal(exercises.filter(e=>e.id.startsWith(chapter+'-')&&e.level===level).length,2);
for(const item of exercises) if(!item.natural) {
  verify(item,item.input||{},item.expected);tests++;
  for(const [input,expected] of item.cases||[]) {verify(item,input,expected);tests++;}
}
console.log(`演習48問・各章各難易度2問を確認。検算${tests}ケース成功。`);

// 順次を一つの箱にまとめ、分岐・ループは独立した節点で表現する。
function graph(item) {
  let n=0;const nodes=[],edges=[];
  const node=(label,shape='box')=>{
    const id='n'+n++;
    label=label.replaceAll(' and ','\nand ');
    const width=Math.max(...label.split('\n').map(line=>[...line].reduce((sum,c)=>sum+(/[\x00-\x7f]/.test(c)?.105:.185),0)))+.35;
    nodes.push(`${id} [label=${JSON.stringify(label)},width=${(shape==='diamond'?width*1.5:width).toFixed(2)},shape=${shape}${shape==='diamond'?',fillcolor="#fff3db"':''}];`);return id;
  };
  const edge=(a,b,label='')=>edges.push(`${a} -> ${b} [label=${JSON.stringify(label)}];`);
  const build=(steps,next)=>{
    for(let i=steps.length-1;i>=0;i--) {
      const s=steps[i];
      if(typeof s==='string') {
        const block=[s];
        while(i>0&&typeof steps[i-1]==='string'&&block.length<3) block.unshift(steps[--i]);
        const id=node(block.join('\n'));edge(id,next);next=id;
      } else if(s.variable||s.while) {
        const cond=node(s.variable?`${s.variable} ≦ ${s.to} ?`:`${s.while} ?`,'diamond');
        let back=cond;
        if(s.variable) {back=node(`${s.variable} ← ${s.variable} ＋ 1`);edge(back,cond,'戻る');}
        const body=build(s.body,back);edge(cond,body,'はい');edge(cond,next,'いいえ');
        next=cond;
        if(s.variable) {const init=node(`${s.variable} ← ${s.from}`);edge(init,cond);next=init;}
      } else {
        const cond=node(`${s.test} ?`,'diamond');
        edge(cond,build(s.yes,next),'はい');edge(cond,build(s.no,next),'いいえ');next=cond;
      }
    }
    return next;
  };
  const end=node('終了','oval');const first=build(item.steps,end);const start=node('開始','oval');edge(start,first);
  return `digraph { graph [rankdir=TB,bgcolor="transparent",nodesep=.24,ranksep=.20,pad=.12]; node [fontname="Meiryo",fontsize=13,height=.38,style="rounded,filled",fillcolor="#edf4fc",color="#496888",margin=".16,.06"]; edge [fontname="Meiryo",fontsize=12,color="#496888",arrowsize=.65]; ${nodes.join('\n')} ${edges.join('\n')} }`;
}

function trace(item) {
  if(item.natural) return '';
  if(item.id==='8-C') return '\n### num＝3の表示結果を確認\n\n| 外側のi | 内側で表示する文字 | 内側を終えた後 |\n|---|---|---|\n| 1 | *** | 改行する |\n| 2 | *** | 改行する |\n| 3 | *** | 改行する |\n';
  const {history}=run(item);
  let rows=history;
  // 長い処理は各反復の最後を採用し、最初と最後の状態を保つ。
  if(rows.some(row=>row.label.endsWith('終了'))) {
    rows=history.filter((row,i)=>i===0 || i===history.length-1 || row.label.endsWith('終了'));
  }
  if(rows.length>7) rows=[...rows.slice(0,3),{label:'…（中間の反復を省略）',values:{}},...rows.slice(-3)];
  if(!rows.length) return '';
  const fmt=v=>Array.isArray(v)?'{'+v.join(', ')+'}':String(v);
  const keys=[...new Set(history.flatMap(r=>Object.keys(r.values)))].filter(k=>k!=='A' || history.some(r=>r.label.startsWith('A[')));
  // 入力定数を省き、処理で代入された変数を表示する。
  const changed=new Set(history.map(r=>r.label.split(' ← ')[0].replace(/\[.*\]/,'')));
  const selected=keys.filter(k=>changed.has(k)||k==='i'||k==='j');
  return `\n### 値の確認（各処理の実行後）\n\n| 実行した処理 | その直後の値 |\n|---|---|\n`+rows.map(r=>`| ${r.label} | ${selected.filter(k=>k in r.values).map(k=>`${k}＝${fmt(r.values[k])}`).join('、')} |`).join('\n')+'\n';
}

const sourceMap={
  '2-F':['変数の退避と上書き','https://www.fe-siken.com/kakomon/sample/b1.html'],
  '4-E':['条件分岐の読み取り','https://www.fe-siken.com/kakomon/sample/b2.html'],
  '6-F':['探索の考え方（公開問題は二分探索）','https://www.fe-siken.com/kakomon/sample/b13.html'],
  '7-F':['配列を一行ずつ追う練習','https://www.fe-siken.com/kakomon/sample/b3.html'],
  '8-B':['配列の位置と上書きに注目する練習','https://www.fe-siken.com/kakomon/08_haru/b1.html']
};
for(const item of exercises) {
  const svg=viz.renderString(graph(item),{format:'svg'});
  const flowPath=path.join(root,`images/flowcharts/${item.id}.svg`);
  const previous=await fs.readFile(flowPath,'utf8').catch(error=>error.code==='ENOENT'?'':Promise.reject(error));
  if (previous!==svg) await fs.writeFile(flowPath,svg);
}
let md=(await fs.readFile(source,'utf8')).replaceAll('\r\n','\n');
try {
  const toc=JSON.parse(await fs.readFile(path.join(temp,'toc.json'),'utf8'));
  md=md.replace(/(<a href="#([^"]+)"><span>[^<]+<\/span><b>)[^<]*(<\/b>)/g,(full,start,id,end)=>start+(toc[id]||'')+end);
} catch(e) {if(e.code!=='ENOENT') throw e;}
// 生成部分のみを置換するので、本文や既存問題への手修正は保持する。
md=md.replace(/<!-- 追加演習開始 \d -->[\s\S]*?<!-- 追加演習終了 \d -->\n*/g,'');
for(let chapter=1;chapter<=8;chapter++) {
  const extra=exercises.filter(e=>e.id.startsWith(chapter+'-')&&!e.existing);
  const section=`<!-- 追加演習開始 ${chapter} -->\n\n`+extra.map(item=>{
    const types=item.natural?'':(item.types||('この問題の変数は整数型です。'+(Number(item.id[0])>=6?'配列の添字は1から始まります。':'')));
    const prereq=item.id==='6-F'?'\n**先に確認：** 探索とは、目的の値を探す処理です。position（ポジション）は位置を覚える変数で、0は「未発見」の目印です。本問は先頭から一つずつ見る方法です。\n':item.id==='7-F'?'\n**先に確認：** A[i − 1]は、一つ前の位置の値です。i＝2から始めるので、存在しないA[0]は読みません。≠は「等しくない」です。\n':'';
    if (chapter === 1) {
      const fields = item.answerFields || ['解答'];
      const rows = fields.map(f => `  <div><strong>${f}</strong><span></span></div>`).join('\n');
      const answerSheet = `<div class="answer-sheet">\n  <p class="sheet-title">解答欄</p>\n${rows}\n</div>`;
      const aiBox = `<div class="ai-box">\n  <p class="ai-label">AIへの質問例｜考え方や疑問点を伝える</p>\n  <p>本教材の演習${item.id}についてです。私は○○と考えました。○○が分かりません。</p>\n</div>`;
      const breakTag = (item.id === '1-B' || item.id === '1-D') ? '\n<div class="page-break"></div>\n' : '';
      return `<section class="exercise-question">\n\n## 演習${item.id}　${item.title}\n\n<span class="difficulty">難易度 ${'★'.repeat(item.level)+'☆'.repeat(3-item.level)}</span>\n\n${item.question}\n\n${answerSheet}\n\n${aiBox}\n\n</section>\n${breakTag}`;
    }
    return `<section class="exercise-question">\n\n## 演習${item.id}　${item.title}\n\n<span class="difficulty">難易度 ${'★'.repeat(item.level)+'☆'.repeat(3-item.level)}</span>\n\n${item.question}\n${prereq}\n${types}\n\n${item.natural?'':'```text\n'+code(item.steps).join('\n')+'\n```\n'}\n**自分で書く：** 答えだけでなく、途中の値・条件の真偽・その理由をノートに残してください。\n\n> 研修中の質問例：本教材の演習${item.id}についてです。私は○○と考えました。○○が分かりません。\n\n</section>\n`;
  }).join('\n')+`\n<!-- 追加演習終了 ${chapter} -->\n\n`;
  const marker=chapter===8?'## 演習後の振り返り':`<div class="page-break"></div>\n\n<a id="chapter-${chapter+1}"></a>`;
  assert(md.includes(marker),marker);md=md.replace(marker,section+marker);
}
const answers=exercises.map(item=>{
  const related=sourceMap[item.id];
  const input=item.input?Object.entries(item.input).map(([k,v])=>`${k}＝${Array.isArray(v)?'{'+v.join(',')+'}':v}`).join('、'):'';
  return `<section class="answer-section">\n\n## 演習${item.id}　解答・解説\n\n${item.answer}\n${input?`\n表の確認に使う入力：${input}。\n`:''}${trace(item)}\n<div class="exercise-flow">\n<p class="flow-title">演習${item.id}のフローチャート</p>\n<img src="images/flowcharts/${item.id}.svg" alt="演習${item.id}の処理順・分岐・繰返し">\n<p class="flow-caption">ひし形は条件判定。「はい」は真、「いいえ」は偽です。矢印の戻り先も確認しましょう。${item.existing?'問題で与えられる入力を使い、空欄があれば埋めた処理を示しています。':''}</p>\n</div>\n${related?`\n公開問題への接続：[${related[0]}](${related[1]})。本演習は研修用のオリジナル問題であり、リンク先の問題・正解と同一ではありません。\n`:''}\n</section>\n`;
}).join('\n');
md=md.replace(/# 解答・解説[\s\S]*?(?=<div class="page-break"><\/div>\n\n<a id="roadmap">)/,
  '# 解答・解説\n\n自分の答えを書いてから確認します。文章、値の確認表、フローチャートを対応させて読みましょう。図では読みやすさのため、連続する代入を一つの箱にまとめることがあります。\n\n'+answers+'\n');
await fs.writeFile(source,md);

// 生HTMLの字下げがMarkdownのコードブロックと誤認されないよう正規化。
let fenced=false;
const normalized=md.split('\n').map(line=>{
  if(line.startsWith('```')) fenced=!fenced;
  return !fenced&&/^\s+</.test(line)?line.trimStart():line;
}).join('\n');
const html=`<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>${title}</title><base href="${pathToFileURL(root+'/').href}"></head><body>${marked.parse(normalized)}</body></html>`;
await fs.writeFile(path.join(temp,'textbook.html'),html);
const browser=await chromium.launch({executablePath:process.env.FE_CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try {
  const page=await browser.newPage();
  await page.goto(pathToFileURL(path.join(temp,'textbook.html')).href);
  await page.evaluate(async()=>{
    await document.fonts.ready;
    await Promise.all([...document.images].map(img=>img.decode()));
    // HTML内の本文に残るバッククォートをインラインコードとして扱う。
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT), nodes=[];
    while(walker.nextNode()) if(!walker.currentNode.parentElement.closest('pre,code,script,style')) nodes.push(walker.currentNode);
    for(const node of nodes) if(/`[^`]+`/.test(node.textContent)) {
      const parts=node.textContent.split(/(`[^`]+`)/g),frag=document.createDocumentFragment();
      for(const part of parts) {if(part.startsWith('`')&&part.endsWith('`')) {const c=document.createElement('code');c.textContent=part.slice(1,-1);frag.append(c);} else frag.append(document.createTextNode(part));}
      node.replaceWith(frag);
    }
    // 固定ページ番号はPDFの検査後、実ページに更新する。
    for(const b of document.querySelectorAll('.toc-list b')) b.textContent='';
  });
  const raw=await page.locator('body').innerText();
  assert(!/<\/?(?:span|strong|small|div|p|br)\b/.test(raw),'HTMLタグが本文に露出しています。');
  assert(!raw.includes('初稿'),'初稿表記が残っています。');
  assert.equal(await page.locator('.exercise-flow img').count(),48);
  assert.equal((raw.match(/難易度 ★/g)||[]).length,48);
  const options={format:'A4',printBackground:true,preferCSSPageSize:true,displayHeaderFooter:true,headerTemplate:'<span></span>',footerTemplate:'<div style="width:100%;text-align:center;font-size:8px;color:#697586;font-family:Meiryo">アルゴリズム入門　｜　<span class="pageNumber"></span></div>',tagged:true,outline:true};
  await page.pdf({...options,path:path.join(temp,'textbook.pdf')});
  // QA側が出力した実ページ番号を次回ビルドに反映。
  try {
    const toc=JSON.parse(await fs.readFile(path.join(temp,'toc.json'),'utf8'));
    await page.evaluate(toc=>{for(const a of document.querySelectorAll('.toc-list a')) a.querySelector('b').textContent=toc[a.getAttribute('href').slice(1)]||'';},toc);
    await page.pdf({...options,path:path.join(temp,'textbook.pdf')});
  } catch(e) {if(e.code!=='ENOENT') throw e;}
  await fs.writeFile(path.join(temp,'textbook-rendered.html'),await page.content());
  console.log('生成先: '+path.join(temp,'textbook.pdf'));
} finally {await browser.close();}
