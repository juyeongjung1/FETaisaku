<link rel="stylesheet" href="教材.css">

<div class="cover">
  <img class="cover-logo" src="images/trainocate-logo.png" alt="TRAINOCATE">
  <p class="cover-label">基本情報技術者試験　科目B対策</p>
  <h1>擬似言語とAIで学ぶ<br>アルゴリズム入門</h1>
  <p class="cover-subtitle">はじめての変数から、配列のトレースまで</p>
  <div class="cover-rule"></div>
  <p class="cover-message">「答えを聞く」のではなく、<br>「分からない場所を見つける」ためにAIを使おう。</p>
  <p class="edition">初稿・内容確認版</p>
</div>

<div class="page-break"></div>

# はじめに

この教材は、基本情報技術者試験の科目Bで出題されるアルゴリズムとプログラミングを、プログラミング未経験者が擬似言語から学ぶための入門書です。

科目Bの問題を解くために、難しいプログラム言語を最初から覚える必要はありません。まず必要なのは、次の三つの力です。

1. 擬似言語を上から順番に読む力
2. 変数や配列の値がどう変化するかを追う力
3. 分からない箇所を言葉にして、質問する力

本書では、フローチャートの記号や作図方法は扱いません。処理の基本となる**順次・選択・繰返し**を、最初から擬似言語で学びます。

また、本書には生成AIへ質問するための例文を掲載しています。AIに正解を直接聞くのではなく、考え方の整理、ヒント、トレースの確認、間違いの発見に利用します。

<div class="goal-box">
  <p class="box-title">本書の到達目標</p>
  <ul>
    <li>変数・代入・配列を説明できる</li>
    <li>選択処理と繰返し処理を読める</li>
    <li>短い擬似言語をトレースできる</li>
    <li>合計・件数・最大値を求める処理を理解できる</li>
    <li>AIを使って、自分で学習を続けられる</li>
  </ul>
</div>

## この教材の使い方

各節は、次の順番で進みます。

<div class="learning-cycle">
  <div><span>1</span><strong>概念を読む</strong><small>何をする仕組みか理解する</small></div>
  <div><span>2</span><strong>処理をたどる</strong><small>値が変わる順番を手で記録する</small></div>
  <div><span>3</span><strong>自力で解く</strong><small>最初からAIに聞かない</small></div>
  <div><span>4</span><strong>AIに質問する</strong><small>分からない箇所だけ尋ねる</small></div>
  <div><span>5</span><strong>解き直す</strong><small>AIを閉じてもう一度解く</small></div>
</div>

<div class="important-box">
  <p class="box-title">大切なルール</p>
  <p>AIの説明は、いつも正しいとは限りません。本書の解説や公式資料と照合し、自分で値を追って確認してください。「AIが言ったから正しい」ではなく、「自分でも同じ結果を確認できたから正しい」と判断します。</p>
</div>

<div class="toc-box">

## 目次

<ol class="toc-list">
  <li><a href="#chapter-0"><span>第0章　AIを学習相手にする</span><b>4</b></a></li>
  <li><a href="#chapter-1"><span>第1章　アルゴリズムと擬似言語</span><b>8</b></a></li>
  <li><a href="#chapter-2"><span>第2章　変数・データ型・代入</span><b>13</b></a></li>
  <li><a href="#chapter-3"><span>第3章　順次処理</span><b>18</b></a></li>
  <li><a href="#chapter-4"><span>第4章　選択処理</span><b>21</b></a></li>
  <li><a href="#chapter-5"><span>第5章　繰返し処理</span><b>26</b></a></li>
  <li><a href="#chapter-6"><span>第6章　配列</span><b>32</b></a></li>
  <li><a href="#chapter-7"><span>第7章　トレースの技術</span><b>37</b></a></li>
  <li><a href="#chapter-8"><span>第8章　総合演習</span><b>41</b></a></li>
  <li><a href="#answers"><span>解答・解説</span><b>45</b></a></li>
  <li><a href="#roadmap"><span>研修後の学習ロードマップ</span><b>49</b></a></li>
</ol>

</div>

<div class="page-break"></div>

<a id="chapter-0"></a>

# 第0章　AIを学習相手にする

## 0.1 AIは「正解を出す機械」ではない

生成AIへ問題をそのまま入力し、「答えを教えて」と頼めば、短時間で答えらしきものが表示されます。しかし、それだけでは自分で問題を解く力は身に付きません。

本書では、AIを次の四つの役割で使います。

| AIの役割 | 何をしてもらうか | 使用する場面 |
|---|---|---|
| 整理役 | 入力・処理・出力を分ける | 問題文の意味が分からない |
| ヒント役 | 次に見るべき場所を示す | 解き始められない |
| 点検役 | 最初に間違えた箇所を示す | 自分の考えに自信がない |
| 練習相手 | 難易度を調整した類題を作る | もう一問練習したい |

<div class="ng-box">
  <p class="box-title">避けたい質問</p>
  <p>問題文を渡さずに「答えを教えて」とだけ頼むことや、考える前に「完成した擬似言語を作って」と頼むこと</p>
  <p class="box-caption">正解だけを受け取ると、どこで考えられなくなったのかが分かりません。</p>
</div>

<div class="ok-box">
  <p class="box-title">学習につながる質問</p>
  <p>「答えはまだ示さず、最初に確認すべき変数を一つ教えてください」</p>
  <p>「私のトレース表で、最初に間違っている行だけを指摘してください」</p>
</div>

## 0.2 AIに質問する前の30秒

質問を入力する前に、次の三点を書き出します。

<div class="thinking-sheet">
  <p class="sheet-title">AIへ聞く前の整理メモ</p>
  <div><span>1</span><strong>分かっていること</strong><i>ここに書く</i></div>
  <div><span>2</span><strong>分からないこと</strong><i>ここに書く</i></div>
  <div><span>3</span><strong>自分で試したこと</strong><i>ここに書く</i></div>
</div>

例えば、次のように書きます。

<div class="thinking-sheet filled">
  <p class="sheet-title">記入例</p>
  <div><span>1</span><p><strong>分かっていること</strong>totalが合計を保存する変数であることは分かります。</p></div>
  <div><span>2</span><p><strong>分からないこと</strong><code>total ← total ＋ A[i]</code>の右辺で、どの値を使うのか分かりません。</p></div>
  <div><span>3</span><p><strong>自分で試したこと</strong>iが1の場合までは表に書きました。</p></div>
</div>

ここまで書くと、AIへの質問が具体的になります。また、自分がどこまで理解できているかも見えるようになります。

## 0.3 問題をAIへ渡す

AIに質問するには、まずAIが読める形で問題を渡す必要があります。方法は次の三つです。

<div class="input-methods">
  <div>
    <span class="method-number">1</span>
    <strong>文章をコピーして貼る</strong>
    <small>WebページやPDFで文字を選択できる場合</small>
  </div>
  <div>
    <span class="method-number">2</span>
    <strong>スクリーンショットを添付する</strong>
    <small>図・表・擬似言語を含む問題の場合</small>
  </div>
  <div>
    <span class="method-number">3</span>
    <strong>必要な部分を手で入力する</strong>
    <small>コピーも画像添付もできない場合</small>
  </div>
</div>

### 方法1　問題文をコピーして貼り付ける

問題文、擬似言語、選択肢をまとめてコピーし、質問の前に貼り付けます。長い問題では、次の見出しを付けるとAIが内容を区別しやすくなります。

