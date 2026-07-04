export type WordEntry = {
  word: string
  emoji: string
  katakana: string
}

export type Letter = {
  upper: string
  lower: string
  words: WordEntry[] // 先頭が基本の単語。増やすほどクイズのバリエーションが広がる
}

// 日本の小学生が日常で耳にするカタカナ語・身近な単語を優先
export const LETTERS: Letter[] = [
  { upper: 'A', lower: 'a', words: [
    { word: 'Apple', emoji: '🍎', katakana: 'アップル（りんご）' },
    { word: 'Ant', emoji: '🐜', katakana: 'アント（あり）' },
  ] },
  { upper: 'B', lower: 'b', words: [
    { word: 'Banana', emoji: '🍌', katakana: 'バナナ' },
    { word: 'Bus', emoji: '🚌', katakana: 'バス' },
  ] },
  { upper: 'C', lower: 'c', words: [
    { word: 'Cake', emoji: '🍰', katakana: 'ケーキ' },
    { word: 'Cat', emoji: '🐱', katakana: 'キャット（ねこ）' },
  ] },
  { upper: 'D', lower: 'd', words: [
    { word: 'Dog', emoji: '🐶', katakana: 'ドッグ（いぬ）' },
    { word: 'Door', emoji: '🚪', katakana: 'ドア' },
  ] },
  { upper: 'E', lower: 'e', words: [
    { word: 'Egg', emoji: '🥚', katakana: 'エッグ（たまご）' },
    { word: 'Elephant', emoji: '🐘', katakana: 'エレファント（ぞう）' },
  ] },
  { upper: 'F', lower: 'f', words: [
    { word: 'Fish', emoji: '🐟', katakana: 'フィッシュ（さかな）' },
    { word: 'Flower', emoji: '🌸', katakana: 'フラワー（はな）' },
  ] },
  { upper: 'G', lower: 'g', words: [
    { word: 'Grape', emoji: '🍇', katakana: 'グレープ（ぶどう）' },
    { word: 'Guitar', emoji: '🎸', katakana: 'ギター' },
  ] },
  { upper: 'H', lower: 'h', words: [
    { word: 'Hamburger', emoji: '🍔', katakana: 'ハンバーガー' },
    { word: 'Hat', emoji: '🎩', katakana: 'ハット（ぼうし）' },
  ] },
  { upper: 'I', lower: 'i', words: [
    { word: 'Ice cream', emoji: '🍦', katakana: 'アイスクリーム' },
  ] },
  { upper: 'J', lower: 'j', words: [
    { word: 'Juice', emoji: '🧃', katakana: 'ジュース' },
    { word: 'Jet', emoji: '✈️', katakana: 'ジェット（ひこうき）' },
  ] },
  { upper: 'K', lower: 'k', words: [
    { word: 'Koala', emoji: '🐨', katakana: 'コアラ' },
    { word: 'King', emoji: '🤴', katakana: 'キング（おうさま）' },
  ] },
  { upper: 'L', lower: 'l', words: [
    { word: 'Lemon', emoji: '🍋', katakana: 'レモン' },
    { word: 'Lion', emoji: '🦁', katakana: 'ライオン' },
  ] },
  { upper: 'M', lower: 'm', words: [
    { word: 'Milk', emoji: '🥛', katakana: 'ミルク' },
    { word: 'Melon', emoji: '🍈', katakana: 'メロン' },
  ] },
  { upper: 'N', lower: 'n', words: [
    { word: 'Night', emoji: '🌙', katakana: 'ナイト（よる）' },
    { word: 'Notebook', emoji: '📓', katakana: 'ノート' },
  ] },
  { upper: 'O', lower: 'o', words: [
    { word: 'Orange', emoji: '🍊', katakana: 'オレンジ' },
    { word: 'Octopus', emoji: '🐙', katakana: 'オクトパス（たこ）' },
  ] },
  { upper: 'P', lower: 'p', words: [
    { word: 'Piano', emoji: '🎹', katakana: 'ピアノ' },
    { word: 'Pizza', emoji: '🍕', katakana: 'ピザ' },
  ] },
  { upper: 'Q', lower: 'q', words: [
    { word: 'Queen', emoji: '👑', katakana: 'クイーン（じょおう）' },
  ] },
  { upper: 'R', lower: 'r', words: [
    { word: 'Rabbit', emoji: '🐰', katakana: 'ラビット（うさぎ）' },
    { word: 'Robot', emoji: '🤖', katakana: 'ロボット' },
  ] },
  { upper: 'S', lower: 's', words: [
    { word: 'Soccer', emoji: '⚽', katakana: 'サッカー' },
    { word: 'Star', emoji: '⭐', katakana: 'スター（ほし）' },
  ] },
  { upper: 'T', lower: 't', words: [
    { word: 'Tomato', emoji: '🍅', katakana: 'トマト' },
    { word: 'Train', emoji: '🚃', katakana: 'トレイン（でんしゃ）' },
  ] },
  { upper: 'U', lower: 'u', words: [
    { word: 'Umbrella', emoji: '☂️', katakana: 'アンブレラ（かさ）' },
    { word: 'Unicorn', emoji: '🦄', katakana: 'ユニコーン' },
  ] },
  { upper: 'V', lower: 'v', words: [
    { word: 'Violin', emoji: '🎻', katakana: 'バイオリン' },
  ] },
  { upper: 'W', lower: 'w', words: [
    { word: 'Watch', emoji: '⌚', katakana: 'ウォッチ（とけい）' },
    { word: 'Water', emoji: '💧', katakana: 'ウォーター（みず）' },
  ] },
  { upper: 'X', lower: 'x', words: [
    { word: 'Xylophone', emoji: '🎵', katakana: 'シロフォン（もっきん）' },
  ] },
  { upper: 'Y', lower: 'y', words: [
    { word: 'Yogurt', emoji: '🍨', katakana: 'ヨーグルト' },
    { word: 'Yacht', emoji: '⛵', katakana: 'ヨット' },
  ] },
  { upper: 'Z', lower: 'z', words: [
    { word: 'Zebra', emoji: '🦓', katakana: 'ゼブラ（しまうま）' },
  ] },
]

export function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function pickRandom<T>(items: T[], count: number): T[] {
  return shuffle(items).slice(0, count)
}

export function randomWord(letter: Letter): WordEntry {
  return letter.words[Math.floor(Math.random() * letter.words.length)]
}
