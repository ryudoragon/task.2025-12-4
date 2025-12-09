'use client'

import { useEffect, useMemo, useState } from 'react'
import { Quest, QuestStatus, TimerColor } from '@/components/quests/QuestFormModal'
import { QuestModal, QuestInput } from '@/components/quests/QuestModal'
import { QuestBoard, QuestTimerState } from '@/components/home/QuestBoard'
import { StatusBoard } from '@/components/home/StatusBoard'
import { BossBoard } from '@/components/home/BossBoard'
import { useFocusStore } from '@/store/focusStore'
import { FocusMode } from '@/components/focus/FocusMode'
import { useQuestsStore } from '@/store/questsStore'
import { createQuest } from '@/lib/quests'

const BACKGROUNDS = [
  { id: 'cyber', label: 'サイバー', url: '/dashbord-cyber-bg.png' },
  { id: 'light', label: 'ライト', url: '/dashbord-siro-bg.png' },
  { id: 'dark', label: 'ダーク', url: '/dashbord-dark-bg.png' },
]

type BoardTab = 'status' | 'quest' | 'boss'

export default function HomePage() {
  const [bgId, setBgId] = useState<'cyber' | 'light' | 'dark'>('cyber')
  const currentBg = BACKGROUNDS.find((b) => b.id === bgId)!

  // プレイヤーステータス (Moved to store)

  const [activeBoard, setActiveBoard] = useState<BoardTab>('quest')

  const quests = useQuestsStore((s) => s.quests)
  const hydrateQuests = useQuestsStore((s) => s.hydrate)
  const setQuests = useQuestsStore((s) => s.setQuests)
  const addQuest = useQuestsStore((s) => s.addQuest)
  const updateQuest = useQuestsStore((s) => s.updateQuest)
  const deleteQuest = useQuestsStore((s) => s.deleteQuest)
  const toggleTopPriority = useQuestsStore((s) => s.toggleTopPriority)
  const completeQuest = useQuestsStore((s) => s.completeQuest)
  const isFocusMode = useFocusStore((s) => s.isFocusMode)
  const currentFocusQuestId = useFocusStore((s) => s.currentQuestId)
  const [isQuestModalOpen, setIsQuestModalOpen] = useState(false)
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null)
  const [completingIds, setCompletingIds] = useState<Set<string>>(new Set())

  const focusQuestTitle = useMemo(
    () => quests.find((q) => q.id === currentFocusQuestId)?.title,
    [quests, currentFocusQuestId]
  )

  // タイマー状態管理
  const [questTimers, setQuestTimers] = useState<Record<string, QuestTimerState>>({})

  // 初期ロード時にサーバーデータを取得
  useEffect(() => {
    hydrateQuests()
  }, [hydrateQuests])

  // タイマー初期化・同期
  useEffect(() => {
    setQuestTimers((prev) => {
      const updated: Record<string, QuestTimerState> = { ...prev }
      quests.forEach((quest) => {
        const plannedSeconds = (quest.plannedMinutes ?? 25) * 60
        if (!updated[quest.id]) {
          updated[quest.id] = {
            remainingSeconds: plannedSeconds,
            plannedSeconds,
            status: 'idle',
          }
        } else {
          const existing = updated[quest.id]
          updated[quest.id] = {
            ...existing,
            plannedSeconds,
            ...(existing.status === 'idle' ? { remainingSeconds: plannedSeconds } : {}),
          }
        }
      })
      // remove timers for deleted tasks
      Object.keys(updated).forEach((id) => {
        if (!quests.find((q) => q.id === id)) delete updated[id]
      })
      return updated
    })
  }, [quests])

  // タイマー進行
  const hasRunning = useMemo(
    () => Object.values(questTimers).some((t) => t.status === 'running'),
    [questTimers]
  )

  useEffect(() => {
    if (!hasRunning) return
    const id = setInterval(() => {
      setQuestTimers((prev) => {
        const next = { ...prev }
        Object.entries(prev).forEach(([questId, timer]) => {
          if (timer.status === 'running') {
            const remaining = Math.max(0, timer.remainingSeconds - 1)
            next[questId] = {
              ...timer,
              remainingSeconds: remaining,
              status: remaining === 0 ? 'finished' : 'running',
            }
          }
        })
        return next
      })
    }, 1000)
    return () => clearInterval(id)
  }, [hasRunning])

  const openAddModal = () => {
    setEditingQuest(null)
    setIsQuestModalOpen(true)
  }

  const handleEditQuest = (quest: Quest) => {
    setEditingQuest(quest)
    setIsQuestModalOpen(true)
  }

  const handleSaveQuest = (questData: QuestInput) => {
    const safePlannedMinutes = questData.plannedMinutes ?? 25
    if (editingQuest) {
      updateQuest(editingQuest.id, (q) => ({
        ...q,
        title: questData.title,
        description: questData.description || undefined,
        dueAt: questData.dueDate ?? undefined,
        plannedMinutes: safePlannedMinutes,
      }))
    } else {
      createQuest({
        title: questData.title,
        description: questData.description,
        plannedMinutes: safePlannedMinutes,
        dueAt: questData.dueDate ? questData.dueDate.toISOString() : null,
      })
        .then((record) => {
          const newQuest: Quest = {
            id: record.id,
            title: record.title,
            description: record.description ?? undefined,
            difficulty: (record.difficulty as Quest['difficulty']) ?? 'NORMAL',
            status: (record.status as QuestStatus) ?? 'TODO',
            isCompleted: record.is_completed ?? false,
            completedAt: record.completed_at ? new Date(record.completed_at) : undefined,
            plannedMinutes: record.planned_minutes ?? safePlannedMinutes,
            isDaily: record.is_daily ?? false,
            isUrgent: record.is_urgent ?? false,
            isTopPriority: record.is_top_priority ?? false,
            timerColor: (record.timer_color as Quest['timerColor']) ?? 'red',
            dueAt: record.due_at ? new Date(record.due_at) : undefined,
          }
          addQuest(newQuest)
        })
        .catch((err) => {
          console.error(err)
          alert(`クエスト作成に失敗しました: ${err?.message ?? '詳細不明'}`)
        })
    }
    setIsQuestModalOpen(false)
    setEditingQuest(null)
  }

  const handleDeleteQuest = (questId: string) => {
    if (confirm('このクエストを削除しますか？')) {
      deleteQuest(questId)
    }
  }

  const getQuestRewards = (difficulty: Quest['difficulty']) => {
    switch (difficulty) {
      case 'EASY':
        return { exp: 50, coins: 25 }
      case 'NORMAL':
        return { exp: 100, coins: 50 }
      case 'HARD':
        return { exp: 200, coins: 100 }
    }
  }

  const calculateLevel = (exp: number) => Math.floor(exp / 1000) + 1
  const getCurrentLevelExp = (exp: number) => exp % 1000

  const handleToggleQuestStatus = async (questId: string) => {
    if (completingIds.has(questId)) return
    const target = quests.find((t) => t.id === questId)
    if (!target) return

    console.info('QuestBoard: 完了トグル', { questId, currentStatus: target.status })
    const rewards = getQuestRewards(target.difficulty)
    const isCompleting = target.status !== 'COMPLETED'

    if (isCompleting) {
      setCompletingIds((prev) => new Set(prev).add(questId))
      try {
        await completeQuest(questId)
      } catch (err: any) {
        console.error(err)
        alert(`クエスト完了の更新に失敗しました: ${err?.message ?? '詳細不明'}`)
        setCompletingIds((prev) => {
          const next = new Set(prev)
          next.delete(questId)
          return next
        })
        return
      }
      // EXP/Coins are now handled in store/questsStore via playerStore
    } else {
      setQuests((prev) =>
        prev.map((q) =>
          q.id === questId ? { ...q, status: 'TODO' as QuestStatus, isCompleted: false } : q
        )
      )
      // Reverting EXP is tricky if we don't track history, for now just revert status
    }
    setCompletingIds((prev) => {
      const next = new Set(prev)
      next.delete(questId)
      return next
    })
  }

  const handleToggleTopPriority = (questId: string) => {
    toggleTopPriority(questId)
  }

  const handleTimerColorChange = (questId: string, color: TimerColor) => {
    setQuests((prev) => prev.map((t) => (t.id === questId ? { ...t, timerColor: color } : t)))
  }

  // タイマー操作ヘルパー
  const updateTimer = (questId: string, updater: (timer: QuestTimerState) => QuestTimerState) => {
    setQuestTimers((prev) => {
      const existing = prev[questId]
      if (!existing) return prev
      return { ...prev, [questId]: updater(existing) }
    })
  }

  const handleStartTimer = (questId: string) => {
    setQuestTimers((prev) => {
      const quest = quests.find((t) => t.id === questId)
      if (!quest) return prev
      const plannedSeconds = (quest.plannedMinutes ?? 25) * 60
      const base = prev[questId] ?? {
        remainingSeconds: plannedSeconds,
        plannedSeconds,
        status: 'idle' as const,
      }
      return {
        ...prev,
        [questId]: { ...base, remainingSeconds: base.remainingSeconds, status: 'running' },
      }
    })
  }

  const handlePauseTimer = (questId: string) =>
    updateTimer(questId, (timer) => ({ ...timer, status: 'paused' }))

  const handleResumeTimer = (questId: string) =>
    updateTimer(questId, (timer) => ({ ...timer, status: 'running' }))

  const handleCancelTimer = (questId: string) => {
    const quest = quests.find((t) => t.id === questId)
    if (!quest) return
    const plannedSeconds = (quest.plannedMinutes ?? 25) * 60
    setQuestTimers((prev) => ({
      ...prev,
      [questId]: { remainingSeconds: plannedSeconds, plannedSeconds, status: 'idle' },
    }))
  }

  const handleAddTime = (questId: string, seconds: number) => {
    updateTimer(questId, (timer) => {
      const nextRemaining = Math.max(60, timer.remainingSeconds + seconds)
      return { ...timer, remainingSeconds: nextRemaining }
    })
  }

  const handleFinishQuestFromTimer = async (questId: string) => {
    console.info('QuestBoard: タイマー完了→完了処理', { questId })
    await handleToggleQuestStatus(questId)
    handleCancelTimer(questId)
  }

  const handleExtendAfterFinish = (questId: string, seconds: number) => {
    updateTimer(questId, (timer) => ({
      ...timer,
      remainingSeconds: timer.remainingSeconds + seconds,
      status: 'running',
    }))
  }

  if (isFocusMode && currentFocusQuestId) {
    return <FocusMode questId={currentFocusQuestId} questTitle={focusQuestTitle} />
  }

  return (
    <div
      className="min-h-screen text-slate-100"
      style={{
        backgroundImage: `url(${currentBg.url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* 背景切り替えボタン */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        {BACKGROUNDS.map((bg) => (
          <button
            key={bg.id}
            onClick={() => setBgId(bg.id as typeof bgId)}
            className={`
              px-3 py-1 rounded-full text-xs font-medium
              border border-cyan-300/60
              bg-black/40 backdrop-blur-md
              hover:bg-cyan-500/40 hover:border-cyan-300
              transition
              ${bg.id === bgId ? 'ring-2 ring-cyan-300' : ''}
            `}
          >
            {bg.label}
          </button>
        ))}
      </div>

      <main className="relative min-h-screen w-full overflow-hidden bg-transparent">
        <section className="relative z-10 mx-auto max-w-6xl px-6 pb-12 pt-10 space-y-6">
          {/* ボード切り替え */}
          <div className="flex gap-2">
            {[
              { id: 'status', label: 'ステータス' },
              { id: 'quest', label: 'クエスト' },
              { id: 'boss', label: 'ボス' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveBoard(tab.id as BoardTab)}
                className={`h-11 px-4 rounded-full text-sm font-semibold tracking-wide border transition ${activeBoard === tab.id
                  ? 'border-cyan-400/80 bg-cyan-500/20 text-cyan-100'
                  : 'border-white/10 bg-white/5 text-slate-200 hover:border-cyan-400/40 hover:text-cyan-100'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ボード本体 */}
          {activeBoard === 'status' && (
            <StatusBoard />
          )}

          {activeBoard === 'quest' && (
            <QuestBoard
              quests={quests}
              timers={questTimers}
              completingIds={completingIds}
              onAdd={openAddModal}
              onEdit={handleEditQuest}
              onDelete={handleDeleteQuest}
              onToggleStatus={handleToggleQuestStatus}
              onToggleTopPriority={handleToggleTopPriority}
              onStartTimer={handleStartTimer}
              onPauseTimer={handlePauseTimer}
              onResumeTimer={handleResumeTimer}
              onCancelTimer={handleCancelTimer}
              onAddTime={handleAddTime}
              onFinishQuestFromTimer={handleFinishQuestFromTimer}
              onExtendAfterFinish={handleExtendAfterFinish}
              onChangeTimerColor={handleTimerColorChange}
            />
          )}

          {activeBoard === 'boss' && <BossBoard />}
        </section>
      </main>

      <QuestModal
        open={isQuestModalOpen}
        onClose={() => {
          setIsQuestModalOpen(false)
          setEditingQuest(null)
        }}
        initialValue={
          editingQuest
            ? {
              title: editingQuest.title,
              description: editingQuest.description ?? '',
              dueDate: editingQuest.dueAt ?? null,
              plannedMinutes: editingQuest.plannedMinutes ?? 25,
            }
            : undefined
        }
        onSave={handleSaveQuest}
      />
    </div>
  )
}
