'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export type TaskDifficulty = 'EASY' | 'NORMAL' | 'HARD'
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED'

export interface Task {
  id: string
  title: string
  description?: string
  difficulty: TaskDifficulty
  dueAt?: Date
  status: TaskStatus
  estimateMinutes?: number
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
  const [estimateMinutes, setEstimateMinutes] = useState('')

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title)
      setDescription(editingTask.description || '')
      setDifficulty(editingTask.difficulty)
      if (editingTask.dueAt) {
        const date = new Date(editingTask.dueAt)
        setDueDate(date.toISOString().split('T')[0])
        setDueTime(date.toTimeString().slice(0, 5))
      } else {
        setDueDate('')
        setDueTime('')
      }
      setEstimateMinutes(editingTask.estimateMinutes?.toString() || '')
    } else {
      // Reset form for new task
      setTitle('')
      setDescription('')
      setDifficulty('NORMAL')
      setDueDate('')
      setDueTime('')
      setEstimateMinutes('')
    }
  }, [editingTask, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) return

    const dueAt = dueDate && dueTime 
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
      estimateMinutes: estimateMinutes ? parseInt(estimateMinutes) : undefined,
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
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md shadow-lg p-6"
        >
          {/* Inner glow */}
          <div className="pointer-events-none absolute inset-0 opacity-60 rounded-3xl">
            <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-cyan-400/25 via-transparent to-transparent rounded-t-3xl" />
          </div>

          {/* Top highlight */}
          <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between mb-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
              {editingTask ? 'クエスト編集' : '新規クエスト'}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full border border-white/10 bg-white/5 text-slate-400 hover:border-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
            {/* Title */}
            <div>
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
              <div className="flex gap-2">
                {(['EASY', 'NORMAL', 'HARD'] as TaskDifficulty[]).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`flex-1 px-3 py-2 rounded-xl border text-[11px] font-semibold uppercase tracking-[0.1em] transition-all ${
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

            {/* Due Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-2">
                  期限日
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md text-slate-100 focus:outline-none focus:border-cyan-400/60 focus:bg-white/15 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-2">
                  時刻
                </label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md text-slate-100 focus:outline-none focus:border-cyan-400/60 focus:bg-white/15 transition-all"
                />
              </div>
            </div>

            {/* Estimate Minutes */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-2">
                見積もり時間（分）
              </label>
              <input
                type="number"
                value={estimateMinutes}
                onChange={(e) => setEstimateMinutes(e.target.value)}
                min="1"
                className="w-full px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/60 focus:bg-white/15 transition-all"
                placeholder="任意"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:border-slate-400 hover:text-slate-300 transition-all text-sm font-semibold uppercase tracking-[0.1em]"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 rounded-xl border border-cyan-400/60 bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/30 hover:shadow-[0_0_18px_rgba(34,211,238,0.6)] transition-all text-sm font-semibold uppercase tracking-[0.1em]"
              >
                {editingTask ? '更新' : '作成'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

