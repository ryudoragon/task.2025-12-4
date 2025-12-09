'use client'

import { FocusMode } from '@/components/focus/FocusMode'

type FocusPageProps = {
  params: { questId: string }
  searchParams?: { title?: string }
}

export default function FocusPage({ params, searchParams }: FocusPageProps) {
  const questTitle = searchParams?.title ? decodeURIComponent(searchParams.title) : undefined
  return <FocusMode questId={params.questId} questTitle={questTitle} />
}


