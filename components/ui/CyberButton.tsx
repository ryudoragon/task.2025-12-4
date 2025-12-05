'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

interface CyberButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  className?: string
}

export function CyberButton({
  children,
  variant = 'primary',
  className = '',
  ...props
}: CyberButtonProps) {
  const baseStyles = `
    px-6 py-2
    font-heading font-bold
    text-sm uppercase tracking-wider
    border-2
    transition-all duration-300
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  const variantStyles = {
    primary: `
      bg-system-blue
      text-system-white
      border-system-blue
      shadow-system-blue-sm
      hover:shadow-system-blue-md
      hover:brightness-110
      active:scale-95
    `,
    secondary: `
      bg-transparent
      text-system-blue
      border-system-blue/50
      hover:bg-system-blue/10
      hover:border-system-blue
      active:scale-95
    `,
    danger: `
      bg-transparent
      text-system-red
      border-system-red/50
      hover:bg-system-red/10
      hover:border-system-red
      hover:shadow-system-red-md
      active:scale-95
    `,
  }

  return (
    <button
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}

