import { useRef, useState } from 'react'
import { LETTERS, shuffle, type Letter } from '../data/letters'
import { speak } from '../lib/speech'
import { playCorrect, playWrong } from '../lib/sounds'
import { saveRecord } from '../lib/records'
import { addLocalLetterCorrect } from '../lib/collection'
import Celebration from './Celebration'

type LetterCase = 'upper' | 'lower'

type Round = {
  segment: Letter[] // 連続するアルファベットの区間
  blanks: number[] // 虫食いの位置（segment内のindex）
  candidates: Letter[] // 下に並ぶ候補カード（虫食いの文字をシャッフル）
}

// レベルごとの区間の長さと虫食いの数（レベル5で最大）
function configForLevel(level: number) {
  return {
    length: Math.min(5 + level, 10),
    blanks: Math.min(1 + level, 6),
  }
}

const MAX_LEVEL = 5

function buildRound(level: number): Round {
  const { length, blanks } = configForLevel(level)
  const start = Math.floor(Math.random() * (LETTERS.length - length + 1))
  const segment = LETTERS.slice(start, start + length)
  // 先頭は手がかりとして必ず見せる（虫食いは2文字目以降から選ぶ）
  const blankPositions = shuffle(
    Array.from({ length: length - 1 }, (_, i) => i + 1),
  )
    .slice(0, blanks)
    .sort((a, b) => a - b)
  return {
    segment,
    blanks: blankPositions,
    candidates: shuffle(blankPositions.map((i) => segment[i])),
  }
}

export default function OrderingGame() {
  const [level, setLevel] = useState(1)
  const [letterCase, setLetterCase] = useState<LetterCase>('upper')
  const [round, setRound] = useState<Round>(() => buildRound(1))
  const [filled, setFilled] = useState<Set<number>>(new Set())
  const [usedCandidates, setUsedCandidates] = useState<Set<string>>(new Set())
  const [wrongTap, setWrongTap] = useState<string | null>(null)
  const missedLetters = useRef<Set<string>>(new Set())

  const activeBlank = round.blanks.find((i) => !filled.has(i))
  const done = activeBlank === undefined

  function show(letter: Letter) {
    return letterCase === 'upper' ? letter.upper : letter.lower
  }

  function resetWith(nextLevel: number, nextCase: LetterCase) {
    setLevel(nextLevel)
    setLetterCase(nextCase)
    setRound(buildRound(nextLevel))
    setFilled(new Set())
    setUsedCandidates(new Set())
    setWrongTap(null)
    missedLetters.current = new Set()
  }

  function handleCandidate(candidate: Letter) {
    if (done || usedCandidates.has(candidate.upper) || wrongTap) return
    const target = round.segment[activeBlank]
    if (candidate.upper === target.upper) {
      const nextFilled = new Set(filled)
      nextFilled.add(activeBlank)
      setFilled(nextFilled)
      setUsedCandidates((prev) => new Set(prev).add(candidate.upper))
      playCorrect()
      speak(candidate.upper)
      if (nextFilled.size === round.blanks.length) {
        const blankLetters = round.blanks.map((i) => round.segment[i].upper)
        const wrong = [...missedLetters.current]
        const correct = blankLetters.filter((l) => !missedLetters.current.has(l))
        addLocalLetterCorrect(correct)
        saveRecord({ mode: 'ordering', level, correct_letters: correct, wrong_letters: wrong })
        // ファンファーレはCelebrationが成績に応じて鳴らす
        setTimeout(() => {
          // そろった区間をとおして読み上げる
          speak(round.segment.map((l) => l.upper).join('. '))
        }, 800)
      }
    } else {
      playWrong()
      missedLetters.current.add(target.upper)
      setWrongTap(candidate.upper)
      setTimeout(() => setWrongTap(null), 500)
    }
  }

  function nextLevel() {
    resetWith(Math.min(level + 1, MAX_LEVEL), letterCase)
  }

  return (
    <div className="flex flex-col items-center gap-6 landscape:gap-4 w-full max-w-2xl">
      <div className="flex items-center gap-3">
        <span className="px-4 py-1 rounded-full bg-white border border-rose-200 text-rose-500 text-lg font-bold">
          レベル {level}
        </span>
        {/* 大文字/小文字の切り替え */}
        <div className="flex rounded-full bg-white border border-gray-200 overflow-hidden">
          {(['upper', 'lower'] as const).map((c) => (
            <button
              key={c}
              onClick={() => {
                if (c !== letterCase) resetWith(level, c)
              }}
              className={[
                'px-4 py-1 text-base font-bold transition-colors',
                letterCase === c ? 'bg-orange-400 text-white' : 'text-gray-500',
              ].join(' ')}
            >
              {c === 'upper' ? 'おおもじ' : 'こもじ'}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xl font-bold text-gray-600">
        あいている ところに はいる アルファベットを えらぼう！
      </p>

      {/* 並び（虫食い付き） */}
      <div
        className="grid gap-2 w-full"
        style={{ gridTemplateColumns: `repeat(${round.segment.length}, minmax(0, 1fr))` }}
      >
        {round.segment.map((letter, i) => {
          const isBlank = round.blanks.includes(i)
          const isFilled = filled.has(i)
          const isActive = i === activeBlank
          if (!isBlank) {
            return (
              <div
                key={i}
                className="aspect-square rounded-xl bg-rose-50 flex items-center justify-center text-3xl sm:text-4xl font-bold text-rose-400"
              >
                {show(letter)}
              </div>
            )
          }
          return (
            <div
              key={i}
              className={[
                'aspect-square rounded-xl flex items-center justify-center text-3xl sm:text-4xl font-bold',
                isFilled
                  ? 'bg-white shadow-md text-rose-500 animate-pop'
                  : isActive
                    ? 'bg-white border-2 border-rose-400 ring-4 ring-rose-100'
                    : 'bg-white/60 border-2 border-dashed border-gray-300',
              ].join(' ')}
            >
              {isFilled ? show(letter) : ''}
            </div>
          )
        })}
      </div>

      {/* 候補カード */}
      {!done && (
        <div className="flex justify-center gap-3 flex-wrap">
          {round.candidates.map((candidate) => {
            const used = usedCandidates.has(candidate.upper)
            const isWrong = wrongTap === candidate.upper
            if (used) {
              return (
                <div
                  key={candidate.upper}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-100"
                />
              )
            }
            return (
              <button
                key={candidate.upper}
                onClick={() => handleCandidate(candidate)}
                className={[
                  'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl text-4xl sm:text-5xl font-bold shadow-md',
                  'flex items-center justify-center transition-all',
                  isWrong
                    ? 'bg-red-100 text-red-500 animate-shake'
                    : 'bg-white text-rose-500 hover:-translate-y-0.5 hover:shadow-lg active:bg-rose-50',
                ].join(' ')}
              >
                {show(candidate)}
              </button>
            )
          })}
        </div>
      )}

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
