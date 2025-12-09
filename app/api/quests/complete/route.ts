import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabase as anonSupabase, isSupabaseConfigured } from '@/lib/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: Request) {
  console.log('[completeQuest] start')

  const { questId } = await request.json().catch(() => ({ questId: null }))
  if (!questId || typeof questId !== 'string') {
    return NextResponse.json({ error: 'questId is required' }, { status: 400 })
  }

  // クライアント選択: service role があれば優先、なければ anon にフォールバック
  const supabase =
    supabaseUrl && supabaseServiceKey
      ? createClient(supabaseUrl, supabaseServiceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        })
      : isSupabaseConfigured()
      ? anonSupabase
      : null

  if (!supabase) {
    return NextResponse.json(
      { error: 'Supabase not configured (set NEXT_PUBLIC_SUPABASE_URL and key)' },
      { status: 500 }
    )
  }

  const payload = {
    status: 'COMPLETED',
    is_completed: true,
    completed_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('quests')
    .update(payload)
    .eq('id', questId)
    .select()
    .single()

  console.log('[completeQuest] questId =', questId, 'data =', data, 'error =', error)

  if (error) {
    console.error('Supabase error in completeQuest route', error)
    return NextResponse.json(
      { error: error.message ?? 'Failed to complete quest', details: error },
      { status: 500 }
    )
  }

  return NextResponse.json({ quest: data })
}


