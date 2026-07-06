# ABCクエスト（abc-quest）

小学生向けのアルファベット・英単語学習アプリ。糸島の塾で、タブレット（＋PC）のブラウザで使う。
オーナー: snj.hirato@gmail.com（塾運営者）。

## 技術構成

- Vite + React 19 + TypeScript + Tailwind CSS v4（`@tailwindcss/vite` プラグイン方式）
- 完全クライアントサイド。サーバーなし。音声はWeb Speech API（`src/lib/speech.ts`）、効果音はWeb Audio（`src/lib/sounds.ts`）— どちらも無料・通信不要
- デプロイ: GitHub `hirato201912/abc-quest`（main）→ Vercel自動デプロイ
- Vercel環境変数（必須）: `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`（値は `.env.local` と同じ。gitignore対象なのでVercel管理画面で登録）

## 画面構成（src/App.tsx のmode切り替え、ルーターなし）

| mode | 内容 |
|---|---|
| home | モード選択。右上に「なまえを えらぶ」（生徒選択） |
| cards | たんごカード: 1文字ずつ代表単語（words[0]）を音声つきで学習 |
| matching | ペアさがし: 大文字・小文字マッチング。レベル制（Lv1=4ペア→最大8ペア）、シール集め、コンボ表示 |
| quiz | クイズ: 絵と音声から頭文字を4択。8問1ラウンド、ノーミス正解のみ⭐獲得 |
| zukan | シールちょう: 成果表示の主役。ことばシール収集＋星ランク（下記） |
| player | 生徒選択（Supabaseの yesta_students から取得） |

ホームは「あそぶ」（ゲーム3つ）と「きみの せいか」（シールちょう）の2セクション構成。ゲームと成果表示を混ぜないこと（ユーザー要望）。

## データ設計の要点

- `src/data/letters.ts`: **1文字 = 複数単語の配列**（`words: WordEntry[]`）。単語を増やすときはここに1行追加するだけ。現在48語。日本の小学生が知っているカタカナ語を優先
- クイズは**未収集の単語を優先出題**（`getLocalWords()` で判定）→ 遊ぶほど図鑑が埋まる
- ずかんの動機設計（飽き対策で多層化済み）:
  - 星ランク: 文字ごとにノーミス正解 1回=★ / 3回=★★ / 5回=★★★（タイルが金色）。`src/lib/collection.ts` の `starRank()`
  - ことばカード: クイズでノーミス正解した単語だけ収集。文字タイルタップで単語一覧
- 進捗の保存先: 生徒選択時はSupabase、未選択時はlocalStorage（`abc_quest_letter_counts` / `abc_quest_words` / `abc_quest_player`）
- シールちょう（`src/components/Zukan.tsx`）: シール帳メタファー。集めたことば＝絵文字シール、未収集＝点線の空きスロット＋？、★★★＝金色リング。進捗バー＋クマ先生の応援吹き出し付き。**数字の羅列でなく絵で成果を見せる**（低学年向け、ユーザー要望）
- ブロックタウン（`src/components/BlockTown.tsx`, `src/lib/blocks.ts`）: **UIから撤去済み（未使用ファイルとして温存）**。「分かりづらい」との評価で一旦廃止。復活させる場合はApp.tsxに再接続。マインクラフトIPは使用禁止（仕組みだけ借りる方針で合意済み）。index.cssの .svg-built / .svg-next はこれ用の残置

## Supabase連動（yesta-studyと共有）

- 同じSupabaseプロジェクト（yesta-studyの `.env.local` と同じURL/anonキー）
- 生徒マスタ: `yesta_students`（id, name, grade, active）— yesta-studyが管理。退塾生は `active=false` になるので生徒取得は `.eq('active', true)` 必須（PlayerPicker.tsx）
- プレイ記録: `abc_quest_records` — DDLは `supabase/abc_quest_records.sql`。列: mode('matching'|'quiz'), level, stars, total, correct_letters[], wrong_letters[], correct_words[], played_at
- **RLSは未設定**（塾の既存運用方針に合わせた。将来生徒名簿を守るならRLS導入を提案済み）
- 記録失敗・未設定・生徒未選択でもゲームは正常動作する（graceful degradation、`src/lib/records.ts`）
- 先生用の閲覧画面はyesta-study側の `/abc-quest` ページ（プレイ履歴＋アルファベット別定着マップ）

## デザイン方針（ユーザーの明示的な要望）

- 対象は**小学生全般**（当初「小1向け」だったが限定しすぎとの指摘で変更済み）
- **配色は「節度を持って」**（ユーザー要望）: メイン=ピンク（rose-400/500）、アクション=オレンジ（orange-400、塾カラー）、背景=rose-50→orange-50の淡いグラデ、カード=白+border-rose-100。紫・青・黄・緑の乱用はNG。意味色のみ例外（正解=emerald-300、不正解=red-100、金ランク=amber）。大文字=rose-500、小文字=orange-400で統一
- UIはひらがな中心。用語は「アルファベット」（文字）と「ことば」（単語）で統一。**「もじ」という表現はNG**（指摘済み）
- **「あそぶ」もNG**（指摘済み）。努力・成長のニュアンスで統一: 「がんばる」「チャレンジ」「はじめる」を使う（例: 「いま がんばっているのは ○○さん」「だれが チャレンジする？」）
- **装飾的な絵文字・アイコンは最小限に**（ユーザーの好み）。機能的なもの（🔊、モード選択の目印）のみ可
- 間違えても罰なし（シェイクのみ）。他の生徒とのランキング比較はしない方針
- タブレット縦横・PC対応: Tailwindの `landscape:` バリアントで横長画面時にグリッド列数やカード配置を組み替え

## 画像素材

- クマ = 塾の公式キャラ。元画像は `juku-attendance/public/`（orange_left.jpg=指し棒, orange_right.jpg=チョーク, icon-512.png）
- ペンギン = えいごスタートラボのロゴ。元画像は `eigo-start-lab/public/eigo_pink_big.png`
- 元画像は白背景ベタなので、**エッジからのflood fillで外側だけ透過**に加工済み（体内部の白は保持）。加工スクリプトはスクラッチパッドにあったもの（System.Drawing使用）。再加工が必要なら同じ方式で
- `public/`: bear-pointer.png（ホーム）, bear-cheer.png（お祝い/ずかんコンプリート）, penguin.png（ホーム下部）, favicon.png, apple-touch-icon.png

## 未処理・保留事項

- `public/favicon.svg` と `public/icons.svg` は旧スキャフォールドの残骸で未使用。削除しようとしたらユーザーが中断したので保留中（削除自体は問題ないはず）
- `src/assets/`（hero.png, react.svg, vite.svg）も未使用のスキャフォールド残骸
- クマ先生の「ごほうびバッジ」（節目のお祝い）は提案済みだが見送り。反応を見て後日追加の可能性
- Supabase SQLの実行とVercel環境変数の登録はユーザー自身が行う運用（完了したかは要確認）

## 関連プロジェクト（同じ itoshima-juku フォルダ内）

- `yesta-study`: 塾の学習記録アプリ（Next.js 16 + Supabase）。生徒マスタと先生用ABCクエスト閲覧画面を持つ
- `eigo-start-lab`: 英語教室のLPサイト（Next.js + Supabase）。ABCクエストとは独立
- `juku-attendance`: 出席管理アプリ。クマ画像の出どころ