<div class="copy-template">
  <p class="template-title">AIへ貼り付ける形</p>
  <div><strong>問題文</strong><span>ここに問題文を貼る</span></div>
  <div><strong>擬似言語</strong><span>ここに擬似言語を貼る</span></div>
  <div><strong>選択肢</strong><span>ここに選択肢を貼る</span></div>
  <div><strong>自分が分からないところ</strong><span>例：3行目で、totalにどの値が入るのか分からない</span></div>
</div>

### 方法2　スクリーンショットを添付する

文字を選択できない場合は、問題全体が読めるスクリーンショットを添付します。問題文、擬似言語、選択肢が途中で切れないようにしてください。

<div class="important-box">
  <p class="box-title">画像を添付したら、最初に読み取り確認をする</p>
  <p>AIは、画像内の添字、記号、数字を読み間違えることがあります。すぐに解かせず、「画像から読み取った問題文と擬似言語をそのまま書き出してください」と頼み、元画像と見比べます。</p>
</div>

### 方法3　必要な部分を手で入力する

画像を添付できない場合は、問題の条件と擬似言語を入力します。すべてを打ち直すのが大変なら、分からない行と、その行で使う変数の初期値だけでも構いません。

<div class="problem-packet">
  <p class="box-title">AIへ送る順番</p>
  <div><span>問題を渡す</span><b>→</b><span>読み取りを確認する</span><b>→</b><span>分からない点を書く</span><b>→</b><span>ヒントを頼む</span></div>
</div>

## 0.4 本書で使う基本プロンプト

次の例文は、問題文や画像をAIへ渡し、内容が正しく読み取られたことを確認した**あと**に続けて送ります。

<div class="ai-box">
  <p class="ai-label">AIへの質問例｜ヒントが欲しいとき</p>
  <p>あなたはプログラミング未経験者の学習支援者です。先ほど渡した問題について、正解や完成した擬似言語はまだ示さないでください。最初に確認すべきことを一つだけ、私に質問してください。私が答えたら次の質問へ進んでください。</p>
</div>

<div class="ai-box">
  <p class="ai-label">AIへの質問例｜自分の考えを点検するとき</p>
  <p>これから私の考え方を説明します。正解を先に示さず、論理が最初に成立しなくなる箇所だけを指摘してください。その理由は一文で説明してください。</p>
</div>

<div class="ai-box">
  <p class="ai-label">AIへの質問例｜類題を作るとき</p>
  <p>先ほど渡した問題と同じ考え方で解ける、数字だけを変更した練習問題を一問作ってください。問題だけを提示し、解答と解説は私が回答するまで表示しないでください。</p>
</div>

## 0.5 AIの回答を確認する

AIから回答を得たら、次の順番で確認します。

1. 問題文に書かれていない条件を勝手に追加していないか
2. 配列の先頭の添字を取り違えていないか
3. 繰返しの開始値・終了値を取り違えていないか
4. 代入前の値と代入後の値を混同していないか
5. 自分でトレースして同じ結果になるか

<div class="note-box">
  <p class="box-title">個人情報・会社情報を入力しない</p>
  <p>氏名、メールアドレス、顧客情報、公開されていない会社資料、パスワードなどはAIへ入力しません。この教材の練習問題のように、公開しても問題のない内容だけを使います。</p>
</div>

<div class="page-break"></div>

<a id="chapter-1"></a>

# 第1章　アルゴリズムと擬似言語

## 1.1 アルゴリズムとは

アルゴリズムとは、目的を達成するための**処理手順**です。

<div class="concept-visual">
  <div class="concept-copy">
    <p class="visual-kicker">身近なたとえ</p>
    <p class="visual-title">アルゴリズムは「料理のレシピ」と同じ</p>
    <p>カレーを作るとき、材料だけを渡されても完成しません。「切る → 炒める → 煮る」のように、作業の順番が必要です。コンピュータにも、同じように具体的な手順を一つずつ伝えます。</p>
  </div>
  <img src="images/algorithm-steps.png" alt="歯車に1から4の番号が付き、手順が順番に進むイラスト">
</div>

<div class="visual-steps">
  <div><span>材料</span><strong>入力</strong><small>数値や文字を受け取る</small></div>
  <b>→</b>
  <div><span>レシピ</span><strong>処理</strong><small>順番どおりに計算する</small></div>
  <b>→</b>
  <div><span>料理</span><strong>出力</strong><small>答えを表示する</small></div>
</div>

例えば、「三つの数の中から最大の数を見つける」という目的に対して、次の手順を考えられます。

1. 一つ目の数を、現在の最大値として覚える
2. 二つ目の数が現在の最大値より大きければ、最大値を更新する
3. 三つ目の数も同じように比較する
4. 最後に残った最大値を表示する

人間が何となく行っている判断を、コンピュータが実行できる順序に分解したものがアルゴリズムです。

<div class="number-race">
  <p class="visual-title">例：3、10、7の中から最大値を探す</p>
  <div class="race-row"><span class="candidate current">3</span><b>最初の暫定1位</b></div>
  <div class="race-row"><span class="candidate">10</span><b>3より大きいので、暫定1位を10へ交代</b></div>
  <div class="race-row"><span class="candidate">7</span><b>10より小さいので、そのまま</b></div>
  <p class="race-result">最後の暫定1位「10」が答え</p>
</div>

## 1.2 良いアルゴリズム

アルゴリズムには、少なくとも次の性質が必要です。

- 手順が明確である
- 同じ入力に対して、決められた結果になる
- いつか処理が終了する
- 実行できない曖昧な指示がない

「いい感じに並べる」「適切な回数だけ繰り返す」という表現は、人間には伝わってもコンピュータには伝わりません。

<div class="compare-instructions">
  <div class="bad-instruction">
    <strong>人には通じるかもしれない</strong>
    <p>「数字をいい感じに並べて」</p>
    <small>何を基準に？　大きい順？　小さい順？</small>
  </div>
  <div class="good-instruction">
    <strong>コンピュータにも伝わる</strong>
    <p>「左から右へ、小さい順に並べる」</p>
    <small>基準と終了地点が明確</small>
  </div>
</div>

## 1.3 擬似言語とは

擬似言語は、アルゴリズムをプログラムに近い形で表現するための記述方法です。特定のプログラミング言語に依存せず、処理の考え方を表します。

<div class="bridge-visual">
  <div><span>人の言葉</span><strong>合計を計算して表示する</strong></div>
  <b>→</b>
  <div class="bridge-center"><span>擬似言語</span><strong>total ← price × count</strong></div>
  <b>→</b>
  <div><span>プログラム</span><strong>各言語の書き方へ変換</strong></div>
</div>

本書では、IPAが定める基本情報技術者試験用の擬似言語の記述形式に合わせます。

```text
整数型: price
整数型: count
整数型: total

price ← 150
count ← 3
total ← price × count
表示する(total)
```

上から一行ずつ実行すると、`total` には450が入り、450が表示されます。

<div class="note-box">
  <p class="box-title">※ 本書の練習問題で使う共通仕様</p>
  <p><code>入力する()</code>は入力された値を返す関数、<code>表示する(値)</code>は受け取った値を画面に表示する手続として扱います。これらの名前は試験共通の命令ではありません。実際の試験では、問題文に書かれた関数・手続の名前と仕様に従います。</p>
</div>

