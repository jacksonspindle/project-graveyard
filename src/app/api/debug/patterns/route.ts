import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Debug endpoint to check pattern data
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    // Use service role to bypass RLS for debugging
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    if (action === 'list_patterns') {
      const { data: patterns, error: patternsError } = await supabase
        .from('user_patterns')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      const { data: insights, error: insightsError } = await supabase
        .from('pattern_insights')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      const { data: metrics, error: metricsError } = await supabase
        .from('user_learning_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      return NextResponse.json({
        patterns: patterns || [],
        insights: insights || [],
        metrics: metrics || [],
        errors: {
          patterns: patternsError?.message,
          insights: insightsError?.message,
          metrics: metricsError?.message
        }
      })
    }

    if (action === 'clear_patterns') {
      // Clear all pattern data for a fresh start
      const { error: patternsError } = await supabase
        .from('user_patterns')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

      const { error: insightsError } = await supabase
        .from('pattern_insights')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

      const { error: metricsError } = await supabase
        .from('user_learning_metrics')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

      const { error: metadataError } = await supabase
        .from('project_metadata')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

      return NextResponse.json({
        message: 'All pattern data cleared',
        errors: {
          patterns: patternsError?.message,
          insights: insightsError?.message,
          metrics: metricsError?.message,
          metadata: metadataError?.message
        }
      })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('Debug patterns error:', error)
    return NextResponse.json({ 
      error: 'Debug failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}