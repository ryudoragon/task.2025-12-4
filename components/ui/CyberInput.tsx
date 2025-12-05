'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

interface CyberInputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

export const CyberInput = forwardRef<HTMLInputElement, CyberInputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`
          w-full
          px-4 py-2
          bg-system-dark/50
          border border-system-blue/50
          text-system-white
          font-mono text-sm
          placeholder:text-system-white/40
          focus:outline-none
          focus:border-system-blue
          focus:shadow-system-blue-sm
          transition-all duration-200
          ${className}
        `}
        {...props}
      />
    )
  }
)

CyberInput.displayName = 'CyberInput'

