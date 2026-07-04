import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { setPlayer, type Player } from '../lib/player'

// 小学生向けアプリのため中学生は表示しない
const GRADES = ['小1', '小2', '小3', '小4', '小5', '小6']

export default function PlayerPicker({
  current,
  onDone,
}: {
  current: Player | null
  onDone: (player: Player | null) => void
}) {
  const [students, setStudents] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState<Player | null>(null)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    supabase
      .from('yesta_students')
      .select('id, name, grade')
      .in('grade', GRADES)
      .order('grade')
      .order('name')
      .then(({ data }) => {
        setStudents((data ?? []) as Player[])
        setLoading(false)
      })
  }, [])

  function choose(player: Player | null) {
    setPlayer(player)
    onDone(player)
  }

  // まちがい防止の確認ステップ
  if (confirming) {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        <span className="w-28 h-28 rounded-full bg-rose-50 flex items-center justify-center">
          <img src="/penguin.png" alt="" className="w-20 h-auto" />
        </span>
        <div className="flex flex-col items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-500 text-sm font-bold">
            {confirming.grade}
          </span>
          <span className="text-4xl font-bold text-gray-800">{confirming.name} さん</span>
        </div>
        <p className="text-xl font-bold text-gray-600">この なまえで がんばる？</p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => choose(confirming)}
            className="px-8 py-4 rounded-full bg-orange-400 text-white text-xl font-bold shadow active:scale-95 transition-transform"
          >
            うん！ がんばる
          </button>
          <button
            onClick={() => setConfirming(null)}
            className="px-8 py-3 rounded-full bg-white border border-gray-200 text-gray-600 text-lg font-bold active:scale-95 transition-transform"
          >
            ちがう ひとだった
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-lg">
      <h2 className="text-3xl font-bold text-rose-500">だれが チャレンジする？</h2>
      <p className="text-sm font-bold text-gray-500">じぶんの なまえを タッチしてね</p>

      {loading ? (
        <p className="text-gray-500 font-bold">よみこみちゅう…</p>
      ) : students.length === 0 ? (
        <p className="text-gray-500 font-bold text-center">
          なまえの リストが よみこめませんでした。
          <br />
          そのまま はじめることも できるよ！
        </p>
      ) : (
        <div className="w-full bg-white rounded-3xl border border-rose-100 shadow-sm p-5 flex flex-col gap-5">
          {GRADES.map((grade) => {
            const gradeStudents = students.filter((s) => s.grade === grade)
            if (gradeStudents.length === 0) return null
            return (
              <div key={grade}>
                <span className="inline-block text-xs font-bold text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full mb-2">
                  {grade}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {gradeStudents.map((s) => {
                    const isSelected = current?.id === s.id
                    return (
                      <button
                        key={s.id}
                        onClick={() => setConfirming(s)}
                        className={[
                          'rounded-xl px-3 py-3 flex items-center gap-2.5 transition-colors',
                          isSelected
                            ? 'border-2 border-rose-400 bg-rose-50'
                            : 'border border-gray-200 bg-white active:bg-rose-50',
                        ].join(' ')}
                      >
                        <span className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                          <img src="/penguin.png" alt="" className="w-7 h-auto" />
                        </span>
                        <span className="text-base font-bold text-gray-700 truncate">
                          {s.name}
                        </span>
                        {isSelected && (
                          <span className="ml-auto text-rose-500 font-bold">✓</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <button
        onClick={() => choose(null)}
        className="text-gray-400 font-bold underline underline-offset-4"
      >
        なまえ なしで はじめる
      </button>
    </div>
  )
}
