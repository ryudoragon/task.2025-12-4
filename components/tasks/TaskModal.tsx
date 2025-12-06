'use client'

import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export type TaskDifficulty = 'EASY' | 'NORMAL' | 'HARD'
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED'
export type TimerColor = 'red' | 'black' | 'blue'

export interface Task {
  id: string
  title: string
  description?: string
  difficulty: TaskDifficulty
  dueAt?: Date
  status: TaskStatus
  plannedMinutes: number
  isDaily?: boolean
  isUrgent?: boolean
  isTopPriority?: boolean
  timerColor?: TimerColor
  estimateMinutes?: number // 互換用（今後は plannedMinutes を使用）
}

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: Omit<Task, 'id'>) => void
  editingTask?: Task | null
}

export function TaskModal({ isOpen, onClose, onSave, editingTask }: TaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [difficulty, setDifficulty] = useState<TaskDifficulty>('NORMAL')
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('')
  const [plannedMinutes, setPlannedMinutes] = useState('25')
  const [plannedMinutesError, setPlannedMinutesError] = useState<string | null>(null)
  const [isDaily, setIsDaily] = useState(false)
  const [isUrgent, setIsUrgent] = useState(false)
  const [isTopPriority, setIsTopPriority] = useState(false)
  const [timerColor, setTimerColor] = useState<TimerColor>('red')

  const formatDateInput = (date: Date) => {
    const year = date.getFullYear()
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const setDueToday = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    setDueDate(formatDateInput(today))
  }

  const setDueTomorrow = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    setDueDate(formatDateInput(tomorrow))
  }

  const clampPlannedMinutes = (value: number) => Math.min(1440, Math.max(1, value || 0))

  const applyPlannedMinutes = (value: number) => {
    const clamped = clampPlannedMinutes(value)
    setPlannedMinutes(clamped.toString())
    setPlannedMinutesError(null)
  }

  const adjustPlannedMinutes = (delta: number) => {
    const current = Number(plannedMinutes) || 0
    applyPlannedMinutes(current + delta)
  }

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title)
      setDescription(editingTask.description || '')
      setDifficulty(editingTask.difficulty)
      if (editingTask.dueAt) {
        const date = new Date(editingTask.dueAt)
        setDueDate(formatDateInput(date))
        setDueTime(date.toTimeString().slice(0, 5))
      } else {
        setDueDate('')
        setDueTime('')
      }
      setPlannedMinutes(
        (editingTask.plannedMinutes ?? editingTask.estimateMinutes ?? 25).toString()
      )
      setIsDaily(!!editingTask.isDaily)
      setIsUrgent(!!editingTask.isUrgent)
      setIsTopPriority(!!editingTask.isTopPriority)
      setTimerColor(editingTask.timerColor ?? 'red')
      setPlannedMinutesError(null)
    } else {
      // Reset form for new task
      setTitle('')
      setDescription('')
      setDifficulty('NORMAL')
      setDueDate('')
      setDueTime('')
      setPlannedMinutes('25')
      setIsDaily(false)
      setIsUrgent(false)
      setIsTopPriority(false)
      setTimerColor('red')
      setPlannedMinutesError(null)
    }
  }, [editingTask, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) return

    const parsedPlanned = Number(plannedMinutes)
    if (!Number.isFinite(parsedPlanned) || parsedPlanned < 1 || parsedPlanned > 1440) {
      setPlannedMinutesError('1〜1440分で入力してください')
      return
    }
    const plannedSafe = clampPlannedMinutes(parsedPlanned)

    const dueAt =
      dueDate && dueTime
        ? new Date(`${dueDate}T${dueTime}`)
        : dueDate
        ? new Date(`${dueDate}T23:59`)
        : undefined

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      difficulty,
      dueAt,
      status: editingTask?.status || 'TODO',
      plannedMinutes: plannedSafe,
      isDaily,
      isUrgent,
      isTopPriority,
      timerColor,
    })

    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 18 }}
          className="relative w-full max-w-2xl max-h-[90vh] rounded-3xl border border-white/15 bg-white/10 backdrop-blur-2xl shadow-[0_0_35px_rgba(0,0,0,0.45)] overflow-hidden"
        >
          {/* Inner glow */}
          <div className="pointer-events-none absolute inset-0 opacity-60">
            <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-cyan-400/20 via-transparent to-transparent" />
          </div>

          <div className="flex flex-col h-full relative z-10">
            {/* Header */}
            <header className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/10">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-300">
                  {editingTask ? 'クエスト編集' : '新規クエスト'}
                </p>
                <h2 className="text-lg font-semibold text-slate-50 mt-1">
                  {editingTask ? 'クエストを更新' : 'クエストを追加'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full border border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400 hover:text-cyan-200 hover:bg-cyan-500/20 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </header>

            {/* Form body (scrollable) */}
            <form
              id="task-modal-form"
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto px-6 pb-6 space-y-5"
            >
              {/* Title */}
              <div className="pt-4">
                <label className="block text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-2">
                  タイトル
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/60 focus:bg-white/15 transition-all"
                  placeholder="クエストのタイトルを入力..."
                  required
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-2">
                  説明（任意）
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/60 focus:bg-white/15 transition-all resize-none"
                  placeholder="詳細を追加..."
                />
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-2">
                  難易度
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['EASY', 'NORMAL', 'HARD'] as TaskDifficulty[]).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`px-3 py-2 rounded-xl border text-[11px] font-semibold uppercase tracking-[0.1em] transition-all ${
                        difficulty === diff
                          ? diff === 'EASY'
                            ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                            : diff === 'NORMAL'
                            ? 'border-amber-400/60 bg-amber-500/20 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                            : 'border-red-400/60 bg-red-500/20 text-red-200 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:border-cyan-400/40 hover:text-cyan-300'
                      }`}
                    >
                      {diff === 'EASY' ? '簡単' : diff === 'NORMAL' ? '普通' : '困難'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due Date & Time with shortcuts */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-2">
                  期限
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md text-slate-100 focus:outline-none focus:border-cyan-400/60 focus:bg-white/15 transition-all"
                    />
                    <div className="flex gap-2 text-xs">
                      <button
                        type="button"
                        onClick={setDueToday}
                        className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-100 transition"
                      >
                        今日
                      </button>
                      <button
                        type="button"
                        onClick={setDueTomorrow}
                        className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-100 transition"
                      >
                        明日
                      </button>
                    </div>
                  </div>
                  <div>
                    <input
                      type="time"
                      value={dueTime}
                      onChange={(e) => setDueTime(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md text-slate-100 focus:outline-none focus:border-cyan-400/60 focus:bg-white/15 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Planned Minutes with quick adjust */}
              <div className="space-y-2">
                <label className="text-sm text-slate-200">クエストにかかる時間（分）</label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      max={1440}
                      step={1}
                      value={plannedMinutes}
                      onChange={(e) => applyPlannedMinutes(Number(e.target.value) || 0)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/60 focus:bg-white/15 transition-all"
                      placeholder="例：25"
                      required
                    />
                    <div className="flex items-center gap-1 text-xs">
                      <button
                        type="button"
                        onClick={() => adjustPlannedMinutes(-1)}
                        className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-100 transition"
                      >
                        -1
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustPlannedMinutes(1)}
                        className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-100 transition"
                      >
                        +1
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustPlannedMinutes(5)}
                        className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-100 transition"
                      >
                        +5分
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustPlannedMinutes(15)}
                        className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-100 transition"
                      >
                        +15分
                      </button>
                    </div>
                  </div>
                  {plannedMinutesError && (
                    <p className="text-xs text-red-300">{plannedMinutesError}</p>
                  )}
                </div>
              </div>

              {/* Timer color (keep existing functionality) */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-2">
                  タイマー色
                </label>
                <div className="flex gap-2">
                  {(['red', 'black', 'blue'] as TimerColor[]).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setTimerColor(color)}
                      className={`flex-1 px-3 py-2 rounded-xl border text-sm font-semibold uppercase tracking-[0.08em] transition ${
                        timerColor === color
                          ? color === 'red'
                            ? 'border-red-400/70 bg-red-500/15 text-red-200 shadow-[0_0_12px_rgba(248,113,113,0.35)]'
                            : color === 'blue'
                            ? 'border-sky-400/70 bg-sky-500/15 text-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.35)]'
                            : 'border-slate-400/70 bg-slate-500/15 text-slate-100 shadow-[0_0_12px_rgba(148,163,184,0.35)]'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/50 hover:text-cyan-200'
                      }`}
                    >
                      {color === 'red' ? '赤' : color === 'blue' ? '青' : '黒'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Flags */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={isDaily}
                    onChange={(e) => setIsDaily(e.target.checked)}
                    className="h-4 w-4 rounded border-white/30 bg-white/10 text-cyan-400 focus:ring-cyan-400"
                  />
                  毎日クエスト
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="h-4 w-4 rounded border-white/30 bg-white/10 text-red-400 focus:ring-red-400"
                  />
                  緊急クエスト
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={isTopPriority}
                    onChange={(e) => setIsTopPriority(e.target.checked)}
                    className="h-4 w-4 rounded border-white/30 bg-white/10 text-amber-400 focus:ring-amber-400"
                  />
                  最優先にする
                </label>
              </div>
            </form>

            {/* Footer */}
            <footer className="flex justify-end gap-3 px-6 py-4 border-t border-white/10 bg-white/5 backdrop-blur-xl">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:border-slate-400 hover:text-slate-100 transition-all text-sm font-semibold uppercase tracking-[0.1em]"
              >
                キャンセル
              </button>
              <button
                type="submit"
                form="task-modal-form"
                className="px-4 py-2.5 rounded-xl border border-cyan-400/60 bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/30 hover:shadow-[0_0_18px_rgba(34,211,238,0.6)] transition-all text-sm font-semibold uppercase tracking-[0.1em]"
              >
                {editingTask ? '更新' : '作成'}
              </button>
            </footer>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

