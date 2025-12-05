'use client'

import { useState } from 'react'
import { AdventureMap } from '@/components/adventure/AdventureMap'
import { TaskList } from '@/components/adventure/TaskList'
import { SystemCard } from '@/components/ui/SystemCard'
import { CyberInput } from '@/components/ui/CyberInput'
import { CyberButton } from '@/components/ui/CyberButton'

// ダミーデータ（後でAPIから取得するように変更）
const DUMMY_CURRENT_TILE_INDEX = 2
const DUMMY_TILES = Array.from({ length: 20 }, (_, i) => ({
  index: i,
  type: (i === 5 ? 'ENEMY' : i === 7 ? 'CHEST' : 'EMPTY') as 'EMPTY' | 'ENEMY' | 'CHEST' | 'EVENT' | 'BOSS',
}))

export default function AdventurePage() {
  const [currentTileIndex, setCurrentTileIndex] = useState(DUMMY_CURRENT_TILE_INDEX)
  const [newQuestInput, setNewQuestInput] = useState('')

  const handleInitializeQuest = () => {
    if (newQuestInput.trim()) {
      console.log('New quest:', newQuestInput)
      // 後でAPI呼び出しを追加
      setNewQuestInput('')
    }
  }

  return (
    <main className="min-h-screen p-4 md:p-8 space-y-8 bg-background text-system-white">
      {/* 上部 40%: すごろくマップ */}
      <div className="max-w-4xl mx-auto">
        <SystemCard title="DUNGEON MAP (ダンジョン探索状況)">
          <AdventureMap
            tiles={DUMMY_TILES}
            currentTileIndex={currentTileIndex}
            onTileClick={(index) => {
              // 後で移動ロジックを追加
              console.log('Tile clicked:', index)
            }}
          />
        </SystemCard>
      </div>

      {/* 下部 60%: タスクリスト */}
      <div className="max-w-4xl mx-auto">
        <SystemCard title="ACTIVE QUESTS (アクティブクエスト)">
          {/* 新規クエスト追加エリア */}
          <div className="mb-6 pb-6 border-b border-system-blue/30">
            <div className="flex gap-4">
              <CyberInput
                placeholder="NEW QUEST PROTOCOL..."
                value={newQuestInput}
                onChange={(e) => setNewQuestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleInitializeQuest()
                  }
                }}
                className="flex-1"
              />
              <CyberButton onClick={handleInitializeQuest}>
                INITIALIZE
              </CyberButton>
            </div>
          </div>

          {/* クエストリスト */}
          <TaskList />
        </SystemCard>
      </div>
    </main>
  )
}

