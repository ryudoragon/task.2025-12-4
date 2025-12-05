'use client'

import { ReactNode } from 'react'

interface SystemCardProps {
  children: ReactNode
  className?: string
  title?: string
}

export function SystemCard({ children, className = '', title }: SystemCardProps) {
  return (
    <div
      className={`
        relative
        bg-background/80
        backdrop-blur-md
        border-2 border-system-blue
        shadow-system-blue-md
        rounded-lg
        overflow-hidden
        p-6
        ${className}
      `}
    >
      {/* 背景装飾（スキャンライン） */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(transparent 0px, transparent 2px, rgba(46, 134, 222, 0.1) 3px)',
        }}
      />

      {/* タイトル */}
      {title && (
        <div className="relative z-10 mb-4 pb-2 border-b border-system-blue/30">
          <h3 className="font-heading text-xl text-system-blue tracking-wider">
            {title}
          </h3>
        </div>
      )}

      {/* コンテンツ */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
