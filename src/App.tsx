import { useState } from 'react'
import MatchingGame from './components/MatchingGame'
import WordCards from './components/WordCards'
import WordQuiz from './components/WordQuiz'
import PlayerPicker from './components/PlayerPicker'
import Zukan from './components/Zukan'
import { getPlayer, type Player } from './lib/player'

type Mode = 'home' | 'matching' | 'cards' | 'quiz' | 'player' | 'zukan'

const MODES: { key: Mode; emoji: string; title: string; desc: string; color: string }[] = [
  {
    key: 'cards',
    emoji: '📖',
    title: 'たんごカード',
    desc: 'アルファベットと ことばを おぼえよう',
    color: 'bg-sky-400',
  },
  {
    key: 'matching',
    emoji: '🧩',
    title: 'ペアさがし',
    desc: 'おおもじと こもじを あわせよう',
    color: 'bg-green-400',
  },
  {
    key: 'quiz',
    emoji: '🎯',
    title: 'クイズ',
    desc: 'ことばの さいしょの もじは どれかな？',
    color: 'bg-pink-400',
  },
  {
    key: 'zukan',
    emoji: '📔',
    title: 'ずかん',
    desc: 'ことばを あつめて ★を ふやそう',
    color: 'bg-amber-400',
  },
]

export default function App() {
  const [mode, setMode] = useState<Mode>('home')
  const [player, setPlayerState] = useState<Player | null>(() => getPlayer())

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-orange-50 to-sky-100 flex flex-col items-center p-4 sm:p-8">
      {mode === 'home' ? (
        <div className="flex flex-col items-center gap-8 my-auto w-full max-w-lg">
          <button
            onClick={() => setMode('player')}
            className="self-end px-5 py-2 rounded-full bg-white text-purple-600 text-base font-bold shadow active:scale-95 transition-transform"
          >
            {player ? `${player.name} さん` : 'なまえを えらぶ'}
          </button>
          <div className="flex items-center gap-2">
            <img
              src="/bear-pointer.png"
              alt="クマせんせい"
              className="w-28 sm:w-32 h-auto"
            />
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-5xl font-bold text-orange-500 drop-shadow-sm">
                ABC クエスト
              </h1>
              <p className="text-xl text-gray-600 font-bold">
                アルファベットを たのしく おぼえよう！
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-5 w-full">
            {MODES.map((m) => (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                className={`${m.color} rounded-3xl px-8 py-6 text-white shadow-lg active:scale-95 transition-transform flex items-center gap-5`}
              >
                <span className="text-5xl">{m.emoji}</span>
                <span className="text-left">
                  <span className="block text-3xl font-bold">{m.title}</span>
                  <span className="block text-base opacity-90">{m.desc}</span>
                </span>
              </button>
            ))}
          </div>
          <img src="/penguin.png" alt="ペンギン" className="w-16 h-auto opacity-80" />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 w-full flex-1">
          <div className="w-full max-w-2xl flex justify-start">
            <button
              onClick={() => setMode('home')}
              className="px-6 py-3 rounded-full bg-gray-500 text-white text-lg font-bold shadow active:scale-95 transition-transform"
            >
              ← もどる
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center w-full">
            {mode === 'matching' && <MatchingGame />}
            {mode === 'cards' && <WordCards />}
            {mode === 'quiz' && <WordQuiz />}
            {mode === 'zukan' && <Zukan player={player} />}
            {mode === 'player' && (
              <PlayerPicker
                current={player}
                onDone={(p) => {
                  setPlayerState(p)
                  setMode('home')
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
