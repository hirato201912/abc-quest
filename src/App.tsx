import { useState } from 'react'
import MatchingGame from './components/MatchingGame'
import WordCards from './components/WordCards'
import WordQuiz from './components/WordQuiz'
import PlayerPicker from './components/PlayerPicker'
import Zukan from './components/Zukan'
import ListeningQuiz from './components/ListeningQuiz'
import OrderingGame from './components/OrderingGame'
import { getPlayer, type Player } from './lib/player'

type Mode =
  | 'home'
  | 'matching'
  | 'cards'
  | 'quiz'
  | 'listening'
  | 'ordering'
  | 'player'
  | 'zukan'

const GAME_MODES: { key: Mode; emoji: string; title: string; desc: string }[] = [
  {
    key: 'cards',
    emoji: '📖',
    title: 'たんごカード',
    desc: 'アルファベットと ことばを おぼえよう',
  },
  {
    key: 'matching',
    emoji: '🧩',
    title: 'ペアさがし',
    desc: 'おおもじと こもじを あわせよう',
  },
  {
    key: 'quiz',
    emoji: '🎯',
    title: 'クイズ',
    desc: 'ことばの さいしょの アルファベットは どれかな？',
  },
  {
    key: 'listening',
    emoji: '👂',
    title: 'きいて えらぶ',
    desc: 'きこえた アルファベットを あてよう',
  },
  {
    key: 'ordering',
    emoji: '🔢',
    title: 'ならべかえ',
    desc: 'アルファベットの じゅんばんを かんせいさせよう',
  },
]


export default function App() {
  const [mode, setMode] = useState<Mode>('home')
  const [player, setPlayerState] = useState<Player | null>(() => getPlayer())

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-orange-50 flex flex-col items-center p-4 sm:p-8">
      {mode === 'home' ? (
        <div className="flex flex-col items-center gap-4 my-auto w-full max-w-lg">
          <div className="flex items-center gap-3">
            <img
              src="/bear-pointer.png"
              alt="クマせんせい"
              className="w-16 sm:w-20 h-auto"
            />
            <div className="flex flex-col">
              <h1 className="text-3xl sm:text-4xl font-bold text-rose-500">
                ABC クエスト
              </h1>
              <p className="text-sm sm:text-base text-gray-500 font-bold">
                アルファベットを たのしく おぼえよう！
              </p>
            </div>
          </div>
          {player ? (
            <div className="w-full rounded-2xl bg-rose-100/60 px-4 py-2 flex items-center gap-3">
              <img src="/penguin.png" alt="" className="w-8 h-auto shrink-0" />
              <span className="flex-1 text-base font-bold text-gray-700">
                いま がんばっているのは{' '}
                <span className="text-rose-500">{player.name} さん</span>
              </span>
              <button
                onClick={() => setMode('player')}
                className="px-4 py-1.5 rounded-full bg-white text-gray-500 text-sm font-bold shadow-sm active:scale-95 transition-transform"
              >
                かえる
              </button>
            </div>
          ) : (
            <button
              onClick={() => setMode('player')}
              className="w-full bg-rose-400 rounded-2xl px-5 py-3 text-white text-lg font-bold shadow-sm active:scale-[0.98] transition-transform"
            >
              まずは なまえを えらぼう！
            </button>
          )}

          <div className="flex flex-col gap-2 w-full">
            <span className="text-sm font-bold text-gray-400 px-1">チャレンジ</span>
            <div className="grid grid-cols-2 gap-2">
              {GAME_MODES.map((m, i) => (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  className={[
                    'bg-white border border-rose-100 rounded-2xl px-4 py-3 shadow-sm',
                    'active:scale-[0.98] transition-transform flex items-center gap-3 text-left',
                    i === GAME_MODES.length - 1 && GAME_MODES.length % 2 === 1
                      ? 'col-span-2'
                      : '',
                  ].join(' ')}
                >
                  <span className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-xl shrink-0">
                    {m.emoji}
                  </span>
                  <span className="text-lg font-bold text-gray-800">{m.title}</span>
                </button>
              ))}
            </div>

            <span className="text-sm font-bold text-gray-400 px-1 mt-2">
              きみの せいか
            </span>
            <button
              onClick={() => setMode('zukan')}
              className="bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3 active:scale-[0.98] transition-transform flex items-center gap-3 text-left"
            >
              <span className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl shrink-0">
                📔
              </span>
              <span className="text-lg font-bold text-gray-800">シールちょう</span>
              <span className="ml-auto text-sm text-gray-500 font-bold">
                あつめた シールと ★
              </span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 w-full flex-1">
          <div className="w-full max-w-2xl flex justify-start">
            <button
              onClick={() => setMode('home')}
              className="px-6 py-3 rounded-full bg-white border border-gray-200 text-gray-600 text-lg font-bold shadow-sm active:scale-95 transition-transform"
            >
              ← もどる
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center w-full">
            {mode === 'matching' && <MatchingGame />}
            {mode === 'cards' && <WordCards />}
            {mode === 'quiz' && <WordQuiz />}
            {mode === 'listening' && <ListeningQuiz />}
            {mode === 'ordering' && <OrderingGame />}
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
