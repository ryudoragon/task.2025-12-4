import { motion } from 'framer-motion'
import { HoloPanel } from '@/components/ui/HoloPanel'

type StatusBoardProps = {
  level: number
  expCurrent: number
  expMax: number
  coins: number
  streakDays: number
  playerClass: string
}

export function StatusBoard({
  level,
  expCurrent,
  expMax,
  coins,
  streakDays,
  playerClass,
}: StatusBoardProps) {
  const expPercent = Math.min(100, (expCurrent / expMax) * 100)

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

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.25em] text-slate-400">レベル</span>
          <span className="font-mono text-2xl text-cyan-300">{level}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.25em] text-slate-400">経験値</span>
          <span className="font-mono text-lg text-cyan-300">
            {expCurrent.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.25em] text-slate-400">コイン</span>
          <span className="font-mono text-lg text-cyan-300">{coins.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.25em] text-slate-400">連続日数</span>
          <span className="font-mono text-lg text-cyan-300">{streakDays}日</span>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-cyan-400/20">
        <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 mb-2">クラス</p>
        <p className="text-sm font-semibold text-purple-300">{playerClass}</p>
      </div>

      <div className="mt-4">
        <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 mb-2">経験値進捗</p>
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
          {expCurrent.toLocaleString()} / {expMax.toLocaleString()}
        </p>
      </div>
    </HoloPanel>
  )
}