<div class="term-box">
  <p class="box-title">※ 「○」は手続・関数の宣言</p>
  <pre><code>○整数型: add(整数型: a, 整数型: b)
  return a ＋ b</code></pre>
  <p>試験では、手続や関数の宣言を先頭の<code>○</code>で表します。この例は、整数<code>a</code>と<code>b</code>を受け取り、その合計を返す関数です。</p>
</div>

<div class="important-box">
  <p class="box-title">問題文で定義された仕様を最優先する</p>
  <p>本書のコード表記は試験形式に合わせています。ただし、配列の要素番号が始まる位置、関数が受け取る引数、返す値などは問題ごとに定義されます。その部分は必ず問題文の指示を優先します。</p>
</div>

## 1.4 処理を作る三つの基本構造

複雑なアルゴリズムも、基本的には次の三つを組み合わせて作ります。

<div class="structure-map">
  <div>
    <span class="structure-number">1</span>
    <strong>順次</strong>
    <p>上から順番に行う</p>
    <small>例：服を着てから靴を履く</small>
  </div>
  <div>
    <span class="structure-number">2</span>
    <strong>選択</strong>
    <p>条件で行動を変える</p>
    <small>例：雨なら傘を持つ</small>
  </div>
  <div>
    <span class="structure-number">3</span>
    <strong>繰返し</strong>
    <p>同じことを何度か行う</p>
    <small>例：全員分の出席を取る</small>
  </div>
</div>

### 順次

上から下へ、決められた順番で処理します。

```text
a ← 5
b ← 10
c ← a ＋ b
```

### 選択

条件によって、実行する処理を分けます。

```text
if (score ≧ 60)
  表示する("合格")
else
  表示する("不合格")
endif
```

### 繰返し

条件や回数に従って、同じ処理を繰り返します。

```text
for (i を 1 から 5 まで 1 ずつ増やす)
  表示する(i)
endfor
```

<div class="checkpoint">
  <p class="checkpoint-label">理解チェック</p>
  <p>「合計が100以上なら割引し、商品ごとに同じ計算を繰り返す」という処理には、三つの基本構造のうち何が含まれますか。</p>
</div>

<div class="page-break"></div>

<a id="chapter-2"></a>

# 第2章　変数・データ型・代入

## 2.1 変数は値を覚える場所

プログラムでは、計算途中の値を覚えておく必要があります。その保管場所が**変数**です。

変数には名前を付けます。例えば、合計を保存する変数なら`total`、件数なら`count`のように、役割が分かる名前を使います。

<div class="variable-visual">
  <p class="visual-title">変数は「名前付きの箱」</p>
  <div class="variable-box">
    <span class="variable-name">total</span>
    <strong>0</strong>
  </div>
  <div class="visual-notes">
    <p><b>箱の名前：</b>`total`</p>
    <p><b>箱の中身：</b>`0`</p>
    <p><b>箱に入れられるもの：</b>整数</p>
  </div>
</div>

```text
整数型: total
total ← 0
```

この例では、整数を保存する変数`total`を用意し、最初の値として0を入れています。

## 2.2 データ型

データ型は、変数にどのような値を保存するかを表します。

データ型は、箱に貼る「中に何を入れてよいか」というラベルです。整数用の箱に文章を入れないように、保存する値の種類をあらかじめ決めます。

| データ型 | 保存する値の例 | 使用例 |
|---|---|---|
| 整数型 | `10`、`-3`、`0` | 件数、添字、合計 |
| 実数型 | `3.14`、`18.5` | 平均、身長、割合 |
| 文字型 | `'A'`、`'?'` | 一文字の記号 |
| 文字列型 | `"合格"`、`"Tokyo"` | 名前、メッセージ |
| 論理型 | `true`、`false` | 条件が成立するか |

<div class="note-box">
  <p class="box-title">数字と文字列は別物</p>
  <p>整数の`10`は計算に使えますが、文字列の`"10"`は文字として扱われます。問題文で指定されたデータ型を確認しましょう。</p>
</div>

## 2.3 代入は右から左へ読む

代入とは、計算結果や値を変数へ入れる操作です。

```text
total ← total ＋ 5
```

<div class="assignment-visual">
  <div class="assignment-right"><span>右側を先に計算</span><strong>3 ＋ 5 ＝ 8</strong></div>
  <b class="assignment-arrow">→</b>
  <div class="assignment-left"><span>左側の箱へ入れる</span><strong>total ← 8</strong></div>
</div>

これは、次の順番で実行します。

1. 現在の`total`の値を取り出す
2. その値に5を足す
3. 計算結果を`total`へ入れ直す

数学の等式ではありません。「左辺と右辺が等しい」とは読みません。

### 例

実行前の`total`が3の場合を考えます。

| 実行する文 | 右辺の計算 | 実行後の`total` |
|---|---:|---:|
| `total ← total ＋ 5` | `3 ＋ 5` | `8` |

## 2.4 値は上書きされる

変数へ新しい値を代入すると、以前の値は失われます。

```text
a ← 10
a ← 3
```

実行後の`a`は3です。最初に入れた10は残りません。

<div class="overwrite-visual">
  <div><span>1回目</span><div class="small-variable"><small>a</small><strong>10</strong></div></div>
  <b>新しい値を入れる →</b>
  <div><span>2回目</span><div class="small-variable changed"><small>a</small><strong>3</strong></div></div>
  <p>同じ箱の中身が10から3へ置き換わる</p>
</div>

## 2.5 二つの変数の値を交換する

`a`に10、`b`に3が入っているとします。二つの値を交換するには、一時的に値を保存する変数が必要です。

二つのコップの飲み物を交換するとき、空のコップが一つ必要なのと同じです。`work`は、値を一時的に避難させる空のコップです。

<div class="swap-visual">
  <div class="swap-stage">
    <span>最初</span>
    <div class="small-variable"><small>a</small><strong>10</strong></div>
    <div class="small-variable"><small>b</small><strong>3</strong></div>
    <div class="small-variable empty"><small>work</small><strong>空</strong></div>
  </div>
  <b>→</b>
  <div class="swap-stage">
    <span>一時保存</span>
    <div class="small-variable"><small>a</small><strong>10</strong></div>
    <div class="small-variable"><small>b</small><strong>3</strong></div>
    <div class="small-variable changed"><small>work</small><strong>3</strong></div>
  </div>
  <b>→</b>
  <div class="swap-stage">
    <span>交換後</span>
    <div class="small-variable changed"><small>a</small><strong>3</strong></div>
    <div class="small-variable changed"><small>b</small><strong>10</strong></div>
  </div>
</div>

```text
整数型: work

work ← b
b ← a
a ← work
```

| 実行後 | `a` | `b` | `work` |
|---|---:|---:|---:|
| 初期状態 | 10 | 3 | 未定義 |
| `work ← b` | 10 | 3 | 3 |
| `b ← a` | 10 | 10 | 3 |
| `a ← work` | 3 | 10 | 3 |

<div class="mistake-box">
  <p class="box-title">よくある間違い</p>
  <pre><code>a ← b
b ← a</code></pre>
  <p>一行目を実行した時点で、`a`に入っていた10が失われます。二行目では、どちらも3になってしまいます。</p>
</div>

## 演習2-A　代入を追う

<span class="difficulty">難易度 ★☆☆</span>

次の処理が終わったとき、`total`の値はいくつですか。

```text
整数型: total

total ← 2
total ← total ＋ 3
total ← total × 2
```

| 実行した文 | 実行後の`total` |
|---|---:|
| `total ← 2` | |
| `total ← total ＋ 3` | |
| `total ← total × 2` | |

