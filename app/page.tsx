'use client'

import { useEffect, useMemo, useState } from 'react'
import { Task, TaskStatus, TimerColor } from '@/components/tasks/TaskModal'
import { QuestModal, QuestInput } from '@/components/quests/QuestModal'
import { QuestBoard, QuestTimerState } from '@/components/home/QuestBoard'
import { StatusBoard } from '@/components/home/StatusBoard'
import { BossBoard } from '@/components/home/BossBoard'

const BACKGROUNDS = [
  { id: 'cyber', label: 'サイバー', url: '/dashbord-cyber-bg.png' },
  { id: 'light', label: 'ライト', url: '/dashbord-siro-bg.png' },
  { id: 'dark', label: 'ダーク', url: '/dashbord-dark-bg.png' },
]

type BoardTab = 'status' | 'quest' | 'boss'

export default function HomePage() {
  const [bgId, setBgId] = useState<'cyber' | 'light' | 'dark'>('cyber')
  const currentBg = BACKGROUNDS.find((b) => b.id === bgId)!

  // プレイヤーステータス
  const [playerLevel, setPlayerLevel] = useState(5)
  const [playerExp, setPlayerExp] = useState(2450)
  const [playerCoins, setPlayerCoins] = useState(1250)
  const [streakDays] = useState(7)

  const [activeBoard, setActiveBoard] = useState<BoardTab>('quest')

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'ニューラルリンク調整',
      description: 'ニューラルインターフェースシステムの調整',
      difficulty: 'HARD',
      status: 'TODO',
      dueAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
      plannedMinutes: 45,
      isDaily: false,
      isUrgent: true,
      isTopPriority: true,
    },
    {
      id: '2',
      title: 'データストリーム最適化',
      description: 'データ処理ストリームの最適化',
      difficulty: 'NORMAL',
      status: 'TODO',
      dueAt: new Date(Date.now() + 5 * 60 * 60 * 1000),
      plannedMinutes: 30,
      isDaily: true,
      isUrgent: false,
      isTopPriority: false,
    },
    {
      id: '3',
      title: 'システム診断',
      description: 'システム全体の診断チェックを実行',
      difficulty: 'EASY',
      status: 'TODO',
      dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      plannedMinutes: 20,
      isDaily: false,
      isUrgent: false,
      isTopPriority: false,
    },
  ])
  const [isQuestModalOpen, setIsQuestModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // タイマー状態管理
  const [taskTimers, setTaskTimers] = useState<Record<string, QuestTimerState>>({})

  // タイマー初期化・同期
  useEffect(() => {
    setTaskTimers((prev) => {
      const updated: Record<string, QuestTimerState> = { ...prev }
      tasks.forEach((task) => {
        const plannedSeconds = (task.plannedMinutes ?? 25) * 60
        if (!updated[task.id]) {
          updated[task.id] = {
            remainingSeconds: plannedSeconds,
            plannedSeconds,
            status: 'idle',
          }
        } else {
          const existing = updated[task.id]
          updated[task.id] = {
            ...existing,
            plannedSeconds,
            ...(existing.status === 'idle' ? { remainingSeconds: plannedSeconds } : {}),
          }
        }
      })
      // remove timers for deleted tasks
      Object.keys(updated).forEach((id) => {
        if (!tasks.find((t) => t.id === id)) delete updated[id]
      })
      return updated
    })
  }, [tasks])

  // タイマー進行
  const hasRunning = useMemo(
    () => Object.values(taskTimers).some((t) => t.status === 'running'),
    [taskTimers]
  )

  useEffect(() => {
    if (!hasRunning) return
    const id = setInterval(() => {
      setTaskTimers((prev) => {
        const next = { ...prev }
        Object.entries(prev).forEach(([taskId, timer]) => {
          if (timer.status === 'running') {
            const remaining = Math.max(0, timer.remainingSeconds - 1)
            next[taskId] = {
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
    setEditingTask(null)
    setIsQuestModalOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsQuestModalOpen(true)
  }

  const handleSaveQuest = (questData: QuestInput) => {
    const safePlannedMinutes = questData.plannedMinutes ?? 25
    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? {
                ...t,
                title: questData.title,
                description: questData.description || undefined,
                dueAt: questData.dueDate ?? undefined,
                plannedMinutes: safePlannedMinutes,
              }
            : t
        )
      )
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        title: questData.title,
        description: questData.description || undefined,
        difficulty: 'NORMAL',
        status: 'TODO',
        dueAt: questData.dueDate ?? undefined,
        plannedMinutes: safePlannedMinutes,
        isDaily: false,
        isUrgent: false,
        isTopPriority: false,
        timerColor: 'red',
      }
      setTasks((prev) => [...prev, newTask])
    }
    setIsQuestModalOpen(false)
    setEditingTask(null)
  }

  const handleDeleteTask = (taskId: string) => {
    if (confirm('このクエストを削除しますか？')) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
    }
  }

  const getTaskRewards = (difficulty: Task['difficulty']) => {
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
  const getExpForNextLevel = (level: number) => level * 1000
  const getCurrentLevelExp = (exp: number) => exp % 1000

  const handleToggleTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newStatus: TaskStatus = t.status === 'COMPLETED' ? 'TODO' : 'COMPLETED'
          const isCompleting = newStatus === 'COMPLETED'
          const rewards = getTaskRewards(t.difficulty)
          if (isCompleting) {
            const newExp = playerExp + rewards.exp
            const newCoins = playerCoins + rewards.coins
            const newLevel = calculateLevel(newExp)
            setPlayerExp(newExp)
            setPlayerCoins(newCoins)
            if (newLevel > playerLevel) setPlayerLevel(newLevel)
          } else {
            const newExp = Math.max(0, playerExp - rewards.exp)
            const newCoins = Math.max(0, playerCoins - rewards.coins)
            const newLevel = calculateLevel(newExp)
            setPlayerExp(newExp)
            setPlayerCoins(newCoins)
            setPlayerLevel(newLevel)
          }
          return { ...t, status: newStatus }
        }
        return t
      })
    )
  }

  const handleToggleTopPriority = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, isTopPriority: !t.isTopPriority } : t))
    )
  }

  const handleTimerColorChange = (taskId: string, color: TimerColor) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, timerColor: color } : t)))
  }

  // タイマー操作ヘルパー
  const updateTimer = (taskId: string, updater: (timer: QuestTimerState) => QuestTimerState) => {
    setTaskTimers((prev) => {
      const existing = prev[taskId]
      if (!existing) return prev
      return { ...prev, [taskId]: updater(existing) }
    })
  }

  const handleStartTimer = (taskId: string) => {
    setTaskTimers((prev) => {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return prev
      const plannedSeconds = (task.plannedMinutes ?? 25) * 60
      const base = prev[taskId] ?? {
        remainingSeconds: plannedSeconds,
        plannedSeconds,
        status: 'idle' as const,
      }
      return {
        ...prev,
        [taskId]: { ...base, remainingSeconds: base.remainingSeconds, status: 'running' },
      }
    })
  }

  const handlePauseTimer = (taskId: string) =>
    updateTimer(taskId, (timer) => ({ ...timer, status: 'paused' }))

  const handleResumeTimer = (taskId: string) =>
    updateTimer(taskId, (timer) => ({ ...timer, status: 'running' }))

  const handleCancelTimer = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return
    const plannedSeconds = (task.plannedMinutes ?? 25) * 60
    setTaskTimers((prev) => ({
      ...prev,
      [taskId]: { remainingSeconds: plannedSeconds, plannedSeconds, status: 'idle' },
    }))
  }

  const handleAddTime = (taskId: string, seconds: number) => {
    updateTimer(taskId, (timer) => {
      const nextRemaining = Math.max(60, timer.remainingSeconds + seconds)
      return { ...timer, remainingSeconds: nextRemaining }
    })
  }

  const handleFinishTaskFromTimer = (taskId: string) => {
    handleToggleTaskStatus(taskId)
    handleCancelTimer(taskId)
  }

  const handleExtendAfterFinish = (taskId: string, seconds: number) => {
    updateTimer(taskId, (timer) => ({
      ...timer,
      remainingSeconds: timer.remainingSeconds + seconds,
      status: 'running',
    }))
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
                className={`h-11 px-4 rounded-full text-sm font-semibold tracking-wide border transition ${
                  activeBoard === tab.id
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
            <StatusBoard
              level={playerLevel}
              expCurrent={playerExp}
              expMax={(playerLevel + 1) * 1000}
              coins={playerCoins}
              streakDays={streakDays}
              playerClass="シャドウモナーク"
            />
          )}

          {activeBoard === 'quest' && (
            <QuestBoard
              tasks={tasks}
              timers={taskTimers}
              onAdd={openAddModal}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onToggleStatus={handleToggleTaskStatus}
              onToggleTopPriority={handleToggleTopPriority}
              onStartTimer={handleStartTimer}
              onPauseTimer={handlePauseTimer}
              onResumeTimer={handleResumeTimer}
              onCancelTimer={handleCancelTimer}
              onAddTime={handleAddTime}
              onFinishTaskFromTimer={handleFinishTaskFromTimer}
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
          setEditingTask(null)
        }}
        initialValue={
          editingTask
            ? {
                title: editingTask.title,
                description: editingTask.description ?? '',
                dueDate: editingTask.dueAt ?? null,
                plannedMinutes: editingTask.plannedMinutes ?? 25,
              }
            : undefined
        }
        onSave={handleSaveQuest}
      />
    </div>
  )
}
