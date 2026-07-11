import { useRef, useState } from 'react'
import { LETTERS, pickRandom, shuffle, type Letter } from '../data/letters'
import { speak } from '../lib/speech'
import { playCorrect, playWrong } from '../lib/sounds'
import { saveRecord } from '../lib/records'
import { addLocalLetterCorrect } from '../lib/collection'
import Celebration from './Celebration'

type Card = {
  id: string
  letter: Letter
  face: 'upper' | 'lower'
}

const MAX_PAIRS = 8
const MISS_LIMIT = 5 // 連打対策: これだけミスしたらカードを混ぜ直す
const MEMORY_START_LEVEL = 3 // このレベルから裏向き（神経衰弱）になる

function pairsForLevel(level: number) {
  return Math.min(3 + level, MAX_PAIRS) // レベル1=4ペア、以降+1
}

function pickRoundLetters(count: number): Letter[] {
  const letters = pickRandom(LETTERS, count)
  // 大文字Iと小文字lは字形がほぼ同じなので、IとLを同じラウンドに出さない
  const hasI = letters.some((l) => l.upper === 'I')
  const hasL = letters.some((l) => l.upper === 'L')
  if (hasI && hasL) {
    const dropTarget = Math.random() < 0.5 ? 'I' : 'L'
    const replacement = pickRandom(
      LETTERS.filter((l) => l.upper !== 'I' && l.upper !== 'L' && !letters.includes(l)),
      1,
    )[0]
    const idx = letters.findIndex((l) => l.upper === dropTarget)
    letters[idx] = replacement
  }
  return letters
}

function buildRound(level: number): Card[] {
  const letters = pickRoundLetters(pairsForLevel(level))
  const cards = letters.flatMap((letter): Card[] => [
    { id: `${letter.upper}-U`, letter, face: 'upper' },
    { id: `${letter.upper}-L`, letter, face: 'lower' },
  ])
  return shuffle(cards)
}

