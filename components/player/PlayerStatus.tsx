'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Star } from 'lucide-react'
import { usePlayerStore } from '@/store/playerStore'

export function PlayerStatus() {
    const { level, currentExp, nextLevelExp } = usePlayerStore()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const progressPercent = Math.min(100, Math.max(0, (currentExp / nextLevelExp) * 100))

    return (
        <div className="w-full bg-white/5 border-b border-white/10 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

                {/* Level Info */}
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                            <span className="text-xl font-bold text-cyan-100">{level}</span>
                        </div>
                        <div className="absolute -top-2 -right-2 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-bold text-cyan-400 border border-cyan-900/50 uppercase tracking-widest">
                            LVL
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <h2 className="text-sm font-medium text-slate-200 flex items-center gap-2">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                            <span>Adventurer</span>
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">Next level: {nextLevelExp - currentExp} XP</p>
                    </div>
                </div>

                {/* EXP Bar */}
                <div className="flex-1 max-w-md mx-8">
                    <div className="flex justify-between text-xs text-slate-400 mb-1.5 px-0.5">
                        <span>EXP</span>
                        <span>{currentExp} / {nextLevelExp}</span>
                    </div>
                    <div className="relative h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                        <motion.div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                        />
                    </div>
                </div>

                {/* Stats / Coins (Placeholder for now) */}
                <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                    <Trophy className="w-4 h-4 text-amber-300" />
                    <span className="text-sm font-medium text-amber-100">Rank: Novice</span>
                </div>

            </div>
        </div>
    )
}
