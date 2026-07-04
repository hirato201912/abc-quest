import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { localBlockCount } from '../lib/blocks'
import { waitForPendingSaves } from '../lib/records'
import type { Player } from '../lib/player'

type Rect = { x: number; y: number; w: number; h: number; fill: string; rx?: number }
type Stage = { label: string; rects: Rect[] }
type Scene = {
  name: string
  stages: Stage[]
  // 完成時にクマ先生が立つ位置（足元は地面 y=110 に固定）
  bear: { x: number; w: number }
}

// 1パーツを建てるのに必要なブロック（＝ノーミス正解）数
const BLOCKS_PER_STAGE = 6

const HOUSE: Scene = {
  name: 'クマせんせいの いえ',
  bear: { x: 44, w: 22 },
  stages: [
    { label: 'じめん', rects: [{ x: 0, y: 110, w: 160, h: 10, fill: '#cdbaa3' }] },
    { label: 'どだい', rects: [{ x: 30, y: 100, w: 100, h: 10, fill: '#b08968' }] },
    { label: 'かべ', rects: [{ x: 30, y: 60, w: 100, h: 40, fill: '#f6ead9' }] },
    {
      label: 'はしら',
      rects: [
        { x: 30, y: 60, w: 6, h: 40, fill: '#dcbf9f' },
        { x: 124, y: 60, w: 6, h: 40, fill: '#dcbf9f' },
        { x: 30, y: 60, w: 100, h: 5, fill: '#dcbf9f' },
      ],
    },
    {
      label: 'ドア',
      rects: [
        { x: 72, y: 74, w: 16, h: 26, fill: '#e8833a' },
        { x: 84, y: 86, w: 3, h: 3, fill: '#8d5524' },
      ],
    },
    {
      label: 'まど',
      rects: [
        { x: 44, y: 72, w: 14, h: 12, fill: '#dbe9ef' },
        { x: 102, y: 72, w: 14, h: 12, fill: '#dbe9ef' },
        { x: 44, y: 77, w: 14, h: 2, fill: '#dcbf9f' },
        { x: 102, y: 77, w: 14, h: 2, fill: '#dcbf9f' },
      ],
    },
    { label: 'やね', rects: [{ x: 24, y: 50, w: 112, h: 10, fill: '#e0719a' }] },
    {
      label: 'やねの てっぺん',
      rects: [
        { x: 40, y: 40, w: 80, h: 10, fill: '#cc5c86' },
        { x: 56, y: 30, w: 48, h: 10, fill: '#cc5c86' },
      ],
    },
    {
      label: 'えんとつ',
      rects: [
        { x: 104, y: 14, w: 10, h: 20, fill: '#b3746a' },
        { x: 102, y: 12, w: 14, h: 4, fill: '#96574d' },
      ],
    },
    {
      label: 'はた',
      rects: [
        { x: 18, y: 72, w: 3, h: 38, fill: '#8d6e5c' },
        { x: 21, y: 72, w: 14, h: 9, fill: '#e0719a' },
      ],
    },
    {
      label: 'はなだん',
      rects: [
        { x: 34, y: 104, w: 4, h: 4, fill: '#e0719a' },
        { x: 42, y: 104, w: 4, h: 4, fill: '#eda45c' },
        { x: 50, y: 104, w: 4, h: 4, fill: '#e0719a' },
        { x: 110, y: 104, w: 4, h: 4, fill: '#eda45c' },
        { x: 118, y: 104, w: 4, h: 4, fill: '#e0719a' },
      ],
    },
    {
      label: 'き',
      rects: [
        { x: 142, y: 86, w: 8, h: 24, fill: '#8d6e5c' },
        { x: 132, y: 62, w: 28, h: 26, fill: '#9dbb8b', rx: 6 },
        { x: 138, y: 52, w: 16, h: 14, fill: '#9dbb8b', rx: 5 },
      ],
    },
  ],
}

