'use client'

import { useState } from 'react'
import { CyberInput } from '@/components/ui/CyberInput'
import { CyberButton } from '@/components/ui/CyberButton'

// ダミークエストデータ（後でAPIから取得するように変更）
const DUMMY_QUESTS = [
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

export function QuestList() {
  const [quests, setQuests] = useState(DUMMY_QUESTS)

  const handleCompleteQuest = (questId: string) => {
    setQuests((prev) =>
      prev.map((quest) =>
        quest.id === questId ? { ...quest, isCompleted: !quest.isCompleted } : quest
      )
    )
  }

  return (
    <div>
      {quests.map((quest) => (
        <div
          key={quest.id}
          className={`
            flex items-center gap-4
            p-4
            border-b border-glass-border
            ${quest.isCompleted ? 'opacity-50' : ''}
          `}
        >
          {/* クエスト名（編集不可のCyberInput風） */}
          <div className="flex-1 min-w-0">
            <CyberInput
              readOnly
              value={quest.title}
              className={`
                ${quest.isCompleted ? 'line-through' : ''}
                cursor-default
              `}
            />
          </div>

          {/* アクションボタン */}
          <div className="flex-shrink-0">
            <CyberButton
              variant="primary"
              onClick={() => handleCompleteQuest(quest.id)}
              disabled={quest.isCompleted}
            >
              {quest.isCompleted ? 'COMPLETED' : 'COMPLETE'}
            </CyberButton>
          </div>
        </div>
      ))}

      {/* 空の状態 */}
      {quests.length === 0 && (
        <div className="text-center py-12 font-mono text-system-white/60">
          <p>NO ACTIVE QUESTS</p>
          <p className="text-xs mt-2">CREATE NEW QUEST TO START</p>
        </div>
      )}
    </div>
  )
}