<div class="ai-box">
  <p class="ai-label">AIへの質問例｜値の変化を追えないとき</p>
  <p>最終的な答えはまだ教えないでください。各行の右辺を先に計算するために、私へ一問ずつ質問してください。私の回答が間違っている場合は、その行だけを指摘してください。</p>
</div>

## 演習2-B　値を交換する

<span class="difficulty">難易度 ★☆☆</span>

`x`に7、`y`に12が入っています。実行後に`x`が12、`y`が7となるように、空欄を埋めてください。

```text
整数型: work

work ← [ ① ]
x ← [ ② ]
y ← [ ③ ]
```

<div class="explain-box">
  <p class="box-title">説明してみよう</p>
  <p>なぜ一時変数`work`が必要なのかを、プログラミングを知らない人へ説明してください。</p>
</div>

<div class="page-break"></div>

<a id="chapter-3"></a>

# 第3章　順次処理

## 3.1 上から順番に実行する

順次処理は、文を上から下へ一度ずつ実行する、最も基本的な構造です。

<div class="vertical-sequence">
  <div><span>1</span><p>リンゴの単価を150円として覚える</p></div>
  <i>↓</i>
  <div><span>2</span><p>みかんの単価を80円として覚える</p></div>
  <i>↓</i>
  <div><span>3</span><p>それぞれの代金を計算して足す</p></div>
  <i>↓</i>
  <div><span>4</span><p>合計金額を表示する</p></div>
</div>

```text
整数型: apple
整数型: orange
整数型: total

apple ← 150
orange ← 80
total ← apple × 3 ＋ orange × 4
表示する(total)
```

この処理は、150円のリンゴを3個、80円のみかんを4個買ったときの合計金額を求めています。

## 3.2 入力・処理・出力で整理する

問題文を読んだら、最初に次の三つへ分けます。

<div class="ipo-visual">
  <div><span>INPUT</span><strong>入力</strong><p>150円、3個<br>80円、4個</p></div>
  <b>→</b>
  <div><span>PROCESS</span><strong>処理</strong><p>150×3<br>＋80×4</p></div>
  <b>→</b>
  <div><span>OUTPUT</span><strong>出力</strong><p>合計770円</p></div>
</div>

| 分類 | 意味 | 例 |
|---|---|---|
| 入力 | 最初に与えられる値 | 単価、個数 |
| 処理 | 入力を使って行う計算 | 単価×個数、合計 |
| 出力 | 最後に求めるもの | 合計金額 |

<div class="ai-box">
  <p class="ai-label">AIへの質問例｜問題文を整理するとき</p>
  <p>完成した擬似言語は作らないでください。次の問題文から、入力・処理・出力を分けるための質問を、一問ずつ私にしてください。私が答えた後、不足があれば指摘してください。</p>
</div>

## 演習3-A　代金を計算する

<span class="difficulty">難易度 ★☆☆</span>

一つ150円のリンゴを3個、一つ80円のみかんを4個買います。合計金額を計算して表示するように、空欄を埋めてください。

```text
整数型: apple
整数型: orange
整数型: total

apple ← [ ① ]
orange ← [ ② ]
total ← [ ③ ]
表示する(total)
```

### 自分の説明

<div class="answer-sheet">
  <p class="sheet-title">自分の言葉で書く</p>
  <div><strong>変数 apple の役割</strong><span></span></div>
  <div><strong>変数 orange の役割</strong><span></span></div>
  <div><strong>変数 total の役割</strong><span></span></div>
</div>

<div class="explain-box">
  <p class="box-title">ペアまたはAIへ説明しよう</p>
  <p>自分が作った式を、どの部分が「リンゴの代金」「みかんの代金」「全体の合計」なのかに分けて説明してください。聞き手は、答えを教えるのではなく、変数の役割について質問します。</p>
</div>

## 演習3-B　消費税込みの金額

<span class="difficulty">難易度 ★★☆</span>

商品の税抜価格`price`と税率`rate`が与えられています。税込価格を求めて表示する処理を作成してください。小数点以下の扱いは考えず、実数型で計算します。

```text
実数型: price
実数型: rate
実数型: taxIncluded

price ← 1200
rate ← 0.1

// ここに処理を書く
```

<div class="ai-box">
  <p class="ai-label">AIへの質問例｜式を点検するとき</p>
  <p>私が作った税込価格の計算式を確認してください。正しい式を先に示さず、「税額を求めている式」か「税込価格を求めている式」かという観点だけで指摘してください。</p>
</div>

<div class="page-break"></div>

<a id="chapter-4"></a>

# 第4章　選択処理

## 4.1 条件によって処理を分ける

選択処理は、条件が成立するかどうかによって、実行する処理を変えます。

<div class="everyday-choice">
  <p class="visual-title">選択は「雨が降っている？」と考えるのと同じ</p>
  <div class="choice-question">雨が降っている？</div>
  <div class="choice-branches">
    <div><span>はい</span><strong>傘を持つ</strong></div>
    <div><span>いいえ</span><strong>そのまま出かける</strong></div>
  </div>
</div>

```text
if (score ≧ 60)
  表示する("合格")
else
  表示する("不合格")
endif
```

条件`score ≧ 60`が成立すれば「合格」、成立しなければ「不合格」を表示します。

## 4.2 比較演算子

| 演算子 | 意味 | 例 |
|---|---|---|
| `＝` | 等しい | `x ＝ 10` |
| `≠` | 等しくない | `x ≠ 10` |
| `＞` | より大きい | `x ＞ 10` |
| `＜` | より小さい | `x ＜ 10` |
| `≧` | 以上 | `x ≧ 10` |
| `≦` | 以下 | `x ≦ 10` |

<div class="note-box">
  <p class="box-title">※ 試験で使う関係演算子</p>
  <p>キーボード入力でよく使う<code>&gt;=</code>や<code>&lt;=</code>ではなく、試験問題では<code>≧</code>や<code>≦</code>を使います。代入は<code>←</code>、等しいかの比較は<code>＝</code>です。</p>
</div>

「18より大きい」と「18以上」は異なります。境界となる値を確認しましょう。

<div class="boundary-visual">
  <p class="visual-title">「60点以上」の境界を見る</p>
  <div class="number-line">
    <span>59</span><strong class="boundary-point">60</strong><span>61</span>
  </div>
  <div class="boundary-labels"><span>条件を満たさない</span><span>ここから条件を満たす</span></div>
</div>

## 4.3 複数の条件

二つ以上の条件を組み合わせるときは、論理演算を使います。

<div class="logic-gates">
  <div><strong>and</strong><p>学生証も必要<br>予約票も必要</p><small>両方そろって通れる</small></div>
  <div><strong>or</strong><p>学生証または<br>運転免許証</p><small>どちらか一方で通れる</small></div>
  <div><strong>not</strong><p>「雨ではない」</p><small>条件を反対にする</small></div>
</div>

| 論理演算 | 成立する条件 |
|---|---|
| `and` | 両方の条件が成立 |
| `or` | 少なくとも一方が成立 |
| `not` | 条件が成立しない |

```text
if (age ≧ 18 and age ＜ 65)
  表示する("対象")
endif
```

## 4.4 三つ以上に分ける

```text
if (score ≧ 80)
  表示する("A")
elseif (score ≧ 60)
  表示する("B")
else
  表示する("C")
endif
```

