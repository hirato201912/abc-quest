// ぶんつくり用の文データ
// ねらい: 「だれが → どうする → なにを」の語順（英語のいちばん最初の文法）を体で覚える
// - 最低限の文法だけ。三単現(He runs)・疑問文・否定文は出さない
// - 冠詞は名詞とひとかたまりのカード（"an apple"）にして、冠詞だけを問わない
// - 日本の小学生になじみのある単語を優先（letters.ts のことばと重なるものが多い）

export type SentenceRole =
  | 'who' // だれが
  | 'do' // どうする
  | 'what' // なにを
  | 'be' // です（be動詞）
  | 'how' // どんな（形容詞の補語）
  | 'thing' // なに（名詞の補語）
  | 'when' // いつ
  | 'where' // どこで

export type SentencePart = {
  word: string
  role: SentenceRole
}

export type Sentence = {
  emoji: string
  ja: string // 意味の支え（ひらがな中心）
  parts: SentencePart[] // 正しい語順
  level: 1 | 2 | 3 // 1=だれが+どうする(I)、2=なにを付き(I)、3=主語いろいろ
  distractors?: string[] // どのマスにも入らないひっかけカード（高学年用: play vs plays など）
}

export function sentenceText(s: Sentence): string {
  return s.parts.map((p) => p.word).join(' ') + '.'
}

const s = (
  level: 1 | 2 | 3,
  emoji: string,
  ja: string,
  who: string,
  doWord: string,
  what?: string,
): Sentence => ({
  emoji,
  ja,
  level,
  parts: [
    { word: who, role: 'who' },
    { word: doWord, role: 'do' },
    ...(what ? [{ word: what, role: 'what' as const }] : []),
  ],
})

export const SENTENCES: Sentence[] = [
  // レベル1: だれが + どうする（主語は I だけ）
  s(1, '🏃', 'わたしは はしる', 'I', 'run'),
  s(1, '🚶', 'わたしは あるく', 'I', 'walk'),
  s(1, '🏊', 'わたしは およぐ', 'I', 'swim'),
  s(1, '🎤', 'わたしは うたう', 'I', 'sing'),
  s(1, '💃', 'わたしは おどる', 'I', 'dance'),
  s(1, '😴', 'わたしは ねる', 'I', 'sleep'),
  s(1, '🤸', 'わたしは ジャンプする', 'I', 'jump'),

  // レベル2: だれが + どうする + なにを（主語は I だけ）
  s(2, '🍎', 'わたしは りんごを たべる', 'I', 'eat', 'an apple'),
  s(2, '🥚', 'わたしは たまごを たべる', 'I', 'eat', 'an egg'),
  s(2, '🥛', 'わたしは ミルクを のむ', 'I', 'drink', 'milk'),
  s(2, '🧃', 'わたしは ジュースを のむ', 'I', 'drink', 'juice'),
  s(2, '🐱', 'わたしは ねこが すき', 'I', 'like', 'cats'),
  s(2, '🐶', 'わたしは いぬが すき', 'I', 'like', 'dogs'),
  s(2, '⚽', 'わたしは サッカーを する', 'I', 'play', 'soccer'),
  s(2, '🎾', 'わたしは テニスを する', 'I', 'play', 'tennis'),
  s(2, '📖', 'わたしは ほんを よむ', 'I', 'read', 'a book'),
  s(2, '🖊️', 'わたしは ペンを もっている', 'I', 'have', 'a pen'),
  s(2, '🎹', 'わたしは ピアノを ひく', 'I', 'play', 'the piano'),

  // レベル3: 主語が いろいろ（You / We）
  s(3, '🏃', 'きみは はしる', 'You', 'run'),
  s(3, '⚽', 'きみは サッカーを する', 'You', 'play', 'soccer'),
  s(3, '🎵', 'きみは おんがくが すき', 'You', 'like', 'music'),
  s(3, '🥛', 'きみは ミルクを のむ', 'You', 'drink', 'milk'),
  s(3, '🍌', 'わたしたちは バナナを たべる', 'We', 'eat', 'bananas'),
  s(3, '🎤', 'わたしたちは うたう', 'We', 'sing'),
  s(3, '🏊', 'わたしたちは およぐ', 'We', 'swim'),
  s(3, '🐶', 'わたしたちは いぬが すき', 'We', 'like', 'dogs'),
]

// ---- 中学じゅんび（スピンオフ）用 ----
// ねらい: 中学英語の最初でつまずきやすい3つ（be動詞・三単現のs・時と場所は文の最後）を先取りする
// distractors で「play と plays」「am と is」を並べて、正しいほうを選び分ける練習になる
// 高学年向けなので日本語には教育漢字を使ってよい（ユーザー了承済み）。
// ただし 彼・彼女・猫・眠 などは中学配当漢字なのでひらがなのまま

const p = (word: string, role: SentenceRole): SentencePart => ({ word, role })

