// ずかんの収集状況（端末内保存）
// 生徒が選択されている場合はSupabaseの記録が正となり、これは名前なしプレイ用のフォールバック

const LETTER_KEY = 'abc_quest_letter_counts'
const WORD_KEY = 'abc_quest_words'

// ノーミス正解の回数 → 星ランク
export function starRank(count: number): 0 | 1 | 2 | 3 {
  if (count >= 5) return 3
  if (count >= 3) return 2
  if (count >= 1) return 1
  return 0
}

export function getLocalLetterCounts(): Record<string, number> {
  try {
    const raw = localStorage.getItem(LETTER_KEY)
    return raw ? (JSON.parse(raw) as Record<string, number>) : {}
  } catch {
    return {}
  }
}

export function addLocalLetterCorrect(letters: string[]) {
  if (letters.length === 0) return
  const counts = getLocalLetterCounts()
  for (const l of letters) counts[l] = (counts[l] ?? 0) + 1
  localStorage.setItem(LETTER_KEY, JSON.stringify(counts))
}

export function getLocalWords(): Set<string> {
  try {
    const raw = localStorage.getItem(WORD_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

export function addLocalWords(words: string[]) {
  if (words.length === 0) return
  const set = getLocalWords()
  for (const w of words) set.add(w)
  localStorage.setItem(WORD_KEY, JSON.stringify([...set]))
}
