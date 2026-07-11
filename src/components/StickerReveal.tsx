import { useState } from 'react'
import type { WordEntry } from '../data/letters'
import { speak } from '../lib/speech'
import { playCorrect } from '../lib/sounds'

// ラウンドで あたらしく手に入れた ことばシールを裏向きで並べ、
// 自分で「おして」めくる開封演出。めくると絵と発音が出る
export default function StickerReveal({ words }: { words: WordEntry[] }) {
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const allOpen = revealed.size === words.length

  function open(entry: WordEntry) {
    if (!revealed.has(entry.word)) {
      setRevealed((prev) => new Set(prev).add(entry.word))
      playCorrect(4)
    }
    speak(entry.word)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xl font-bold text-orange-500">
        あたらしい ことばシール {words.length}まい ゲット！
      </p>
      <p className="text-base font-bold text-gray-500">
        {allOpen
          ? 'シールちょうに はっておいたよ！'
          : 'シールを おして めくってみよう'}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {words.map((entry) => {
          const isOpen = revealed.has(entry.word)
          return (
            <button
              key={entry.word}
              onClick={() => open(entry)}
              className={
                isOpen
                  ? 'min-w-24 h-28 px-3 rounded-2xl bg-white border-2 border-amber-200 shadow-md flex flex-col items-center justify-center gap-0.5 animate-flip-in'
                  : 'w-24 h-28 rounded-2xl bg-rose-100 border-2 border-rose-200 shadow-md hover:shadow-lg flex items-center justify-center text-4xl font-bold text-rose-400 animate-invite'
              }
            >
              {isOpen ? (
                <>
                  <span className="text-4xl">{entry.emoji}</span>
                  <span className="text-lg font-bold text-gray-800">
                    {entry.word}
                  </span>
                  <span className="text-xs text-gray-500">{entry.katakana}</span>
                </>
              ) : (
                '？'
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
