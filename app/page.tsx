'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { HoloPanel } from '@/components/ui/HoloPanel'
import { motion } from 'framer-motion'
import { TaskModal, Task, TaskDifficulty, TaskStatus } from '@/components/tasks/TaskModal'

const BACKGROUNDS = [
  { id: 'cyber', label: 'サイバー', url: '/dashbord-cyber-bg.png' },
  { id: 'light', label: 'ライト', url: '/dashbord-siro-bg.png' },
  { id: 'dark', label: 'ダーク', url: '/dashbord-dark-bg.png' },
]

export default function HomePage() {
  const [bgId, setBgId] = useState<'cyber' | 'light' | 'dark'>('cyber')
  const [isMounted, setIsMounted] = useState(false)
  const currentBg = BACKGROUNDS.find((b) => b.id === bgId)!
  
  // プレイヤーステータス
  const [playerLevel, setPlayerLevel] = useState(5)
  const [playerExp, setPlayerExp] = useState(2450)
  const [playerCoins, setPlayerCoins] = useState(1250)
  const [streakDays, setStreakDays] = useState(7)
  
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'ニューラルリンク調整',
      description: 'ニューラルインターフェースシステムの調整',
      difficulty: 'HARD',
      status: 'TODO',
      dueAt: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
    },
    {
      id: '2',
      title: 'データストリーム最適化',
      description: 'データ処理ストリームの最適化',
      difficulty: 'NORMAL',
      status: 'TODO',
      dueAt: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
    },
    {
      id: '3',
      title: 'システム診断',
      description: 'システム全体の診断チェックを実行',
      difficulty: 'EASY',
      status: 'TODO',
      dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
    },
  ])
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // クライアントサイドでのみマウントを検出
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleAddTask = () => {
    setEditingTask(null)
    setIsTaskModalOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsTaskModalOpen(true)
  }

  const handleSaveTask = (taskData: Omit<Task, 'id'>) => {
    if (editingTask) {
      // Update existing task
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...taskData, id: editingTask.id } : t))
    } else {
      // Add new task
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString(),
      }
      setTasks([...tasks, newTask])
    }
    setIsTaskModalOpen(false)
    setEditingTask(null)
  }

  const handleDeleteTask = (taskId: string) => {
    if (confirm('このクエストを削除しますか？')) {
      setTasks(tasks.filter(t => t.id !== taskId))
    }
  }

  // 難易度に応じた経験値とコインの報酬
  const getTaskRewards = (difficulty: TaskDifficulty) => {
    switch (difficulty) {
      case 'EASY':
        return { exp: 50, coins: 25 }
      case 'NORMAL':
        return { exp: 100, coins: 50 }
      case 'HARD':
        return { exp: 200, coins: 100 }
    }
  }

  // レベルアップの計算
  const calculateLevel = (exp: number) => {
    // レベル = floor(exp / 1000) + 1
    return Math.floor(exp / 1000) + 1
  }

  // 次のレベルまでの必要経験値
  const getExpForNextLevel = (level: number) => {
    return level * 1000
  }

  // 現在のレベルでの経験値進捗（0-1000の範囲）
  const getCurrentLevelExp = (exp: number) => {
    return exp % 1000
  }

  const handleToggleTaskStatus = (taskId: string) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const newStatus: TaskStatus = t.status === 'COMPLETED' ? 'TODO' : 'COMPLETED'
        const isCompleting = newStatus === 'COMPLETED'
        
        // タスク完了時に経験値とコインを追加
        if (isCompleting) {
          const rewards = getTaskRewards(t.difficulty)
          const newExp = playerExp + rewards.exp
          const newCoins = playerCoins + rewards.coins
          const newLevel = calculateLevel(newExp)
          
          setPlayerExp(newExp)
          setPlayerCoins(newCoins)
          
          // レベルアップした場合
          if (newLevel > playerLevel) {
            setPlayerLevel(newLevel)
          }
        } else {
          // タスクを元に戻す場合は報酬を減らす
          const rewards = getTaskRewards(t.difficulty)
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
    }))
  }

  const getDifficultyColor = (difficulty: TaskDifficulty) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-emerald-400'
      case 'NORMAL':
        return 'bg-amber-400'
      case 'HARD':
        return 'bg-red-400'
    }
  }

  const getDifficultyTextColor = (difficulty: TaskDifficulty) => {
    switch (difficulty) {
      case 'EASY':
        return 'text-emerald-300'
      case 'NORMAL':
        return 'text-yellow-300'
      case 'HARD':
        return 'text-red-300'
    }
  }

  const formatDueDate = (dueAt?: Date) => {
    if (!dueAt) return null
    const now = new Date()
    const diff = dueAt.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `残り${days}日`
    } else if (hours > 0) {
      return `残り${hours}時間`
    } else if (diff > 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return `残り${minutes}分`
    } else {
      return '期限切れ'
    }
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
      {/* Background switcher buttons */}
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

      {/* Main layout */}
      <main className="relative min-h-screen w-full overflow-hidden bg-transparent">
        <section className="relative z-10 mx-auto max-w-6xl px-6 pb-10 pt-10">
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1.3fr_1.1fr] gap-6">
          {/* Left panel: PLAYER STATUS */}
          <HoloPanel glowColor="cyan" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
                プレイヤーステータス
              </h2>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-emerald-300 border border-emerald-500/30">
                稼働中
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white">レベル</span>
                <span className="font-mono text-2xl text-cyan-300">{playerLevel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white">経験値</span>
                <span className="font-mono text-lg text-cyan-300">{playerExp.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white">コイン</span>
                <span className="font-mono text-lg text-cyan-300">{playerCoins.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white">連続日数</span>
                <span className="font-mono text-lg text-cyan-300">{streakDays}日</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-cyan-400/20">
              <p className="text-[10px] uppercase tracking-[0.25em] text-white mb-2">クラス</p>
              <p className="text-sm font-semibold text-purple-300">シャドウモナーク</p>
            </div>

            <div className="mt-4">
              <p className="text-[10px] uppercase tracking-[0.25em] text-white mb-2">経験値進捗</p>
              <div className="relative h-2 w-full rounded-full bg-slate-900/70 overflow-hidden">
                <motion.div 
                  key={playerExp}
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${(getCurrentLevelExp(playerExp) / 1000) * 100}%` 
                  }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
              </div>
              <p className="mt-2 text-[11px] font-mono text-white">
                {getCurrentLevelExp(playerExp).toLocaleString()} / {getExpForNextLevel(playerLevel).toLocaleString()}
              </p>
            </div>
          </HoloPanel>

          {/* Center panel: TODAY'S QUESTS */}
          <HoloPanel glowColor="cyan" className="p-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300 mb-6">
              今日のクエスト
            </h2>

            {tasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-white mb-2">クエストがありません</p>
                <p className="text-[11px] text-slate-100">+ボタンをクリックして新しいクエストを追加</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className={`group relative flex items-center gap-3 rounded-xl border p-3 transition-all hover:border-cyan-400/40 shadow-lg ${
                      task.status === 'COMPLETED'
                        ? 'border-emerald-400/30 bg-white/2 backdrop-blur-md'
                        : 'bg-white/3 backdrop-blur-md border-white/20 hover:bg-white/5'
                    }`}
                    style={task.status === 'COMPLETED' ? { opacity: 0.6 } : {}}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${getDifficultyColor(task.difficulty)}`} />
                    <div className="flex-1 pl-2 min-w-0">
                      <p className={`text-sm font-medium ${task.status === 'COMPLETED' ? 'line-through text-slate-200' : 'text-white'}`}>
                        {task.title}
                      </p>
                      <div className="mt-1 flex items-center gap-2 flex-wrap">
                        {task.dueAt && (
                          <span className="text-[11px] text-white" suppressHydrationWarning>
                            {isMounted ? formatDueDate(task.dueAt) : '計算中...'}
                          </span>
                        )}
                        <span className={`text-[11px] font-semibold ${getDifficultyTextColor(task.difficulty)}`}>
                          {task.difficulty === 'EASY' ? '簡単' : task.difficulty === 'NORMAL' ? '普通' : '困難'}
                        </span>
                        {task.estimateMinutes && (
                          <span className="text-[11px] text-white">
                            • {task.estimateMinutes}分
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {task.status !== 'COMPLETED' && (
                        <>
                          <button
                            onClick={() => handleEditTask(task)}
                            className="p-1.5 rounded-lg border border-white/10 bg-white/2 text-slate-400 hover:border-cyan-400/60 hover:text-cyan-300 hover:bg-cyan-500/20 transition-all"
                            title="編集"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1.5 rounded-lg border border-white/10 bg-white/2 text-slate-400 hover:border-red-400/60 hover:text-red-300 hover:bg-red-500/20 transition-all"
                            title="削除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleToggleTaskStatus(task.id)}
                        className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] transition-all ${
                          task.status === 'COMPLETED'
                            ? 'border-emerald-400/60 bg-emerald-500/30 text-emerald-200 hover:bg-emerald-500/40 hover:shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                            : 'border-emerald-400/60 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30 hover:shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                        }`}
                      >
                        {task.status === 'COMPLETED' ? '元に戻す' : '完了'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <motion.button 
              onClick={handleAddTask}
              className="absolute bottom-6 right-6 w-12 h-12 rounded-full border border-cyan-400/60 bg-cyan-500/20 flex items-center justify-center text-cyan-300 transition-all hover:bg-cyan-500/30 hover:shadow-[0_0_18px_rgba(34,211,238,0.6)]"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </HoloPanel>

          {/* Right panel: BOSS / RAID STATUS */}
          <HoloPanel glowColor="fuchsia" className="p-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-fuchsia-300 mb-2">
              週次レイドボス
            </h2>
            <p className="text-base font-semibold text-slate-100 mb-4">アビサルコア v1.3</p>

            {/* Phase/Affix badge */}
            <div className="mb-4 inline-block rounded-full border border-purple-400/40 bg-purple-500/20 px-3 py-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-purple-300">
                フェーズ2 • シールド
              </span>
            </div>

            {/* HP Bar */}
            <div className="mb-2">
              <div className="relative h-3 w-full rounded-full bg-slate-900/70 overflow-hidden">
                <motion.div 
                  className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 shadow-[0_0_20px_rgba(236,72,153,0.6)]"
                  initial={{ width: 0 }}
                  animate={{ width: '50%' }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
              </div>
              <p className="mt-2 text-[11px] font-mono text-white">150,000 / 300,000 HP</p>
            </div>

            {/* Damage log */}
            <div className="mt-6 space-y-1.5">
              <p className="text-[10px] uppercase tracking-[0.25em] text-white mb-2">最近のダメージ</p>
              <ul className="space-y-1.5 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-400/30 scrollbar-track-transparent">
                <li className="text-[11px] text-white">
                  ▶ あなたのダメージ <span className="text-cyan-300 font-mono font-semibold">+120</span>
                  <span className="text-slate-100"> (クエスト: モーニングフォーカス)</span>
                </li>
                <li className="text-[11px] text-white">
                  ▶ パーティのダメージ <span className="text-fuchsia-300 font-mono font-semibold">+540</span>
                  <span className="text-slate-100"> 過去1時間</span>
                </li>
                <li className="text-[11px] text-white">
                  ▶ あなたのダメージ <span className="text-cyan-300 font-mono font-semibold">+85</span>
                  <span className="text-slate-100"> (クエスト: データストリーム)</span>
                </li>
              </ul>
            </div>
          </HoloPanel>
        </div>
      </section>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false)
          setEditingTask(null)
        }}
        onSave={handleSaveTask}
        editingTask={editingTask}
      />
      </main>
    </div>
  )
}