const PARK: Scene = {
  name: 'こうえん',
  bear: { x: 66, w: 22 },
  stages: [
    { label: 'しばふ', rects: [{ x: 0, y: 110, w: 160, h: 10, fill: '#b2c79c' }] },
    { label: 'いけ', rects: [{ x: 96, y: 94, w: 44, h: 16, fill: '#bcd9e4', rx: 8 }] },
    {
      label: 'き',
      rects: [
        { x: 20, y: 80, w: 8, h: 30, fill: '#8d6e5c' },
        { x: 8, y: 56, w: 32, h: 28, fill: '#9dbb8b', rx: 8 },
      ],
    },
    {
      label: 'ベンチ',
      rects: [
        { x: 56, y: 96, w: 28, h: 4, fill: '#c98d5a' },
        { x: 58, y: 100, w: 3, h: 10, fill: '#a06a3f' },
        { x: 79, y: 100, w: 3, h: 10, fill: '#a06a3f' },
        { x: 56, y: 90, w: 28, h: 3, fill: '#c98d5a' },
      ],
    },
    {
      label: 'ブランコ',
      rects: [
        { x: 110, y: 58, w: 3, h: 52, fill: '#c98d5a' },
        { x: 146, y: 58, w: 3, h: 52, fill: '#c98d5a' },
        { x: 108, y: 54, w: 44, h: 4, fill: '#c98d5a' },
        { x: 124, y: 58, w: 2, h: 30, fill: '#a06a3f' },
        { x: 134, y: 58, w: 2, h: 30, fill: '#a06a3f' },
        { x: 121, y: 88, w: 18, h: 4, fill: '#e8833a' },
      ],
    },
    {
      label: 'はな',
      rects: [
        { x: 48, y: 104, w: 4, h: 4, fill: '#e0719a' },
        { x: 56, y: 106, w: 4, h: 4, fill: '#eda45c' },
        { x: 88, y: 104, w: 4, h: 4, fill: '#e0719a' },
        { x: 96, y: 106, w: 4, h: 4, fill: '#eda45c' },
      ],
    },
    {
      label: 'くも',
      rects: [
        { x: 30, y: 20, w: 26, h: 8, fill: '#ffffff', rx: 4 },
        { x: 40, y: 14, w: 20, h: 8, fill: '#ffffff', rx: 4 },
      ],
    },
    { label: 'おひさま', rects: [{ x: 128, y: 12, w: 18, h: 18, fill: '#f4c26b', rx: 9 }] },
  ],
}

const SCENES = [HOUSE, PARK]
const TOTAL_STAGES = SCENES.reduce((n, s) => n + s.stages.length, 0)

