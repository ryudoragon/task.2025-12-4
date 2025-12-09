import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface QuestMetadata {
    xpReward?: number
    difficulty?: 'EASY' | 'NORMAL' | 'HARD'
    description?: string
    plannedMinutes?: number
    isDaily?: boolean
    isUrgent?: boolean
    isTopPriority?: boolean
    timerColor?: string
}

interface QuestMetadataState {
    metadata: Record<string, QuestMetadata>

    // Actions
    setMetadata: (questId: string, data: QuestMetadata) => void
    getMetadata: (questId: string) => QuestMetadata | undefined
    removeMetadata: (questId: string) => void
    resync: (validIds: string[]) => void // Clean up stale metadata
}

export const useQuestMetadataStore = create<QuestMetadataState>()(
    persist(
        (set, get) => ({
            metadata: {},

            setMetadata: (questId, data) => {
                set((state) => ({
                    metadata: {
                        ...state.metadata,
                        [questId]: { ...state.metadata[questId], ...data },
                    },
                }))
            },

            getMetadata: (questId) => {
                return get().metadata[questId]
            },

            removeMetadata: (questId) => {
                set((state) => {
                    const newMetadata = { ...state.metadata }
                    delete newMetadata[questId]
                    return { metadata: newMetadata }
                })
            },

            resync: (validIds) => {
                // Optional: remove keys not in validIds to keep storage clean
                set((state) => {
                    const newMetadata = { ...state.metadata }
                    const validSet = new Set(validIds)
                    Object.keys(newMetadata).forEach((key) => {
                        if (!validSet.has(key)) {
                            delete newMetadata[key]
                        }
                    })
                    return { metadata: newMetadata }
                })
            },
        }),
        {
            name: 'quest-metadata-storage',
        }
    )
)