export default function MatchingGame() {
  const [level, setLevel] = useState(1)
  const [cards, setCards] = useState<Card[]>(() => buildRound(1))
  const [selected, setSelected] = useState<string | null>(null)
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [wrongPair, setWrongPair] = useState<Set<string>>(new Set())
  const [justMatched, setJustMatched] = useState<Set<string>>(new Set())
  const [justHidden, setJustHidden] = useState<Set<string>>(new Set()) // 裏へ戻る瞬間のフリップ用
  const [stickers, setStickers] = useState<Letter[]>([])
  const [combo, setCombo] = useState(0)
  const [coaching, setCoaching] = useState(false) // 混ぜ直し中の声かけ表示
  const missedLetters = useRef<Set<string>>(new Set()) // このラウンドでミスした文字
  const missStreak = useRef(0)

  const done = matched.size === cards.length && cards.length > 0
  const memoryMode = level >= MEMORY_START_LEVEL // 神経衰弱（裏向き）

  // 神経衰弱で表向きのカードが裏へ戻るときも、めくる動きを見せる
  function flipBack(ids: string[]) {
    if (!memoryMode) return
    setJustHidden(new Set(ids))
    setTimeout(() => setJustHidden(new Set()), 300)
  }

  // 未クリアのカードだけ位置を混ぜ直す（クリア済みはそのまま）
  function reshuffleUnmatched() {
    setCards((prev) => {
      const openIndexes = prev
        .map((c, i) => (matched.has(c.id) ? -1 : i))
        .filter((i) => i >= 0)
      const pool = shuffle(openIndexes.map((i) => prev[i]))
      const next = [...prev]
      openIndexes.forEach((idx, k) => {
        next[idx] = pool[k]
      })
      return next
    })
  }

  function handleTap(card: Card) {
    if (coaching || matched.has(card.id) || wrongPair.size > 0) return

    if (selected === null) {
      setSelected(card.id)
      speak(card.letter.upper)
      return
    }
    if (selected === card.id) {
      setSelected(null)
      flipBack([card.id])
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
      playCorrect(combo)
      speak(`${card.letter.upper}! ${card.letter.words[0].word}!`)
      if (next.size === cards.length) {
        const roundLetters = [...new Set(cards.map((c) => c.letter.upper))]
        const wrong = [...missedLetters.current]
        const correct = roundLetters.filter((l) => !missedLetters.current.has(l))
        addLocalLetterCorrect(correct)
        saveRecord({ mode: 'matching', level, correct_letters: correct, wrong_letters: wrong })
        // ファンファーレはCelebrationが成績に応じて鳴らす
        setTimeout(() => speak('Great job!'), 1000)
      }
    } else {
      playWrong()
      setCombo(0)
      missedLetters.current.add(first.letter.upper)
      missedLetters.current.add(card.letter.upper)
      missStreak.current += 1
      // 神経衰弱ではミスは前提なので、混ぜ直し（連打対策）は表向きレベルのみ
      const shouldCoach = !memoryMode && missStreak.current >= MISS_LIMIT
      setWrongPair(new Set([first.id, card.id]))
      setTimeout(
        () => {
          setWrongPair(new Set())
          setSelected(null)
          flipBack([first.id, card.id])
          if (shouldCoach) {
            // 連打対策: いったん手を止めさせてカードを混ぜ直す
            missStreak.current = 0
            setCoaching(true)
            reshuffleUnmatched()
            setTimeout(() => setCoaching(false), 2200)
          }
        },
        memoryMode ? 1000 : 500, // 裏向きのときは覚える時間を少し長く
      )
    }
  }

  function nextLevel() {
    setMatched(new Set())
    setJustMatched(new Set())
    setJustHidden(new Set())
    setStickers([])
    setCombo(0)
    setSelected(null)
    missedLetters.current = new Set()
    missStreak.current = 0
    const next = pairsForLevel(level + 1) > pairsForLevel(level) ? level + 1 : level
    setLevel(next)
    setCards(buildRound(next)) // 最大レベル到達後も同じ枚数で新しい問題
  }

  return (
    <div className="flex flex-col items-center gap-5 landscape:gap-3 w-full max-w-2xl landscape:max-w-4xl">
      <div className="flex items-center gap-4">
        <span className="px-4 py-1 rounded-full bg-white border border-rose-200 text-rose-500 text-lg font-bold">
          レベル {level}
        </span>
        {memoryMode && (
          <span className="px-4 py-1 rounded-full bg-rose-400 text-white text-lg font-bold">
            めくりモード
          </span>
        )}
        {combo >= 2 && (
          <span
            key={combo}
            className="px-4 py-1 rounded-full bg-orange-100 text-orange-600 text-lg font-bold animate-pop"
          >
            コンボ ×{combo}！
          </span>
        )}
      </div>

      {/* あつめたシール（トレイ） */}
      <div className="flex items-center gap-1.5 min-h-12 flex-wrap justify-center rounded-full bg-white/70 border border-rose-100 px-6 py-1.5">
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
        {memoryMode
          ? 'カードを めくって おなじ ペアを さがそう！'
          : 'おおもじと こもじの ペアを えらぼう！'}
      </p>

      <div className="relative w-full">
        <div className="grid grid-cols-4 landscape:grid-cols-8 gap-3 sm:gap-4 w-full">
          {cards.map((card) => {
            const isMatched = matched.has(card.id)
            const isSelected = selected === card.id
            const isWrong = wrongPair.has(card.id)
            const popping = justMatched.has(card.id)
            // 神経衰弱では、選択中・判定中・クリア済みのカードだけ表を見せる
            const faceUp = !memoryMode || isMatched || isSelected || isWrong
            return (
              <button
                key={card.id}
                onClick={() => handleTap(card)}
                disabled={isMatched}
                className={[
                  'aspect-square rounded-2xl text-5xl sm:text-6xl landscape:text-5xl font-bold shadow-md transition-all',
                  'flex items-center justify-center',
                  !faceUp
                    ? 'bg-gradient-to-br from-rose-200 to-rose-300 border-2 border-white/60 hover:-translate-y-0.5 hover:shadow-lg active:scale-95'
                    : isMatched
                      ? `bg-orange-50 border border-orange-100 shadow-none ${popping ? 'ring-2 ring-amber-200' : ''}`
                      : isWrong
                        ? 'bg-red-100 text-red-500 animate-shake'
                        : isSelected
                          ? 'bg-rose-100 text-rose-600 ring-4 ring-rose-300 scale-105'
                          : 'bg-white text-rose-500 hover:-translate-y-0.5 hover:shadow-lg active:bg-rose-50',
                  popping ? 'animate-pop' : '',
                  memoryMode && faceUp && !isMatched ? 'animate-flip-in' : '',
                  !faceUp && justHidden.has(card.id) ? 'animate-flip-in' : '',
                ].join(' ')}
              >
                {!faceUp ? (
                  <img src="/penguin.png" alt="" className="w-1/2 h-auto opacity-60" />
                ) : isMatched ? (
                  card.letter.words[0].emoji
                ) : card.face === 'upper' ? (
                  card.letter.upper
                ) : (
                  card.letter.lower
                )}
              </button>
            )
          })}
        </div>

        {coaching && (
          <div className="absolute inset-0 rounded-2xl bg-white/60 backdrop-blur-[2px] flex items-center justify-center animate-bounce-in">
            <div className="flex flex-col items-center gap-2 rounded-3xl bg-white border border-rose-100 shadow-xl px-10 py-6">
              <img src="/bear-pointer.png" alt="クマせんせい" className="w-24 h-auto" />
              <p className="text-2xl font-bold text-rose-500">
                ゆっくり よく みてみよう！
              </p>
              <p className="text-sm font-bold text-gray-500">カードを まぜなおしたよ</p>
            </div>
          </div>
        )}
      </div>

      {done && (
        <Celebration
          tier={missedLetters.current.size === 0 ? 4 : 3}
          onNext={nextLevel}
          label="つぎの レベルへ"
        />
      )}
    </div>
  )
}
