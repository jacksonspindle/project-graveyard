import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { generateCoachingInsights } from '@/lib/claude'

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

    // Get user's detected patterns
    const { data: patterns, error: patternsError } = await supabaseServer
      .from('user_patterns')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('confidence_score', { ascending: false })

    if (patternsError) {
      console.error('Error fetching patterns:', patternsError)
      return NextResponse.json({ error: 'Failed to fetch patterns' }, { status: 500 })
    }

    // Get recent projects for context (last 5 only)
    const { data: projects, error: projectsError } = await supabaseServer
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    if (projectsError) {
      console.error('Error fetching projects:', projectsError) 
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }

    if (!patterns || patterns.length === 0) {
      return NextResponse.json({
        message: 'No patterns detected yet. Run pattern detection first.',
        insights: [],
        needs_pattern_detection: true
      })
    }

    // Clear existing insights before generating new ones (to prevent duplicates)
    console.log('🧹 Clearing existing insights to prevent duplicates...')
    await supabaseServer
      .from('pattern_insights')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('is_active', true)

    // Generate coaching insights using detected patterns
    console.log('🧠 Generating coaching insights with Claude...')
    console.log('Using patterns:', patterns.length)
    console.log('Pattern details:', patterns.map(p => ({ name: p.pattern_name, confidence: p.confidence_score })))
    console.log('Recent projects:', projects?.length || 0)
    
    const coachingInsights = await generateCoachingInsights(patterns, projects || [], userId)
    
    console.log('✅ Coaching insights generated!')
    console.log('Insights created:', coachingInsights.length)

    // Store coaching insights in database
    if (coachingInsights.length > 0) {
      console.log('💾 Attempting to store', coachingInsights.length, 'insights')
      let storedCount = 0
      
      for (const insight of coachingInsights) {
        try {
          console.log('💾 Storing insight:', insight.insight_type, '-', insight.insight_text.substring(0, 50) + '...')
          
          // Convert pattern names to UUIDs
          const relatedPatternIds = []
          if (insight.related_patterns && insight.related_patterns.length > 0) {
            for (const patternName of insight.related_patterns) {
              const matchingPattern = patterns.find(p => p.pattern_name === patternName)
              if (matchingPattern) {
                relatedPatternIds.push(matchingPattern.id)
              }
            }
          }

          const { data, error } = await supabaseServer
            .from('pattern_insights')
            .insert({
              user_id: userId,
              insight_text: insight.insight_text,
              insight_type: insight.insight_type,
              confidence_score: insight.confidence,
              projects_analyzed: projects?.length || 0,
              related_pattern_ids: relatedPatternIds,
              is_active: true
            })
            .select()
          
          if (error) {
            console.error('❌ Database error storing insight:', error)
          } else {
            console.log('✅ Successfully stored coaching insight:', data)
            storedCount++
          }
        } catch (error) {
          console.error('❌ Exception storing coaching insight:', error)
        }
      }
      
      console.log(`💾 Storage complete: ${storedCount}/${coachingInsights.length} insights stored`)
    } else {
      console.log('⚠️ No coaching insights to store')
    }

    return NextResponse.json({
      message: 'Coaching insights generated',
      insights: coachingInsights,
      patterns_used: patterns.length,
      projects_analyzed: projects?.length || 0,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error generating coaching insights:', error)
    return NextResponse.json(
      { error: 'Internal server error during coaching analysis' },
      { status: 500 }
    )
  }
}