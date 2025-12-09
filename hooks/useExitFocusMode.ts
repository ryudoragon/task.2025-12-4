'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useFocusStore } from '@/store/focusStore'

export const useExitFocusMode = () => {
  const router = useRouter()
  const resetFocusState = useFocusStore((s) => s.resetFocusState)

  return useCallback(() => {
    resetFocusState()
    router.push('/')
  }, [resetFocusState, router])
}

