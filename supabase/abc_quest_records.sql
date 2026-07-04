-- ABCクエストのプレイ記録テーブル
-- SupabaseダッシュボードのSQL Editorで1回実行してください

create table if not exists abc_quest_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references yesta_students(id),
  mode text not null check (mode in ('matching', 'quiz')),
  level int,                                  -- ペアさがし: クリアしたレベル
  stars int,                                  -- クイズ: ノーミス正解で獲得したスター数
  total int,                                  -- クイズ: 全問題数
  correct_letters text[] not null default '{}', -- ノーミスで正解したアルファベット
  wrong_letters text[] not null default '{}',   -- ミスしたアルファベット
  correct_words text[] not null default '{}',   -- クイズでノーミス正解した英単語
  played_at timestamptz not null default now()
);

-- RLSは現在の運用方針に合わせて未設定（他テーブルと同様）

-- ※ すでに旧版のcreate tableを実行済みの場合は、代わりに以下だけ実行:
-- alter table abc_quest_records
--   add column if not exists correct_letters text[] not null default '{}',
--   add column if not exists wrong_letters text[] not null default '{}',
--   add column if not exists correct_words text[] not null default '{}';
