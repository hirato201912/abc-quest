export type Player = {
  id: string
  name: string
  grade: string
}

const STORAGE_KEY = 'abc_quest_player'

export function getPlayer(): Player | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Player) : null
  } catch {
    return null
  }
}

export function setPlayer(player: Player | null) {
  if (player) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(player))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}
