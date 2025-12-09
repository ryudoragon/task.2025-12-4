import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { HoloPanel } from '@/components/ui/HoloPanel'
import { usePlayerStore } from '@/store/playerStore'

export function StatusBoard() {
  const { level, currentExp, nextLevelExp, coins, str, int, mp, hp, statPoints, allocatePoint } = usePlayerStore()
  const streakDays = 7 // Mock or from another store
  const playerClass = "シャドウモナーク"

  const expPercent = Math.min(100, (currentExp / nextLevelExp) * 100)

  return (
    <HoloPanel
      glowColor="cyan"
      disableFloat
      className="p-6 min-h-[360px] flex flex-col gap-4"
    >
      {/* CAUSE: ボード高さがコンテンツで伸縮しレイアウトシフト → min-hで枠を固定 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
          プレイヤーステータス
        </h2>
        <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-emerald-300 border border-emerald-500/30">
          稼働中
        </span>
      </div>

      <div className="space-y-4">
        {/* Basic Stats */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.25em] text-white">レベル</span>
            <span className="font-mono text-2xl text-white">{level}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.25em] text-white">経験値</span>
            <span className="font-mono text-lg text-white">
              {currentExp.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.25em] text-white">コイン</span>
            <span className="font-mono text-lg text-white">{coins.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.25em] text-white">連続日数</span>
            <span className="font-mono text-lg text-white">{streakDays}日</span>
          </div>
        </div>

        {/* Extended Stats (STR/INT/MP/HP) */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-white">ステータス</span>
            {statPoints > 0 && (
              <span className="text-[10px] font-bold text-amber-300 animate-pulse">
                割り当て可能: {statPoints}
              </span>
            )}
          </div>

          {(['str', 'int', 'mp', 'hp'] as const).map((stat) => (
            <div key={stat} className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.25em] text-white">
                {stat.toUpperCase()}
              </span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-lg text-white">
                  {
                    stat === 'str' ? str :
                      stat === 'int' ? int :
                        stat === 'mp' ? mp :
                          hp
                  }
                </span>
                {statPoints > 0 && (
                  <button
                    onClick={() => allocatePoint(stat)}
                    className="p-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/40 border border-amber-500/50 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-cyan-400/20">
        <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 mb-2">クラス</p>
        <p className="text-sm font-semibold text-purple-300">{playerClass}</p>
      </div>

      <div className="mt-4">
        <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 mb-2">経験値/NEXT</p>
        <div className="relative h-2 w-full rounded-full bg-slate-900/70 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500"
            initial={{ width: 0 }}
            animate={{ width: `${expPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
        </div>
        <p className="mt-2 text-[11px] font-mono text-slate-300">
          {currentExp.toLocaleString()} / {nextLevelExp.toLocaleString()}
        </p>
      </div>
    </HoloPanel>
  )
}
