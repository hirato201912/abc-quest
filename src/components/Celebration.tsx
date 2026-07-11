import { useEffect } from 'react'
import { playFanfare } from '../lib/sounds'

export type CelebrationTier = 1 | 2 | 3 | 4

// 成績に応じてクマ先生の反応が育つ（罰なし: いちばん下でも ほめる）
const TIERS: Record<
  CelebrationTier,
  { words: string; confetti: string[]; color: string }
> = {
  1: { words: 'がんばったね！', confetti: ['⭐', '✨', '⭐'], color: 'text-rose-500' },
  2: { words: 'いいね！', confetti: ['⭐', '✨', '🎉', '✨', '⭐'], color: 'text-rose-500' },
  3: { words: 'すごい！', confetti: ['⭐', '✨', '🎉', '✨', '⭐'], color: 'text-rose-500' },
  4: {
    words: 'かんぺき！',
    confetti: ['✨', '⭐', '🌟', '🎉', '🌟', '⭐', '✨'],
    color: 'text-amber-500',
  },
}

export default function Celebration({
  onNext,
  label,
  tier = 3,
}: {
  onNext: () => void
  label: string
  tier?: CelebrationTier
}) {
  const t = TIERS[tier]

  useEffect(() => {
    // 直前の正解音・読み上げと重なりすぎないよう少し待ってから鳴らす
    const timer = setTimeout(() => playFanfare(tier), 400)
    return () => clearTimeout(timer)
  }, [tier])

  return (
    <div className="relative flex flex-col items-center gap-4 animate-bounce-in">
      <div className="pointer-events-none absolute inset-x-0 -top-4 flex justify-center gap-2">
        {t.confetti.map((emoji, i) => (
          <span
            key={i}
            className="text-3xl animate-float-up"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            {emoji}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <img src="/bear-cheer.png" alt="クマせんせい" className="w-24 h-auto" />
        <p className={`text-4xl font-bold ${t.color}`}>{t.words}</p>
      </div>
      <button
        onClick={onNext}
        className="px-10 py-5 rounded-full bg-orange-400 text-white text-2xl font-bold shadow-lg active:scale-95 transition-transform"
      >
        {label}
      </button>
    </div>
  )
}
