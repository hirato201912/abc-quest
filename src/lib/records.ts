import { supabase } from './supabase'
import { getPlayer } from './player'

export type QuestRecord = {
  mode: 'matching' | 'quiz' | 'listening' | 'ordering' | 'sentence'
  level?: number
  stars?: number
  total?: number
  correct_letters?: string[]
  wrong_letters?: string[]
  correct_words?: string[]
  correct_sentences?: string[] // ぶんつくりでノーミス完成した文（correct_wordsとは分ける: ずかん集計を汚さないため）
}

// 送信中の記録。ずかん・ブロックタウンはこれを待ってから集計する
const pendingSaves = new Set<Promise<unknown>>()

export function waitForPendingSaves(): Promise<void> {
  return Promise.allSettled([...pendingSaves]).then(() => undefined)
}

// 生徒が選択されていて接続設定があるときだけ記録する（失敗してもゲームは止めない）
export function saveRecord(record: QuestRecord) {
  const player = getPlayer()
  if (!supabase || !player) return
  const save = Promise.resolve(
    supabase
      .from('abc_quest_records')
      .insert({ student_id: player.id, ...record })
      .then(({ error }) => {
        if (error) console.warn('きろくの ほぞんに しっぱいしました', error.message)
      }),
  )
  pendingSaves.add(save)
  save.finally(() => pendingSaves.delete(save))
}
