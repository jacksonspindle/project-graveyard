import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseServer = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, insightType } = body // insightType is optional filter

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Build the query with optional filtering
    let query = supabaseServer
      .from('pinned_insights')
      .select(`
        *,
        ai_insight:ai_insights(
          id,
          content,
          insight_type,
          confidence_score,
          created_at
        ),
        project:projects(
          id,
          name,
          epitaph,
          death_cause,
          death_date
        ),
        pattern_insight:pattern_insights(
          id,
          insight_text,
          insight_type,
          confidence_score,
          projects_analyzed,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('pinned_at', { ascending: false })

    // Apply filter if specified
    if (insightType && (insightType === 'project_specific' || insightType === 'pattern_analysis')) {
      query = query.eq('insight_type', insightType)
    }

    const { data: pinnedInsights, error } = await query

    if (error) {
      console.error('Error fetching pinned insights:', error)
      return NextResponse.json(
        { error: 'Failed to fetch pinned insights' },
        { status: 500 }
      )
    }

    // Process the data to ensure proper structure
    const processedInsights = pinnedInsights?.map(insight => ({
      ...insight,
      // Ensure the joined data is properly structured
      ai_insight: insight.ai_insight || null,
      project: insight.project || null,
      pattern_insight: insight.pattern_insight || null
    })) || []

    // Separate insights by type for easier frontend consumption
    const projectInsights = processedInsights.filter(i => i.insight_type === 'project_specific')
    const patternInsights = processedInsights.filter(i => i.insight_type === 'pattern_analysis')

    return NextResponse.json({
      success: true,
      data: {
        all: processedInsights,
        project_specific: projectInsights,
        pattern_analysis: patternInsights,
        total_count: processedInsights.length,
        project_count: projectInsights.length,
        pattern_count: patternInsights.length
      }
    })

  } catch (error) {
    console.error('Error in get pinned insights API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET method for direct URL access (optional)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const insightType = searchParams.get('insightType')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      )
    }

    // Forward to POST method with proper payload
    return await POST(new NextRequest(request.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, insightType })
    }))

  } catch (error) {
    console.error('Error in GET pinned insights API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}