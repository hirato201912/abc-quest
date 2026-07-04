import { useEffect, useMemo, useRef, useState } from 'react'
import { LETTERS, pickRandom, shuffle, type Letter, type WordEntry } from '../data/letters'
import { speak } from '../lib/speech'
import { saveRecord } from '../lib/records'
import { addLocalLetterCorrect, addLocalWords, getLocalWords } from '../lib/collection'
import Celebration from './Celebration'

const QUESTIONS_PER_ROUND = 8
const CHOICES = 4

type Question = {
  answer: Letter
  word: WordEntry
  choices: Letter[]
  showLower: boolean
}

function buildQuestions(): Question[] {
  const collected = getLocalWords()
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
  const [round, setRound] = useState(0)
  const questions = useMemo(() => buildQuestions(), [round])
  const [qIndex, setQIndex] = useState(0)
  const [stars, setStars] = useState(0)
  const [wrongTap, setWrongTap] = useState<string | null>(null)
  const [correctTap, setCorrectTap] = useState(false)
  const [missed, setMissed] = useState(false) // この問題で一度でも間違えたか
  const correctLetters = useRef<string[]>([])
  const wrongLetters = useRef<string[]>([])
  const correctWords = useRef<string[]>([])

  const question = questions[qIndex]
  const finished = qIndex >= QUESTIONS_PER_ROUND

  useEffect(() => {
    if (!finished) speak(question.word.word)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIndex, round])

  function handleChoice(choice: Letter) {
    if (correctTap) return
    if (choice.upper === question.answer.upper) {
      setCorrectTap(true)
      const earned = missed ? stars : stars + 1 // ノーミス正解のみスター
      setStars(earned)
      ;(missed ? wrongLetters : correctLetters).current.push(question.answer.upper)
      if (!missed) correctWords.current.push(question.word.word)
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
      setWrongTap(choice.upper)
      setMissed(true)
      speak(question.word.word)
      setTimeout(() => setWrongTap(null), 500)
    }
  }

  function nextRound() {
    setQIndex(0)
    setStars(0)
    setMissed(false)
    correctLetters.current = []
    wrongLetters.current = []
    correctWords.current = []
    setRound((r) => r + 1)
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center gap-6">
        <p className="text-3xl font-bold text-gray-700">
          ⭐ {stars} こ あつめたよ！
        </p>
        <Celebration onNext={nextRound} label="もういちど チャレンジ" />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 landscape:gap-3 w-full max-w-xl landscape:max-w-4xl">
      <div className="flex items-center gap-2 text-2xl">
        {Array.from({ length: QUESTIONS_PER_ROUND }).map((_, i) => (
          <span key={i} className={i < stars ? '' : 'opacity-25'}>
            ⭐
          </span>
        ))}
      </div>

      <p className="text-xl font-bold text-gray-600">
        この ことばは どの アルファベットから はじまるかな？
      </p>

      <div className="flex flex-col landscape:flex-row items-center gap-6 w-full landscape:justify-center">
        <button
          onClick={() => speak(question.word.word)}
          className="rounded-3xl bg-white shadow-xl px-12 py-8 landscape:px-8 landscape:py-5 flex flex-col items-center gap-3 active:scale-95 transition-transform"
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
                'flex items-center justify-center transition-colors',
                isCorrect
                  ? 'bg-emerald-300 text-emerald-800 animate-pop'
                  : isWrong
                    ? 'bg-red-100 text-red-500 animate-shake'
                    : 'bg-white text-rose-500 active:bg-rose-50',
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
