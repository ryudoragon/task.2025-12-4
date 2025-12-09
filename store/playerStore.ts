import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type PlayerState = {
    level: number
    currentExp: number
    nextLevelExp: number
    coins: number
    // Stats
    str: number
    int: number
    mp: number
    hp: number
    statPoints: number

    // Actions
    addExp: (amount: number) => void
    addCoins: (amount: number) => void
    allocatePoint: (stat: 'str' | 'int' | 'mp' | 'hp') => void
    reset: () => void
}

export const usePlayerStore = create<PlayerState>()(
    persist(
        (set, get) => ({
            level: 1,
            currentExp: 0,
            nextLevelExp: 100,
            coins: 0,

            // Default Stats
            str: 1,
            int: 1,
            mp: 1,
            hp: 1,
            statPoints: 0,

            addExp: (amount: number) => {
                const { level, currentExp } = get()
                let newExp = currentExp + amount
                let newLevel = level
                let newPoints = get().statPoints
                const FixedNextLevelExp = 100

                // Level up logic (Fixed: every 100 XP = 1 Level)
                while (newExp >= FixedNextLevelExp) {
                    newExp -= FixedNextLevelExp
                    newLevel += 1
                    newPoints += 10 // +10 SP per level
                }

                set({
                    level: newLevel,
                    currentExp: newExp,
                    nextLevelExp: FixedNextLevelExp,
                    statPoints: newPoints
                })
            },

            addCoins: (amount: number) => {
                set({ coins: get().coins + amount })
            },

            allocatePoint: (stat: 'str' | 'int' | 'mp' | 'hp') => {
                const state = get()
                if (state.statPoints > 0) {
                    set({
                        [stat]: state[stat] + 1,
                        statPoints: state.statPoints - 1
                    })
                }
            },

            reset: () => {
                set({
                    level: 1,
                    currentExp: 0,
                    nextLevelExp: 100,
                    coins: 0,
                    str: 1,
                    int: 1,
                    mp: 1,
                    hp: 1,
                    statPoints: 0
                })
            },
        }),
        {
            name: 'player-storage', // persist to localStorage
            onRehydrateStorage: () => (state) => {
                // Retroactive Point Calculation for existing players
                if (state && state.level > 1) {
                    // Calculate total stats expected: (Level - 1) * 10
                    const expectedTotalPoints = (state.level - 1) * 10

                    // Calculate current distributed points (excluding base 1)
                    // Ensure defaults are 1 if they were undefined in old storage
                    const curStr = state.str || 1
                    const curInt = state.int || 1
                    const curMp = state.mp || 1
                    const curHp = state.hp || 1
                    const curPoints = state.statPoints || 0

                    const distributed = (curStr - 1) + (curInt - 1) + (curMp - 1) + (curHp - 1)
                    const currentTotal = distributed + curPoints

                    // If we are missing points (e.g. user was lvl 5 but stats are default), give them difference
                    if (currentTotal < expectedTotalPoints) {
                        const diff = expectedTotalPoints - currentTotal
                        if (diff > 0) {
                            state.statPoints = (state.statPoints || 0) + diff
                            // Also ensure base stats are set if migrating
                            if (!state.str) state.str = 1
                            if (!state.int) state.int = 1
                            if (!state.mp) state.mp = 1
                            if (!state.hp) state.hp = 1

                            console.log(`[PlayerStore] Retroactively granted ${diff} stat points.`)
                        }
                    }
                }
            }
        }
    )
)
