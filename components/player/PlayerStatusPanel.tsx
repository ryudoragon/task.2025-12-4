'use client'

import { Settings } from 'lucide-react'

type PlayerStatusProps = {
  name: string
  level: number
  exp: { current: number; max: number }
  hp: { current: number; max: number }
  mp: { current: number; max: number }
  atk: number
  def: number
  will: number
  speed: number
  luck: number
  critical: number // %
  skillSlots: { current: number; max: number }
  gearPower: number
  energy: number
  titles: { current: number; max: number }
  awakeningTier: 1 | 2 | 3
}

export function PlayerStatusPanel(props: PlayerStatusProps) {
  const {
    name,
    level,
    exp,
    hp,
    mp,
    atk,
    def,
    will,
    speed,
    luck,
    critical,
    skillSlots,
    gearPower,
    energy,
    titles,
    awakeningTier,
  } = props

  const expPercentage = (exp.current / exp.max) * 100
  const hpPercentage = (hp.current / hp.max) * 100
  const mpPercentage = (mp.current / mp.max) * 100

  const tierColors = {
    1: {
      border: 'border-cyan-400/60',
      shadow: 'shadow-[0_0_30px_rgba(34,211,238,0.6)]',
      glow: 'from-cyan-400/20',
    },
    2: {
      border: 'border-purple-400/60',
      shadow: 'shadow-[0_0_30px_rgba(168,85,247,0.6)]',
      glow: 'from-purple-400/20',
    },
    3: {
      border: 'border-amber-400/60',
      shadow: 'shadow-[0_0_30px_rgba(251,191,36,0.6)]',
      glow: 'from-amber-400/20',
    },
  }

  const tier = tierColors[awakeningTier]

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-6 space-y-4 bg-[#050511] text-slate-100">
      {/* ① ヘッダー */}
      <div className="relative bg-white/5 backdrop-blur-sm border border-cyan-400/40 rounded-2xl p-4 shadow-[0_0_25px_rgba(34,211,238,0.3)]">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-cyan-300 mb-1 tracking-wide">
              {name}
            </h1>
            <div className="text-lg font-mono text-cyan-400 mb-3">LV. {level}</div>
          </div>
          <button className="p-2 rounded-lg border border-cyan-400/30 bg-white/5 hover:bg-cyan-500/20 hover:border-cyan-400/60 transition-all duration-200">
            <Settings className="w-5 h-5 text-cyan-300" />
          </button>
        </div>

        {/* EXPバー */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="uppercase tracking-widest">EXP</span>
            <span className="font-mono text-cyan-300">
              {exp.current.toLocaleString()} / {exp.max.toLocaleString()} ({Math.floor(expPercentage)}%)
            </span>
          </div>
          <div className="relative h-3 w-full rounded-full bg-slate-900/70 overflow-hidden border border-cyan-400/20">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.8)] transition-all duration-500 ease-out"
              style={{ width: `${expPercentage}%` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
          </div>
        </div>
      </div>

      {/* ② キャラ表示エリア */}
      <div
        className={`relative bg-gradient-to-b ${tier.glow} to-transparent border-2 ${tier.border} rounded-2xl p-8 md:p-12 ${tier.shadow} transition-all duration-300 hover:scale-[1.02]`}
      >
        <div className="aspect-[3/4] max-w-xs mx-auto flex items-center justify-center">
          <div className="w-full h-full border-2 border-dashed border-cyan-400/30 rounded-xl flex items-center justify-center bg-white/5 backdrop-blur-sm">
            <div className="text-center space-y-2">
              <div className="text-6xl mb-4">⚔️</div>
              <p className="text-xs uppercase tracking-widest text-cyan-300/60">
                Character Avatar
              </p>
              <p className="text-[10px] text-slate-500">Tier {awakeningTier}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ③ 主要ステータス（2×2グリッド） */}
      <div className="grid grid-cols-2 gap-3">
        {/* HP */}
        <div className="bg-white/5 backdrop-blur-sm border border-red-400/40 rounded-xl p-4 shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all duration-200 hover:scale-105 hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">❤️</span>
            <span className="text-xs uppercase tracking-widest text-red-300/80">HP</span>
          </div>
          <div className="text-xl font-mono font-bold text-red-300 mb-2">
            {hp.current} / {hp.max}
          </div>
          <div className="relative h-2 w-full rounded-full bg-slate-900/70 overflow-hidden border border-red-400/20">
            <div
              className={`h-full rounded-full bg-gradient-to-r from-red-500 to-red-400 shadow-[0_0_8px_rgba(239,68,68,0.8)] transition-all duration-500 ${
                hpPercentage < 30 ? 'animate-pulse' : ''
              }`}
              style={{ width: `${hpPercentage}%` }}
            />
          </div>
        </div>

        {/* MP */}
        <div className="bg-white/5 backdrop-blur-sm border border-blue-400/40 rounded-xl p-4 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-200 hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">💙</span>
            <span className="text-xs uppercase tracking-widest text-blue-300/80">MP</span>
          </div>
          <div className="text-xl font-mono font-bold text-blue-300 mb-2">
            {mp.current} / {mp.max}
          </div>
          <div className="relative h-2 w-full rounded-full bg-slate-900/70 overflow-hidden border border-blue-400/20">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)] transition-all duration-500"
              style={{ width: `${mpPercentage}%` }}
            />
          </div>
        </div>

        {/* ATK */}
        <div className="bg-white/5 backdrop-blur-sm border border-amber-400/40 rounded-xl p-4 shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all duration-200 hover:scale-105 hover:shadow-[0_0_30px_rgba(251,191,36,0.5)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⚔️</span>
            <span className="text-xs uppercase tracking-widest text-amber-300/80">ATK</span>
          </div>
          <div className="text-2xl font-mono font-bold text-amber-300">{atk}</div>
        </div>

        {/* DEF */}
        <div className="bg-white/5 backdrop-blur-sm border border-emerald-400/40 rounded-xl p-4 shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all duration-200 hover:scale-105 hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🛡️</span>
            <span className="text-xs uppercase tracking-widest text-emerald-300/80">DEF</span>
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-300">{def}</div>
        </div>
      </div>

      {/* ④ 詳細ステータス */}
      <div className="bg-white/5 backdrop-blur-sm border border-cyan-400/40 rounded-2xl p-4 shadow-[0_0_25px_rgba(34,211,238,0.3)]">
        <h2 className="text-xs uppercase tracking-widest text-cyan-300/80 mb-4">詳細ステータス</h2>
        <div className="space-y-3">
          {[
            { label: 'WIL', value: will, icon: '🧠' },
            { label: 'SPD', value: speed, icon: '⚡' },
            { label: 'LUK', value: luck, icon: '🍀' },
            { label: 'Critical', value: `${critical}%`, icon: '💥' },
            {
              label: 'Skill Slot',
              value: `${skillSlots.current} / ${skillSlots.max}`,
              icon: '📚',
            },
            { label: 'Gear Power', value: `${gearPower} GP`, icon: '⚙️' },
          ].map((stat, idx) => (
            <div
              key={stat.label}
              className="flex items-center justify-between py-2 border-b border-cyan-400/10 last:border-0"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{stat.icon}</span>
                <span className="text-xs uppercase tracking-widest text-cyan-300/80">
                  {stat.label}
                </span>
              </div>
              <span className="font-mono font-semibold text-cyan-300">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ⑤ 資源 & 称号 */}
      <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 backdrop-blur-sm border-2 border-amber-400/50 rounded-2xl p-4 shadow-[0_0_30px_rgba(251,191,36,0.4)]">
        <h2 className="text-xs uppercase tracking-widest text-amber-300/90 mb-4">
          資源 & 称号
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">⚡</div>
            <div>
              <div className="text-xs uppercase tracking-widest text-amber-300/70 mb-1">
                エネルギー
              </div>
              <div className="text-xl font-mono font-bold text-amber-300">
                {energy.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-3xl">🏆</div>
            <div>
              <div className="text-xs uppercase tracking-widest text-amber-300/70 mb-1">
                称号コレクション
              </div>
              <div className="text-xl font-mono font-bold text-amber-300">
                {titles.current} / {titles.max}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ダミーデータ
const mockPlayerData: PlayerStatusProps = {
  name: 'SHADOW_MONARCH',
  level: 23,
  exp: { current: 18450, max: 24000 },
  hp: { current: 148, max: 200 },
  mp: { current: 89, max: 120 },
  atk: 342,
  def: 198,
  will: 156,
  speed: 128,
  luck: 87,
  critical: 24,
  skillSlots: { current: 3, max: 5 },
  gearPower: 148,
  energy: 1250,
  titles: { current: 14, max: 150 },
  awakeningTier: 2,
}

// 使用例
export default function PlayerStatusPanelExample() {
  return <PlayerStatusPanel {...mockPlayerData} />
}

