import { HoloPanel } from '@/components/ui/HoloPanel'
import { motion } from 'framer-motion'

export function BossBoard() {
  return (
    <HoloPanel glowColor="fuchsia" disableFloat className="p-6 min-h-[380px] flex flex-col gap-4">
      {/* CAUSE: ボード高さがログ増減で揺れる → min-hで枠を固定 */}
      <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-fuchsia-300 mb-2">
        週次レイドボス
      </h2>
      <p className="text-base font-semibold text-slate-100 mb-4">アビサルコア v1.3</p>

      {/* Phase/Affix badge */}
      <div className="mb-4 inline-block rounded-full border border-purple-400/40 bg-purple-500/20 px-3 py-1">
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-purple-300">
          フェーズ2 • シールド
        </span>
      </div>

      {/* HP Bar */}
      <div className="mb-2">
        <div className="relative h-3 w-full rounded-full bg-slate-900/70 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 shadow-[0_0_20px_rgba(236,72,153,0.6)]"
            initial={{ width: 0 }}
            animate={{ width: '50%' }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
        </div>
        <p className="mt-2 text-[11px] font-mono text-slate-300">150,000 / 300,000 HP</p>
      </div>

      {/* Damage log */}
      <div className="mt-6 space-y-1.5">
        <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 mb-2">最近のダメージ</p>
        <ul className="space-y-1.5 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-400/30 scrollbar-track-transparent">
          <li className="text-[11px] text-slate-300">
            ▶ あなたのダメージ <span className="text-cyan-300 font-mono font-semibold">+120</span>
            <span className="text-slate-200"> (クエスト: モーニングフォーカス)</span>
          </li>
          <li className="text-[11px] text-slate-300">
            ▶ パーティのダメージ <span className="text-fuchsia-300 font-mono font-semibold">+540</span>
            <span className="text-slate-200"> 過去1時間</span>
          </li>
          <li className="text-[11px] text-slate-300">
            ▶ あなたのダメージ <span className="text-cyan-300 font-mono font-semibold">+85</span>
            <span className="text-slate-200"> (クエスト: データストリーム)</span>
          </li>
        </ul>
      </div>
    </HoloPanel>
  )
}

