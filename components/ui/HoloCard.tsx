'use client'

import { ReactNode } from 'react'

interface HoloCardProps {
  children: ReactNode
  title?: string
  className?: string
  glowColor?: 'cyan' | 'purple' | 'blue'
  delay?: number
}

export function HoloCard({
  children,
  title,
  className = '',
  glowColor = 'cyan',
  delay = 0,
}: HoloCardProps) {
  const glowColors = {
    cyan: {
      border: 'border-cyan-400/40',
      shadow: 'shadow-[0_0_20px_rgba(56,189,248,0.4)]',
      innerGlow: 'shadow-[inset_0_0_30px_rgba(56,189,248,0.1)]',
    },
    purple: {
      border: 'border-purple-400/40',
      shadow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
      innerGlow: 'shadow-[inset_0_0_30px_rgba(168,85,247,0.1)]',
    },
    blue: {
      border: 'border-blue-400/40',
      shadow: 'shadow-[0_0_20px_rgba(59,130,246,0.4)]',
      innerGlow: 'shadow-[inset_0_0_30px_rgba(59,130,246,0.1)]',
    },
  }

  const colors = glowColors[glowColor]

  return (
    <div
      className={`
        relative
        bg-white/10
        backdrop-blur-xl
        ${colors.border}
        border
        rounded-2xl
        p-6
        ${colors.shadow}
        ${colors.innerGlow}
        shadow-2xl
        transition-all duration-300 ease-out
        hover:scale-[1.02]
        ${className}
      `}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        animation: `fadeInUp 0.5s ease-out ${delay}s both`,
      }}
    >
      {/* Hologram grid overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none rounded-2xl"
        style={{
          backgroundImage: `
            linear-gradient(rgba(123, 223, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(123, 223, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Scanline effect */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none rounded-2xl"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(123, 223, 255, 0.1) 2px, rgba(123, 223, 255, 0.1) 4px)',
        }}
      />

      {/* Title section */}
      {title && (
        <div className="relative z-10 mb-6 pb-4 border-b border-cyan-400/20">
          <h3 className="font-heading text-2xl font-bold text-cyan-300 tracking-wider uppercase">
            {title}
          </h3>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Corner glow accents */}
      <div className="absolute top-0 left-0 w-20 h-20 bg-cyan-400/10 rounded-br-full blur-xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-20 h-20 bg-purple-400/10 rounded-tl-full blur-xl pointer-events-none" />
    </div>
  )
}
