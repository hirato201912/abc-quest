const CONFETTI = ['⭐', '✨', '🎉', '✨', '⭐']

export default function Celebration({
  onNext,
  label,
}: {
  onNext: () => void
  label: string
}) {
  return (
    <div className="relative flex flex-col items-center gap-4 animate-bounce-in">
      <div className="pointer-events-none absolute inset-x-0 -top-4 flex justify-center gap-2">
        {CONFETTI.map((emoji, i) => (
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
        <p className="text-4xl font-bold text-rose-500">すごい！</p>
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
