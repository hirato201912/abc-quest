import { useEffect, useMemo, useRef, useState } from 'react'
import { shuffle } from '../data/letters'
import { SENTENCES, sentenceText, type SentenceRole } from '../data/sentences'
import { speak } from '../lib/speech'
import { playCorrect, playWrong } from '../lib/sounds'
import { saveRecord } from '../lib/records'
import Celebration, { type CelebrationTier } from './Celebration'

const SENTENCES_PER_ROUND = 5
const MAX_LEVEL = 3

// 語順の役割ラベル。「だれが → どうする → なにを」が このモードの学びの芯
const ROLE_LABELS: Record<SentenceRole, string> = {
  who: 'だれが',
  do: 'どうする',
  what: 'なにを',
}

export default function SentenceGame() {
  const [level, setLevel] = useState<1 | 2 | 3>(1)
  const [round, setRound] = useState(0)
  const roundSentences = useMemo(
    () =>
      shuffle(SENTENCES.filter((s) => s.level === level)).slice(
        0,
        SENTENCES_PER_ROUND,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [round, level],
  )
  const [sIndex, setSIndex] = useState(0)
  const [filled, setFilled] = useState(0)
  const [stars, setStars] = useState(0)
  const [missed, setMissed] = useState(false) // この文で一度でも間違えたか
  const [combo, setCombo] = useState(0)
  const [wrongTap, setWrongTap] = useState<string | null>(null)
  const correctSentences = useRef<string[]>([])

  const sentence = roundSentences[sIndex]
  const finished = sIndex >= SENTENCES_PER_ROUND
  const candidates = useMemo(
    () => (sentence ? shuffle([...sentence.parts]) : []),
    [sentence],
  )
  const sentenceDone = sentence !== undefined && filled === sentence.parts.length

  // 文のはじまりに お手本を読み上げる
  useEffect(() => {
    if (!finished && sentence) speak(sentenceText(sentence))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sIndex, round])

  function handleCandidate(word: string) {
    if (!sentence || sentenceDone || wrongTap) return
    const target = sentence.parts[filled]
    if (word === target.word) {
      const nextFilled = filled + 1
      setFilled(nextFilled)
      playCorrect(combo)
      setCombo((c) => c + 1)
      if (nextFilled === sentence.parts.length) {
        // 文が完成: 全文を読み上げて、少し見せてから次へ
        const text = sentenceText(sentence)
        const earned = missed ? stars : stars + 1 // ノーミスで作れた文だけスター
        setStars(earned)
        if (!missed) correctSentences.current.push(text)
        if (sIndex + 1 === SENTENCES_PER_ROUND) {
          saveRecord({
            mode: 'sentence',
            level,
            stars: earned,
            total: SENTENCES_PER_ROUND,
            correct_sentences: correctSentences.current,
          })
        }
        setTimeout(() => speak(text), 400)
        setTimeout(() => {
          setFilled(0)
          setMissed(false)
          setSIndex((i) => i + 1)
        }, 2600)
      } else {
        speak(word)
      }
    } else {
      playWrong()
      setWrongTap(word)
      setMissed(true)
      setCombo(0)
      setTimeout(() => setWrongTap(null), 500)
    }
  }

  function nextRound() {
    setSIndex(0)
    setFilled(0)
    setStars(0)
    setMissed(false)
    setCombo(0)
    correctSentences.current = []
    setLevel((l) => (l < MAX_LEVEL ? ((l + 1) as 1 | 2 | 3) : l))
    setRound((r) => r + 1)
  }

  if (finished) {
    const tier: CelebrationTier =
      stars === SENTENCES_PER_ROUND ? 4 : stars >= 4 ? 3 : stars >= 2 ? 2 : 1
    return (
      <div className="flex flex-col items-center gap-6">
        <p className="text-3xl font-bold text-gray-700">
          ⭐ {stars} こ あつめたよ！
        </p>
        <Celebration
          tier={tier}
          onNext={nextRound}
          label={level < MAX_LEVEL ? 'つぎの レベルへ' : 'もういちど チャレンジ'}
        />
      </div>
    )
  }

  if (!sentence) return null

  const placedWords = sentence.parts.slice(0, filled).map((p) => p.word)

  return (
    <div className="flex flex-col items-center gap-6 landscape:gap-3 w-full max-w-2xl">
      <div className="flex items-center gap-4">
        <span className="px-4 py-1 rounded-full bg-white border border-rose-200 text-rose-500 text-lg font-bold">
          レベル {level}
        </span>
        <div className="relative flex items-center gap-1 text-2xl">
          {Array.from({ length: SENTENCES_PER_ROUND }).map((_, i) => (
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
      </div>

      <p className="text-xl font-bold text-gray-600">
        ことばを じゅんばんに ならべて えいごの ぶんを つくろう！
      </p>

      {/* 場面カード: 絵と いみ、お手本の読み上げ */}
      <button
        onClick={() => speak(sentenceText(sentence))}
        className="rounded-3xl bg-white shadow-xl px-10 py-5 flex flex-col items-center gap-1.5 hover:scale-[1.01] active:scale-95 transition-transform"
      >
        <span className="text-7xl landscape:text-6xl">{sentence.emoji}</span>
        <span className="text-xl font-bold text-gray-700">{sentence.ja}</span>
        <span className="text-base text-gray-500">🔊 もういちど きく</span>
      </button>

      {/* 文スロット: だれが → どうする → なにを */}
      <div className="flex items-start justify-center gap-3 flex-wrap">
        {sentence.parts.map((part, i) => {
          const isFilled = i < filled
          const isActive = i === filled
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className={[
                  'min-w-24 px-4 h-16 rounded-xl flex items-center justify-center text-2xl sm:text-3xl font-bold whitespace-nowrap',
                  isFilled
                    ? 'bg-white shadow-md text-rose-500 animate-pop'
                    : isActive
                      ? 'bg-white border-2 border-rose-400 ring-4 ring-rose-100'
                      : 'bg-white/60 border-2 border-dashed border-gray-300',
                ].join(' ')}
              >
                {isFilled ? part.word : ''}
              </div>
              <span className="text-sm font-bold text-gray-400">
                {ROLE_LABELS[part.role]}
              </span>
            </div>
          )
        })}
        {/* 文のおわりの ピリオド */}
        <span className="text-3xl font-bold text-gray-400 self-center pb-6">.</span>
      </div>

      {/* 候補カード / 完成した文 */}
      {sentenceDone ? (
        <p className="text-3xl font-bold text-rose-500 animate-bounce-in">
          {sentenceText(sentence)}
        </p>
      ) : (
        <div className="flex justify-center gap-3 flex-wrap">
          {candidates.map((part, i) => {
            const used = placedWords.includes(part.word)
            const isWrong = wrongTap === part.word
            if (used) {
              return (
                <div key={i} className="min-w-24 h-16 rounded-2xl bg-gray-100" />
              )
            }
            return (
              <button
                key={i}
                onClick={() => handleCandidate(part.word)}
                className={[
                  'min-w-24 px-4 h-16 rounded-2xl text-2xl sm:text-3xl font-bold shadow-md whitespace-nowrap',
                  'flex items-center justify-center transition-all',
                  isWrong
                    ? 'bg-red-100 text-red-500 animate-shake'
                    : 'bg-white text-rose-500 hover:-translate-y-0.5 hover:shadow-lg active:bg-rose-50',
                ].join(' ')}
              >
                {part.word}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
