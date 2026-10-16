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
const aiLabel = 'AIへの質問例｜自分の考えを伝えてヒントを求める';
const aiParagraphs = s => s.split('\n\n').map(part=>'<p>'+escape(part).replace(/(分かっていること：|試したこと：|分からないこと：)/g,'<strong>$1</strong>').replaceAll('\n','<br>')+'</p>').join('\n  ');

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
function verifyTraceTable(item) {
  const result=run(item), {num}=item.input||{};
  const turns=variable=>result.history.filter(row=>row.label.startsWith(variable+'＝')&&row.label.endsWith('の回を終了')).map(row=>row.values);
  let rows;
  if(item.id==='8-C') {
    const characters=[...result.text.replaceAll('\n','')];
    rows=turns('j').map((v,i)=>[String(i+1),String(v.i),String(v.j),characters[i],v.j===num?'する':'しない']);
  }
  assert.deepEqual(item.answerTable.rows,rows,item.id+'の完成表と実行結果が一致しません');
  assert.deepEqual(item.tableTemplate.headers,item.answerTable.headers,item.id+'の表の列名');
  assert.equal(item.tableTemplate.rows.length,rows.length,item.id+'の表の行数');
  return rows.length;
}
let tests=0;
for (const item of exercises) {
  assert(typeof item.answer==='string'&&item.answer.trim(),item.id+'の解説文が空です');
  const lines=item.aiQuestion.split('\n');
  assert.equal(lines[0],`問題${item.id}について質問です。`,item.id);
  assert.equal(lines[1],'',item.id);
  assert.equal(lines.length,5,item.id);
  for (const [i,label] of ['分かっていること：','試したこと：','分からないこと：'].entries())
    assert(lines[i+2].startsWith(label)&&lines[i+2].length>label.length,item.id+'の'+label);
}
for(let chapter=1;chapter<=8;chapter++) for(let level=1;level<=3;level++)
  assert.equal(exercises.filter(e=>e.id.startsWith(chapter+'-')&&e.level===level).length,(chapter===1?[3,3,0]:chapter===4?[2,3,1]:[2,2,2])[level-1]);
for (const item of exercises.filter(e=>e.choices)) {
  assert.equal(item.choices.options.length,4,item.id);
  assert.equal(new Set(item.choices.options).size,4,item.id);
  assert.match(item.choices.correct,/^[アイウエ]$/,item.id);
}
for(const item of exercises) if(!item.natural) {
  assert(item.codeTask,item.id+'のコードの課題がありません');
  verify(item,item.input||{},item.expected);tests++;
  for(const [input,expected] of item.cases||[]) {verify(item,input,expected);tests++;}
}
console.log(`演習48問・第1章は★3問と★★3問、第4章は★2問・★★3問・★★★1問、ほかの章は各難易度2問を確認。検算${tests}ケース成功。`);
const traceExercises=exercises.filter(item=>item.traceGuide);
assert.equal(traceExercises.length,1);
assert(exercises.filter(item=>Number(item.id[0])<=6).every(item=>!item.tableTemplate&&!item.traceGuide&&!/表に|表を|トレース/.test(item.question+item.aiQuestion)), '第6章までは表への記入を求めません。');
for(const id of ['6-C','6-D','6-E','6-F']) {
  const item=exercises.find(item=>item.id===id);
  const initial=item.types.match(/整数型の配列: A ← \{([^}]+)\}/);
  assert(initial,id+'の配列の宣言・初期値がありません');
  assert.deepEqual(initial[1].split(',').map(Number),item.input.A,id+'の掲載コードと入力配列');
}
console.log(`記入用トレース表1問・完成表${traceExercises.reduce((n,item)=>n+verifyTraceTable(item),0)}行の全値を実行結果と照合。第1〜6章の演習に表の記入指定がないことを確認。`);
const countExercise=exercises.find(item=>item.id==='5-B');
const countRun=run(countExercise);let previous=countRun.history[0].values;
const countRows=countRun.history.filter(row=>row.label==='繰返し一回分を終了').map(row=>{
  const first=(row.values['処理①']||0)>(previous['処理①']||0)?'○':'×';
  const second=(row.values['処理②']||0)>(previous['処理②']||0)?'○':'×';
  const result=[String(previous.i),'○',first,second,second];previous=row.values;return result;
});
countRows.push([String(countRun.env.i),'×','×','―','×']);
assert.deepEqual(countExercise.answerTable.rows,countRows,'5-Bの○・×・―の完成表');

