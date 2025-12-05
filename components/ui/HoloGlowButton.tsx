'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

interface HoloGlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'cyan' | 'purple' | 'blue'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function HoloGlowButton({
  children,
  variant = 'cyan',
  size = 'md',
  className = '',
  ...props
}: HoloGlowButtonProps) {
  const variants = {
    cyan: {
      bg: 'bg-cyan-500/20',
      border: 'border-cyan-400/50',
      text: 'text-cyan-300',
      glow: 'shadow-[0_0_20px_rgba(123,223,255,0.4)]',
      hoverGlow: 'hover:shadow-[0_0_30px_rgba(123,223,255,0.6)]',
    },
    purple: {
      bg: 'bg-purple-500/20',
      border: 'border-purple-400/50',
      text: 'text-purple-300',
      glow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
      hoverGlow: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]',
    },
    blue: {
      bg: 'bg-blue-500/20',
      border: 'border-blue-400/50',
      text: 'text-blue-300',
      glow: 'shadow-[0_0_20px_rgba(59,130,246,0.4)]',
      hoverGlow: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]',
    },
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  const colors = variants[variant]

  return (
    <button
      className={`
        relative
        ${colors.bg}
        ${colors.border}
        border-2
        ${colors.text}
        ${colors.glow}
        ${colors.hoverGlow}
        ${sizes[size]}
        rounded-xl
        font-heading
        font-bold
        uppercase
        tracking-wider
        backdrop-blur-sm
        transition-all duration-300 ease-out
        overflow-hidden
        hover:scale-105
        active:scale-95
        ${className}
      `}
      {...props}
    >
      {/* Animated background gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-cyan-400/20 animate-[shimmer_3s_linear_infinite]"
        style={{ width: '200%' }}
      />

      {/* Content */}
      <span className="relative z-10">{children}</span>

      {/* Inner glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-xl pointer-events-none" />
    </button>
  )
}