上から条件を確認し、最初に成立した処理だけを実行します。そのため、条件を書く順番が重要です。

<div class="ranking-visual">
  <div><span>80点以上？</span><strong>A</strong></div>
  <i>成立しなければ次へ ↓</i>
  <div><span>60点以上？</span><strong>B</strong></div>
  <i>成立しなければ次へ ↓</i>
  <div><span>どちらでもない</span><strong>C</strong></div>
</div>

<div class="mistake-box">
  <p class="box-title">順番を逆にするとどうなるか</p>
  <pre><code>if (score ≧ 60)
  表示する("B")
elseif (score ≧ 80)
  表示する("A")
endif</code></pre>
  <p>`score`が90でも、最初の`score ≧ 60`が成立するため「B」と表示されます。</p>
</div>

## 演習4-A　偶数・奇数を判定する

<span class="difficulty">難易度 ★☆☆</span>

整数`x`が偶数なら「偶数」、そうでなければ「奇数」と表示します。空欄を埋めてください。`x mod 2`は、`x`を2で割った余りです。

```text
if ([ ① ])
  表示する("偶数")
else
  表示する("奇数")
endif
```

## 演習4-B　BMIを判定する

<span class="difficulty">難易度 ★★☆</span>

身長`height`（m）と体重`weight`（kg）からBMIを求め、次の基準で結果を表示します。

<div class="criteria-card">
  <p><strong>BMIの計算式</strong><code>BMI ＝ 体重 ÷ (身長 × 身長)</code></p>
  <div class="criteria-row">
    <span><b>18.5未満</b>低体重</span>
    <span><b>18.5以上25未満</b>標準体重</span>
    <span><b>25以上</b>肥満</span>
  </div>
</div>

```text
実数型: height
実数型: weight
実数型: bmi
文字列型: result

height ← 入力する()
weight ← 入力する()
bmi ← weight ÷ (height × height)

if ([ ① ])
  result ← "低体重"
elseif ([ ② ])
  result ← "標準体重"
else
  result ← "肥満"
endif

表示する(result)
```

### 境界値を確認する

| `bmi` | 期待する結果 |
|---:|---|
| 18.49 | |
| 18.50 | |
| 24.99 | |
| 25.00 | |

<div class="ai-box">
  <p class="ai-label">AIへの質問例｜条件漏れを点検するとき</p>
  <p>完成した条件式は表示しないでください。私が書いたBMI判定について、18.5と25.0の境界値を使って判定漏れや重複がないか確認し、問題がある条件だけを指摘してください。</p>
</div>

<div class="explain-box">
  <p class="box-title">説明してみよう</p>
  <p>二つ目の条件を`bmi ＜ 25`だけで書ける理由を説明してください。最初の`if`が成立しなかった時点で、どの条件が分かっているでしょうか。</p>
</div>

<div class="page-break"></div>

<a id="chapter-5"></a>

# 第5章　繰返し処理

## 5.1 同じ処理を繰り返す

繰返し処理は、決められた回数または条件が成立している間、同じ処理を実行します。

<div class="repeat-visual">
  <p class="visual-title">5人の出席を確認する</p>
  <div><span>1人目</span><span>2人目</span><span>3人目</span><span>4人目</span><span>5人目</span></div>
  <p>「名前を呼ぶ → 返事を記録する」を5回繰り返す</p>
</div>

```text
for (i を 1 から 5 まで 1 ずつ増やす)
  表示する(i)
endfor
```

この処理は、1、2、3、4、5を順番に表示します。

## 5.2 回数が決まっている繰返し

`for`は、繰り返す回数が分かっている場合に向いています。

<div class="loop-counter">
  <span class="active">i ＝ 1</span><b>→</b><span>i ＝ 2</span><b>→</b><span>i ＝ 3</span><b>→</b><span>…</span><b>→</b><span>i ＝ 10</span><b>→ 終了</b>
</div>

```text
整数型: i

for (i を 1 から 10 まで 1 ずつ増やす)
  表示する(i)
endfor
```

<div class="note-box">
  <p class="box-title">※ 「1から10まで」は10を含む</p>
  <p><code>for (i を 1 から 10 まで 1 ずつ増やす)</code>では、<code>i</code>は1、2、…、10と変化します。開始値・終了値・増減の方向を、毎回確認します。</p>
</div>

## 5.3 条件で続ける繰返し

`while`は、条件が成立している間、処理を繰り返します。

<div class="analogy-box">
  <p class="visual-title">身近なたとえ：行列に人がいる間は受付を続ける</p>
  <p><b>for：</b>最初から「10人」と分かっているとき</p>
  <p><b>while：</b>あと何人来るか分からず、「待っている人がいる間」続けるとき</p>
</div>

```text
整数型: i

i ← 1
while (i ≦ 5)
  表示する(i)
  i ← i ＋ 1
endwhile
```

### `while`を読む順番

1. 繰返しの前に初期値を確認する
2. 条件式を確認する
3. 条件が成立したら処理を実行する
4. 変数の更新を確認する
5. 条件式へ戻る

<div class="important-box">
  <p class="box-title">無限ループに注意</p>
  <p>`i ← i ＋ 1`がなければ、`i`は1のままです。条件`i ≦ 5`が常に成立し、処理が終わりません。繰返しでは「いつ条件が成立しなくなるか」を確認します。</p>
</div>

## 5.4 合計を求める

1から5までの合計を求めます。

<div class="piggy-bank">
  <p class="visual-title">`total`は、数字を貯める貯金箱</p>
  <div><span>0</span><b>＋1</b><span>1</span><b>＋2</b><span>3</span><b>＋3</b><span>6</span><b>＋4</b><span>10</span><b>＋5</b><span class="final">15</span></div>
</div>

```text
整数型: i
整数型: total

total ← 0

for (i を 1 から 5 まで 1 ずつ増やす)
  total ← total ＋ i
endfor

表示する(total)
```

| `i` | 実行前の`total` | `total ＋ i` | 実行後の`total` |
|---:|---:|---:|---:|
| 1 | 0 | 1 | 1 |
| 2 | 1 | 3 | 3 |
| 3 | 3 | 6 | 6 |
| 4 | 6 | 10 | 10 |
| 5 | 10 | 15 | 15 |

<div class="term-box">
  <p class="box-title">累積する変数</p>
  <p>`total`のように、繰返しのたびに値を加えていく変数を累積用の変数として使います。合計の初期値は通常0です。</p>
</div>

## 5.5 件数を数える

1から10までの整数のうち、偶数の件数を数えます。

<div class="tally-visual">
  <p class="visual-title">`count`は、条件に合ったときだけ押すカウンター</p>
  <div><span>1</span><span class="hit">2</span><span>3</span><span class="hit">4</span><span>5</span><span class="hit">6</span><span>7</span><span class="hit">8</span><span>9</span><span class="hit">10</span></div>
  <p>色の付いた偶数だけで、カウンターを1増やす</p>
</div>

```text
整数型: i
整数型: count

count ← 0

for (i を 1 から 10 まで 1 ずつ増やす)
  if (i mod 2 ＝ 0)
    count ← count ＋ 1
  endif
endfor

表示する(count)
```

`count`は、条件が成立した場合だけ1増えます。

## 演習5-A　合計と平均

<span class="difficulty">難易度 ★★☆</span>

1から10までの整数を順番に表示し、最後に合計と平均を表示します。空欄を埋めてください。

