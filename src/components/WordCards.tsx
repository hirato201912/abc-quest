import { useState } from 'react'
import { LETTERS } from '../data/letters'
import { speak } from '../lib/speech'

export default function WordCards() {
  const [index, setIndex] = useState(0)
  const [animKey, setAnimKey] = useState(0)
  const letter = LETTERS[index]
  const word = letter.words[0]

  function go(delta: number) {
    const next = (index + delta + LETTERS.length) % LETTERS.length
    setIndex(next)
    setAnimKey((k) => k + 1)
    speak(`${LETTERS[next].upper}. ${LETTERS[next].words[0].word}.`)
  }

  return (
    <div className="flex flex-col items-center gap-6 landscape:gap-3 w-full max-w-xl landscape:max-w-3xl">
      <p className="text-xl font-bold text-purple-700">
        カードを タッチすると こえが きこえるよ！
      </p>

      <button
        key={animKey}
        onClick={() => speak(`${letter.upper}. ${word.word}.`)}
        className="w-full rounded-3xl bg-white shadow-xl p-8 landscape:p-5 flex flex-col landscape:flex-row items-center justify-center gap-4 landscape:gap-10 active:scale-95 transition-transform animate-bounce-in"
      >
        <div className="flex items-end gap-4">
          <span className="text-8xl landscape:text-7xl font-bold text-blue-600">{letter.upper}</span>
          <span className="text-7xl landscape:text-6xl font-bold text-pink-500">{letter.lower}</span>
        </div>
        <span className="text-8xl landscape:text-7xl">{word.emoji}</span>
        <div className="flex flex-col items-center gap-2">
          <span className="text-4xl font-bold text-gray-800">{word.word}</span>
          <span className="text-xl text-gray-500">{word.katakana}</span>
          <span className="text-2xl">🔊</span>
        </div>
      </button>

      <div className="flex items-center gap-8">
        <button
          onClick={() => go(-1)}
          className="w-20 h-20 rounded-full bg-orange-400 text-white text-4xl font-bold shadow-lg active:scale-90 transition-transform"
        >
          ←
        </button>
        <span className="text-2xl font-bold text-gray-600">
          {index + 1} / {LETTERS.length}
        </span>
        <button
          onClick={() => go(1)}
          className="w-20 h-20 rounded-full bg-orange-400 text-white text-4xl font-bold shadow-lg active:scale-90 transition-transform"
        >
          →
        </button>
      </div>
    </div>
  )
}
