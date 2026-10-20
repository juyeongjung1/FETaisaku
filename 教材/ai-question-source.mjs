import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath, pathToFileURL} from 'node:url';

const book='科目B_擬似言語とAIで学ぶアルゴリズム入門';

export async function exportAiQuestionSource(page,root,temp) {
  const questions=await page.evaluate(()=>{
    const inline=node=>[...node.childNodes].map(child=>child.nodeType===Node.TEXT_NODE?child.textContent:
      child.nodeType!==Node.ELEMENT_NODE?'':child.tagName==='BR'?'\n':inline(child)).join('');
    const blocks=node=>{
      if(node.nodeType===Node.TEXT_NODE) return node.textContent.trim()?[node.textContent.trim()]:[];
      if(node.nodeType!==Node.ELEMENT_NODE||node.matches('.ai-box,.continuation-title')) return [];
      if(node.matches('.output-sample')) return ['【問題の出力例（原文）】\n```text\n'+inline(node).trim()+'\n```'];
      if(node.tagName==='PRE') return [(node.querySelector('code')?'【問題掲載コード（原文）】':'【問題の出力例（原文）】')+
        '\n```text\n'+node.textContent.replace(/\n$/,'')+'\n```'];
      if(node.tagName==='TABLE') return [[...node.rows].map(row=>
        '| '+[...row.cells].map(cell=>inline(cell).trim().replaceAll('\n',' ／ ')||'（空欄）').join(' | ')+' |').join('\n')];
      if(node.matches('.answer-sheet')) return ['【解答欄（未記入）】\n'+[...node.querySelectorAll('strong')].map(label=>'- '+inline(label).trim()+'： （記入欄）').join('\n')];
      if(node.matches('ul,ol')) return [[...node.children].map((item,i)=>(node.tagName==='OL'?(i+1)+'. ':'- ')+inline(item).trim()).join('\n')];
      if(node.matches('p,h2,h3,h4,.difficulty')) return [inline(node).trim()].filter(Boolean);
      assertNoImages(node);
      return [...node.childNodes].flatMap(blocks);
    };
    const assertNoImages=node=>{if(node.matches('img,svg')) throw new Error('演習内の図はテキスト化方法の確認が必要です');};
    return [...document.querySelectorAll('.exercise-question')].map(section=>{
      const heading=section.querySelector('h2');
      const id=heading.textContent.match(/^演習(\d-[A-F])\s/)[1];
      return {id,title:heading.textContent,text:blocks(section).join('\n\n'),
        codes:[...section.querySelectorAll('pre code')].map(code=>code.textContent.replace(/\n$/,'')),
        choices:[...section.querySelectorAll('.choice-table tbody tr')].map(row=>inline(row).trim())};
    });
  });
  assert.deepEqual(questions.map(q=>q.id),Array.from({length:8},(_,n)=>Array.from('ABCDEF',letter=>(n+1)+'-'+letter)).flat());
  assert.equal(questions.flatMap(q=>q.codes).length,42);
  assert.equal(questions.flatMap(q=>q.choices).length,48);
  const source=await fs.readFile(path.join(root,book+'.md'),'utf8');
  const originals=[...source.replaceAll('\r\n','\n').matchAll(/<section class="exercise-question\b[^"]*">([\s\S]*?)<\/section>/g)]
    .map(match=>({id:match[1].match(/^## 演習(\d-[A-F])\s/m)[1],
      codes:[...match[1].matchAll(/```text\n([\s\S]*?)\n```/g)].map(code=>code[1])}));
  assert.deepEqual(originals.map(q=>q.id),questions.map(q=>q.id),'組版と原稿の問題番号が一致しません');
  for(let i=0;i<questions.length;i++) assert.deepEqual(questions[i].codes,originals[i].codes,questions[i].id+'の原稿と掲載コードが一致しません');
  for(const q of questions) {
    assert(!q.text.includes('AIへの質問例'),'AI質問例が問題本文へ混入しています');
    assert.deepEqual([...q.text.matchAll(/【問題掲載コード（原文）】\n```text\n([\s\S]*?)\n```/g)].map(match=>match[1]),q.codes,q.id+'の掲載コードが変わっています');
  }
  const pdfHash=createHash('sha256').update(await fs.readFile(path.join(temp,'textbook.pdf'))).digest('hex');
  const header=`# 科目B教材：問題本文のAI参照用テキスト\n\n対応PDF：${book}.pdf\n対応PDFのSHA-256：${pdfHash}\n\nこのファイルは、対応PDFと同じ原稿・組版データから抽出した全48問の問題本文です。\n問題番号、問題文、掲載コード、選択肢、出力例、未記入の解答欄・記入表を収録しています。\nコード内の空欄は原文のままであり、解答・解説、解説用の確認入力、AIへの質問例は収録していません。\n「（空欄）」「（記入欄）」は、紙面上の未記入セル・欄を表します。\n問題内に示された誤りを含む表・仮定・表示例は、出題の一部です。正しい解答と取り違えないでください。\nA[1]などの角括弧の数字は配列の添字であり、出典や引用の番号ではありません。\n古い版と併用せず、問題番号と題名で対象を特定してください。\n`;
  const text=header+'\n'+questions.map(q=>`===== 問題${q.id} 開始 =====\n問題ID：${q.id}（演習${q.id}／問題${q.id}）\n\n${q.text}\n\n===== 問題${q.id} 終了 =====`).join('\n\n')+'\n';
  const out=path.resolve(root,'../output/ai');
  await fs.mkdir(out,{recursive:true});
  const destination=path.join(out,'科目B_問題本文_AI参照用.txt');
  await fs.writeFile(destination,text,'utf8');
  await fs.writeFile(path.join(temp,'ai-question-source.json'),JSON.stringify({pdfHash,questions},null,2));
  console.log('AI参照用TXT：全48問・掲載コード42本・選択肢48件を原文と照合。生成先: '+destination);
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const root=path.dirname(fileURLToPath(import.meta.url)),temp=path.resolve(root,'../tmp/pdfs');
  const [source,pdf]=await Promise.all([fs.stat(path.join(root,book+'.md')),fs.stat(path.join(temp,'textbook.pdf'))]);
  assert(source.mtimeMs<=pdf.mtimeMs,'教材原稿がPDFより新しいため、先にbuild.mjsで再生成してください');
  const modules=process.env.FE_NODE_MODULES;
  assert(modules,'FE_NODE_MODULESを設定してください');
  const {chromium}=await import(pathToFileURL(path.join(modules,'playwright/index.mjs')));
  const browser=await chromium.launch({executablePath:process.env.FE_CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  try {
    const page=await browser.newPage();
    await page.goto(pathToFileURL(path.join(temp,'textbook-rendered.html')).href);
    await exportAiQuestionSource(page,root,temp);
  } finally {await browser.close();}
}
