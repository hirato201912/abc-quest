import { useEffect, useState } from 'react'
import { LETTERS } from '../data/letters'
import { speak } from '../lib/speech'
import { supabase } from '../lib/supabase'
import { getLocalLetterCounts, getLocalWords, starRank } from '../lib/collection'
import { waitForPendingSaves } from '../lib/records'
import type { Player } from '../lib/player'

const TOTAL_WORDS = LETTERS.reduce((n, l) => n + l.words.length, 0)

function Stars({ rank }: { rank: 0 | 1 | 2 | 3 }) {
  return (
    <span className="text-sm leading-none">
      {[0, 1, 2].map((i) => (
        <span key={i} className={i < rank ? 'text-amber-400' : 'text-gray-200'}>
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
      await waitForPendingSaves() // 直前のプレイの記録送信を待つ
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

  // 1文字ぶんのことばシール一覧
  if (openLetter) {
    const letter = LETTERS.find((l) => l.upper === openLetter)!
    const rank = starRank(counts[letter.upper] ?? 0)
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-xl">
        <div className="flex items-center gap-4">
          <span className="text-7xl font-bold text-rose-500">
            {letter.upper}
            <span className="text-orange-400">{letter.lower}</span>
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
                  'rounded-3xl px-6 py-5 flex flex-col items-center gap-1.5 min-w-40',
                  got
                    ? 'bg-white border-2 border-amber-200 shadow-md active:scale-95 transition-transform animate-bounce-in'
                    : 'bg-white/60 border-2 border-dashed border-gray-300',
                ].join(' ')}
              >
                <span className={got ? 'text-7xl' : 'text-6xl text-gray-300'}>
                  {got ? w.emoji : '？'}
                </span>
                <span
                  className={[
                    'text-2xl font-bold',
                    got ? 'text-gray-800' : 'text-gray-300',
                  ].join(' ')}
                >
                  {got ? w.word : '？？？'}
                </span>
                {got && <span className="text-sm text-gray-500">{w.katakana}</span>}
                {got && <span className="text-lg">🔊</span>}
              </button>
            )
          })}
        </div>

        {letter.words.some((w) => !words.has(w.word)) && (
          <p className="text-gray-500 font-bold">
            クイズで せいかいすると シールが もらえるよ！
          </p>
        )}

        <button
          onClick={() => setOpenLetter(null)}
          className="px-8 py-3 rounded-full bg-orange-400 text-white text-lg font-bold shadow active:scale-95 transition-transform"
        >
          シールちょうに もどる
        </button>
      </div>
    )
  }

  // 26文字のシールちょう
  const percent = Math.round((words.size / TOTAL_WORDS) * 100)
  const cheer = complete
    ? null
    : percent >= 80
      ? 'すごい！ もうすこしで ぜんぶ あつまるよ！'
      : percent >= 40
        ? 'その ちょうし！ どんどん あつめよう！'
        : words.size > 0
          ? 'いい スタート！ クイズで シールを ふやそう！'
          : 'クイズで せいかいすると シールが もらえるよ！'
  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-2xl landscape:max-w-3xl">
      <h2 className="text-3xl font-bold text-rose-500">
        {player ? `${player.name}さんの シールちょう` : 'きみの シールちょう'}
      </h2>

      {cheer && (
        <div className="flex items-end gap-2 w-full max-w-md">
          <img
            src="/bear-pointer.png"
            alt="クマせんせい"
            className="w-14 h-auto shrink-0"
          />
          <div className="bg-white border border-rose-100 rounded-2xl rounded-bl-sm px-4 py-2.5 text-gray-600 font-bold text-sm shadow-sm mb-1">
            {cheer}
          </div>
        </div>
      )}

      {/* ことばシールの進捗バー */}
      <div className="w-full max-w-md flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-base font-bold text-gray-600">
          <span>あつめた ことばシール</span>
          <span>
            {words.size} <span className="text-gray-400">/ {TOTAL_WORDS}</span>
          </span>
        </div>
        <div className="h-5 rounded-full bg-white border border-rose-100 overflow-hidden">
          <div
            className="h-full bg-rose-400 rounded-full transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex justify-end">
          <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-sm font-bold">
            ★★★ きんいろ {goldCount} / {LETTERS.length}
          </span>
        </div>
      </div>

      {complete && (
        <div className="flex items-center gap-3 animate-bounce-in">
          <img src="/bear-cheer.png" alt="クマせんせい" className="w-20 h-auto" />
          <p className="text-3xl font-bold text-rose-500">パーフェクト！</p>
        </div>
      )}

      <div className="grid grid-cols-4 sm:grid-cols-5 landscape:grid-cols-7 gap-3 w-full">
        {LETTERS.map((letter, i) => {
          const rank = starRank(counts[letter.upper] ?? 0)
          const gotWords = letter.words.filter((w) => words.has(w.word))
          const hasSticker = gotWords.length > 0
          return (
            <button
              key={letter.upper}
              onClick={() => setOpenLetter(letter.upper)}
              className={[
                'aspect-square rounded-2xl flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform',
                rank === 3
                  ? 'bg-amber-50 ring-2 ring-amber-300 shadow-md'
                  : hasSticker || rank > 0
                    ? 'bg-white border border-rose-100 shadow-sm'
                    : 'bg-white/60 border-2 border-dashed border-gray-200',
                hasSticker ? 'animate-bounce-in' : '',
              ].join(' ')}
              style={hasSticker ? { animationDelay: `${i * 0.03}s` } : undefined}
            >
              <span
                className={[
                  'text-3xl sm:text-4xl leading-none',
                  hasSticker ? '' : 'text-gray-300',
                ].join(' ')}
              >
                {hasSticker ? gotWords[0].emoji : '？'}
              </span>
              <span
                className={[
                  'text-lg font-bold leading-none',
                  rank > 0 || hasSticker ? 'text-rose-500' : 'text-gray-300',
                ].join(' ')}
              >
                {letter.upper}
                <span
                  className={
                    rank > 0 || hasSticker ? 'text-orange-400' : 'text-gray-300'
                  }
                >
                  {letter.lower}
                </span>
              </span>
              <Stars rank={rank} />
            </button>
          )
        })}
      </div>

      <p className="text-sm font-bold text-gray-500 text-center">
        シールを タッチすると なかみが みられるよ！
      </p>
    </div>
  )
}
