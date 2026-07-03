export type Letter = {
  upper: string
  lower: string
  word: string
  emoji: string
  katakana: string
}

// 日本の小1が日常で耳にするカタカナ語・身近な単語を優先
export const LETTERS: Letter[] = [
  { upper: 'A', lower: 'a', word: 'Apple', emoji: '🍎', katakana: 'アップル（りんご）' },
  { upper: 'B', lower: 'b', word: 'Banana', emoji: '🍌', katakana: 'バナナ' },
  { upper: 'C', lower: 'c', word: 'Cake', emoji: '🍰', katakana: 'ケーキ' },
  { upper: 'D', lower: 'd', word: 'Dog', emoji: '🐶', katakana: 'ドッグ（いぬ）' },
  { upper: 'E', lower: 'e', word: 'Egg', emoji: '🥚', katakana: 'エッグ（たまご）' },
  { upper: 'F', lower: 'f', word: 'Fish', emoji: '🐟', katakana: 'フィッシュ（さかな）' },
  { upper: 'G', lower: 'g', word: 'Grape', emoji: '🍇', katakana: 'グレープ（ぶどう）' },
  { upper: 'H', lower: 'h', word: 'Hamburger', emoji: '🍔', katakana: 'ハンバーガー' },
  { upper: 'I', lower: 'i', word: 'Ice cream', emoji: '🍦', katakana: 'アイスクリーム' },
  { upper: 'J', lower: 'j', word: 'Juice', emoji: '🧃', katakana: 'ジュース' },
  { upper: 'K', lower: 'k', word: 'Koala', emoji: '🐨', katakana: 'コアラ' },
  { upper: 'L', lower: 'l', word: 'Lemon', emoji: '🍋', katakana: 'レモン' },
  { upper: 'M', lower: 'm', word: 'Milk', emoji: '🥛', katakana: 'ミルク' },
  { upper: 'N', lower: 'n', word: 'Night', emoji: '🌙', katakana: 'ナイト（よる）' },
  { upper: 'O', lower: 'o', word: 'Orange', emoji: '🍊', katakana: 'オレンジ' },
  { upper: 'P', lower: 'p', word: 'Piano', emoji: '🎹', katakana: 'ピアノ' },
  { upper: 'Q', lower: 'q', word: 'Queen', emoji: '👑', katakana: 'クイーン（じょおう）' },
  { upper: 'R', lower: 'r', word: 'Rabbit', emoji: '🐰', katakana: 'ラビット（うさぎ）' },
  { upper: 'S', lower: 's', word: 'Soccer', emoji: '⚽', katakana: 'サッカー' },
  { upper: 'T', lower: 't', word: 'Tomato', emoji: '🍅', katakana: 'トマト' },
  { upper: 'U', lower: 'u', word: 'Umbrella', emoji: '☂️', katakana: 'アンブレラ（かさ）' },
  { upper: 'V', lower: 'v', word: 'Violin', emoji: '🎻', katakana: 'バイオリン' },
  { upper: 'W', lower: 'w', word: 'Watch', emoji: '⌚', katakana: 'ウォッチ（とけい）' },
  { upper: 'X', lower: 'x', word: 'Xylophone', emoji: '🎵', katakana: 'シロフォン（もっきん）' },
  { upper: 'Y', lower: 'y', word: 'Yogurt', emoji: '🍨', katakana: 'ヨーグルト' },
  { upper: 'Z', lower: 'z', word: 'Zebra', emoji: '🦓', katakana: 'ゼブラ（しまうま）' },
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
