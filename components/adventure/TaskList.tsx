'use client'

import { useState } from 'react'
import { CyberInput } from '@/components/ui/CyberInput'
import { CyberButton } from '@/components/ui/CyberButton'

// ダミータスクデータ（後でAPIから取得するように変更）
const DUMMY_TASKS = [
  {
    id: '1',
    title: '朝の運動を30分する',
    description: 'ジョギングまたはウォーキング',
    difficulty: 'EASY' as const,
    estimateMinutes: 30,
    isCompleted: false,
  },
  {
    id: '2',
    title: 'プロジェクトのドキュメントを更新',
    description: 'READMEとAPI仕様書を更新',
    difficulty: 'NORMAL' as const,
    estimateMinutes: 60,
    isCompleted: false,
  },
  {
    id: '3',
    title: '新しい機能の実装',
    description: 'ユーザー認証機能を追加',
    difficulty: 'HARD' as const,
    estimateMinutes: 120,
    isCompleted: true,
  },
]

export function TaskList() {
  const [tasks, setTasks] = useState(DUMMY_TASKS)

  const handleCompleteTask = (taskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, isCompleted: !task.isCompleted }
        : task
    ))
  }

  return (
    <div>
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`
            flex items-center gap-4
            p-4
            border-b border-glass-border
            ${task.isCompleted ? 'opacity-50' : ''}
          `}
        >
          {/* タスク名（編集不可のCyberInput風） */}
          <div className="flex-1 min-w-0">
            <CyberInput
              readOnly
              value={task.title}
              className={`
                ${task.isCompleted ? 'line-through' : ''}
                cursor-default
              `}
            />
          </div>

          {/* アクションボタン */}
          <div className="flex-shrink-0">
            <CyberButton
              variant="primary"
              onClick={() => handleCompleteTask(task.id)}
              disabled={task.isCompleted}
            >
              {task.isCompleted ? 'COMPLETED' : 'COMPLETE'}
            </CyberButton>
          </div>
        </div>
      ))}

      {/* 空の状態 */}
      {tasks.length === 0 && (
        <div className="text-center py-12 font-mono text-system-white/60">
          <p>NO ACTIVE QUESTS</p>
          <p className="text-xs mt-2">CREATE NEW QUEST TO START</p>
        </div>
      )}
    </div>
  )
}

