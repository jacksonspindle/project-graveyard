import { NextRequest, NextResponse } from 'next/server'
import { analyzePostMortem } from '@/lib/claude'
import { createClient } from '@supabase/supabase-js'

// Create a server-side Supabase client with service role key for bypassing RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServer = createClient(supabaseUrl, supabaseServiceKey)

console.log('Using service role key:', supabaseServiceKey?.substring(0, 20) + '...')
console.log('Service key type:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service_role' : 'anon (fallback)')

export async function POST(request: NextRequest) {
  try {
    console.log('API: Starting post-mortem analysis...')
    
    // Skip authentication for now - we'll handle it client-side
    // TODO: Implement proper server-side auth later

    const body = await request.json()
    console.log('API: Request body:', { projectId: body.projectId, postMortemId: body.postMortemId })
    const { projectId, postMortemId } = body

    if (!projectId || !postMortemId) {
      return NextResponse.json(
        { error: 'Project ID and Post-Mortem ID are required' },
        { status: 400 }
      )
    }

    // Get the project and post-mortem data
    console.log('API: Fetching project and post-mortem data...')
    
    // Use server-side client to bypass RLS
    let project, postMortem
    
    // First, let's check if there are ANY projects in the database
    console.log('API: Checking if projects table exists and has data...')
    const { data: allProjectsTest, error: testError } = await supabaseServer
      .from('projects')
      .select('id, name')
      .limit(5)
    
    console.log('API: All projects test:', allProjectsTest?.length || 0, 'projects found')
    if (testError) console.log('API: Test error:', testError)
    
    try {
      console.log('API: Looking for project ID:', projectId)
      const { data: projectData, error: projectError } = await supabaseServer
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()
      
      console.log('API: Project query result:', { projectData, projectError })
      
      if (projectError) throw projectError
      project = projectData
      console.log('API: Project found:', project?.name || 'null')
    } catch (err) {
      console.log('API: Error fetching project:', err)
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    
    try {
      const { data: postMortemData, error: postMortemError } = await supabaseServer
        .from('post_mortems')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle()
      
      if (postMortemError) throw postMortemError
      postMortem = postMortemData
      console.log('API: Post-mortem found:', !!postMortem, 'ID:', postMortem?.id)
    } catch (err) {
      console.log('API: Error fetching post-mortem:', err)
      return NextResponse.json({ error: 'Post-mortem not found' }, { status: 404 })
    }
    
    if (!postMortem || postMortem.id !== postMortemId) {
      console.log('API: Post-mortem mismatch - expected:', postMortemId, 'got:', postMortem?.id)
      return NextResponse.json({ error: 'Post-mortem not found' }, { status: 404 })
    }

    // Get user's project history with post-mortems for richer pattern analysis
    const { data: allProjects } = await supabaseServer
      .from('projects')
      .select('*')
      .eq('user_id', project.user_id)
      .order('created_at', { ascending: false })
    
    const recentProjects = (allProjects || [])
      .filter(p => p.id !== projectId)
      .slice(0, 3) // Last 3 projects for context
    
    const projectHistory = []
    for (const proj of recentProjects) {
      try {
        const { data: projPostMortem } = await supabaseServer
          .from('post_mortems')
          .select('*')
          .eq('project_id', proj.id)
          .maybeSingle()
          
        projectHistory.push({
          name: proj.name,
          deathCause: proj.death_cause,
          lessonsLearned: projPostMortem?.lessons_learned || '',
          whatWentWrong: projPostMortem?.what_went_wrong || '',
          techStack: proj.tech_stack,
        })
      } catch {
        // No post-mortem for this project, add basic info
        projectHistory.push({
          name: proj.name,
          deathCause: proj.death_cause,
          lessonsLearned: '',
          whatWentWrong: '',
          techStack: proj.tech_stack,
        })
      }
    }

    // Generate AI insights
    console.log('API: Calling Claude API...')
    console.log('API: Anthropic API key exists:', !!process.env.ANTHROPIC_API_KEY)
    
    const insights = await analyzePostMortem({
      projectName: project.name,
      projectDescription: project.description,
      deathCause: project.death_cause,
      techStack: project.tech_stack,
      whatProblem: postMortem.what_problem,
      whatWentWrong: postMortem.what_went_wrong,
      lessonsLearned: postMortem.lessons_learned,
      projectHistory,
    })
    
    console.log('API: Claude returned insights:', insights.length)

    // Delete existing insights for this post-mortem
    await supabaseServer
      .from('ai_insights')
      .delete()
      .eq('post_mortem_id', postMortemId)

    // Save new insights to database
    const savedInsights = []
    for (const insight of insights) {
      const { data: saved, error } = await supabaseServer
        .from('ai_insights')
        .insert({
          project_id: projectId,
          post_mortem_id: postMortemId,
          insight_type: insight.type,
          content: insight.content,
          confidence_score: insight.confidenceScore,
        })
        .select()
        .single()
      
      if (error) throw error
      savedInsights.push(saved)
    }

    console.log('API: Successfully generated insights:', savedInsights.length)
    return NextResponse.json({ insights: savedInsights })

  } catch (error) {
    console.error('API: Error analyzing post-mortem:', error)
    
    // Return more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('API: Error details:', errorMessage)
    
    return NextResponse.json(
      { error: `Failed to analyze post-mortem: ${errorMessage}` },
      { status: 500 }
    )
  }
}