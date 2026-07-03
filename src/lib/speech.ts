let cachedVoice: SpeechSynthesisVoice | null = null

function getEnglishVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice) return cachedVoice
  const voices = window.speechSynthesis.getVoices()
  cachedVoice =
    voices.find((v) => v.lang === 'en-US' && v.localService) ??
    voices.find((v) => v.lang === 'en-US') ??
    voices.find((v) => v.lang.startsWith('en')) ??
    null
  return cachedVoice
}

// iPad Safariなどでは音声リストが非同期で届く
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = null
    getEnglishVoice()
  }
}

export function speak(text: string, rate = 0.85) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = rate
  const voice = getEnglishVoice()
  if (voice) utterance.voice = voice
  window.speechSynthesis.speak(utterance)
}
