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

export function playCorrect() {
  tone(660, 0, 0.15)
  tone(880, 0.12, 0.25)
}

export function playWrong() {
  tone(200, 0, 0.25, 0.08)
}

export function playFanfare() {
  tone(523, 0, 0.18)
  tone(659, 0.15, 0.18)
  tone(784, 0.3, 0.18)
  tone(1047, 0.45, 0.5)
}