// 順次を一つの箱にまとめ、分岐・ループは独立した節点で表現する。
function graph(item) {
  let n=0,loopNumber=0;const nodes=[],edges=[];
  const node=(label,shape='box')=>{
    const id='n'+n++;
    label=label.replaceAll(' and ','\nand ');
    const width=Math.max(...label.split('\n').map(line=>[...line].reduce((sum,c)=>sum+(/[\x00-\x7f]/.test(c)?.105:.185),0)))+.35;
    const loop=shape==='loopstart'||shape==='loopend';
    nodes.push(`${id} [label=${JSON.stringify(label)},width=${(shape==='diamond'?width*1.5:width).toFixed(2)},shape=${loop?'box':shape}${loop?`,class="${shape}",style="filled",fillcolor="#e8f3ee",color="#28704a"`:shape==='diamond'?',fillcolor="#fff3db"'+(item.id==='5-B'?',style="filled"':''):''}];`);return id;
  };
  const edge=(a,b,label='',ports='')=>edges.push(`${a} -> ${b} [label=${JSON.stringify(label)}${ports?', '+ports:''}];`);
  const build=(steps,next)=>{
    for(let i=steps.length-1;i>=0;i--) {
      const s=steps[i];
      if(typeof s==='string') {
        const block=[s];
        while(i>0&&typeof steps[i-1]==='string'&&block.length<3) block.unshift(steps[--i]);
        const id=node(block.join('\n'));edge(id,next);next=id;
      } else if(s.variable||s.while) {
        const name=s.variable?`${s.variable}の繰返し`:`繰返し${++loopNumber}`;
        const end=node(name,'loopend');edge(end,next);
        const body=build(s.body,end);
        const begin=node(name+'\n'+(s.variable?`${s.from}から${s.to}まで、1ずつ増やす`:`継続条件：${s.while}`),'loopstart');
        edge(begin,body);next=begin;
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

function loopSymbols(svg) {
  return svg.replace(/(class="node (loopstart|loopend)"[\s\S]*?<polygon[^>]*points=")([^"]+)(")/g,(_,before,kind,points,after)=>{
    const coordinates=points.trim().split(/\s+/).map(pair=>pair.split(',').map(Number));
    const xs=coordinates.map(p=>p[0]),ys=coordinates.map(p=>p[1]);
    const left=Math.min(...xs),right=Math.max(...xs),top=Math.min(...ys),bottom=Math.max(...ys);
    const cut=Math.min((right-left)*.12,(bottom-top)*.35);
    const corners=kind==='loopstart'?[[left,bottom],[left,top+cut],[left+cut,top],[right-cut,top],[right,top+cut],[right,bottom]]:
      [[left,top],[right,top],[right,bottom-cut],[right-cut,bottom],[left+cut,bottom],[left,bottom-cut]];
    return before+corners.map(pair=>pair.map(v=>v.toFixed(2)).join(',')).join(' ')+after;
  });
}

function trace(item) {
  if(item.natural) return '';
  if(item.answerTable) {
    const table='\n### '+(Number(item.id[0])<=6?'値の確認':'表の完成例')+'\n'+tableTemplate(item,item.answerTable);
    return item.traceGuide?`\n<div class="completed-trace" data-exercise="${item.id}">\n${table}\n</div>\n`:table;
  }
  const {history}=run(item);
  let rows=history;
  // 長い処理は各反復の最後を採用し、最初と最後の状態を保つ。
  if(rows.some(row=>row.label.endsWith('終了'))) {
    rows=history.filter((row,i)=>i===0 || i===history.length-1 || row.label.endsWith('終了'));
  }
  if(!rows.length) return '';
  const fmt=v=>Array.isArray(v)?'{'+v.join(', ')+'}':String(v);
  const keys=[...new Set(history.flatMap(r=>Object.keys(r.values)))].filter(k=>k!=='A' || history.some(r=>r.label.startsWith('A[')));
  // 入力定数を省き、処理で代入された変数を表示する。
  const changed=new Set(history.map(r=>r.label.split(' ← ')[0].replace(/\[.*\]/,'')));
  const selected=keys.filter(k=>changed.has(k)||k==='i'||k==='j');
  const traceTitle=item.id==='4-B'?'値の確認（score＝59の場合）':item.id==='4-C'?'値の確認（BMI＝18.50の場合）':'値の確認（各処理の実行後）';
  return `\n### ${traceTitle}\n\n| 実行した処理 | その直後の値 |\n|---|---|\n`+rows.map(r=>`| ${r.label} | ${selected.filter(k=>k in r.values).map(k=>`${k}＝${fmt(r.values[k])}`).join('、')} |`).join('\n')+'\n';
}

const sourceMap={
  '2-F':['2022年12月サンプル20問セット 問1 変数の退避と上書き','https://www.fe-siken.com/kakomon/sample/b1.html','https://www.ipa.go.jp/shiken/syllabus/henkou/2022/gmcbt80000007cfs-att/fe_kamoku_b_set_sample_qs.pdf'],
  '4-E':['2022年12月サンプル20問セット 問2 条件分岐の読み取り','https://www.fe-siken.com/kakomon/sample/b2.html','https://www.ipa.go.jp/shiken/syllabus/henkou/2022/gmcbt80000007cfs-att/fe_kamoku_b_set_sample_qs.pdf'],
  '6-F':['2022年12月サンプル20問セット 問13 探索の考え方（公開問題は二分探索）','https://www.fe-siken.com/kakomon/sample/b13.html','https://www.ipa.go.jp/shiken/syllabus/henkou/2022/gmcbt80000007cfs-att/fe_kamoku_b_set_sample_qs.pdf'],
  '7-F':['2022年12月サンプル20問セット 問3 配列を一行ずつ追う練習','https://www.fe-siken.com/kakomon/sample/b3.html','https://www.ipa.go.jp/shiken/syllabus/henkou/2022/gmcbt80000007cfs-att/fe_kamoku_b_set_sample_qs.pdf'],
  '8-B':['令和8年度 問1 配列の位置と上書きに注目する練習','https://www.fe-siken.com/kakomon/08_haru/b1.html','https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_b_qs.pdf']
};
for(const item of exercises) {
  const svg=loopSymbols(viz.renderString(graph(item),{format:'svg'}));
  const count=steps=>steps.reduce((n,s)=>n+(typeof s==='string'?0:s.variable||s.while?1+count(s.body):count(s.yes)+count(s.no)),0);
  for(const kind of ['loopstart','loopend']) assert.equal((svg.match(new RegExp(`class="node ${kind}"`,'g'))||[]).length,count(item.steps),item.id+'のループ端');
  const flowPath=path.join(root,`images/flowcharts/${item.id}.svg`);
  const previous=await fs.readFile(flowPath,'utf8').catch(error=>error.code==='ENOENT'?'':Promise.reject(error));
  if (previous!==svg) await fs.writeFile(flowPath,svg);
}
let md=(await fs.readFile(source,'utf8')).replaceAll('\r\n','\n');
try {
  const toc=JSON.parse(await fs.readFile(path.join(temp,'toc.json'),'utf8'));
  md=md.replace(/(<a href="#([^"]+)"><span>[^<]+<\/span><b>)[^<]*(<\/b>)/g,(full,start,id,end)=>start+(toc[id]||'')+end);
} catch(e) {if(e.code!=='ENOENT') throw e;}
function choiceTable(item) {
  if (!item.choices) return '';
  return '\n<div class="choice-table" data-exercise="'+item.id+'">\n\n| 選択肢 | 内容 |\n|---|---|\n'+
    item.choices.options.map((option,i)=>'| '+'アイウエ'[i]+' | '+(item.id==='8-C'?option.replace(' ／ ③','<br>③'):option)+' |').join('\n')+'\n\n</div>\n';
}
function tableTemplate(item, table=item.tableTemplate) {
  if (!table) return '';
  const {headers, rows} = table;
  const headerLine = '| ' + headers.join(' | ') + ' |';
  const sepLine = '|' + headers.map((h, i) => i === 0 ? '---|' : '---:|').join('');
  const rowLines = rows.map(r => '| ' + r.join(' | ') + ' |').join('\n');
  return `\n${headerLine}\n${sepLine}\n${rowLines}\n\n`;
}
function tracePractice(item) {
  return `\n<div class="trace-practice" data-exercise="${item.id}">\n<p class="trace-title">トレース表（記入用）</p>\n<p class="trace-guide">${escape(item.traceGuide)}</p>\n${tableTemplate(item)}\n</div>\n`;
}
function traceWorksheet(item) {
  return `<section class="trace-worksheet" data-exercise="${item.id}">\n\n### 演習${item.id}の記入用トレース表\n\n前のページのコードと見比べながら、表に書き込んでください。\n${tracePractice(item)}\n</section>\n`;
}
// 既存問題も生成元のAI例文を使い、再ビルド時の食い違いを防ぐ。
for (const item of exercises.filter(e=>e.existing)) {
  const from=md.indexOf('## 演習'+item.id+'　'), to=md.indexOf('</section>',from);
  assert(from>=0&&to>from,item.id+'の問題位置がありません');
  const section=md.slice(from,to);
  const pattern=/(<div class="ai-box">\n\s*<p class="ai-label">)[^<]*(<\/p>)[\s\S]*?(<\/div>)/;
  assert(pattern.test(section)&&item.aiQuestion,item.id+'のAI例文がありません');
  const updated=section.replace(pattern,(_,start,middle,end)=>start+aiLabel+middle+'\n  '+aiParagraphs(item.aiQuestion)+'\n'+end);
  let withTask=updated.replace(/<p class="exercise-task">[^\n]*<\/p>\n\n/g,'')
    .replace('```text',`<p class="exercise-task"><strong>このコードの課題：</strong>${escape(item.codeTask)}</p>\n\n\`\`\`text`);
  if(item.traceGuide&&!item.traceWorksheet) {
    const start='<!-- トレース表開始 '+item.id+' -->',end='<!-- トレース表終了 '+item.id+' -->';
    const a=withTask.indexOf(start)+start.length,b=withTask.indexOf(end,a);
    assert(withTask.includes(start)&&b>a,item.id+'の表の生成位置がありません');
    withTask=withTask.slice(0,a)+'\n'+tracePractice(item)+'\n'+withTask.slice(b);
  }
  md=md.slice(0,from)+withTask+md.slice(to);
}
for(const item of exercises.filter(e=>e.existing&&e.traceWorksheet)) {
  const start='<!-- トレース用紙開始 '+item.id+' -->',end='<!-- トレース用紙終了 '+item.id+' -->';
  const a=md.indexOf(start)+start.length,b=md.indexOf(end,a);
  assert(md.includes(start)&&b>a,item.id+'の用紙の生成位置がありません');
  md=md.slice(0,a)+'\n\n'+traceWorksheet(item)+'\n'+md.slice(b);
}
for (const item of exercises.filter(e=>e.existing&&e.choices)) {
  const start='<!-- 選択肢開始 '+item.id+' -->', end='<!-- 選択肢終了 '+item.id+' -->';
  assert(md.includes(start)&&md.includes(end),item.id+'の選択肢位置がありません');
  const from=md.indexOf(start)+start.length, to=md.indexOf(end,from);
  md=md.slice(0,from)+'\n'+choiceTable(item)+'\n'+md.slice(to);
}
// 生成部分のみを置換するので、本文や既存問題への手修正は保持する。
md=md.replace(/<!-- 追加演習開始 \d -->[\s\S]*?<!-- 追加演習終了 \d -->\n*/g,'');
for(let chapter=1;chapter<=8;chapter++) {
  const extra=exercises.filter(e=>e.id.startsWith(chapter+'-')&&!e.existing);
  const section=`<!-- 追加演習開始 ${chapter} -->\n\n`+extra.map(item=>{
    const types=item.natural?'':(item.types||('この問題の変数は整数型です。'+(Number(item.id[0])>=6?'配列の添字は1から始まります。':'')));
    const typesInCode = ['4-D','6-C','6-D','6-E','6-F'].includes(item.id);
    const prereq=item.id==='7-F'?'\n**先に確認：** A[i − 1]は、一つ前の位置の値です。i＝2から始めるので、存在しないA[0]は読みません。≠は「等しくない」です。\n':'';
    const codeBlock = item.natural ? '' : (`<p class="exercise-task"><strong>このコードの課題：</strong>${escape(item.codeTask)}</p>\n\n` + '```text\n' + (typesInCode ? types + '\n\n' : '') + (item.displayCode ? item.displayCode.join('\n') : code(item.steps).join('\n')) + '\n```\n');
    const tablePart = item.traceGuide?(item.traceWorksheet?'':tracePractice(item)):tableTemplate(item);
    const choicePart = choiceTable(item);
    const fields = item.choices ? ['選択肢（ア〜エ）'] : (item.answerFields || ['解答']);
    const rows = fields.map(f => `  <div><strong>${f}</strong><span></span></div>`).join('\n');
    const answerSheet = `<div class="answer-sheet">\n  <p class="sheet-title">解答欄</p>\n${rows}\n</div>`;
    const aiBox = `<div class="ai-box">\n  <p class="ai-label">${aiLabel}</p>\n  ${aiParagraphs(item.aiQuestion)}\n</div>`;
    const breakTag = (item.id === '1-B' || item.id === '1-D') ? '\n<div class="page-break"></div>\n' : '';
    const secClass = item.traceGuide?'exercise-question compact-question fit-question':item.compact ? 'exercise-question compact-question' : 'exercise-question';
    return `<section class="${secClass}">\n\n## 演習${item.id}　${item.title}\n\n<span class="difficulty">難易度 ${'★'.repeat(item.level)+'☆'.repeat(3-item.level)}</span>\n\n${item.question}\n${prereq}\n${types && !typesInCode ? types + '\n\n' : ''}${codeBlock}${tablePart}${choicePart}\n${answerSheet}\n\n${aiBox}\n\n</section>\n${item.traceWorksheet?traceWorksheet(item):''}${breakTag}`;
  }).join('\n')+`\n<!-- 追加演習終了 ${chapter} -->\n\n`;
  const marker=chapter===8?'## 演習後の振り返り':`<div class="page-break"></div>\n\n<a id="chapter-${chapter+1}"></a>`;
  assert(md.includes(marker),marker);md=md.replace(marker,section+marker);
}
function displayResult(item) {
  if(item.natural || !code(item.steps).some(line=>line.includes('表示する('))) return '';
  let inputs=[item.input||{}];
  if(['4-B','4-C'].includes(item.id)) inputs.push(...item.cases.map(([input])=>input));
  if(item.id==='4-C') inputs.sort((a,b)=>a.weight-b.weight);
  const rows=inputs.map(input=>{
    const result=run(item,input);
    const label=item.id==='4-C'?`BMI＝${result.env.bmi.toFixed(2)}の場合`:
      Object.entries(input).map(([key,value])=>`${key}＝${Array.isArray(value)?'{'+value.join(', ')+'}':value}`).join('、');
    const content=result.text || result.output.map(String).join('\n');
    assert(content,item.id+'の表示結果が空です');
    return `  <div class="result-case">${label?'<span class="result-label">'+(['8-A','8-B'].includes(item.id)?'確認用：':'')+escape(label)+(item.id==='4-C'?'':'の場合')+'</span>':''}<samp class="result-lines">${escape(content.trimEnd()).replaceAll('\n','<br>')}</samp></div>`;
  });
  return `\n<div class="display-result" data-exercise="${item.id}">\n  <p class="result-title">表示結果</p>\n${rows.join('\n')}\n</div>\n`;
}
const answers=exercises.map(item=>{
  const related=sourceMap[item.id];
  const input=item.input?Object.entries(item.input).map(([k,v])=>`${k}＝${Array.isArray(v)?'{'+v.join(',')+'}':v}`).join('、'):'';
  const from=md.indexOf('## 演習'+item.id+'　'), to=md.indexOf('</section>',from);
  const sheet=md.slice(from,to).match(/<div class="answer-sheet">[\s\S]*?\n<\/div>/);
  assert(sheet,item.id+'の解答欄がありません');
  const fields=[...sheet[0].matchAll(/<strong>([\s\S]*?)<\/strong>/g)].map(m=>m[1]);
  assert.equal(item.solution.length,fields.length,item.id+'の解答欄と解答の項目数が一致しません');
  assert(item.solution.every(value=>typeof value==='string'&&value.trim()),item.id+'の解答が空です');
  if(item.choices) assert.equal(item.solution[0],item.choices.correct,item.id+'の正解記号');
  const solution=`<div class="solution-table" data-exercise="${item.id}">\n\n| 解答欄の項目 | 解答 |\n|---|---|\n`+
    fields.map((field,i)=>`| ${field} | ${item.choices?'**正解：'+item.solution[i]+'**':item.solution[i]} |`).join('\n')+'\n\n</div>\n';
  const tableIsAnswer=Boolean(item.tableTemplate);
  const outputPart=displayResult(item);
  const besideTrace=['5-A','6-C','8-A'].includes(item.id);
  const answerPart=solution+(besideTrace?'':outputPart);
  const inputNote=input&&!outputPart?`\n表の確認に使う入力：${input}。\n`:'';
  const tablePart=trace(item).replace(/^### /gm,'#### ');
  const tracePart=besideTrace?`\n<div class="trace-with-result">\n<div>\n${tablePart}\n</div>\n${outputPart}\n</div>\n`:tablePart;
  const secClass=['4-C','5-A','6-C','6-D','7-F','8-A','8-C'].includes(item.id)?'answer-section dense-answer':'answer-section';
  return `<section class="${secClass}" data-exercise="${item.id}">\n\n## 演習${item.id}　解答・解説\n\n<div class="answer-part">\n\n### ${item.solutionTitle||'解答'}\n\n${answerPart}${tableIsAnswer?inputNote+tracePart:''}\n</div>\n\n<div class="explanation-part">\n\n### 解説\n\n${item.answer}\n${tableIsAnswer?'':inputNote+tracePart}\n<div class="exercise-flow">\n<p class="flow-title">演習${item.id}のフローチャート</p>\n<img src="images/flowcharts/${item.id}.svg" alt="演習${item.id}の処理順・分岐・繰返し">\n${item.existing?'<p class="flow-caption">問題の入力と、空欄を埋めた処理を示しています。</p>':''}\n</div>\n${related?`\n公開問題への接続：[${related[0]}](${related[1]})（[IPA公式問題PDF](${related[2]})）。本演習は研修用のオリジナル問題であり、リンク先の問題・正解と同一ではありません。\n`:''}\n</div>\n\n</section>\n`;
}).join('\n');
// 共通の読み方は原稿に残し、各問の解説だけを再生成する。
const answerIntro=md.match(/^# 解答・解説\n[\s\S]*?(?=<section class="answer-section\b)/m);
assert(answerIntro,'解答・解説の導入がありません');
md=md.replace(/# 解答・解説[\s\S]*?(?=<div class="page-break"><\/div>\n\n<a id="roadmap">)/,
  answerIntro[0]+answers+'\n');
let sectionNumber='',subheading=0,detail=0,inCode=false;
md=md.split('\n').map(line=>{
  if(line.startsWith('```')) inCode=!inCode;
  if(inCode) return line;
  if(/^#{1,2} /.test(line)) {
    sectionNumber=line.match(/^## (\d+\.\d+)\s/)?.[1]||'';subheading=0;detail=0;
  } else if(sectionNumber&&/^### /.test(line)) {
    subheading++;detail=0;
    return `### ${sectionNumber}.${subheading} `+line.slice(4).replace(/^\d+(?:\.\d+){2,}\s+/, '');
  } else if(sectionNumber&&/^#### /.test(line)) {
    assert(subheading,sectionNumber+'の小見出しの階層');detail++;
    return `#### ${sectionNumber}.${subheading}.${detail} `+line.slice(5).replace(/^\d+(?:\.\d+){2,}\s+/, '');
  }
  return line;
}).join('\n');
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
    for(const node of document.querySelectorAll('code'))
      if(/^(if|else|elseif|endif|while|endwhile|for|endfor)$/.test(node.textContent)) node.classList.add('syntax-keyword');
    for(const heading of document.querySelectorAll('h3,h4'))
      if(!heading.closest('.answer-section,.exercise-question,.trace-worksheet')) heading.classList.add(heading.tagName==='H3'?'lesson-subheading':'lesson-detailheading');
    for(const node of document.querySelectorAll('.nested-lesson code'))
      if(/^[ij](?:$|[ ＝←])/.test(node.textContent)) node.classList.add('loop-'+node.textContent[0]);
    const nestedCode=document.querySelector('.nested-example pre code');
    nestedCode.innerHTML=nestedCode.textContent.split('\n').map(line=>{
      const safe=line.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
      const variable=/for \(i|表示する\(i\)|^endfor/.test(line)?'i':/for \(j|表示する\(j\)|^  endfor/.test(line)?'j':'';
      return variable?`<span class="loop-${variable}">${safe}</span>`:safe;
    }).join('\n');
    // 固定ページ番号はPDFの検査後、実ページに更新する。
    for(const b of document.querySelectorAll('.toc-list b')) b.textContent='';
  });
  const raw=await page.locator('body').innerText();
  assert(!/<\/?(?:span|strong|small|div|p|br)\b/.test(raw),'HTMLタグが本文に露出しています。');
  assert(!raw.includes('初稿'),'初稿表記が残っています。');
  assert.equal(await page.locator('.exercise-flow img').count(),48);
  assert.equal(await page.locator('.answer-part > h3').count(),48);
  assert.equal(await page.locator('.explanation-part > h3').count(),48);
  assert.equal(await page.locator('.solution-table tbody tr').count(),100);
  assert.equal(await page.locator('.choice-table').count(),12);
  assert.equal(await page.locator('.choice-table tbody tr').count(),48);
  assert.equal(await page.locator('.code-example > .example-task').count(),29);
  assert.equal(await page.locator('.exercise-question > .exercise-task').count(),42);
  assert.equal(await page.locator('.code-example > .display-result').count(),20);
  assert.equal(await page.locator('.nested-example .result-lines .loop-i').count(),6);
  assert.equal(await page.locator('.nested-example .result-lines .loop-j').count(),6);
  assert.deepEqual(await page.locator('.nested-example .result-lines span').allTextContents(),['1','1','1','2','1','3','2','1','2','2','2','3']);
  assert.equal(await page.locator('.answer-section .display-result').count(),14);
  assert.equal(await page.locator('.trace-practice').count(),1);
  assert.equal(await page.locator('.completed-trace').count(),1);
  assert.equal(await page.locator('.trace-practice tbody tr').count(),9);
  assert.equal(await page.locator('.completed-trace tbody tr').count(),9);
  assert(await page.evaluate(()=>[...document.querySelectorAll('.exercise-question')].filter(section=>/^演習[1-6]-/.test(section.querySelector('h2').innerText)).every(section=>
    [...section.querySelectorAll('table')].every(table=>table.closest('.choice-table')))), '第6章までの演習は通常の解答欄を使用してください。');
  assert(await page.evaluate(()=>[...document.querySelectorAll('.trace-practice')].every(blank=>{
    const full=document.querySelector('.completed-trace[data-exercise="'+blank.dataset.exercise+'"]');
    return [...blank.querySelectorAll('th')].map(cell=>cell.innerText).join('|')===[...full.querySelectorAll('th')].map(cell=>cell.innerText).join('|')
      && blank.querySelectorAll('tbody tr').length===full.querySelectorAll('tbody tr').length;
  })),'記入用の表と完成表の列・行をそろえてください。');
  assert(await page.evaluate(()=>[...document.querySelectorAll('pre')].every(pre=>{
    if(pre.closest('.exercise-question')) return pre.previousElementSibling?.classList.contains('exercise-task');
    return pre.closest('.code-example') && pre.previousElementSibling?.classList.contains('example-task');
  })),'コードの直前に課題を配置してください。');
  assert(await page.evaluate(()=>[...document.querySelectorAll('.code-example')].every(example=>
    !example.querySelector('pre').innerText.includes('表示する(') || example.querySelector('pre').nextElementSibling?.classList.contains('display-result'))),
    '説明用コードの表示結果を直後の別枠に配置してください。');
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
