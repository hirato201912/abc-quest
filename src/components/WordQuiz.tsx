import { useEffect, useMemo, useState } from 'react'
import { LETTERS, pickRandom, shuffle, type Letter } from '../data/letters'
import { speak } from '../lib/speech'
import Celebration from './Celebration'

const QUESTIONS_PER_ROUND = 8
const CHOICES = 4

type Question = {
  answer: Letter
  choices: Letter[]
  showLower: boolean
}

function buildQuestions(): Question[] {
  return pickRandom(LETTERS, QUESTIONS_PER_ROUND).map((answer) => {
    const others = pickRandom(
      LETTERS.filter((l) => l.upper !== answer.upper),
      CHOICES - 1,
    )
    return {
      answer,
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

  const question = questions[qIndex]
  const finished = qIndex >= QUESTIONS_PER_ROUND

  useEffect(() => {
    if (!finished) speak(question.answer.word)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIndex, round])

  function handleChoice(choice: Letter) {
    if (correctTap) return
    if (choice.upper === question.answer.upper) {
      setCorrectTap(true)
      setStars((s) => s + 1)
      speak(`${choice.upper}! Good job!`)
      setTimeout(() => {
        setCorrectTap(false)
        setWrongTap(null)
        setQIndex((i) => i + 1)
      }, 1200)
    } else {
      setWrongTap(choice.upper)
      speak(question.answer.word)
      setTimeout(() => setWrongTap(null), 500)
    }
  }

  function nextRound() {
    setQIndex(0)
    setStars(0)
    setRound((r) => r + 1)
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center gap-6">
        <p className="text-3xl font-bold text-gray-700">
          ⭐ {stars} こ あつめたよ！
        </p>
        <Celebration onNext={nextRound} label="もういちど あそぶ" />
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

      <p className="text-xl font-bold text-purple-700">
        この ことばは どの アルファベットから はじまるかな？
      </p>

      <div className="flex flex-col landscape:flex-row items-center gap-6 w-full landscape:justify-center">
        <button
          onClick={() => speak(question.answer.word)}
          className="rounded-3xl bg-white shadow-xl px-12 py-8 landscape:px-8 landscape:py-5 flex flex-col items-center gap-3 active:scale-95 transition-transform"
        >
          <span className="text-8xl landscape:text-7xl">{question.answer.emoji}</span>
          <span className="text-3xl font-bold text-gray-800">
            {correctTap ? question.answer.word : '？'.repeat(question.answer.word.length)}
          </span>
          <span className="text-lg text-gray-500">{question.answer.katakana}</span>
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
                  ? 'bg-green-400 text-white animate-pop'
                  : isWrong
                    ? 'bg-red-300 text-red-800 animate-shake'
                    : 'bg-white text-blue-600 active:bg-blue-100',
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
