import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabase as anonSupabase, isSupabaseConfigured } from '@/lib/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: Request) {
  console.log('[createQuest] start')
  const body = await request.json().catch(() => ({}))
  const {
    title,
    description,
    difficulty = 'NORMAL',
    planned_minutes = 25,
    due_at = null,
    is_daily = false,
    is_urgent = false,
    is_top_priority = false,
    timer_color = 'red',
  } = body

  if (!title || typeof title !== 'string') {
    return NextResponse.json({ error: 'title is required' }, { status: 400 })
  }

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
    title,
    description,
    difficulty,
    planned_minutes,
    due_at,
    is_daily,
    is_urgent,
    is_top_priority,
    timer_color,
    status: 'TODO',
    is_completed: false,
  }

  const { data, error } = await supabase
    .from('quests')
    .insert(payload)
    .select()
    .single()

  console.log('[createQuest] payload =', payload, 'data =', data, 'error =', error)

  if (error) {
    return NextResponse.json(
      { error: error.message ?? 'Failed to create quest', details: error },
      { status: 500 }
    )
  }

  return NextResponse.json({ quest: data })
}