```text
整数型: i
整数型: total
実数型: average

total ← [ ① ]

for (i を [ ② ] から [ ③ ] まで 1 ずつ増やす)
  表示する(i)
  total ← [ ④ ]
endfor

average ← [ ⑤ ]
表示する(total)
表示する(average)
```

<div class="ai-box">
  <p class="ai-label">AIへの質問例｜繰返しを追うとき</p>
  <p>空欄の答えは教えないでください。`i`、実行前の`total`、実行後の`total`を記録する空のトレース表を作ってください。最初の二回は私が埋めるので、間違っているセルだけを指摘してください。</p>
</div>

## 演習5-B　処理回数を数える

<span class="difficulty">難易度 ★★☆</span>

次の処理で、処理①と処理②はそれぞれ何回実行されますか。

```text
整数型: i

i ← 1

while (i ≦ 5)
  // 処理①
  if (i mod 2 ＝ 1)
    // 処理②
  endif
  i ← i ＋ 1
endwhile
```

| `i` | `i ≦ 5` | 処理① | `i mod 2 ＝ 1` | 処理② |
|---:|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |
| 6 | | | | |

<div class="ai-box">
  <p class="ai-label">AIへの質問例｜自分の表を点検するとき</p>
  <p>実行回数の正解はまだ教えないでください。私が作成した表を確認し、条件判定と処理実行を混同している最初の行だけを指摘してください。</p>
</div>

<div class="page-break"></div>

<a id="chapter-6"></a>

# 第6章　配列

## 6.1 配列は同じ型の値をまとめる

配列は、同じデータ型の複数の値を、一つの名前で管理する仕組みです。

<div class="array-visual">
  <p class="visual-title">配列は「番号付きのロッカー」</p>
  <div class="array-cells">
    <div><small>A[1]</small><strong>5</strong></div>
    <div><small>A[2]</small><strong>10</strong></div>
    <div><small>A[3]</small><strong>3</strong></div>
  </div>
  <p>配列名は建物の名前、添字はロッカー番号、値は中に入っている荷物です。</p>
</div>

```text
整数型の配列: A ← {5, 10, 3}
```

この例では、配列の要素番号を1から始めます。

| 要素 | `A[1]` | `A[2]` | `A[3]` |
|---|---:|---:|---:|
| 値 | 5 | 10 | 3 |

`A`は配列全体の名前、`A[2]`は二番目の要素を表します。

<div class="important-box">
  <p class="box-title">※ 配列の要素番号を確認する</p>
  <p>試験問題では、「配列の要素番号は1から始まる」のように開始位置が示されます。<code>A[1]</code>を先頭と決めつけず、問題文の指定を確認します。</p>
</div>

## 6.2 配列の要素を順番に表示する

```text
整数型: i
整数型の配列: A ← {3, 8, 2, 5}

for (i を 1 から 4 まで 1 ずつ増やす)
  表示する(A[i])
endfor
```

`i`が1、2、3、4と変化するため、`A[1]`、`A[2]`、`A[3]`、`A[4]`を順番に参照します。

<div class="array-pointer">
  <div class="array-cells">
    <div><small>A[1]</small><strong>3</strong></div>
    <div class="selected"><small>A[2]</small><strong>8</strong></div>
    <div><small>A[3]</small><strong>2</strong></div>
    <div><small>A[4]</small><strong>5</strong></div>
  </div>
  <p><span>↑</span> `i ＝ 2`なら、2番のロッカー`A[2]`を見る</p>
</div>

## 6.3 配列の合計

```text
整数型: i
整数型: total
整数型の配列: A ← {3, 8, 2, 5}

total ← 0

for (i を 1 から 4 まで 1 ずつ増やす)
  total ← total ＋ A[i]
endfor

表示する(total)
```

| `i` | `A[i]` | 実行前の`total` | 実行後の`total` |
|---:|---:|---:|---:|
| 1 | 3 | 0 | 3 |
| 2 | 8 | 3 | 11 |
| 3 | 2 | 11 | 13 |
| 4 | 5 | 13 | 18 |

<div class="array-sum-strip">
  <span>0</span><b>+ A[1]の3</b><span>3</span><b>+ A[2]の8</b><span>11</span><b>+ A[3]の2</b><span>13</span><b>+ A[4]の5</b><span class="final">18</span>
</div>

## 6.4 配列の最大値

```text
整数型: i
整数型: max
整数型の配列: A ← {2, 5, 1, 9, 8, 10, 7, 3, 6, 4}

max ← A[1]

for (i を 2 から 10 まで 1 ずつ増やす)
  if (A[i] ＞ max)
    max ← A[i]
  endif
endfor

表示する(max)
```

最初の要素`A[1]`を、現在の最大値として`max`へ入れます。その後、残りの要素を一つずつ比較します。

<div class="champion-visual">
  <p class="visual-title">`max`は「暫定チャンピオン」</p>
  <div><span>2</span><b>→</b><span class="winner">5</span><b>→</b><span>1</span><b>→</b><span class="winner">9</span><b>→</b><span>8</span><b>→</b><span class="winner final">10</span></div>
  <p>今のチャンピオンより大きい値が現れたときだけ、`max`を交代する</p>
</div>

<div class="note-box">
  <p class="box-title">なぜ最大値の初期値を0にしないのか</p>
  <p>配列の値がすべて負の数の場合、0は配列に存在しないのに最大値として残ってしまいます。最初の要素を初期値にすれば、配列内の値から最大値を選べます。</p>
</div>

## 演習6-A　10個の合計

<span class="difficulty">難易度 ★★☆</span>

配列`A`には、添字1から10までの10個の整数が入っています。合計を求めるように空欄を埋めてください。

```text
整数型: i
整数型: total
整数型の配列: A

total ← [ ① ]

for (i を [ ② ] から [ ③ ] まで 1 ずつ増やす)
  total ← [ ④ ]
endfor

表示する(total)
```

<div class="ai-box">
  <p class="ai-label">AIへの質問例｜添字と値を整理するとき</p>
  <p>空欄の答えは表示しないでください。`i`、`A[i]`、`total`がそれぞれ何を表しているかを確認する質問を、一問ずつ出してください。</p>
</div>

## 演習6-B　最大値の変化を追う

<span class="difficulty">難易度 ★★☆</span>

次の配列を使って、最大値を求める処理をトレースしてください。

```text
A ← {2, 5, 1, 9, 8, 10, 7, 3, 6, 4}
```

| `i` | `A[i]` | 比較前の`max` | `A[i] ＞ max` | 比較後の`max` |
|---:|---:|---:|---|---:|
| 初期化 | 2 | ― | ― | 2 |
| 2 | 5 | | | |
| 3 | 1 | | | |
| 4 | 9 | | | |
| 5 | 8 | | | |
| 6 | 10 | | | |
| 7 | 7 | | | |
| 8 | 3 | | | |
| 9 | 6 | | | |
| 10 | 4 | | | |

<div class="ai-box">
  <p class="ai-label">AIへの質問例｜自分のトレースを確認するとき</p>
  <p>最終的な最大値は教えないでください。私の表で、`max`を更新する必要があるのに更新していない最初の行、または更新する必要がないのに更新した最初の行だけを指摘してください。</p>
</div>

<div class="page-break"></div>

<a id="chapter-7"></a>

# 第7章　トレースの技術

## 7.1 コードを眺めるだけでは解けない

科目Bでは、擬似言語を見て「何となく分かった」と感じても、選択肢を正しく選べないことがあります。値の変化を紙に書き、処理を実行した結果を確認する必要があります。

