import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { detectUserPatterns, generateCoachingInsights } from '@/lib/claude'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Two-Pass Pattern Analysis - Orchestrator API (Direct Function Calls)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    console.log('🚀 Starting Two-Pass AI Analysis...')

    // Create service client to bypass RLS
    const supabaseServer = createClient(supabaseUrl, supabaseServiceKey)

    // Get all projects for the user
    const { data: projects, error: projectsError } = await supabaseServer
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (projectsError) {
      console.error('Error fetching projects:', projectsError)
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }

    if (!projects || projects.length < 2) {
      return NextResponse.json({ 
        message: 'Not enough projects for pattern detection',
        pass1_patterns: [],
        pass2_insights: [],
        projectsAnalyzed: projects?.length || 0,
        needs_more_data: true
      })
    }

    // Pass 1: Pattern Detection
    console.log('📊 Pass 1: Pattern Detection')
    console.log('Projects to analyze:', projects.length)
    
    const detectedPatterns = await detectUserPatterns(projects, userId)
    console.log('✅ Pattern detection complete:', detectedPatterns.length, 'patterns')

    // Clear existing patterns before re-analysis to prevent duplicates
    console.log('🧹 Clearing existing patterns to prevent duplicates...')
    await supabaseServer
      .from('user_patterns')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('is_active', true)

    // Store detected patterns in database
    if (detectedPatterns.length > 0) {
      for (const pattern of detectedPatterns) {
        try {
          // Create new pattern (since we cleared existing ones)
          await supabaseServer
            .from('user_patterns')
            .insert({
              user_id: userId,
              pattern_type: 'behavioral',
              pattern_name: pattern.pattern_name,
              pattern_value: {
                evidence: pattern.evidence,
                description: pattern.description,
                ai_generated: true,
                first_analysis: new Date().toISOString()
              },
              frequency: 1,
              confidence_score: pattern.confidence,
              first_detected_at: new Date().toISOString(),
              last_detected_at: new Date().toISOString()
            })
          
          console.log('✅ Successfully stored pattern:', pattern.pattern_name)
        } catch (error) {
          console.error('Error storing pattern:', pattern.pattern_name, error)
        }
      }
    }

    // Pass 2: Coaching Insights (only if patterns were detected)
    let coachingInsights: any[] = []
    if (detectedPatterns.length > 0) {
      console.log('🧠 Pass 2: Coaching Insights')
      
      // Clear existing insights before generating new ones (to prevent duplicates)
      console.log('🧹 Clearing existing insights to prevent duplicates...')
      await supabaseServer
        .from('pattern_insights')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('is_active', true)
      
      // Get stored patterns for coaching
      const { data: storedPatterns } = await supabaseServer
        .from('user_patterns')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('confidence_score', { ascending: false })

      if (storedPatterns && storedPatterns.length > 0) {
        coachingInsights = await generateCoachingInsights(storedPatterns, projects.slice(0, 5), userId)
        console.log('✅ Coaching insights complete:', coachingInsights.length, 'insights')

        // Store coaching insights
        if (coachingInsights.length > 0) {
          for (const insight of coachingInsights) {
            try {
              // Convert pattern names to UUIDs
              const relatedPatternIds = []
              if (insight.related_patterns && insight.related_patterns.length > 0) {
                for (const patternName of insight.related_patterns) {
                  const matchingPattern = storedPatterns.find(p => p.pattern_name === patternName)
                  if (matchingPattern) {
                    relatedPatternIds.push(matchingPattern.id)
                  }
                }
              }

              await supabaseServer
                .from('pattern_insights')
                .insert({
                  user_id: userId,
                  insight_text: insight.insight_text,
                  insight_type: insight.insight_type,
                  confidence_score: insight.confidence,
                  projects_analyzed: projects.length,
                  related_pattern_ids: relatedPatternIds,
                  is_active: true
                })
              
              console.log('✅ Successfully stored coaching insight')
            } catch (error) {
              console.error('❌ Exception storing coaching insight:', error)
            }
          }
        }
      }
    }

    return NextResponse.json({
      message: 'Two-pass AI analysis completed',
      pass1_patterns: detectedPatterns,
      pass2_insights: coachingInsights,
      projectsAnalyzed: projects.length,
      system: 'two_pass_ai_direct',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in two-pass analysis:', error)
    return NextResponse.json(
      { error: 'Internal server error during AI analysis' },
      { status: 500 }
    )
  }
}