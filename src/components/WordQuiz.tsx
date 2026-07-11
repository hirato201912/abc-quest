import { useEffect, useMemo, useRef, useState } from 'react'
import { LETTERS, pickRandom, shuffle, type Letter, type WordEntry } from '../data/letters'
import { speak } from '../lib/speech'
import { playCorrect, playWrong } from '../lib/sounds'
import { saveRecord } from '../lib/records'
import {
  addLocalLetterCorrect,
  addLocalWords,
  getLocalWords,
  loadProgress,
} from '../lib/collection'
import { getPlayer } from '../lib/player'
import Celebration, { type CelebrationTier } from './Celebration'
import StickerReveal from './StickerReveal'

const QUESTIONS_PER_ROUND = 8
const CHOICES = 4

type Question = {
  answer: Letter
  word: WordEntry
  choices: Letter[]
  showLower: boolean
}

function buildQuestions(collected: Set<string>): Question[] {
  return pickRandom(LETTERS, QUESTIONS_PER_ROUND).map((answer) => {
    const others = pickRandom(
      LETTERS.filter((l) => l.upper !== answer.upper),
      CHOICES - 1,
    )
    // ずかんに ない ことばを優先して出題（遊ぶほど図鑑が埋まる）
    const uncollected = answer.words.filter((w) => !collected.has(w.word))
    const pool = uncollected.length > 0 ? uncollected : answer.words
    return {
      answer,
      word: pool[Math.floor(Math.random() * pool.length)],
      choices: shuffle([answer, ...others]),
      showLower: Math.random() < 0.5,
    }
  })
}

