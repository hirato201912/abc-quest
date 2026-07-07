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

  const percent = Math.round((words.size / TOTAL_WORDS) * 100)
  const goldPercent = Math.round((goldCount / LETTERS.length) * 100)
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
    <div className="flex flex-col items-center gap-5 w-full max-w-2xl landscape:max-w-4xl">
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

      {/* 2つの成果メーター（ことば集め・アルファベットの定着） */}
      <div className="w-full max-w-md flex flex-col gap-4">
        {/* あつめた ことばシール */}
        <div className="flex flex-col gap-1.5">
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
        </div>

        {/* かんぺきに おぼえた アルファベット（★★★・きんいろ） */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-base font-bold text-gray-600">
            <span>
              かんぺきに おぼえた アルファベット{' '}
              <span className="text-amber-500">★★★</span>
            </span>
            <span>
              {goldCount} <span className="text-gray-400">/ {LETTERS.length}</span>
            </span>
          </div>
          <div className="h-5 rounded-full bg-white border border-amber-200 overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all"
              style={{ width: `${goldPercent}%` }}
            />
          </div>
        </div>

        <p className="text-xs font-bold text-gray-400 text-center leading-relaxed">
          おなじ アルファベットを なんかいも せいかいすると ★ が ふえて、
          ぜんぶ そろうと きんいろに なるよ！
        </p>
      </div>

      {complete && (
        <div className="flex items-center gap-3 animate-bounce-in">
          <img src="/bear-cheer.png" alt="クマせんせい" className="w-20 h-auto" />
          <p className="text-3xl font-bold text-rose-500">パーフェクト！</p>
        </div>
      )}

      {/* 見開きアルバム: 1文字=1行、シール枠が全部見える */}
      <div className="w-full flex flex-col landscape:grid landscape:grid-cols-2 gap-2">
        {LETTERS.map((letter) => {
          const rank = starRank(counts[letter.upper] ?? 0)
          const isGold = rank === 3
          return (
            <div
              key={letter.upper}
              className={[
                'flex items-center gap-3 px-3 py-2 rounded-2xl',
                isGold
                  ? 'bg-amber-50 border border-amber-200'
                  : 'bg-white border border-rose-100',
              ].join(' ')}
            >
              {/* 文字＋星（押すと文字の発音） */}
              <button
                onClick={() => speak(letter.upper)}
                className="flex flex-col items-center w-14 shrink-0 active:scale-95 transition-transform"
              >
                <span className="text-2xl font-bold leading-tight">
                  <span className="text-rose-500">{letter.upper}</span>
                  <span className="text-orange-400">{letter.lower}</span>
                </span>
                <Stars rank={rank} />
              </button>

              {/* ことばシールの枠 */}
              <div className="flex gap-2 flex-1 flex-wrap">
                {letter.words.map((w) => {
                  const got = words.has(w.word)
                  return got ? (
                    <button
                      key={w.word}
                      onClick={() => speak(w.word)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-amber-200 shadow-sm active:scale-95 transition-transform animate-bounce-in"
                    >
                      <span className="text-2xl">{w.emoji}</span>
                      <span className="text-sm font-bold text-gray-700">{w.word}</span>
                    </button>
                  ) : (
                    <div
                      key={w.word}
                      className="flex items-center px-4 py-1.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-300 text-sm font-bold"
                    >
                      ？？？
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-sm font-bold text-gray-500 text-center">
        シールを おすと こえが きこえるよ！
      </p>
    </div>
  )
}