この作業を**トレース**といいます。

<div class="trace-visual">
  <div class="trace-code">
    <span>1回目</span><strong>total ← 0 ＋ 1</strong>
    <span>2回目</span><strong>total ← 1 ＋ 2</strong>
    <span>3回目</span><strong>total ← 3 ＋ 3</strong>
  </div>
  <b>→</b>
  <div class="trace-note">
    <p class="visual-title">頭の中だけで追わない</p>
    <p>「何回目か」「計算前」「計算後」を表へ書く。トレースは、プログラムの実況中継です。</p>
  </div>
</div>

## 7.2 最初に表の列を決める

すべての変数を書く必要はありません。次を目安に列を作ります。

<div class="trace-column-guide">
  <div><strong>いつ？</strong><span>i</span><small>何回目か</small></div>
  <div><strong>何を使う？</strong><span>A[i]</span><small>現在の要素</small></div>
  <div><strong>どう変わる？</strong><span>total</span><small>実行前と実行後</small></div>
</div>

- 繰返しを制御する変数
- 条件式で参照する変数
- 処理によって値が更新される変数
- 配列の場合は、添字と現在参照する要素

### 例

```text
整数型: i
整数型: total

total ← 0

for (i を 1 から 3 まで 1 ずつ増やす)
  total ← total ＋ i × 2
endfor
```

| `i` | `i × 2` | 実行前の`total` | 実行後の`total` |
|---:|---:|---:|---:|
| 1 | 2 | 0 | 2 |
| 2 | 4 | 2 | 6 |
| 3 | 6 | 6 | 12 |

## 7.3 「いつの値か」を明確にする

次の二つは意味が異なります。

- 文を実行する前の値
- 文を実行した後の値

トレース表の見出しに「実行前」「実行後」と書くと、混乱を防げます。

## 7.4 条件判定も一行として記録する

選択処理や繰返しでは、処理本体だけでなく条件判定も行われます。

```text
i ← 1

while (i ≦ 3)
  表示する(i)
  i ← i ＋ 1
endwhile
```

`i`が4になったときも、条件`i ≦ 3`は一度判定されます。ただし、処理本体は実行されません。

| `i` | `i ≦ 3` | 表示 | 更新後の`i` |
|---:|---|---:|---:|
| 1 | true | 1 | 2 |
| 2 | true | 2 | 3 |
| 3 | true | 3 | 4 |
| 4 | false | ― | ― |

## 7.5 AIにトレースさせる前に

AIへ「トレース表を作って」と頼むだけでは、AIが作った表を眺めて終わってしまいます。次の順序で使います。

1. 自分で必要な列を決める
2. 最初の一回分を自分で記入する
3. AIには列の過不足、または最初の誤りだけを確認させる
4. 残りを自分で埋める
5. 最後に解説と照合する

<div class="ai-box">
  <p class="ai-label">AIへの質問例｜表の設計を確認するとき</p>
  <p>この擬似言語をトレースするために、私は表の列を「i、A[i]、total」としました。答えや完成表は表示せず、追跡に不足している列、または不要な列があれば、その理由だけを教えてください。</p>
</div>

## 演習7-A　最初の誤りを見つける

<span class="difficulty">難易度 ★★☆</span>

次の処理を考えます。

```text
整数型: i
整数型: total

total ← 1

for (i を 1 から 4 まで 1 ずつ増やす)
  total ← total × i
endfor
```

ある受講者が次の表を作りました。最初に間違っている行を見つけ、正しい値を記入してください。

| `i` | 実行前の`total` | `total × i` | 実行後の`total` |
|---:|---:|---:|---:|
| 1 | 1 | 1 | 1 |
| 2 | 1 | 2 | 2 |
| 3 | 2 | 5 | 5 |
| 4 | 5 | 20 | 20 |

<div class="ai-box">
  <p class="ai-label">AIへの質問例｜自分の説明をレビューするとき</p>
  <p>私は「iが3の行で、2×3を5と計算していることが最初の誤り」と説明しました。正解を追加で示さず、この説明が論理的に成立しているかだけを評価してください。</p>
</div>

<div class="page-break"></div>

<a id="chapter-8"></a>

# 第8章　総合演習

この章では、複数の知識を組み合わせます。最初からAIへ入力せず、問題ごとに次の欄を埋めてください。

<div class="analysis-sheet">
  <p class="sheet-title">問題を解く前の確認欄</p>
  <div><strong>使われている変数</strong><span></span></div>
  <div><strong>使われている配列</strong><span></span></div>
  <div><strong>選択処理</strong><span></span></div>
  <div><strong>繰返し処理</strong><span></span></div>
  <div><strong>求めている結果</strong><span></span></div>
</div>

## 演習8-A　条件に合う値の件数

<span class="difficulty">難易度 ★★☆</span>

配列`A`には10個の整数が入っています。5以上の値がいくつあるかを数えて表示します。空欄を埋めてください。

```text
整数型: i
整数型: count
整数型の配列: A

count ← [ ① ]

for (i を 1 から 10 まで 1 ずつ増やす)
  if ([ ② ])
    [ ③ ]
  endif
endfor

表示する(count)
```

<div class="ai-box">
  <p class="ai-label">AIへの質問例｜自力で埋めた後</p>
  <p>空欄①～③を私が埋めました。完成コードを示さず、各空欄が「初期化」「条件判定」「件数の更新」のどの役割になっているかを確認してください。誤りがあれば、最初の空欄だけを指摘してください。</p>
</div>

## 演習8-B　最大値とその位置

<span class="difficulty">難易度 ★★★</span>

配列`A`の最大値と、その値が入っている添字を表示します。最大値が複数ある場合は、最初に現れる位置を表示します。

```text
整数型: i
整数型: max
整数型: maxIndex
整数型の配列: A

max ← A[1]
maxIndex ← 1

for (i を 2 から Aの要素数 まで 1 ずつ増やす)
  if ([ ① ])
    max ← [ ② ]
    maxIndex ← [ ③ ]
  endif
endfor

表示する(max)
表示する(maxIndex)
```

### 考えるポイント

- 条件を`≧`にすると、最大値が複数ある場合に何が起きるか
- `max`を更新するタイミングと`maxIndex`を更新するタイミング
- 繰返しを2から始める理由

<div class="ai-box">
  <p class="ai-label">AIへの質問例｜条件の違いを考える</p>
  <p>`A[i] ＞ max`と`A[i] ≧ max`の違いについて、具体的な配列を一つ使って質問形式で説明してください。最終的な空欄の答えは表示しないでください。</p>
</div>

## 演習8-C　記号を正方形に表示する

<span class="difficulty">難易度 ★★★</span>

整数`num`が入力されます。`num`行、各行に`num`個の`*`を表示し、正方形を作ります。改行せずに文字を表示する処理を`横に表示する()`、改行する処理を`改行する()`とします。

```text
整数型: num
整数型: i
整数型: j

num ← 入力する()

for ([ ① ])
  for ([ ② ])
    [ ③ ]
  endfor
  [ ④ ]
endfor
```

`num`が3の場合の出力：

<div class="output-sample" aria-label="numが3の場合の出力例">
  <code>***＜br＞***＜br＞***</code>
</div>

<div class="ai-box">
  <p class="ai-label">AIへの質問例｜入れ子の繰返し</p>
  <p>完成した擬似言語は示さないでください。外側の繰返しと内側の繰返しが、それぞれ「行数」と「一行の文字数」のどちらを担当するか、私が説明できるように質問してください。</p>
