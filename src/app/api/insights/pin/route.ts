import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseServer = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      userId, 
      insightId, 
      insightType,  // 'project_specific' | 'pattern_analysis'
      projectId,
      notes 
    } = body

    if (!userId || !insightId || !insightType) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, insightId, insightType' },
        { status: 400 }
      )
    }

    if (insightType === 'project_specific' && !projectId) {
      return NextResponse.json(
        { error: 'projectId is required for project_specific insights' },
        { status: 400 }
      )
    }

    // Verify the insight exists and belongs to the user
    if (insightType === 'project_specific') {
      const { data: aiInsight, error: aiError } = await supabaseServer
        .from('ai_insights')
        .select('id, project_id')
        .eq('id', insightId)
        .single()

      if (aiError || !aiInsight) {
        return NextResponse.json(
          { error: 'AI insight not found' },
          { status: 404 }
        )
      }

      // Verify user owns the project
      const { data: project, error: projectError } = await supabaseServer
        .from('projects')
        .select('user_id')
        .eq('id', aiInsight.project_id)
        .single()

      if (projectError || !project || project.user_id !== userId) {
        return NextResponse.json(
          { error: 'Unauthorized: Project not found or access denied' },
          { status: 403 }
        )
      }
    } else {
      // pattern_analysis
      const { data: patternInsight, error: patternError } = await supabaseServer
        .from('pattern_insights')
        .select('id, user_id')
        .eq('id', insightId)
        .single()

      if (patternError || !patternInsight || patternInsight.user_id !== userId) {
        return NextResponse.json(
          { error: 'Pattern insight not found or access denied' },
          { status: 404 }
        )
      }
    }

    // Check if already pinned
    const column = insightType === 'project_specific' ? 'ai_insight_id' : 'pattern_insight_id'
    const { data: existingPin } = await supabaseServer
      .from('pinned_insights')
      .select('id')
      .eq('user_id', userId)
      .eq(column, insightId)
      .maybeSingle()

    if (existingPin) {
      return NextResponse.json(
        { error: 'Insight is already pinned' },
        { status: 409 }
      )
    }

    // Create the pinned insight
    const pinData = {
      user_id: userId,
      insight_type: insightType,
      notes: notes || null,
      ...(insightType === 'project_specific' 
        ? { ai_insight_id: insightId, project_id: projectId }
        : { pattern_insight_id: insightId }
      )
    }

    const { data: pinnedInsight, error: pinError } = await supabaseServer
      .from('pinned_insights')
      .insert([pinData])
      .select()
      .single()

    if (pinError) {
      console.error('Error pinning insight:', pinError)
      return NextResponse.json(
        { error: 'Failed to pin insight' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      pinnedInsight 
    })

  } catch (error) {
    console.error('Error in pin insight API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const insightId = searchParams.get('insightId')
    const insightType = searchParams.get('insightType')

    if (!userId || !insightId || !insightType) {
      return NextResponse.json(
        { error: 'Missing required parameters: userId, insightId, insightType' },
        { status: 400 }
      )
    }

    // Find the pinned insight
    const column = insightType === 'project_specific' ? 'ai_insight_id' : 'pattern_insight_id'
    const { data: pinnedInsight, error: findError } = await supabaseServer
      .from('pinned_insights')
      .select('id')
      .eq('user_id', userId)
      .eq(column, insightId)
      .maybeSingle()

    if (findError) {
      console.error('Error finding pinned insight:', findError)
      return NextResponse.json(
        { error: 'Failed to find pinned insight' },
        { status: 500 }
      )
    }

    if (!pinnedInsight) {
      return NextResponse.json(
        { error: 'Pinned insight not found' },
        { status: 404 }
      )
    }

    // Delete the pinned insight
    const { error: deleteError } = await supabaseServer
      .from('pinned_insights')
      .delete()
      .eq('id', pinnedInsight.id)

    if (deleteError) {
      console.error('Error unpinning insight:', deleteError)
      return NextResponse.json(
        { error: 'Failed to unpin insight' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Insight unpinned successfully'
    })

  } catch (error) {
    console.error('Error in unpin insight API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}