export const SENTENCES_PREP: Sentence[] = [
  // レベル1: be動詞（だれが + です + どんな/なに）。am/is/are のひっかけ付き
  { level: 1, emoji: '😊', ja: '私は うれしい', parts: [p('I', 'who'), p('am', 'be'), p('happy', 'how')], distractors: ['is'] },
  { level: 1, emoji: '😪', ja: '私は ねむい', parts: [p('I', 'who'), p('am', 'be'), p('sleepy', 'how')], distractors: ['are'] },
  { level: 1, emoji: '🍽️', ja: '私は おなかが すいた', parts: [p('I', 'who'), p('am', 'be'), p('hungry', 'how')], distractors: ['is'] },
  { level: 1, emoji: '📏', ja: '君は 背が 高い', parts: [p('You', 'who'), p('are', 'be'), p('tall', 'how')], distractors: ['am'] },
  { level: 1, emoji: '👩‍🏫', ja: 'かのじょは 先生 です', parts: [p('She', 'who'), p('is', 'be'), p('a teacher', 'thing')], distractors: ['am'] },
  { level: 1, emoji: '⚽', ja: 'かれは サッカー選手 です', parts: [p('He', 'who'), p('is', 'be'), p('a soccer player', 'thing')], distractors: ['are'] },
  { level: 1, emoji: '🐱', ja: 'それは ねこ です', parts: [p('It', 'who'), p('is', 'be'), p('a cat', 'thing')], distractors: ['am'] },
  { level: 1, emoji: '👫', ja: '私たちは 友だち です', parts: [p('We', 'who'), p('are', 'be'), p('friends', 'thing')], distractors: ['is'] },

  // レベル2: 三単現のs（He/She は どうする に s が付く）。sなし/あり のひっかけ付き
  { level: 2, emoji: '⚽', ja: 'かれは サッカーを する', parts: [p('He', 'who'), p('plays', 'do'), p('soccer', 'what')], distractors: ['play'] },
  { level: 2, emoji: '🐱', ja: 'かのじょは ねこが 好き', parts: [p('She', 'who'), p('likes', 'do'), p('cats', 'what')], distractors: ['like'] },
  { level: 2, emoji: '🍎', ja: 'かれは りんごを 食べる', parts: [p('He', 'who'), p('eats', 'do'), p('an apple', 'what')], distractors: ['eat'] },
  { level: 2, emoji: '🥛', ja: 'かのじょは ミルクを 飲む', parts: [p('She', 'who'), p('drinks', 'do'), p('milk', 'what')], distractors: ['drink'] },
  { level: 2, emoji: '📖', ja: 'かれは 本を 読む', parts: [p('He', 'who'), p('reads', 'do'), p('a book', 'what')], distractors: ['read'] },
  { level: 2, emoji: '🎹', ja: 'かのじょは ピアノを ひく', parts: [p('She', 'who'), p('plays', 'do'), p('the piano', 'what')], distractors: ['play'] },
  { level: 2, emoji: '🎤', ja: 'かのじょは 歌う', parts: [p('She', 'who'), p('sings', 'do')], distractors: ['sing'] },
  { level: 2, emoji: '🎾', ja: '私は テニスを する', parts: [p('I', 'who'), p('play', 'do'), p('tennis', 'what')], distractors: ['plays'] },
  { level: 2, emoji: '🎵', ja: '君は 音楽が 好き', parts: [p('You', 'who'), p('like', 'do'), p('music', 'what')], distractors: ['likes'] },

  // レベル3: いつ・どこで は文の最後（日本語との語順の違いを体感する）
  { level: 3, emoji: '⚽', ja: '私は 日曜日に サッカーを する', parts: [p('I', 'who'), p('play', 'do'), p('soccer', 'what'), p('on Sundays', 'when')] },
  { level: 3, emoji: '🌙', ja: 'かれは 夜に 本を 読む', parts: [p('He', 'who'), p('reads', 'do'), p('a book', 'what'), p('at night', 'when')] },
  { level: 3, emoji: '🏊', ja: '私たちは 夏に 泳ぐ', parts: [p('We', 'who'), p('swim', 'do'), p('in summer', 'when')] },
  { level: 3, emoji: '🎹', ja: 'かのじょは 放課後に ピアノを ひく', parts: [p('She', 'who'), p('plays', 'do'), p('the piano', 'what'), p('after school', 'when')] },
  { level: 3, emoji: '🍳', ja: '私は 7時に 朝ごはんを 食べる', parts: [p('I', 'who'), p('eat', 'do'), p('breakfast', 'what'), p('at seven', 'when')] },
  { level: 3, emoji: '🏫', ja: '君は 学校で 英語を 勉強する', parts: [p('You', 'who'), p('study', 'do'), p('English', 'what'), p('at school', 'where')] },
  { level: 3, emoji: '🥛', ja: 'かれは 朝に ミルクを 飲む', parts: [p('He', 'who'), p('drinks', 'do'), p('milk', 'what'), p('in the morning', 'when')] },
  { level: 3, emoji: '🎾', ja: 'かれらは 公園で テニスを する', parts: [p('They', 'who'), p('play', 'do'), p('tennis', 'what'), p('in the park', 'where')] },
]