export default function WordQuiz() {
  // 収集済みの ことば（生徒選択時はSupabase、未選択時は端末内）。未収集を優先出題する
  const [collected, setCollected] = useState<Set<string> | null>(null)
  useEffect(() => {
    let cancelled = false
    loadProgress(getPlayer())
      .then((p) => {
        if (!cancelled) setCollected(p.words)
      })
      .catch(() => {
        // 出題の優先度にしか使わないので、読み込めなければ端末内の記録で代用
        if (!cancelled) setCollected(getLocalWords())
      })
    return () => {
      cancelled = true
    }
  }, [])

  const [round, setRound] = useState(0)
  const questions = useMemo(
    () => (collected ? buildQuestions(collected) : null),
    [round, collected],
  )
  const [qIndex, setQIndex] = useState(0)
  const [stars, setStars] = useState(0)
  const [wrongTap, setWrongTap] = useState<string | null>(null)
  const [correctTap, setCorrectTap] = useState(false)
  const [missed, setMissed] = useState(false) // この問題で一度でも間違えたか
  const [combo, setCombo] = useState(0) // ノーミス正解の連続数
  const correctLetters = useRef<string[]>([])
  const wrongLetters = useRef<string[]>([])
  const correctWords = useRef<string[]>([])
  const newStickers = useRef<WordEntry[]>([]) // このラウンドで はじめて手に入れた ことばシール

  const question = questions ? questions[qIndex] : undefined
  const finished = qIndex >= QUESTIONS_PER_ROUND

  useEffect(() => {
    if (!finished && question) speak(question.word.word)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIndex, round, questions])

  function handleChoice(choice: Letter) {
    if (!question || correctTap) return
    if (choice.upper === question.answer.upper) {
      setCorrectTap(true)
      const earned = missed ? stars : stars + 1 // ノーミス正解のみスター
      setStars(earned)
      ;(missed ? wrongLetters : correctLetters).current.push(question.answer.upper)
      if (!missed) {
        correctWords.current.push(question.word.word)
        // ずかんに まだ ない ことばなら、ラウンド後の「シールめくり」に出す
        if (collected && !collected.has(question.word.word)) {
          newStickers.current.push(question.word)
        }
        setCombo((c) => c + 1)
      }
      playCorrect(missed ? 0 : combo)
      if (qIndex + 1 === QUESTIONS_PER_ROUND) {
        addLocalLetterCorrect(correctLetters.current)
        addLocalWords(correctWords.current)
        saveRecord({
          mode: 'quiz',
          stars: earned,
          total: QUESTIONS_PER_ROUND,
          correct_letters: correctLetters.current,
          wrong_letters: wrongLetters.current,
          correct_words: correctWords.current,
        })
      }
      speak(`${choice.upper}! Good job!`)
      setTimeout(() => {
        setCorrectTap(false)
        setWrongTap(null)
        setMissed(false)
        setQIndex((i) => i + 1)
      }, 1200)
    } else {
      playWrong()
      setWrongTap(choice.upper)
      setMissed(true)
      setCombo(0)
      speak(question.word.word)
      setTimeout(() => setWrongTap(null), 500)
    }
  }

  function nextRound() {
    // あつめた ことばを反映（次ラウンドの出題優先と「あたらしいシール」判定に使う）
    setCollected((prev) => {
      if (!prev) return prev
      const next = new Set(prev)
      for (const w of correctWords.current) next.add(w)
      return next
    })
    setQIndex(0)
    setStars(0)
    setMissed(false)
    setCombo(0)
    correctLetters.current = []
    wrongLetters.current = []
    correctWords.current = []
    newStickers.current = []
    setRound((r) => r + 1)
  }

  if (finished) {
    const tier: CelebrationTier =
      stars === QUESTIONS_PER_ROUND ? 4 : stars >= 6 ? 3 : stars >= 3 ? 2 : 1
    return (
      <div className="flex flex-col items-center gap-6">
        <p className="text-3xl font-bold text-gray-700">
          ⭐ {stars} こ あつめたよ！
        </p>
        {newStickers.current.length > 0 && (
          <StickerReveal words={newStickers.current} />
        )}
        <Celebration tier={tier} onNext={nextRound} label="もういちど チャレンジ" />
      </div>
    )
  }

  if (!question) {
    return <p className="text-gray-500 font-bold">よみこみちゅう…</p>
  }

  return (
    <div className="flex flex-col items-center gap-6 landscape:gap-3 w-full max-w-xl landscape:max-w-4xl">
      <div className="relative flex items-center gap-2 text-2xl">
        {Array.from({ length: QUESTIONS_PER_ROUND }).map((_, i) => (
          <span key={i} className={i < stars ? '' : 'opacity-25'}>
            ⭐
          </span>
        ))}
        {combo >= 2 && (
          <span
            key={combo}
            className="absolute left-full ml-3 whitespace-nowrap px-3 py-0.5 rounded-full bg-orange-100 text-orange-600 text-base font-bold animate-pop"
          >
            コンボ ×{combo}！
          </span>
        )}
      </div>

      <p className="text-xl font-bold text-gray-600">
        この ことばは どの アルファベットから はじまるかな？
      </p>

      <div className="flex flex-col landscape:flex-row items-center gap-6 w-full landscape:justify-center">
        <button
          onClick={() => speak(question.word.word)}
          className="rounded-3xl bg-white shadow-xl px-12 py-8 landscape:px-8 landscape:py-5 flex flex-col items-center gap-3 hover:scale-[1.01] active:scale-95 transition-transform"
        >
          <span className="text-8xl landscape:text-7xl">{question.word.emoji}</span>
          <span className="text-3xl font-bold text-gray-800">
            {correctTap ? question.word.word : '？'.repeat(question.word.word.length)}
          </span>
          <span className="text-lg text-gray-500">{question.word.katakana}</span>
          <span className="text-xl">🔊 もういちど きく</span>
        </button>

        <div className="grid grid-cols-4 landscape:grid-cols-2 gap-4 w-full landscape:w-72">
        {question.choices.map((choice) => {
          const isWrong = wrongTap === choice.upper
          const isCorrect = correctTap && choice.upper === question.answer.upper
          return (
            <button
              key={choice.upper}
              onClick={() => handleChoice(choice)}
              className={[
                'aspect-square rounded-2xl text-6xl font-bold shadow-md',
                'flex items-center justify-center transition-all',
                isCorrect
                  ? 'bg-emerald-300 text-emerald-800 animate-pop'
                  : isWrong
                    ? 'bg-red-100 text-red-500 animate-shake'
                    : 'bg-white text-rose-500 hover:-translate-y-0.5 hover:shadow-lg active:bg-rose-50',
              ].join(' ')}
            >
              {question.showLower ? choice.lower : choice.upper}
            </button>
          )
        })}
        </div>
      </div>
    </div>
  )
}
