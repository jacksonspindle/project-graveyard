export type DeathCause = 
  | "lost_interest"
  | "over_scoped"
  | "better_solution_existed"
  | "technical_roadblock"
  | "life_got_in_way"
  | "other"

export type RevivalStatus = "buried" | "reviving" | "revived"

export interface Project {
  id: string
  user_id: string
  name: string
  description?: string
  death_date: string
  death_cause: DeathCause
  epitaph?: string
  tech_stack: string[]
  revival_status: RevivalStatus
  created_at: string
  updated_at: string
}

export interface PostMortem {
  id: string
  project_id: string
  what_problem?: string
  what_went_wrong?: string
  lessons_learned?: string
  created_at: string
  updated_at: string
}

export interface CodeSnippet {
  id: string
  project_id: string
  title: string
  code: string
  language: string
  tags: string[]
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export const DEATH_CAUSES: Record<DeathCause, string> = {
  lost_interest: "Lost Interest",
  over_scoped: "Over-scoped",
  better_solution_existed: "Better Solution Existed",
  technical_roadblock: "Technical Roadblock",
  life_got_in_way: "Life Got in the Way",
  other: "Other",
}

export const DEATH_CAUSE_EMOJIS: Record<DeathCause, string> = {
  lost_interest: "😴",
  over_scoped: "📈",
  better_solution_existed: "🏆",
  technical_roadblock: "🧱",
  life_got_in_way: "🌪️",
  other: "❓",
}