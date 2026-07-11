let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (!('AudioContext' in window)) return null
  if (!ctx) ctx = new AudioContext()
  // タブレットではユーザー操作前にsuspendedになっていることがある
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, startAt: number, duration: number, volume = 0.12) {
  const audio = getCtx()
  if (!audio) return
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  const t = audio.currentTime + startAt
  gain.gain.setValueAtTime(volume, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration)
  osc.connect(gain)
  gain.connect(audio.destination)
  osc.start(t)
  osc.stop(t + duration)
}

// step = コンボ数。連続正解で半音ずつ音程が上がる（上限あり）
export function playCorrect(step = 0) {
  const mult = Math.pow(2, Math.min(step, 8) / 12)
  tone(660 * mult, 0, 0.15)
  tone(880 * mult, 0.12, 0.25)
}

export function playWrong() {
  // とがったブザーではなく、やわらかい「あれ？」の下がり2音（罰なし方針）
  tone(392, 0, 0.12, 0.07)
  tone(330, 0.1, 0.22, 0.07)
}

// お祝いの段階（Celebrationのtierと対応）。上の段ほど長く華やかに
export function playFanfare(tier: 1 | 2 | 3 | 4 = 3) {
  tone(523, 0, 0.18)
  tone(659, 0.15, tier === 1 ? 0.4 : 0.18)
  if (tier === 1) return
  tone(784, 0.3, tier === 2 ? 0.45 : 0.18)
  if (tier === 2) return
  tone(1047, 0.45, 0.5)
  if (tier === 4) {
    tone(1319, 0.7, 0.15, 0.1)
    tone(1568, 0.85, 0.15, 0.1)
    tone(2093, 1.0, 0.6, 0.1)
  }
}
