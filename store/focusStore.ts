import { create } from 'zustand'

type FocusState = {
  isFocusLocked: boolean
  isFocusMode: boolean
  currentQuestId: string | null
  setFocusLocked: (locked: boolean) => void
  setFocusMode: (enabled: boolean) => void
  setCurrentQuestId: (questId: string | null) => void
  resetFocusState: () => void
}

export const useFocusStore = create<FocusState>((set) => ({
  isFocusLocked: false,
  isFocusMode: false,
  currentQuestId: null,
  setFocusLocked: (locked) => set({ isFocusLocked: locked }),
  setFocusMode: (enabled) => set({ isFocusMode: enabled }),
  setCurrentQuestId: (questId) => set({ currentQuestId: questId }),
  resetFocusState: () =>
    set({ isFocusLocked: false, isFocusMode: false, currentQuestId: null }),
}))

