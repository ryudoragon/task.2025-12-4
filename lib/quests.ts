export type QuestRecord = {
  id: string
  title: string
  description?: string
  difficulty: string
  planned_minutes?: number
  due_at?: string
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | string
  is_completed?: boolean
  completed_at?: string
  is_daily?: boolean
  is_urgent?: boolean
  is_top_priority?: boolean
  timer_color?: string
  created_at?: string
  updated_at?: string
}

export async function completeQuest(questId: string) {
  const res = await fetch('/api/quests/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questId }),
  })
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(detail.error ?? detail.message ?? res.statusText ?? 'クエスト完了に失敗しました')
  }
  const body = (await res.json()) as { quest?: QuestRecord }
  return body.quest
}

export async function fetchQuests(): Promise<QuestRecord[]> {
  const res = await fetch('/api/quests/list', { cache: 'no-store' }).catch(() => null)
  if (!res || !res.ok) return []
  const body = (await res.json().catch(() => ({ quests: [] }))) as { quests?: QuestRecord[] }
  if (body.error) {
    console.error('fetchQuests error', body.error)
  }
  return body.quests ?? []
}

export async function createQuest(payload: {
  title: string
  description?: string
  difficulty?: string
  plannedMinutes?: number
  dueAt?: string | null
  isDaily?: boolean
  isUrgent?: boolean
  isTopPriority?: boolean
  timerColor?: string
}): Promise<QuestRecord> {
  const res = await fetch('/api/quests/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: payload.title,
      description: payload.description,
      difficulty: payload.difficulty ?? 'NORMAL',
      planned_minutes: payload.plannedMinutes ?? 25,
      due_at: payload.dueAt ?? null,
      is_daily: payload.isDaily ?? false,
      is_urgent: payload.isUrgent ?? false,
      is_top_priority: payload.isTopPriority ?? false,
      timer_color: payload.timerColor ?? 'red',
    }),
  })
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(detail.error ?? detail.message ?? res.statusText ?? 'クエスト作成に失敗しました')
  }
  const body = (await res.json()) as { quest?: QuestRecord }
  if (!body.quest) {
    throw new Error('クエスト作成に失敗しました')
  }
  return body.quest
}


