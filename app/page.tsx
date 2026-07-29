"use client";

import { useState } from "react";

const chapters = [
  { number: "00", title: "この本の使い方", status: "done" },
  { number: "01", title: "擬似言語の読み方", status: "current" },
  { number: "02", title: "配列とトレース", status: "next" },
  { number: "03", title: "基本アルゴリズム", status: "next" },
  { number: "04", title: "データ構造", status: "next" },
  { number: "05", title: "応用アルゴリズム", status: "next" },
  { number: "06", title: "情報セキュリティ", status: "next" },
  { number: "07", title: "実践演習", status: "next" },
];

const promptText =
  "次の擬似コードについて、答えはまだ教えず、変数 total の値がどの順番で変化するかを表にするためのヒントをください。私が書いた表に誤りがある場合は、誤っている行だけを指摘してください。";

export default function Home() {
  const [promptOpen, setPromptOpen] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const isCorrect = answer === "10";

  async function copyPrompt() {
    await navigator.clipboard.writeText(promptText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="ALGONOTE トップへ">
          <span className="brand-mark">A</span>
          <span>
            <strong>ALGONOTE</strong>
            <small>科目Bを、読める力から。</small>
          </span>
        </a>
        <div className="topbar-actions">
          <span className="course-label">基本情報技術者試験 科目B</span>
          <button className="outline-button" type="button">
            学習ガイド
          </button>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar" aria-label="章の一覧">
          <div className="sidebar-heading">
            <span>CONTENTS</span>
            <strong>全8章</strong>
          </div>
          <nav>
            {chapters.map((chapter) => (
              <a
                key={chapter.number}
                className={`chapter-link ${chapter.status}`}
                href={chapter.status === "current" ? "#lesson" : "#roadmap"}
                aria-current={chapter.status === "current" ? "page" : undefined}
              >
                <span className="chapter-number">{chapter.number}</span>
                <span>{chapter.title}</span>
                {chapter.status === "done" && (
                  <span className="chapter-check" aria-label="完了">
                    ✓
                  </span>
                )}
              </a>
            ))}
          </nav>
          <div className="sidebar-note">
            <span className="note-icon">↗</span>
            <p>
              <strong>研修ではここまで</strong>
              <br />
              第1章の演習までを一緒に体験します。続きは同じ手順で自習できます。
            </p>
          </div>
        </aside>

        <main id="top">
          <section className="lesson-hero" id="lesson">
            <div className="hero-copy">
              <div className="eyebrow">
                <span>CHAPTER 01</span>
                <span className="level">LEVEL 1</span>
                <span>読了目安 25分</span>
              </div>
              <h1>
                変数は、
                <br />
                値をしまう箱。
              </h1>
              <p>
                アルゴリズムを読む第一歩は、処理の途中で値がどう変わるかを追うことです。
                まずは「変数」と「代入」の2つだけを使って考えます。
              </p>
            </div>
            <div className="hero-visual" aria-label="変数totalの値が3から8へ変化する図">
              <div className="code-label">変数名</div>
              <div className="variable-name">total</div>
              <div className="value-flow">
                <div className="value-box old">
                  <span>変更前</span>
                  <strong>3</strong>
                </div>
                <span className="flow-arrow">→</span>
                <div className="value-box new">
                  <span>変更後</span>
                  <strong>8</strong>
                </div>
              </div>
              <code>total ← total + 5</code>
            </div>
          </section>

          <div className="content-column">
            <section className="objectives">
              <span className="section-index">01</span>
              <div>
                <p className="kicker">この節のゴール</p>
                <h2>読み終えたら、できること</h2>
                <ul>
                  <li>変数と代入を、自分の言葉で説明できる</li>
                  <li>短い擬似コードを上から順番に読める</li>
                  <li>変数の値をトレース表に記録できる</li>
                </ul>
              </div>
            </section>

            <section className="text-section">
              <p className="kicker">1.1 変数とは</p>
              <h2>名前をつけた「一時的な保管場所」</h2>
              <p>
                計算の途中では、合計や件数などの値を一時的に覚えておく必要があります。その保管場所が
                <strong>変数</strong>です。箱にラベルを貼るように、変数には役割が分かる名前をつけます。
              </p>
              <div className="analogy-card">
                <div className="analogy-badge">日常で例えると</div>
                <div className="analogy-illustration">
                  <span className="jar-label">合計</span>
                  <strong>8</strong>
                </div>
                <p>
                  「合計」と書いた容器に、現在の合計値を入れておくイメージです。新しい数を足すたびに、
                  容器の中身を新しい値へ入れ替えます。
                </p>
              </div>
            </section>

            <section className="text-section">
              <p className="kicker">1.2 代入とは</p>
              <h2>右側を計算して、左側へ入れる</h2>
              <p>
                科目Bの擬似言語では、値を変数へ入れる操作を「←」で表します。数学の等号とは意味が違うため、
                必ず右側から読みます。
              </p>
              <div className="code-card">
                <div className="code-card-header">
                  <span>擬似コード</span>
                  <span>右から左へ読む →</span>
                </div>
                <pre>
                  <span className="code-var">total</span>
                  <span className="code-op"> ← </span>
                  <span className="code-var">total</span>
                  <span> + </span>
                  <span className="code-num">5</span>
                </pre>
                <p>
                  ① 現在の total に5を足す　→　② 計算結果を total に入れ直す
                </p>
              </div>
              <div className="important-note">
                <span>!</span>
                <p>
                  <strong>読み方のコツ</strong>
                  <br />
                  「total と total + 5 が等しい」ではなく、「total の中身を、現在値より5大きい値に更新する」と読みます。
                </p>
              </div>
            </section>

            <section className="exercise-section">
              <div className="exercise-heading">
                <div>
                  <p className="kicker light">MINI EXERCISE 01</p>
                  <h2>手を動かして追ってみよう</h2>
                </div>
                <span className="difficulty">難易度 ★☆☆</span>
              </div>
              <div className="exercise-body">
                <p className="problem-lead">
                  次の処理が終わったとき、変数 <code>total</code> の値はいくつですか。
                </p>
                <pre className="problem-code">
                  <span>① total ← 2</span>
                  <span>② total ← total + 3</span>
                  <span>③ total ← total × 2</span>
                </pre>

                <div className="prompt-anchor">
                  <button
                    className="prompt-button"
                    type="button"
                    aria-expanded={promptOpen}
                    onClick={() => setPromptOpen((open) => !open)}
                  >
                    <span className="spark">✦</span>
                    AIへの質問例を見る
                    <span>{promptOpen ? "−" : "+"}</span>
                  </button>
                  {promptOpen && (
                    <div className="prompt-tooltip" role="dialog" aria-label="AIへの質問例">
                      <div className="tooltip-label">そのまま使える質問例</div>
                      <p>{promptText}</p>
                      <button type="button" onClick={copyPrompt}>
                        {copied ? "コピーしました ✓" : "質問文をコピー"}
                      </button>
                      <small>まず自分で1行以上追ってから使いましょう。</small>
                    </div>
                  )}
                </div>

                <fieldset className="answers">
                  <legend>答えを選んでください</legend>
                  {["5", "7", "10", "12"].map((choice) => (
                    <label
                      key={choice}
                      className={
                        answer === choice
                          ? isCorrect
                            ? "selected correct"
                            : "selected incorrect"
                          : ""
                      }
                    >
                      <input
                        type="radio"
                        name="answer"
                        value={choice}
                        checked={answer === choice}
                        onChange={(event) => setAnswer(event.target.value)}
                      />
                      <span>{choice}</span>
                    </label>
                  ))}
                </fieldset>

                {answer && (
                  <div className={`feedback ${isCorrect ? "correct" : "incorrect"}`} aria-live="polite">
                    <strong>{isCorrect ? "正解です！" : "もう一度、②から追ってみましょう。"}</strong>
                    <p>
                      {isCorrect
                        ? "2 → 5 → 10 と変化します。式を見るだけでなく、各行を実行した直後の値を書き残すのがコツです。"
                        : "各行の右側を先に計算し、その結果で total の中身を更新してみてください。"}
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="trace-section">
              <div>
                <p className="kicker">答えを「見える化」する</p>
                <h2>トレース表にすると迷わない</h2>
                <p>
                  行ごとの変化を表に残せば、長い問題でも「どこで読み違えたか」を特定できます。
                  次章では配列も同じ方法で追います。
                </p>
              </div>
              <div className="trace-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>実行した行</th>
                      <th>total の値</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>①</td>
                      <td>2</td>
                    </tr>
                    <tr>
                      <td>②</td>
                      <td>5</td>
                    </tr>
                    <tr>
                      <td>③</td>
                      <td>10</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="roadmap-section" id="roadmap">
              <p className="kicker">この先の学習</p>
              <h2>同じ型で、科目Bの主要範囲へ</h2>
              <p>
                各章は「概念 → 最小例 → 演習 → AI質問例 → 解説」の順で進みます。
              </p>
              <div className="roadmap-grid">
                {chapters.slice(2).map((chapter, index) => (
                  <article key={chapter.number}>
                    <span>{chapter.number}</span>
                    <div>
                      <strong>{chapter.title}</strong>
                      <small>
                        {[
                          "添字・一次元配列・トレース表",
                          "集計・探索・整列・文字列処理",
                          "スタック・キュー・木・グラフ",
                          "再帰・二次元配列・シミュレーション",
                          "認証・暗号・攻撃と対策",
                          "科目B形式の総合問題",
                        ][index]}
                      </small>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <footer>
              <div>
                <strong>ALGONOTE</strong>
                <span>基本情報技術者試験 科目B オリジナル教材</span>
              </div>
              <p>Prototype edition — Chapter 01</p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
