import { getLocalLetterCounts } from './collection'

// ブロック = ノーミス正解の累計回数（ペアさがし＋クイズ）
export function localBlockCount(): number {
  return Object.values(getLocalLetterCounts()).reduce((a, b) => a + b, 0)
}
