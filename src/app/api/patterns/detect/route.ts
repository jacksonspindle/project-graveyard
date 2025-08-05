import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { detectUserPatterns } from '@/lib/claude'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

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
        patterns: [],
        needs_more_data: true
      })
    }

    // AI Pattern Detection with Claude - FOCUSED TASK
    console.log('🔍 Starting focused pattern detection with Claude...')
    console.log('Projects to analyze:', projects.length)
    console.log('Project sample:', projects[0] ? {
      name: projects[0].name,
      tech_stack: projects[0].tech_stack,
      death_cause: projects[0].death_cause
    } : 'No projects')
    
    const detectedPatterns = await detectUserPatterns(projects, userId)
    
    console.log('✅ Pattern detection complete!')
    console.log('Detected patterns:', detectedPatterns.length)
    console.log('Pattern details:', detectedPatterns)

    // Store detected patterns in database
    if (detectedPatterns.length > 0) {
      for (const pattern of detectedPatterns) {
        try {
          // Check if pattern already exists for this user
          const { data: existingPattern } = await supabaseServer
            .from('user_patterns')
            .select('id')
            .eq('user_id', userId)
            .eq('pattern_name', pattern.pattern_name)
            .maybeSingle()

          if (existingPattern) {
            // Update existing pattern
            await supabaseServer
              .from('user_patterns')
              .update({
                confidence_score: pattern.confidence,
                pattern_value: {
                  evidence: pattern.evidence,
                  description: pattern.description,
                  ai_generated: true,
                  last_analysis: new Date().toISOString()
                },
                frequency: supabaseServer.rpc('increment_frequency'),
                last_detected_at: new Date().toISOString()
              })
              .eq('id', existingPattern.id)
          } else {
            // Create new pattern
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
          }
          
          console.log('✅ Successfully stored pattern:', pattern.pattern_name)
        } catch (error) {
          console.error('Error storing pattern:', pattern.pattern_name, error)
        }
      }
    }

    return NextResponse.json({
      message: 'Pattern detection completed',
      patterns: detectedPatterns,
      projectsAnalyzed: projects.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in pattern detection:', error)
    return NextResponse.json(
      { error: 'Internal server error during pattern detection' },
      { status: 500 }
    )
  }
}