// ぶんつくり用の文データ
// ねらい: 「だれが → どうする → なにを」の語順（英語のいちばん最初の文法）を体で覚える
// - 最低限の文法だけ。三単現(He runs)・疑問文・否定文は出さない
// - 冠詞は名詞とひとかたまりのカード（"an apple"）にして、冠詞だけを問わない
// - 日本の小学生になじみのある単語を優先（letters.ts のことばと重なるものが多い）

export type SentenceRole = 'who' | 'do' | 'what'

export type SentencePart = {
  word: string
  role: SentenceRole
}

export type Sentence = {
  emoji: string
  ja: string // 意味の支え（ひらがな中心）
  parts: SentencePart[] // 正しい語順
  level: 1 | 2 | 3 // 1=だれが+どうする(I)、2=なにを付き(I)、3=主語いろいろ
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
