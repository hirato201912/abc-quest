import { useEffect, useState } from 'react'
import { LETTERS } from '../data/letters'
import { speak } from '../lib/speech'
import { supabase } from '../lib/supabase'
import { getLocalLetterCounts, getLocalWords, starRank } from '../lib/collection'
import type { Player } from '../lib/player'

const TOTAL_WORDS = LETTERS.reduce((n, l) => n + l.words.length, 0)

function Stars({ rank }: { rank: 0 | 1 | 2 | 3 }) {
  return (
    <span className="text-xs leading-none">
      {[0, 1, 2].map((i) => (
        <span key={i} className={i < rank ? 'text-amber-500' : 'text-gray-300'}>
          ★
        </span>
      ))}
    </span>
  )
}

export default function Zukan({ player }: { player: Player | null }) {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [words, setWords] = useState<Set<string>>(new Set())
  const [openLetter, setOpenLetter] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      // 生徒が選ばれていればSupabaseの記録から、いなければ端末内の記録から
      if (player && supabase) {
        const { data } = await supabase
          .from('abc_quest_records')
          .select('correct_letters, correct_words')
          .eq('student_id', player.id)
        if (!cancelled && data) {
          const letterCounts: Record<string, number> = {}
          const wordSet = new Set<string>()
          for (const rec of data) {
            for (const l of rec.correct_letters ?? []) {
              letterCounts[l] = (letterCounts[l] ?? 0) + 1
            }
            for (const w of rec.correct_words ?? []) wordSet.add(w)
          }
          setCounts(letterCounts)
          setWords(wordSet)
          setLoading(false)
          return
        }
      }
      if (!cancelled) {
        setCounts(getLocalLetterCounts())
        setWords(getLocalWords())
        setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [player])

  const goldCount = LETTERS.filter(
    (l) => starRank(counts[l.upper] ?? 0) === 3,
  ).length
  const complete = goldCount === LETTERS.length && words.size === TOTAL_WORDS

  if (loading) {
    return <p className="text-gray-500 font-bold">よみこみちゅう…</p>
  }

  // ことばカードの一覧（1文字ぶん）
  if (openLetter) {
    const letter = LETTERS.find((l) => l.upper === openLetter)!
    const rank = starRank(counts[letter.upper] ?? 0)
    return (
      <div className="flex flex-col items-center gap-5 w-full max-w-xl">
        <div className="flex items-center gap-4">
          <span className="text-6xl font-bold text-blue-600">
            {letter.upper}
            <span className="text-pink-500">{letter.lower}</span>
          </span>
          <Stars rank={rank} />
        </div>

        <div className="flex flex-wrap justify-center gap-4 w-full">
          {letter.words.map((w) => {
            const got = words.has(w.word)
            return (
              <button
                key={w.word}
                onClick={() => {
                  if (got) speak(w.word)
                }}
                className={[
                  'rounded-2xl px-6 py-4 flex flex-col items-center gap-1 shadow-md min-w-36',
                  got ? 'bg-white active:scale-95 transition-transform' : 'bg-gray-200',
                ].join(' ')}
              >
                <span className="text-5xl">{got ? w.emoji : '？'}</span>
                <span
                  className={[
                    'text-xl font-bold',
                    got ? 'text-gray-800' : 'text-gray-400',
                  ].join(' ')}
                >
                  {got ? w.word : '？？？'}
                </span>
                {got && <span className="text-sm text-gray-500">{w.katakana}</span>}
              </button>
            )
          })}
        </div>

        {letter.words.some((w) => !words.has(w.word)) && (
          <p className="text-gray-500 font-bold">
            クイズで せいかいすると ことばが あつまるよ！
          </p>
        )}

        <button
          onClick={() => setOpenLetter(null)}
          className="px-8 py-3 rounded-full bg-orange-400 text-white text-lg font-bold shadow active:scale-95 transition-transform"
        >
          ずかんに もどる
        </button>
      </div>
    )
  }

  // 26文字の一覧
  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-2xl landscape:max-w-3xl">
      <h2 className="text-3xl font-bold text-purple-700">
        {player ? `${player.name}さんの ずかん` : 'きみの ずかん'}
      </h2>

      <div className="flex gap-6 text-lg font-bold text-gray-600">
        <span>ことば　{words.size} / {TOTAL_WORDS}</span>
        <span>
          <span className="text-amber-500">★★★</span>　{goldCount} / {LETTERS.length}
        </span>
      </div>

      {complete && (
        <div className="flex items-center gap-3 animate-bounce-in">
          <img src="/bear-cheer.png" alt="クマせんせい" className="w-20 h-auto" />
          <p className="text-3xl font-bold text-pink-500">パーフェクト！</p>
        </div>
      )}

      <div className="grid grid-cols-5 sm:grid-cols-6 landscape:grid-cols-9 gap-3 w-full">
        {LETTERS.map((letter) => {
          const rank = starRank(counts[letter.upper] ?? 0)
          const collectedWords = letter.words.filter((w) => words.has(w.word)).length
          return (
            <button
              key={letter.upper}
              onClick={() => setOpenLetter(letter.upper)}
              className={[
                'aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95 transition-transform',
                rank === 3
                  ? 'bg-amber-200 ring-2 ring-amber-400 shadow-md'
                  : rank > 0
                    ? 'bg-white shadow-md'
                    : 'bg-gray-200',
              ].join(' ')}
            >
              <span
                className={[
                  'text-2xl sm:text-3xl font-bold leading-none',
                  rank > 0 ? 'text-blue-600' : 'text-gray-400',
                ].join(' ')}
              >
                {letter.upper}
                <span className={rank > 0 ? 'text-pink-500' : 'text-gray-400'}>
                  {letter.lower}
                </span>
              </span>
              <Stars rank={rank} />
              <span className="text-[10px] font-bold text-gray-500 leading-none">
                ことば {collectedWords}/{letter.words.length}
              </span>
            </button>
          )
        })}
      </div>

      <p className="text-gray-500 font-bold text-center text-sm">
        ノーミスで せいかいすると ★が ふえるよ！　★★★で きんいろに！
      </p>
    </div>
  )
}
