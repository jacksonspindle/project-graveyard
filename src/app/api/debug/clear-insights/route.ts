import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Debug endpoint to clear all insights for a user
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Create service client to bypass RLS
    const supabaseServer = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🧹 Clearing all insights and patterns for user:', userId)

    // Set all existing insights as inactive
    const { error: insightsError } = await supabaseServer
      .from('pattern_insights')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('is_active', true)

    if (insightsError) {
      console.error('Error clearing insights:', insightsError)
      return NextResponse.json({ error: 'Failed to clear insights' }, { status: 500 })
    }

    // Set all existing patterns as inactive
    const { error: patternsError } = await supabaseServer
      .from('user_patterns')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('is_active', true)

    if (patternsError) {
      console.error('Error clearing patterns:', patternsError)
      return NextResponse.json({ error: 'Failed to clear patterns' }, { status: 500 })
    }

    console.log('✅ All insights and patterns cleared for user')

    return NextResponse.json({
      message: 'All insights and patterns cleared successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in clear insights:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}