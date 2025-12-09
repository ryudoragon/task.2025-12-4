import { create } from 'zustand'

type PomodoroMode = 'focus' | 'break'

type PomodoroState = {
  mode: PomodoroMode
  focusDuration: number
  breakDuration: number
  remainingTime: number
  isRunning: boolean
  start: () => void
  pause: () => void
  reset: () => void
  switchMode: () => void
  setDurations: (focus: number, rest: number) => void
  tick: () => void
}

const clampSeconds = (value: number, fallback: number) => {
  const safe = Number.isFinite(value) ? value : fallback
  return Math.max(60, safe) // 最低1分
}

export const usePomodoroStore = create<PomodoroState>((set, get) => ({
  mode: 'focus',
  focusDuration: 25 * 60,
  breakDuration: 5 * 60,
  remainingTime: 25 * 60,
  isRunning: false,

  start: () =>
    set((state) => {
      const currentDuration = state.mode === 'focus' ? state.focusDuration : state.breakDuration
      const nextRemaining = state.remainingTime <= 0 ? currentDuration : state.remainingTime
      return { isRunning: true, remainingTime: nextRemaining }
    }),

  pause: () => set({ isRunning: false }),

  reset: () =>
    set((state) => {
      const duration = state.mode === 'focus' ? state.focusDuration : state.breakDuration
      return { isRunning: false, remainingTime: duration }
    }),

  switchMode: () =>
    set((state) => {
      const nextMode: PomodoroMode = state.mode === 'focus' ? 'break' : 'focus'
      const duration = nextMode === 'focus' ? state.focusDuration : state.breakDuration
      return { mode: nextMode, remainingTime: duration, isRunning: false }
    }),

  setDurations: (focus, rest) =>
    set((state) => {
      const focusSec = clampSeconds(focus, state.focusDuration)
      const breakSec = clampSeconds(rest, state.breakDuration)
      const currentDuration = state.mode === 'focus' ? focusSec : breakSec
      return {
        focusDuration: focusSec,
        breakDuration: breakSec,
        // 走行中は残り時間を保持、停止中は設定値へ合わせる
        remainingTime: state.isRunning ? state.remainingTime : currentDuration,
      }
    }),

  tick: () =>
    set((state) => {
      if (!state.isRunning) return state
      const next = Math.max(0, state.remainingTime - 1)
      if (next > 0) {
        return { remainingTime: next }
      }
      const nextMode: PomodoroMode = state.mode === 'focus' ? 'break' : 'focus'
      const duration = nextMode === 'focus' ? state.focusDuration : state.breakDuration
      return { mode: nextMode, remainingTime: duration, isRunning: false }
    }),
}))

