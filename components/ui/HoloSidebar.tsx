'use client'

import { useState } from 'react'
import { Home, Map, Target, Settings, User, Trophy } from 'lucide-react'

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href?: string
  onClick?: () => void
}

const sidebarItems: SidebarItem[] = [
  { icon: Home, label: 'Dashboard', href: '/' },
  { icon: Map, label: 'Adventure', href: '/adventure' },
  { icon: Target, label: 'Quests', href: '/quests' },
  { icon: Trophy, label: 'Achievements', href: '/achievements' },
  { icon: User, label: 'Profile', href: '/profile' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

export function HoloSidebar() {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <div
      className="
        fixed left-0 top-0 h-full
        w-20
        bg-white/5
        backdrop-blur-xl
        border-r border-cyan-400/30
        shadow-[0_0_30px_rgba(56,189,248,0.2)]
        z-50
        flex flex-col
        items-center
        py-8
        gap-6
        animate-[slideInLeft_0.5s_ease-out]
      "
      style={{
        background: 'linear-gradient(180deg, rgba(123, 223, 255, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)',
        animation: 'slideInLeft 0.5s ease-out',
      }}
    >
      {/* Logo/Icon at top */}
      <div
        className="
          w-12 h-12
          rounded-xl
          bg-gradient-to-br from-cyan-400 to-purple-500
          flex items-center justify-center
          shadow-[0_0_20px_rgba(123,223,255,0.5)]
          mb-4
        "
        style={{
          animation: 'scaleIn 0.3s ease-out 0.2s both',
        }}
      >
        <Target className="w-6 h-6 text-white" />
      </div>

      {/* Sidebar items */}
      <div className="flex flex-col gap-4 flex-1">
        {sidebarItems.map((item, index) => {
          const Icon = item.icon
          const isActive = activeIndex === index

          return (
            <button
              key={index}
              onClick={() => {
                setActiveIndex(index)
                item.onClick?.()
              }}
              className={`
                relative
                w-14 h-14
                rounded-xl
                flex items-center justify-center
                transition-all duration-300
                hover:scale-110 hover:translate-x-1
                active:scale-95
                group
                ${isActive
                  ? 'bg-cyan-400/20 border-2 border-cyan-400/50 shadow-[0_0_15px_rgba(123,223,255,0.4)]'
                  : 'bg-white/5 border border-cyan-400/20 hover:bg-cyan-400/10 hover:border-cyan-400/40'
                }
              `}
            >
              <Icon
                className={`
                  w-6 h-6
                  transition-colors duration-300
                  ${isActive ? 'text-cyan-300' : 'text-cyan-400/60'}
                `}
              />

              {/* Active indicator glow */}
              {isActive && (
                <div className="absolute inset-0 rounded-xl bg-cyan-400/10 blur-md -z-10 animate-pulse" />
              )}

              {/* Tooltip on hover */}
              <div
                className="
                  absolute left-full ml-4
                  px-3 py-1
                  bg-cyan-900/90
                  backdrop-blur-sm
                  border border-cyan-400/30
                  rounded-lg
                  text-xs
                  font-mono
                  text-cyan-300
                  whitespace-nowrap
                  pointer-events-none
                  shadow-lg
                  opacity-0 group-hover:opacity-100
                  translate-x-[-10px] group-hover:translate-x-0
                  transition-all duration-300
                "
              >
                {item.label}
              </div>
            </button>
          )
        })}
      </div>

      {/* Bottom accent */}
      <div className="w-12 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full opacity-50" />
    </div>
  )
}
