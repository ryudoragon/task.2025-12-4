'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface HoloPanelProps {
  children: ReactNode
  className?: string
  glowColor?: 'cyan' | 'purple' | 'fuchsia'
}

export function HoloPanel({ children, className = '', glowColor = 'cyan' }: HoloPanelProps) {
  const glowConfig = {
    cyan: {
      border: 'border-cyan-400/35',
      shadow: 'shadow-[0_0_40px_rgba(34,211,238,0.35)]',
      topGradient: 'from-cyan-400/25',
      rightGradient: 'from-fuchsia-500/25',
    },
    purple: {
      border: 'border-purple-400/35',
      shadow: 'shadow-[0_0_40px_rgba(168,85,247,0.35)]',
      topGradient: 'from-purple-400/25',
      rightGradient: 'from-cyan-500/25',
    },
    fuchsia: {
      border: 'border-fuchsia-400/35',
      shadow: 'shadow-[0_0_40px_rgba(236,72,153,0.35)]',
      topGradient: 'from-fuchsia-400/25',
      rightGradient: 'from-purple-500/25',
    },
  }

  const config = glowConfig[glowColor]

  return (
    <motion.div
      className={`
        relative
        overflow-hidden
        rounded-3xl
        bg-white/3
        backdrop-blur-2xl
        border border-white/10
        shadow-[0_0_40px_rgba(0,0,0,0.3)]
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -6, scale: 1.01 }}
      style={{
        animation: 'float 6s ease-in-out infinite',
      }}
    >
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}

