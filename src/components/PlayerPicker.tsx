import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { setPlayer, type Player } from '../lib/player'

const GRADES = ['小1', '小2', '小3', '小4', '小5', '小6', '中1', '中2', '中3']

export default function PlayerPicker({
  current,
  onDone,
}: {
  current: Player | null
  onDone: (player: Player | null) => void
}) {
  const [students, setStudents] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    supabase
      .from('yesta_students')
      .select('id, name, grade')
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

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg">
      <h2 className="text-3xl font-bold text-purple-700">だれが あそぶ？</h2>

      {loading ? (
        <p className="text-gray-500 font-bold">よみこみちゅう…</p>
      ) : students.length === 0 ? (
        <p className="text-gray-500 font-bold text-center">
          なまえの リストが よみこめませんでした。
          <br />
          そのまま あそぶことも できるよ！
        </p>
      ) : (
        <div className="flex flex-col gap-4 w-full">
          {GRADES.map((grade) => {
            const gradeStudents = students.filter((s) => s.grade === grade)
            if (gradeStudents.length === 0) return null
            return (
              <div key={grade} className="flex flex-col gap-2">
                <span className="text-sm font-bold text-gray-500">{grade}</span>
                <div className="flex flex-wrap gap-3">
                  {gradeStudents.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => choose(s)}
                      className={[
                        'px-6 py-4 rounded-2xl text-xl font-bold shadow-md active:scale-95 transition-transform',
                        current?.id === s.id
                          ? 'bg-purple-500 text-white'
                          : 'bg-white text-gray-800',
                      ].join(' ')}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <button
        onClick={() => choose(null)}
        className="px-8 py-4 rounded-full bg-gray-400 text-white text-lg font-bold shadow active:scale-95 transition-transform"
      >
        なまえ なしで あそぶ
      </button>
    </div>
  )
}
