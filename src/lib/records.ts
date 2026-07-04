import { supabase } from './supabase'
import { getPlayer } from './player'

export type QuestRecord = {
  mode: 'matching' | 'quiz'
  level?: number
  stars?: number
  total?: number
  correct_letters?: string[]
  wrong_letters?: string[]
  correct_words?: string[]
}

// 生徒が選択されていて接続設定があるときだけ記録する（失敗してもゲームは止めない）
export function saveRecord(record: QuestRecord) {
  const player = getPlayer()
  if (!supabase || !player) return
  void supabase
    .from('abc_quest_records')
    .insert({ student_id: player.id, ...record })
    .then(({ error }) => {
      if (error) console.warn('きろくの ほぞんに しっぱいしました', error.message)
    })
}
