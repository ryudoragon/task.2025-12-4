import { useMemo, useState } from 'react'
import { Task, TaskStatus, TimerColor } from '@/components/tasks/TaskModal'
import { HoloPanel } from '@/components/ui/HoloPanel'
import { motion } from 'framer-motion'
import {
  AlarmClock,
  CheckCircle2,
  Pause,
  Play,
  Plus,
  RefreshCcw,
  Star,
  TimerReset,
  Trash2,
  Clock,
  SquareMinus,
} from 'lucide-react'

export type TaskTimerStatus = 'idle' | 'running' | 'paused' | 'finished'

export type QuestTimerState = {
  remainingSeconds: number
  status: TaskTimerStatus
  plannedSeconds: number
}

type QuestBoardProps = {
  tasks: Task[]
  onAdd: () => void
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onToggleStatus: (taskId: string) => void
  onToggleTopPriority: (taskId: string) => void
  timers: Record<string, QuestTimerState>
  onStartTimer: (taskId: string) => void
  onPauseTimer: (taskId: string) => void
  onResumeTimer: (taskId: string) => void
  onCancelTimer: (taskId: string) => void
  onAddTime: (taskId: string, seconds: number) => void
  onFinishTaskFromTimer: (taskId: string) => void
  onExtendAfterFinish: (taskId: string, seconds: number) => void
  onChangeTimerColor: (taskId: string, color: TimerColor) => void
}

const TABS = [
  { id: 'all', label: '全体' },
  { id: 'daily', label: '毎日' },
  { id: 'urgent', label: '緊急' },
  { id: 'top', label: '最優先' },
  { id: 'done', label: '完了' }, // 右端の完了タブを追加
] as const

