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
      description?: string
      death_date: string
      death_cause: string
      epitaph?: string
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
      description: string
      epitaph: string
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
        .single()
      
      if (error) throw error
      return data
    },

    async create(postMortem: {
      project_id: string
      what_problem?: string
      what_went_wrong?: string
      lessons_learned?: string
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
      what_problem: string
      what_went_wrong: string
      lessons_learned: string
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