import { useEffect, useMemo, useRef, useState } from 'react'
import { LETTERS, pickRandom, randomWord, shuffle, type Letter, type WordEntry } from '../data/letters'
import { speak } from '../lib/speech'
import { playCorrect, playWrong } from '../lib/sounds'
import { saveRecord } from '../lib/records'
import { addLocalLetterCorrect } from '../lib/collection'
import Celebration, { type CelebrationTier } from './Celebration'

const QUESTIONS_PER_ROUND = 8
const CHOICES = 4

type Question = {
  answer: Letter
  word: WordEntry // 正解したときのごほうび表示用
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
      word: randomWord(answer),
      choices: shuffle([answer, ...others]),
      showLower: Math.random() < 0.5,
    }
  })
}

export default function ListeningQuiz() {
  const [round, setRound] = useState(0)
  const questions = useMemo(() => buildQuestions(), [round])
  const [qIndex, setQIndex] = useState(0)
  const [stars, setStars] = useState(0)
  const [wrongTap, setWrongTap] = useState<string | null>(null)
  const [correctTap, setCorrectTap] = useState(false)
  const [missed, setMissed] = useState(false) // この問題で一度でも間違えたか
  const [combo, setCombo] = useState(0) // ノーミス正解の連続数
  const correctLetters = useRef<string[]>([])
  const wrongLetters = useRef<string[]>([])

  const question = questions[qIndex]
  const finished = qIndex >= QUESTIONS_PER_ROUND

  useEffect(() => {
    if (!finished) speak(question.answer.upper)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIndex, round])

  function handleChoice(choice: Letter) {
    if (correctTap) return
    if (choice.upper === question.answer.upper) {
      setCorrectTap(true)
      const earned = missed ? stars : stars + 1 // ノーミス正解のみスター
      setStars(earned)
      ;(missed ? wrongLetters : correctLetters).current.push(question.answer.upper)
      if (!missed) setCombo((c) => c + 1)
      if (qIndex + 1 === QUESTIONS_PER_ROUND) {
        addLocalLetterCorrect(correctLetters.current)
        saveRecord({
          mode: 'listening',
          stars: earned,
          total: QUESTIONS_PER_ROUND,
          correct_letters: correctLetters.current,
          wrong_letters: wrongLetters.current,
        })
      }
      playCorrect(missed ? 0 : combo)
      speak(`${question.answer.upper}! ${question.word.word}!`)
      setTimeout(() => {
        setCorrectTap(false)
        setWrongTap(null)
        setMissed(false)
        setQIndex((i) => i + 1)
      }, 2000)
    } else {
      playWrong()
      setWrongTap(choice.upper)
      setMissed(true)
      setCombo(0)
      speak(question.answer.upper)
      setTimeout(() => setWrongTap(null), 500)
    }
  }

  function nextRound() {
    setQIndex(0)
    setStars(0)
    setMissed(false)
    setCombo(0)
    correctLetters.current = []
    wrongLetters.current = []
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
        <Celebration tier={tier} onNext={nextRound} label="もういちど チャレンジ" />
      </div>
    )
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
        きこえた アルファベットは どれかな？
      </p>

      <div className="flex flex-col landscape:flex-row items-center gap-6 w-full landscape:justify-center">
        {correctTap ? (
          // 正解のごほうび: ことばと絵を表示
          <div className="rounded-3xl bg-white border-2 border-amber-200 shadow-xl px-12 py-8 landscape:px-8 landscape:py-5 flex flex-col items-center gap-2 animate-bounce-in">
            <span className="text-7xl">{question.word.emoji}</span>
            <span className="text-2xl font-bold text-gray-800">
              <span className="text-rose-500">{question.answer.upper}</span> は{' '}
              {question.word.word}！
            </span>
            <span className="text-base text-gray-500">{question.word.katakana}</span>
          </div>
        ) : (
          <button
            onClick={() => speak(question.answer.upper)}
            className="rounded-3xl bg-white shadow-xl px-14 py-10 landscape:px-10 landscape:py-6 flex flex-col items-center gap-3 hover:scale-[1.01] active:scale-95 transition-transform"
          >
            <span className="text-7xl">🔊</span>
            <span className="text-xl font-bold text-gray-600">もういちど きく</span>
          </button>
        )}

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
