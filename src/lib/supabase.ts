import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type-safe database helpers
export const db = {
  projects: {
    async getAll(userId: string) {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },

    async create(project: {
      user_id: string
      name: string
      description?: string | null
      death_date: string
      death_cause: string
      epitaph?: string | null
      tech_stack: string[]
    }) {
      const { data, error } = await supabase
        .from('projects')
        .insert([project])
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    },

    async update(id: string, updates: Partial<{
      name: string
      description: string | null
      epitaph: string | null
      revival_status: string
    }>) {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    }
  },

  postMortems: {
    async getByProjectId(projectId: string) {
      const { data, error } = await supabase
        .from('post_mortems')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle()
      
      if (error) throw error
      return data
    },

    async create(postMortem: {
      project_id: string
      what_problem?: string | null
      what_went_wrong?: string | null
      lessons_learned?: string | null
    }) {
      const { data, error } = await supabase
        .from('post_mortems')
        .insert([postMortem])
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async update(id: string, updates: Partial<{
      what_problem: string | null
      what_went_wrong: string | null
      lessons_learned: string | null
    }>) {
      const { data, error } = await supabase
        .from('post_mortems')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('post_mortems')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    }
  },

  aiInsights: {
    async getByPostMortemId(postMortemId: string) {
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('post_mortem_id', postMortemId)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      return data
    },

    async create(insight: {
      project_id: string
      post_mortem_id: string
      insight_type: 'pattern_recognition' | 'coaching' | 'questions' | 'strategies'
      content: string
      confidence_score?: number
    }) {
      const { data, error } = await supabase
        .from('ai_insights')
        .insert([insight])
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async deleteByPostMortemId(postMortemId: string) {
      const { error } = await supabase
        .from('ai_insights')
        .delete()
        .eq('post_mortem_id', postMortemId)
      
      if (error) throw error
    }
  },

  // Pattern tracking tables
  userPatterns: {
    async getByUserId(userId: string) {
      const { data, error } = await supabase
        .from('user_patterns')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('confidence_score', { ascending: false })
      
      if (error) throw error
      return data
    },

    async create(pattern: {
      user_id: string
      pattern_type: string
      pattern_name: string
      pattern_value: Record<string, any>
      frequency?: number
      confidence_score?: number
    }) {
      const { data, error } = await supabase
        .from('user_patterns')
        .insert([pattern])
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async incrementFrequency(id: string) {
      const { data, error } = await supabase
        .from('user_patterns')
        .update({ 
          frequency: supabase.rpc('increment', { x: 1 }),
          last_detected_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  },

  projectMetadata: {
    async getByProjectId(projectId: string) {
      const { data, error } = await supabase
        .from('project_metadata')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle()
      
      if (error) throw error
      return data
    },

    async create(metadata: {
      project_id: string
      total_days_active?: number
      first_commit_date?: string
      last_commit_date?: string
      peak_activity_day?: string
      peak_activity_hour?: number
      estimated_lines_of_code?: number
      estimated_commit_count?: number
      libraries_count?: number
      files_count?: number
      first_commit_type?: string
      has_readme?: boolean
      has_tests?: boolean
      has_documentation?: boolean
      github_repo_url?: string
    }) {
      const { data, error } = await supabase
        .from('project_metadata')
        .insert([metadata])
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async update(id: string, updates: Partial<{
      total_days_active: number
      estimated_lines_of_code: number
      estimated_commit_count: number
      libraries_count: number
      files_count: number
      has_readme: boolean
      has_tests: boolean
      has_documentation: boolean
    }>) {
      const { data, error } = await supabase
        .from('project_metadata')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  },

  patternInsights: {
    async getByUserId(userId: string, limit: number = 10) {
      const { data, error } = await supabase
        .from('pattern_insights')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('confidence_score', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return data
    },

    async create(insight: {
      user_id: string
      insight_text: string
      insight_type: string
      related_pattern_ids?: string[]
      confidence_score?: number
      projects_analyzed?: number
    }) {
      const { data, error } = await supabase
        .from('pattern_insights')
        .insert([insight])
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async markShown(id: string) {
      const { data, error } = await supabase
        .from('pattern_insights')
        .update({ 
          times_shown: supabase.rpc('increment', { x: 1 }),
          last_validated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async submitFeedback(id: string, feedback: 'helpful' | 'not_helpful' | 'irrelevant') {
      const { data, error } = await supabase
        .from('pattern_insights')
        .update({ user_feedback: feedback })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  },

  userLearningMetrics: {
    async getByUserId(userId: string, metricName?: string) {
      let query = supabase
        .from('user_learning_metrics')
        .select('*')
        .eq('user_id', userId)
        .order('measurement_date', { ascending: false })

      if (metricName) {
        query = query.eq('metric_name', metricName)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data
    },

    async create(metric: {
      user_id: string
      metric_name: string
      metric_value: number
      measurement_period: string
      measurement_date: string
      previous_value?: number
      change_percentage?: number
      trend?: string
    }) {
      const { data, error } = await supabase
        .from('user_learning_metrics')
        .insert([metric])
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  },

  patternTriggers: {
    async getAll() {
      const { data, error } = await supabase
        .from('pattern_triggers')
        .select('*')
        .eq('is_active', true)
      
      if (error) throw error
      return data
    }
  },

  pinnedInsights: {
    async getByUserId(userId: string) {
      const { data, error } = await supabase
        .from('pinned_insights')
        .select(`
          *,
          ai_insight:ai_insights(*),
          project:projects(id, name, epitaph, death_date),
          pattern_insight:pattern_insights(*)
        `)
        .eq('user_id', userId)
        .order('pinned_at', { ascending: false })
      
      if (error) throw error
      return data
    },

    async pin(insight: {
      user_id: string
      insight_type: 'project_specific' | 'pattern_analysis'
      ai_insight_id?: string
      project_id?: string
      pattern_insight_id?: string
      notes?: string
      // New fields to store exact content at time of pinning
      pinned_content?: string
      pinned_insight_type?: string
      pinned_confidence_score?: number
      project_name?: string
      project_epitaph?: string
    }) {
      const { data, error } = await supabase
        .from('pinned_insights')
        .insert([insight])
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async unpin(pinnedInsightId: string) {
      const { error } = await supabase
        .from('pinned_insights')
        .delete()
        .eq('id', pinnedInsightId)
      
      if (error) throw error
    },

    async isPinned(userId: string, insightId: string, type: 'project_specific' | 'pattern_analysis') {
      const column = type === 'project_specific' ? 'ai_insight_id' : 'pattern_insight_id'
      
      const { data, error } = await supabase
        .from('pinned_insights')
        .select('id')
        .eq('user_id', userId)
        .eq(column, insightId)
        .maybeSingle()
      
      if (error) throw error
      return !!data
    },

    async updateNotes(pinnedInsightId: string, notes: string) {
      const { data, error } = await supabase
        .from('pinned_insights')
        .update({ notes })
        .eq('id', pinnedInsightId)
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  },

  auth: {
    async signUp(email: string, password: string) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) throw error
      return data
    },

    async signIn(email: string, password: string) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      return data
    },

    async signOut() {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },

    async getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    }
  }
}