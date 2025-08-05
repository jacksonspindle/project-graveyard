import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Dashboard data API - bypasses RLS issues
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Create service client to bypass RLS
    const supabaseServer = createClient(supabaseUrl, supabaseServiceKey)

    console.log('📊 Loading dashboard data for user:', userId)

    // Load all data with service client
    const [patternsResult, insightsResult, metricsResult] = await Promise.all([
      supabaseServer
        .from('user_patterns')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('confidence_score', { ascending: false }),
      
      supabaseServer
        .from('pattern_insights')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('confidence_score', { ascending: false })
        .limit(5),
      
      supabaseServer
        .from('user_learning_metrics')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)
    ])

    console.log('✅ Dashboard data loaded:')
    console.log('- Patterns:', patternsResult.data?.length || 0)
    console.log('- Insights:', insightsResult.data?.length || 0)  
    console.log('- Metrics:', metricsResult.data?.length || 0)

    // Check for errors
    if (patternsResult.error) {
      console.error('Patterns error:', patternsResult.error)
    }
    if (insightsResult.error) {
      console.error('Insights error:', insightsResult.error)
    }
    if (metricsResult.error) {
      console.error('Metrics error:', metricsResult.error)
    }

    return NextResponse.json({
      patterns: patternsResult.data || [],
      insights: insightsResult.data || [],
      metrics: metricsResult.data || [],
      errors: {
        patterns: patternsResult.error?.message,
        insights: insightsResult.error?.message,
        metrics: metricsResult.error?.message
      }
    })

  } catch (error) {
    console.error('Error loading dashboard data:', error)
    return NextResponse.json(
      { error: 'Internal server error loading dashboard data' },
      { status: 500 }
    )
  }
}