export default function BlockTown({ player }: { player: Player | null }) {
  const [blocks, setBlocks] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      await waitForPendingSaves() // 直前のプレイの記録送信を待つ
      if (player && supabase) {
        const { data } = await supabase
          .from('abc_quest_records')
          .select('correct_letters')
          .eq('student_id', player.id)
        if (!cancelled && data) {
          setBlocks(data.reduce((n, rec) => n + (rec.correct_letters?.length ?? 0), 0))
          setLoading(false)
          return
        }
      }
      if (!cancelled) {
        setBlocks(localBlockCount())
        setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [player])

  if (loading) {
    return <p className="text-gray-500 font-bold">よみこみちゅう…</p>
  }

  const unlockedStages = Math.floor(blocks / BLOCKS_PER_STAGE)
  const allDone = unlockedStages >= TOTAL_STAGES

  // いま建てているシーンを決める（完成した直後はそのシーンに留まり、次の正解から次のシーンへ）
  let remaining = Math.min(unlockedStages, TOTAL_STAGES)
  let sceneIndex = 0
  while (sceneIndex < SCENES.length - 1 && remaining > SCENES[sceneIndex].stages.length) {
    remaining -= SCENES[sceneIndex].stages.length
    sceneIndex++
  }
  const scene = SCENES[sceneIndex]
  const builtInScene = Math.min(remaining, scene.stages.length)
  const sceneComplete = builtInScene === scene.stages.length
  const progress = blocks % BLOCKS_PER_STAGE
  const need = BLOCKS_PER_STAGE - progress
  const bearHeight = scene.bear.w * 1.32 // bear-cheer.png の縦横比

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-xl">
      <h2 className="text-3xl font-bold text-rose-500">ブロックタウン</h2>

      <div className="flex items-center gap-3">
        <span className="px-4 py-1.5 rounded-full bg-white border border-rose-200 text-rose-500 font-bold">
          ブロック {blocks} こ
        </span>
        {sceneIndex > 0 && (
          <span className="px-4 py-1.5 rounded-full bg-white border border-orange-200 text-orange-500 font-bold">
            かんせい {sceneIndex} けん
          </span>
        )}
      </div>

      <div className="w-full bg-white rounded-3xl border border-rose-100 shadow-sm p-4 flex flex-col items-center gap-3">
        <span className="text-lg font-bold text-gray-700">{scene.name}</span>
        <svg viewBox="0 0 160 120" className="w-full max-w-md rounded-2xl">
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#eaf3f8" />
              <stop offset="100%" stopColor="#fbf3e9" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="160" height="120" fill="url(#sky)" rx="8" />

          {/* まだ建っていないパーツ = 設計図（点線）。つぎのパーツは明滅 */}
          {scene.stages.map((stage, si) => {
            if (si < builtInScene) return null
            return (
              <g key={`plan-${si}`} className={si === builtInScene ? 'svg-next' : undefined} opacity={si === builtInScene ? 1 : 0.35}>
                {stage.rects.map((r, ri) => (
                  <rect
                    key={ri}
                    x={r.x}
                    y={r.y}
                    width={r.w}
                    height={r.h}
                    rx={r.rx ?? 0}
                    fill="none"
                    stroke="#c9b6a6"
                    strokeWidth="1"
                    strokeDasharray="3 2"
                  />
                ))}
              </g>
            )
          })}

          {/* 建ったパーツ。いちばん新しいものは落ちてくるアニメーション */}
          {scene.stages.slice(0, builtInScene).map((stage, si) => (
            <g key={`built-${si}`} className={si === builtInScene - 1 ? 'svg-built' : undefined}>
              {stage.rects.map((r, ri) => (
                <rect
                  key={ri}
                  x={r.x}
                  y={r.y}
                  width={r.w}
                  height={r.h}
                  rx={r.rx ?? 0}
                  fill={r.fill}
                  stroke="#8d6e5c"
                  strokeOpacity="0.3"
                  strokeWidth="0.75"
                />
              ))}
            </g>
          ))}

          {/* 完成するとクマ先生が住みつく */}
          {sceneComplete && (
            <image
              href="/bear-cheer.png"
              x={scene.bear.x}
              y={110 - bearHeight}
              width={scene.bear.w}
              height={bearHeight}
              className="svg-built"
            />
          )}
        </svg>

        {allDone ? (
          <p className="text-xl font-bold text-rose-500">
            まちが ぜんぶ かんせい！ すごい！
          </p>
        ) : sceneComplete ? (
          <p className="text-lg font-bold text-rose-500">
            「{scene.name}」が かんせい！ つぎの せいかいから あたらしい ばしょが はじまるよ
          </p>
        ) : (
          <div className="w-full flex flex-col items-center gap-2">
            <p className="text-base font-bold text-gray-600">
              つぎは 「{scene.stages[builtInScene].label}」！
              あと {need} かい せいかいで できるよ
            </p>
            <div className="w-full max-w-xs h-3 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full bg-orange-400 rounded-full transition-all"
                style={{ width: `${(progress / BLOCKS_PER_STAGE) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <p className="text-sm font-bold text-gray-500 text-center">
        てんせんは これから つくる ところ。ゲームで ノーミスせいかいすると ブロックが 1こ もらえるよ！
      </p>
    </div>
  )
}
