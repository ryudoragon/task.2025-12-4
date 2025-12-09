import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabase as anonSupabase, isSupabaseConfigured } from '@/lib/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: Request) {
  console.log('[createQuest] start')
  const body = await request.json().catch(() => ({}))
  const { title } = body

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

  // Minimal payload for locked schema
  // We only send what the table definitely supports based on "list" API results being empty but existing
  // Actually "list" returned empty array, so we assume at least ID/TITLE exist.
  // The goal is to avoid 500 Generic Error from "column does not exist"
  const payload = {
    title,
    // description, // Removed
    // difficulty, // Removed
    // ... all removed
    status: 'TODO',
    is_completed: false,
    // Add user_id if needed, but currently auth is open/anon or handled by RLS?
    // body doesn't passed userId. Let's assume table might auto-handle or is loose.
    // If table requires user_id, this might fail, but let's try minimal first.
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