const formatTime = (seconds: number) => {
  const clamped = Math.max(0, seconds)
  const h = Math.floor(clamped / 3600)
  const m = Math.floor((clamped % 3600) / 60)
  const s = clamped % 60
  const pad = (v: number) => v.toString().padStart(2, '0')
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`
  return `${pad(m)}:${pad(s)}`
}

export function QuestBoard({
  tasks,
  onAdd,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleTopPriority,
  timers,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onCancelTimer,
  onAddTime,
  onFinishTaskFromTimer,
  onExtendAfterFinish,
  onChangeTimerColor,
}: QuestBoardProps) {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('all')

  const filteredTasks = useMemo(() => {
    switch (activeTab) {
      case 'daily':
        return tasks.filter((t) => t.isDaily)
      case 'urgent':
        return tasks.filter((t) => t.isUrgent)
      case 'top':
        return tasks.filter((t) => t.isTopPriority)
      case 'done':
        return tasks.filter((t) => t.status === 'COMPLETED')
      default:
        return tasks
    }
  }, [activeTab, tasks])

  const getTimer = (taskId: string): QuestTimerState | undefined => timers[taskId]

  const renderTimerControls = (task: Task) => {
    const timer = getTimer(task.id)
    const remaining = timer?.remainingSeconds ?? (task.plannedMinutes ?? 25) * 60
    const status = timer?.status ?? 'idle'
    const isFinished = status === 'finished'
    const isLow = remaining <= 60
    const color = task.timerColor ?? 'red'
    const colorClass =
      color === 'black'
        ? 'text-black dark:text-slate-100'
        : color === 'blue'
        ? 'text-sky-400'
        : 'text-red-500'

    return (
      <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 space-y-2 min-h-[200px]">
        {/* CAUSE: タイマーの表示/非表示で高さが大きく変動 → タイマー枠にmin-hを設定 */}
        <div className="flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-300" />
            <span className="uppercase tracking-[0.2em]">残り時間</span>
          </div>
        </div>
        <div className="flex items-center justify-center w-[240px] h-[86px] mx-auto bg-black/10 rounded-lg">
          {/* CAUSE: 桁変化で位置が動く → 固定幅・固定高さ・leading-none・tabular-numsを徹底。アニメはopacityのみで位置は不変 */}
          <motion.span
            key={remaining}
            initial={{ opacity: 0.92 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className={`text-6xl md:text-7xl font-analog-digital tabular-nums leading-none tracking-[0.12em] ${colorClass}`}
          >
            {formatTime(remaining)}
          </motion.span>
        </div>

        {/* タイマー色選択（レイアウトが動かないよう小さめ固定ボタン） */}
        <div className="flex gap-2 text-[11px] mt-2">
          {(['red', 'black', 'blue'] as TimerColor[]).map((c) => {
            const active = color === c
            const base =
              'px-2 py-1 rounded-md border text-xs transition-all leading-none tracking-[0.05em]'
            const activeCls = 'border-cyan-400/70 bg-cyan-500/15 text-cyan-100'
            const inactiveCls = 'border-white/15 bg-white/5 text-slate-200 hover:border-cyan-300/40'
            return (
              <button
                key={c}
                onClick={() => onChangeTimerColor(task.id, c)}
                className={`${base} ${active ? activeCls : inactiveCls}`}
              >
                {c === 'red' ? '赤' : c === 'black' ? '黒' : '青'}
              </button>
            )
          })}
        </div>

        {!isFinished ? (
          <div className="flex flex-wrap gap-2">
            {status === 'idle' && (
              <button
                onClick={() => onStartTimer(task.id)}
                className="flex-1 min-w-[140px] rounded-lg border border-cyan-400/60 bg-cyan-500/20 px-3 py-2 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/30 transition"
              >
                <div className="flex items-center justify-center gap-2">
                  <Play className="w-4 h-4" />
                  開始
                </div>
              </button>
            )}
            {status === 'running' && (
              <button
                onClick={() => onPauseTimer(task.id)}
                className="flex-1 min-w-[120px] rounded-lg border border-amber-400/60 bg-amber-500/20 px-3 py-2 text-xs font-semibold text-amber-100 hover:bg-amber-500/30 transition"
              >
                <div className="flex items-center justify-center gap-2">
                  <Pause className="w-4 h-4" />
                  一時停止
                </div>
              </button>
            )}
            {status === 'paused' && (
              <button
                onClick={() => onResumeTimer(task.id)}
                className="flex-1 min-w-[120px] rounded-lg border border-emerald-400/60 bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-100 hover:bg-emerald-500/30 transition"
              >
                <div className="flex items-center justify-center gap-2">
                  <Play className="w-4 h-4" />
                  再開
                </div>
              </button>
            )}
            {(status === 'running' || status === 'paused') && (
              <button
                onClick={() => onCancelTimer(task.id)}
                className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 transition"
              >
                <div className="flex items-center justify-center gap-2">
                  <RefreshCcw className="w-4 h-4" />
                  リセット
                </div>
              </button>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => onAddTime(task.id, -300)}
                className="rounded-lg border border-white/15 bg-white/5 px-2 py-2 text-xs text-slate-200 hover:bg-white/10 transition"
              >
                <SquareMinus className="w-4 h-4" />
              </button>
              <button
                onClick={() => onAddTime(task.id, 300)}
                className="rounded-lg border border-white/15 bg-white/5 px-2 py-2 text-xs text-slate-200 hover:bg-white/10 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => onAddTime(task.id, 900)}
                className="rounded-lg border border-white/15 bg-white/5 px-2 py-2 text-xs text-slate-200 hover:bg-white/10 transition"
              >
                +15分
              </button>
              <button
                onClick={() => onAddTime(task.id, 300)}
                className="rounded-lg border border-white/15 bg-white/5 px-2 py-2 text-xs text-slate-200 hover:bg-white/10 transition"
              >
                +5分
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 rounded-lg border border-emerald-400/40 bg-emerald-500/10 p-3">
            <div className="flex items-center gap-2 text-emerald-200 text-sm font-semibold">
              <AlarmClock className="w-4 h-4" />
              タイマーが終了しました
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => onFinishTaskFromTimer(task.id)}
                className="flex-1 min-w-[140px] rounded-lg border border-emerald-400/60 bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-100 hover:bg-emerald-500/30 transition"
              >
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  完了する
                </div>
              </button>
              <button
                onClick={() => onExtendAfterFinish(task.id, 300)}
                className="rounded-lg border border-cyan-400/60 bg-cyan-500/20 px-3 py-2 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/30 transition"
              >
                +5分延長
              </button>
              <button
                onClick={() => onExtendAfterFinish(task.id, 900)}
                className="rounded-lg border border-cyan-400/60 bg-cyan-500/20 px-3 py-2 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/30 transition"
              >
                +15分延長
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <HoloPanel glowColor="cyan" disableFloat className="p-6 flex flex-col gap-4 min-h-[760px]">
      {/* CAUSE: カード高さ変動による親コンテナの揺れ → パネル自体にmin-hを付与 */}
      {/* タブバー＋右上「クエスト追加」ボタン。高さ固定で揺れ防止 */}
      <div className="relative h-14 flex items-end border-b border-white/15 pb-0">
        <div className="flex items-end gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300 mr-2">
            クエストボード
          </h2>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`h-11 px-4 rounded-t-lg text-sm font-semibold transition-all border border-transparent border-b-0 ${
                activeTab === tab.id
                  ? 'bg-white/15 text-white shadow-md -mb-px border-white/30'
                  : 'text-slate-300 opacity-70 hover:opacity-100 hover:bg-white/8'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="absolute right-0 top-0 flex items-center h-full">
          <button
            onClick={onAdd}
            aria-label="クエストを追加"
            className="
              relative
              px-5 py-2 rounded-xl
              font-semibold text-sm
              text-cyan-300
              bg-gradient-to-br from-[#0a2a4a] to-[#0e436e]
              border border-cyan-400/40
              shadow-[0_0_10px_2px_rgba(0,255,255,0.35)]
              hover:shadow-[0_0_15px_4px_rgba(0,255,255,0.6)]
              hover:text-cyan-200
              active:scale-95
              transition-all duration-200
              max-md:shadow-[0_0_7px_1px_rgba(0,255,255,0.25)]
            "
          >
            ＋ クエスト追加
            <span
              className="
                absolute inset-0 rounded-xl
                pointer-events-none
                bg-cyan-300/10
                blur-[8px]
              "
            ></span>
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[600px]">
        {/* CAUSE: タブ/タイマー切替でリスト全体の高さが再計算され揺れる → リストコンテナにmin-hを設定 */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <p className="text-sm">クエストがありません</p>
            <p className="text-[11px] text-slate-500 mt-1">+ボタンでクエストを追加してください</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {filteredTasks.map((task) => {
              const timer = getTimer(task.id)
              return (
                <li
                  key={task.id}
                  className={`group relative flex flex-col gap-3 rounded-xl border p-4 transition-all hover:border-cyan-400/40 shadow-lg min-h-[300px] ${
                    task.status === 'COMPLETED'
                      ? 'border-emerald-400/30 bg-white/2 backdrop-blur-md'
                      : 'bg-white/3 backdrop-blur-md border-white/20 hover:bg-white/5'
                  }`}
                  style={task.status === 'COMPLETED' ? { opacity: 0.7 } : {}}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p
                          className={`text-sm font-semibold ${
                            task.status === 'COMPLETED' ? 'line-through text-slate-200' : 'text-white'
                          }`}
                        >
                          {task.title}
                        </p>
                        {task.isDaily && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full border border-cyan-400/40 bg-cyan-500/10 text-cyan-200">
                            毎日
                          </span>
                        )}
                        {task.isUrgent && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full border border-red-400/40 bg-red-500/10 text-red-200">
                            緊急
                          </span>
                        )}
                        {task.isTopPriority && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full border border-amber-400/40 bg-amber-500/10 text-amber-200">
                            最優先
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-[12px] text-slate-200 line-clamp-2 mb-2">{task.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-200">
                        <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5">
                          予定 {task.plannedMinutes ?? 25}分
                        </span>
                        <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5">
                          難易度: {task.difficulty}
                        </span>
                        {task.dueAt && (
                          <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5">
                            締切: {task.dueAt.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEdit(task)}
                          className="p-2 rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:border-cyan-400/60 hover:text-cyan-300 hover:bg-cyan-500/20 transition-all"
                        >
                          <TimerReset className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(task.id)}
                          className="p-2 rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:border-red-400/60 hover:text-red-300 hover:bg-red-500/20 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onToggleTopPriority(task.id)}
                          className={`p-2 rounded-lg border transition-all ${
                            task.isTopPriority
                              ? 'border-amber-400/70 bg-amber-500/20 text-amber-200'
                              : 'border-white/10 bg-white/5 text-slate-200 hover:border-amber-400/50 hover:text-amber-200 hover:bg-amber-500/10'
                          }`}
                          title="最優先にする"
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                      <button
                        onClick={() => onToggleStatus(task.id)}
                        className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] transition-all ${
                          task.status === 'COMPLETED'
                            ? 'border-emerald-400/60 bg-emerald-500/30 text-emerald-200 hover:bg-emerald-500/40'
                            : 'border-emerald-400/60 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30'
                        }`}
                      >
                        {task.status === 'COMPLETED' ? '元に戻す' : '完了'}
                      </button>
                    </div>
                  </div>

                  {/* タイマー領域 */}
                  {renderTimerControls(task)}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <motion.button
        onClick={onAdd}
        aria-label="クエストを追加"
        className="absolute bottom-6 right-6 w-12 h-12 rounded-full border border-cyan-400/60 bg-cyan-500/20 flex items-center justify-center text-cyan-300 transition-all hover:bg-cyan-500/30 hover:shadow-[0_0_18px_rgba(34,211,238,0.6)]"
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus className="w-5 h-5" />
      </motion.button>
    </HoloPanel>
  )
}

