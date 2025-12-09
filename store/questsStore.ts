'use client'

import { create } from 'zustand'
import { completeQuest as completeQuestRemote, fetchQuests } from '@/lib/quests'
import { Quest, QuestStatus } from '@/components/quests/QuestFormModal'

type QuestsState = {
  quests: Quest[]
  hydrated: boolean
  hydrate: () => Promise<void>
  setQuests: (updater: (prev: Quest[]) => Quest[]) => void
  addQuest: (quest: Quest) => void
  updateQuest: (questId: string, updater: (quest: Quest) => Quest) => void
  deleteQuest: (questId: string) => void
  toggleStatus: (questId: string) => void
  toggleTopPriority: (questId: string) => void
  markQuestCompleted: (questId: string) => void
  completeQuest: (questId: string) => Promise<void>
}

export const useQuestsStore = create<QuestsState>((set, get) => ({
  quests: [],
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return
    const records = await fetchQuests()
    const quests: Quest[] = records.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description ?? undefined,
      difficulty: (r.difficulty as Quest['difficulty']) ?? 'NORMAL',
      status: (r.status as QuestStatus) ?? 'TODO',
      dueAt: r.due_at ? new Date(r.due_at) : undefined,
      isCompleted: r.is_completed ?? r.status === 'COMPLETED',
      completedAt: r.completed_at ? new Date(r.completed_at) : undefined,
      plannedMinutes: r.planned_minutes ?? 25,
      isDaily: r.is_daily ?? false,
      isUrgent: r.is_urgent ?? false,
      isTopPriority: r.is_top_priority ?? false,
      timerColor: (r.timer_color as Quest['timerColor']) ?? 'red',
    }))
    set({ quests, hydrated: true })
  },

  setQuests: (updater) => set((state) => ({ quests: updater(state.quests) })),

  addQuest: (quest) => set((state) => ({ quests: [...state.quests, quest] })),

  updateQuest: (questId, updater) =>
    set((state) => ({
      quests: state.quests.map((quest) => (quest.id === questId ? updater(quest) : quest)),
    })),

  deleteQuest: (questId) =>
    set((state) => ({
      quests: state.quests.filter((quest) => quest.id !== questId),
    })),

  toggleStatus: (questId) =>
    set((state) => ({
      quests: state.quests.map((quest) =>
        quest.id === questId
          ? {
              ...quest,
              status: quest.status === 'COMPLETED' ? 'TODO' : ('COMPLETED' as QuestStatus),
              isCompleted: quest.status !== 'COMPLETED',
            }
          : quest
      ),
    })),

  toggleTopPriority: (questId) =>
    set((state) => ({
      quests: state.quests.map((quest) =>
        quest.id === questId ? { ...quest, isTopPriority: !quest.isTopPriority } : quest
      ),
    })),

  markQuestCompleted: (questId) =>
    set((state) => ({
      quests: state.quests.map((quest) =>
        quest.id === questId
          ? { ...quest, status: 'COMPLETED' as QuestStatus, isCompleted: true }
          : quest
      ),
    })),

  completeQuest: async (questId) => {
    await completeQuestRemote(questId)
    set((state) => ({
      quests: state.quests.map((quest) =>
        quest.id === questId
          ? { ...quest, status: 'COMPLETED' as QuestStatus, isCompleted: true }
          : quest
      ),
    }))
  },
}))

