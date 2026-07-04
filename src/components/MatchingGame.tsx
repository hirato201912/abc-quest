import { useMemo, useRef, useState } from 'react'
import { LETTERS, pickRandom, shuffle, type Letter } from '../data/letters'
import { speak } from '../lib/speech'
import { playCorrect, playFanfare, playWrong } from '../lib/sounds'
import { saveRecord } from '../lib/records'
import { addLocalLetterCorrect } from '../lib/collection'
import Celebration from './Celebration'

type Card = {
  id: string
  letter: Letter
  face: 'upper' | 'lower'
}

const MAX_PAIRS = 8

function pairsForLevel(level: number) {
  return Math.min(3 + level, MAX_PAIRS) // レベル1=4ペア、以降+1
}

function buildRound(level: number): Card[] {
  const letters = pickRandom(LETTERS, pairsForLevel(level))
  const cards = letters.flatMap((letter): Card[] => [
    { id: `${letter.upper}-U`, letter, face: 'upper' },
    { id: `${letter.upper}-L`, letter, face: 'lower' },
  ])
  return shuffle(cards)
}

export default function MatchingGame() {
  const [level, setLevel] = useState(1)
  const [roundKey, setRoundKey] = useState(0)
  const cards = useMemo(() => buildRound(level), [level, roundKey])
  const [selected, setSelected] = useState<string | null>(null)
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [wrongPair, setWrongPair] = useState<Set<string>>(new Set())
  const [justMatched, setJustMatched] = useState<Set<string>>(new Set())
  const [stickers, setStickers] = useState<Letter[]>([])
  const [combo, setCombo] = useState(0)
  const missedLetters = useRef<Set<string>>(new Set()) // このラウンドでミスした文字

  const done = matched.size === cards.length && cards.length > 0

  function handleTap(card: Card) {
    if (matched.has(card.id) || wrongPair.size > 0) return

    if (selected === null) {
      setSelected(card.id)
      speak(card.letter.upper)
      return
    }
    if (selected === card.id) {
      setSelected(null)
      return
    }

    const first = cards.find((c) => c.id === selected)!
    if (first.letter.upper === card.letter.upper) {
      const next = new Set(matched)
      next.add(first.id)
      next.add(card.id)
      setMatched(next)
      setJustMatched(new Set([first.id, card.id]))
      setStickers((s) => [...s, card.letter])
      setCombo((c) => c + 1)
      setSelected(null)
      playCorrect()
      speak(`${card.letter.upper}! ${card.letter.words[0].word}!`)
      if (next.size === cards.length) {
        const roundLetters = [...new Set(cards.map((c) => c.letter.upper))]
        const wrong = [...missedLetters.current]
        const correct = roundLetters.filter((l) => !missedLetters.current.has(l))
        addLocalLetterCorrect(correct)
        saveRecord({ mode: 'matching', level, correct_letters: correct, wrong_letters: wrong })
        setTimeout(() => {
          playFanfare()
          speak('Great job!')
        }, 1000)
      }
    } else {
      playWrong()
      setCombo(0)
      missedLetters.current.add(first.letter.upper)
      missedLetters.current.add(card.letter.upper)
      setWrongPair(new Set([first.id, card.id]))
      setTimeout(() => {
        setWrongPair(new Set())
        setSelected(null)
      }, 500)
    }
  }

  function nextLevel() {
    setMatched(new Set())
    setJustMatched(new Set())
    setStickers([])
    setCombo(0)
    setSelected(null)
    missedLetters.current = new Set()
    if (pairsForLevel(level + 1) > pairsForLevel(level)) {
      setLevel(level + 1)
    } else {
      setRoundKey((k) => k + 1) // 最大レベル到達後は同じ枚数で新しい問題
    }
  }

  return (
    <div className="flex flex-col items-center gap-5 landscape:gap-3 w-full max-w-2xl landscape:max-w-4xl">
      <div className="flex items-center gap-4">
        <span className="px-4 py-1 rounded-full bg-white border border-rose-200 text-rose-500 text-lg font-bold">
          レベル {level}
        </span>
        {combo >= 2 && (
          <span
            key={combo}
            className="px-4 py-1 rounded-full bg-orange-100 text-orange-600 text-lg font-bold animate-pop"
          >
            コンボ ×{combo}！
          </span>
        )}
      </div>

      {/* あつめたシール */}
      <div className="flex items-center gap-1 min-h-10 flex-wrap justify-center">
        {stickers.map((letter, i) => (
          <span key={i} className="text-3xl animate-bounce-in">
            {letter.words[0].emoji}
          </span>
        ))}
        {stickers.length === 0 && (
          <span className="text-gray-400 text-sm font-bold">
            ペアを みつけて シールを あつめよう！
          </span>
        )}
      </div>

      <p className="text-xl font-bold text-gray-600">
        おおもじと こもじの ペアを タッチしよう！
      </p>

      <div className="grid grid-cols-4 landscape:grid-cols-8 gap-3 sm:gap-4 w-full">
        {cards.map((card) => {
          const isMatched = matched.has(card.id)
          const isSelected = selected === card.id
          const isWrong = wrongPair.has(card.id)
          const popping = justMatched.has(card.id)
          return (
            <button
              key={card.id}
              onClick={() => handleTap(card)}
              disabled={isMatched}
              className={[
                'aspect-square rounded-2xl text-5xl sm:text-6xl landscape:text-5xl font-bold shadow-md transition-colors',
                'flex items-center justify-center',
                isMatched
                  ? 'bg-orange-50'
                  : isWrong
                    ? 'bg-red-100 text-red-500 animate-shake'
                    : isSelected
                      ? 'bg-rose-100 text-rose-600 ring-4 ring-rose-300 scale-105'
                      : 'bg-white text-rose-500 active:bg-rose-50',
                popping ? 'animate-pop' : '',
              ].join(' ')}
            >
              {isMatched
                ? card.letter.words[0].emoji
                : card.face === 'upper'
                  ? card.letter.upper
                  : card.letter.lower}
            </button>
          )
        })}
      </div>

      {done && <Celebration onNext={nextLevel} label="つぎの レベルへ" />}
    </div>
  )
}
