// ずかんの収集状況（端末内保存）
// 生徒が選択されている場合はSupabaseの記録が正となり、これは名前なしプレイ用のフォールバック

import { supabase } from './supabase'
import { getPlayer, type Player } from './player'

const LETTER_KEY = 'abc_quest_letter_counts'
const WORD_KEY = 'abc_quest_words'

// 生徒選択中はSupabaseの記録が正。端末内には書かず、生徒同士の記録の混入を防ぐ
function cloudActive(): boolean {
  return !!(supabase && getPlayer())
}

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
  if (letters.length === 0 || cloudActive()) return
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
  if (words.length === 0 || cloudActive()) return
  const set = getLocalWords()
  for (const w of words) set.add(w)
  localStorage.setItem(WORD_KEY, JSON.stringify([...set]))
}

export type Progress = {
  letterCounts: Record<string, number>
  words: Set<string>
}

// 進捗の読み込み。生徒選択中はSupabaseの記録を集計（失敗時はthrow、ローカルへは切り替えない）、
// 未選択時は端末内の記録を返す
export async function loadProgress(player: Player | null): Promise<Progress> {
  if (player && supabase) {
    const { data, error } = await supabase
      .from('abc_quest_records')
      .select('correct_letters, correct_words')
      .eq('student_id', player.id)
    if (error) throw error
    const letterCounts: Record<string, number> = {}
    const words = new Set<string>()
    for (const rec of data ?? []) {
      for (const l of rec.correct_letters ?? []) {
        letterCounts[l] = (letterCounts[l] ?? 0) + 1
      }
      for (const w of rec.correct_words ?? []) words.add(w)
    }
    return { letterCounts, words }
  }
  return { letterCounts: getLocalLetterCounts(), words: getLocalWords() }
}
