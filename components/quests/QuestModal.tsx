import React, { useState } from 'react'

export type QuestInput = {
  title: string
  description: string
  dueDate: Date | null
  plannedMinutes: number
}

type QuestModalProps = {
  open: boolean
  initialValue?: QuestInput
  onClose: () => void
  onSave: (quest: QuestInput) => void
}

export const QuestModal: React.FC<QuestModalProps> = ({
  open,
  initialValue,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(initialValue?.title ?? '')
  const [description, setDescription] = useState(initialValue?.description ?? '')
  const [dueDate, setDueDate] = useState<Date | null>(initialValue?.dueDate ?? null)
  const [plannedMinutes, setPlannedMinutes] = useState<number>(
    initialValue?.plannedMinutes ?? 25
  )

  if (!open) return null

  const clampMinutes = (value: number) => {
    if (Number.isNaN(value)) return 1
    return Math.min(Math.max(1, value), 24 * 60) // 1〜1440分に制限
  }

  const handleMinutesChange = (delta: number) => {
    setPlannedMinutes((prev) => clampMinutes(prev + delta))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onSave({
      title: title.trim(),
      description: description.trim(),
      dueDate,
      plannedMinutes: clampMinutes(plannedMinutes),
    })
  }

  const setDueToday = () => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    setDueDate(d)
  }

  const setDueTomorrow = () => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    d.setHours(0, 0, 0, 0)
    setDueDate(d)
  }

  const formatDateInput = (date: Date | null): string => {
    if (!date) return ''
    const y = date.getFullYear()
    const m = `${date.getMonth() + 1}`.padStart(2, '0')
    const d = `${date.getDate()}`.padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  const parseDateFromInput = (value: string): Date | null => {
    if (!value) return null
    const [y, m, d] = value.split('-').map((v) => Number(v))
    if (!y || !m || !d) return null
    const date = new Date(y, m - 1, d)
    date.setHours(0, 0, 0, 0)
    return date
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="
          w-full max-w-2xl
          max-h-[90vh]
          rounded-3xl
          bg-slate-900/80
          backdrop-blur-2xl
          border border-cyan-400/30
          shadow-[0_0_30px_rgba(0,255,255,0.4)]
          overflow-hidden
        "
      >
        <form className="flex flex-col h-full" onSubmit={handleSubmit}>
          {/* ヘッダー */}
          <header className="px-6 pt-5 pb-3 border-b border-white/10">
            <h2 className="text-lg font-semibold text-cyan-200">クエストを追加</h2>
            <p className="mt-1 text-xs text-slate-300">
              クエスト名・期限・かかる時間を設定してください。
            </p>
          </header>

          {/* スクロール可能エリア */}
          <div className="flex-1 px-6 pb-5 pt-3 space-y-4 overflow-y-auto">
            {/* クエスト名 */}
            <div className="space-y-2">
              <label className="text-sm text-slate-200">クエスト名</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="
                  w-full px-3 py-2 rounded-xl
                  bg-white/5 border border-white/10
                  text-slate-50 text-sm
                  focus:outline-none focus:ring-2 focus:ring-cyan-400/70
                "
                placeholder="例：レポートの導入を書く"
              />
            </div>

            {/* 説明 */}
            <div className="space-y-2">
              <label className="text-sm text-slate-200">クエストの説明</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="
                  w-full px-3 py-2 rounded-xl
                  bg-white/5 border border-white/10
                  text-slate-50 text-sm
                  focus:outline-none focus:ring-2 focus:ring-cyan-400/70
                  resize-y
                "
                placeholder="詳細メモや、やる順番などを書いておくと便利です。"
              />
            </div>

            {/* 期限 + 今日/明日 ショートカット */}
            <div className="space-y-2">
              <label className="text-sm text-slate-200">期限日</label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="date"
                  value={formatDateInput(dueDate)}
                  onChange={(e) => setDueDate(parseDateFromInput(e.target.value))}
                  className="
                    px-3 py-2 rounded-xl
                    bg-white/5 border border-white/10
                    text-slate-50 text-sm
                    focus:outline-none focus:ring-2 focus:ring-cyan-400/70
                  "
                />
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={setDueToday}
                    className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-100"
                  >
                    今日
                  </button>
                  <button
                    type="button"
                    onClick={setDueTomorrow}
                    className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-100"
                  >
                    明日
                  </button>
                </div>
              </div>
            </div>

            {/* 何分でやるか（タイマー用予定時間） */}
            <div className="space-y-2">
              <label className="text-sm text-slate-200">このクエストにかける時間（分）</label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={24 * 60}
                  step={1}
                  value={plannedMinutes}
                  onChange={(e) => setPlannedMinutes(clampMinutes(Number(e.target.value) || 1))}
                  className="
                    w-28 px-3 py-2 rounded-xl
                    bg-white/5 border border-white/10
                    text-slate-50 text-sm
                    focus:outline-none focus:ring-2 focus:ring-cyan-400/70
                    text-right
                  "
                />
                <span className="text-xs text-slate-300">分</span>

                <div className="flex flex-wrap items-center gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => handleMinutesChange(-1)}
                    className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20"
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMinutesChange(1)}
                    className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMinutesChange(5)}
                    className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20"
                  >
                    +5分
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMinutesChange(15)}
                    className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20"
                  >
                    +15分
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* フッター */}
          <footer className="flex justify-end gap-3 px-6 py-4 border-t border-white/10 bg-slate-900/80">
            <button
              type="button"
              onClick={onClose}
              className="
                px-4 py-2 text-sm rounded-xl
                bg-white/5 hover:bg-white/10
                text-slate-100
              "
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="
                px-4 py-2 text-sm rounded-xl
                bg-cyan-500 hover:bg-cyan-400
                text-slate-900 font-semibold
                shadow-md shadow-cyan-500/40
              "
            >
              クエストを保存
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}