</div>

## 演習後の振り返り

| 振り返る項目 | 記入欄 |
|---|---|
| 最初に分からなかったこと | |
| 自分で試したこと | |
| AIへ入力した質問 | |
| AIから得たヒント | |
| AIの説明を確認した方法 | |
| 次に同じ問題を解くときの注意点 | |

<div class="page-break"></div>

<a id="answers"></a>

# 解答・解説

<div class="answer-warning">
  <p class="box-title">解答を見る前に</p>
  <p>最低でも一度は、自分で値を追ってください。AIを使った場合も、最後はAIを閉じて解き直してから解答を確認します。</p>
</div>

## 演習2-A

**答え：10**

| 実行した文 | 実行後の`total` |
|---|---:|
| `total ← 2` | 2 |
| `total ← total ＋ 3` | 5 |
| `total ← total × 2` | 10 |

最後の行では、直前の値5を使って`5 × 2`を計算します。

## 演習2-B

```text
work ← x
x ← y
y ← work
```

① `x`、② `y`、③ `work`

最初に`x`の値7を`work`へ退避してから、`x`を12へ更新します。

## 演習3-A

① `150`、② `80`、③ `apple × 3 ＋ orange × 4`

合計金額は770円です。

## 演習3-B

```text
taxIncluded ← price × (1 ＋ rate)
表示する(taxIncluded)
```

税額だけを求める場合は`price × rate`ですが、税込価格には元の価格も含まれます。

## 演習4-A

```text
x mod 2 ＝ 0
```

2で割った余りが0なら偶数です。

## 演習4-B

① `bmi ＜ 18.5`

② `bmi ＜ 25`

最初の条件が成立しなかった時点で、`bmi ≧ 18.5`であることが分かっています。そのため、二つ目では上限だけを確認できます。

| `bmi` | 結果 |
|---:|---|
| 18.49 | 低体重 |
| 18.50 | 標準体重 |
| 24.99 | 標準体重 |
| 25.00 | 肥満 |

## 演習5-A

① `0`、② `1`、③ `10`、④ `total ＋ i`、⑤ `total ÷ 10`

合計は55、平均は5.5です。

## 演習5-B

処理①は5回、処理②は3回です。

処理②を実行するのは、`i`が1、3、5の場合です。`i`が6のとき、条件判定は行いますが、繰返し内部の処理は実行しません。

## 演習6-A

① `0`、② `1`、③ `10`、④ `total ＋ A[i]`

`i`は添字、`A[i]`はその位置に保存されている値です。

## 演習6-B

`max`は次のように変化します。

<div class="value-path">
  <span>2</span><b>→</b><span>5</span><b>→</b><span>5</span><b>→</b><span>9</span><b>→</b><span>9</span><b>→</b><span>10</span><b>→</b><span>10</span><b>→</b><span>10</span><b>→</b><span>10</span><b>→</b><span>10</span>
</div>

現在の`max`より大きい値が現れた場合だけ更新します。

## 演習7-A

最初の誤りは`i ＝ 3`の行です。`2 × 3`は6なので、実行後の`total`は6です。続く`i ＝ 4`では`6 × 4`を計算し、24になります。

## 演習8-A

① `0`

② `A[i] ≧ 5`

③ `count ← count ＋ 1`

条件を満たした要素に出会うたびに、件数を1増やします。

## 演習8-B

① `A[i] ＞ max`

② `A[i]`

③ `i`

`＞`を使うため、同じ最大値が後から現れても更新せず、最初の位置が残ります。

## 演習8-C

```text
for (i を 1 から num まで 1 ずつ増やす)
  for (j を 1 から num まで 1 ずつ増やす)
    横に表示する("*")
  endfor
  改行する()
endfor
```

外側の繰返しが行数、内側の繰返しが一行に表示する`*`の個数を担当します。

<div class="page-break"></div>

<a id="roadmap"></a>

# 研修後の学習ロードマップ

本書で扱った内容は、科目Bのアルゴリズム問題を読むための入口です。次の順番で学習を続けます。

| 段階 | 学習内容 | 到達目標 |
|---|---|---|
| 1 | 変数・代入・条件分岐・繰返し | 短いコードをトレースできる |
| 2 | 一次元・二次元配列 | 添字と要素を区別できる |
| 3 | 合計・件数・最大・最小 | 基本パターンを説明できる |
| 4 | 線形探索・二分探索 | 探索範囲の変化を追える |
| 5 | 基本的な整列 | 要素の交換を追える |
| 6 | スタック・キュー・リスト | データ構造の操作を理解できる |
| 7 | 再帰・木・グラフ | 呼出しと探索順を追える |
| 8 | 科目B形式の総合問題 | 時間内に必要な値を追える |

## 自習の一週間モデル

| 曜日 | 学習内容 |
|---|---|
| 1日目 | 概念説明を読み、例題をトレースする |
| 2日目 | 基本問題をAIなしで解く |
| 3日目 | 間違えた問題についてAIへ質問する |
| 4日目 | AIが作成した易しい類題を解く |
| 5日目 | 本番形式の問題を時間を測って解く |
| 6日目 | 間違いを「読解・条件・添字・計算・トレース」に分類する |
| 7日目 | AIを使わず、間違えた問題を解き直す |

## 生成AIを使う場合

PDFファイルを添付できる生成AIに本書を読み込ませる場合は、質問に次の条件を付けます。

<div class="prompt-card">
  <p class="prompt-title">生成AIへコピーして使える指示文</p>
  <p>登録された教材を優先して回答してください。<br>
  答えを直接示す前に、私がどこまで考えたかを確認してください。<br>
  最初はヒントを一つだけ提示してください。<br>
  擬似言語を説明するときは、変数の変化を表にしてください。<br>
  私の考えに誤りがある場合は、最初の誤りだけを指摘してください。<br>
  教材と異なる説明をする場合は、そのことを明示してください。</p>
</div>

<div class="important-box">
  <p class="box-title">最後は必ずAIなしで解く</p>
  <p>AIの説明を理解できても、本番でAIは使用できません。各単元の最後には、AIを閉じ、問題文と紙だけで同じ問題をもう一度解いてください。</p>
</div>

## 学習記録

| 日付 | 学習範囲 | 自力で解けた問題 | AIへ質問した内容 | 解き直し |
|---|---|---|---|---|
| | | | | □ |
| | | | | □ |
| | | | | □ |
| | | | | □ |

<div class="page-break"></div>

# 参考資料

- [独立行政法人情報処理推進機構（IPA）「試験要綱・シラバスについて」](https://www.ipa.go.jp/shiken/syllabus/gaiyou.html)
- [独立行政法人情報処理推進機構（IPA）「基本情報技術者試験 科目Bのサンプル問題」](https://www.ipa.go.jp/shiken/syllabus/ps6vr7000000oett-att/fe_kamoku_b_sample.pdf)
- [独立行政法人情報処理推進機構（IPA）「令和8年度 基本情報技術者試験 科目B 公開問題」](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/rcu1hd0000012qj6-att/2026r08_fe_kamoku_b_qs.pdf)
- [独立行政法人情報処理推進機構（IPA）「SG・FE 公開問題」](https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/index.html)

---

本教材は内容確認用の初稿です。擬似言語は基本情報技術者試験用の記述形式に合わせています。演習量、難易度、解説の粒度は、研修対象者と実施時間に合わせて調整します。
