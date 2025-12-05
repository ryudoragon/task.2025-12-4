'use client'

import { SystemCard } from '@/components/ui/SystemCard'

interface QuestNotificationProps {
  questTitle?: string
  questDescription?: string
  xpReward?: number
  coinReward?: number
  onAccept?: () => void
}

export function QuestNotification({
  questTitle = '【デイリークエスト: 準備】',
  questDescription = '今日のタスクを整理せよ',
  xpReward = 100,
  coinReward = 50,
  onAccept,
}: QuestNotificationProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景オーバーレイ */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      {/* モーダルコンテンツ */}
      <div className="relative z-10 w-full max-w-md">
        <SystemCard className="p-6">
          {/* ヘッダー: SYSTEM ALERT */}
          <div className="mb-4 text-center">
            <h2 className="font-heading text-xl font-bold text-system-red animate-pulse-fast drop-shadow-[0_0_8px_rgba(231,76,60,0.8)]">
              SYSTEM ALERT
            </h2>
          </div>

          {/* メッセージ */}
          <div className="mb-6 space-y-2">
            {/* メインメッセージ */}
            <h3 className="font-heading text-2xl font-bold text-system-blue text-center drop-shadow-[0_0_8px_rgba(46,134,222,0.8)]">
              {questTitle}
            </h3>
            
            {/* サブメッセージ */}
            <p className="font-mono text-sm text-system-white/80 text-center">
              {questDescription}
            </p>
          </div>

          {/* 報酬表示 */}
          <div className="mb-6 border-t border-system-blue/30 pt-4">
            <div className="flex items-center justify-center gap-6">
              <span className="font-mono text-xs text-system-white/60 uppercase tracking-wider">
                REWARDS:
              </span>
              <div className="flex items-center gap-4">
                <span className="font-mono text-base text-system-gold drop-shadow-[0_0_8px_rgba(241,196,15,0.6)]">
                  XP: {xpReward}
                </span>
                <span className="font-mono text-base text-system-gold drop-shadow-[0_0_8px_rgba(241,196,15,0.6)]">
                  Coins: {coinReward}
                </span>
              </div>
            </div>
          </div>

          {/* ACCEPT ボタン */}
          <div className="flex justify-center">
            <button
              onClick={onAccept}
              className="
                relative
                px-8 py-3
                bg-system-blue
                text-system-white
                font-heading font-bold text-lg
                uppercase tracking-wider
                border-2 border-system-blue
                shadow-system-blue-md
                transition-all duration-300
                hover:shadow-[0_0_20px_rgba(46,134,222,0.9),0_0_40px_rgba(46,134,222,0.6),inset_0_0_10px_rgba(46,134,222,0.4)]
                hover:scale-105
                hover:brightness-110
                active:scale-95
                group
              "
            >
              <span className="relative z-10 drop-shadow-[0_0_4px_rgba(0,0,0,0.5)]">
                ACCEPT
              </span>
              
              {/* ボタンの発光エフェクト（ホバー時） */}
              <div className="absolute inset-0 bg-system-blue opacity-0 group-hover:opacity-50 transition-opacity duration-300 blur-xl -z-10"></div>
            </button>
          </div>
        </SystemCard>
      </div>
    </div>
  )
}

