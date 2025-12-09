import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabase as anonSupabase, isSupabaseConfigured } from '@/lib/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET() {
  console.log('[listQuests] start')

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
      { quests: [], error: 'Supabase not configured (set NEXT_PUBLIC_SUPABASE_URL and key)' },
      { status: 200 }
    )
  }

  const { data, error } = await supabase
    .from('quests')
    .select('*')
    .order('created_at', { ascending: true })

  console.log('[listQuests] data length =', data?.length ?? 0, 'error =', error)

  if (error) {
    console.error('Supabase error in list quests', error)
    return NextResponse.json(
      { quests: [], error: error.message ?? 'Failed to fetch quests', details: error },
      { status: 200 }
    )
  }

  return NextResponse.json({ quests: data ?? [] })
}


