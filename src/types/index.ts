export type DeathCause = 
  | "lost_interest"
  | "over_scoped"
  | "better_solution_existed"
  | "technical_roadblock"
  | "life_got_in_way"
  | "other"

export type RevivalStatus = "buried" | "reviving" | "revived"

export type InsightType = "pattern_recognition" | "coaching" | "questions" | "strategies"

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

export interface AIInsight {
  id: string
  project_id: string
  post_mortem_id: string
  insight_type: InsightType
  content: string
  confidence_score?: number
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

export const INSIGHT_TYPE_LABELS: Record<InsightType, string> = {
  pattern_recognition: "Pattern Recognition",
  coaching: "Coaching Insight",
  questions: "Reflection Questions",
  strategies: "Growth Strategies",
}

export const INSIGHT_TYPE_EMOJIS: Record<InsightType, string> = {
  pattern_recognition: "🔍",
  coaching: "💡",
  questions: "❓",
  strategies: "🎯",
}

// Pattern Recognition Types
export type PatternType = "time_based" | "technical" | "behavioral"

export type PatternName = 
  | "weekend_warrior" 
  | "auth_curse" 
  | "scope_creeper" 
  | "serial_starter" 
  | "perfectionist_paralysis"
  | "evening_coder"
  | "library_overload"
  | "framework_hopper"
  | "progressive_learner"

export type InsightTypePR = "warning" | "recommendation" | "observation" | "prediction"

export type CommitType = "setup" | "auth" | "ui" | "data_model" | "api" | "other"

export type Trend = "improving" | "declining" | "stable"

export interface UserPattern {
  id: string
  user_id: string
  pattern_type: PatternType
  pattern_name: PatternName
  pattern_value: Record<string, any>
  frequency: number
  confidence_score?: number
  first_detected_at: string
  last_detected_at: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProjectMetadata {
  id: string
  project_id: string
  
  // Time-based metrics
  total_days_active?: number
  first_commit_date?: string
  last_commit_date?: string
  peak_activity_day?: string
  peak_activity_hour?: number
  
  // Development metrics
  estimated_lines_of_code?: number
  estimated_commit_count?: number
  libraries_count?: number
  files_count?: number
  
  // Pattern indicators
  first_commit_type?: CommitType
  has_readme: boolean
  has_tests: boolean
  has_documentation: boolean
  
  // GitHub integration (for future)
  github_repo_url?: string
  github_stars: number
  github_forks: number
  github_last_activity?: string
  
  created_at: string
  updated_at: string
}

export interface PatternInsight {
  id: string
  user_id: string
  insight_text: string
  insight_type: InsightTypePR
  related_pattern_ids: string[]
  confidence_score?: number
  projects_analyzed: number
  first_generated_at: string
  last_validated_at: string
  times_shown: number
  user_feedback?: 'helpful' | 'not_helpful' | 'irrelevant'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserLearningMetric {
  id: string
  user_id: string
  metric_name: string
  metric_value: number
  measurement_period: 'weekly' | 'monthly' | 'quarterly' | 'all_time'
  measurement_date: string
  previous_value?: number
  change_percentage?: number
  trend?: Trend
  created_at: string
}

export interface PatternTrigger {
  id: string
  pattern_name: PatternName
  trigger_condition: Record<string, any>
  min_occurrences: number
  confidence_threshold: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PinnedInsight {
  id: string
  user_id: string
  insight_type: 'project_specific' | 'pattern_analysis'
  ai_insight_id?: string
  project_id?: string
  pattern_insight_id?: string
  pinned_at: string
  notes?: string
  created_at: string
  
  // Exact content stored at time of pinning (preserves original text)
  pinned_content?: string
  pinned_insight_type?: string
  pinned_confidence_score?: number
  project_name?: string
  project_epitaph?: string
  
  // Populated joins for display (may be outdated if regenerated)
  ai_insight?: AIInsight
  project?: Project
  pattern_insight?: PatternInsight
}

// Pattern Analysis Results
export interface PatternAnalysis {
  pattern_name: PatternName
  confidence: number
  supporting_projects: string[]
  metadata: Record<string, any>
  insight_text: string
}

export interface UserPatternProfile {
  user_id: string
  active_patterns: UserPattern[]
  recent_insights: PatternInsight[]
  learning_velocity: {
    avg_project_lifespan_trend: Trend
    scope_management_score: number
    technology_consistency_score: number
    completion_rate_trend: Trend
  }
  risk_factors: {
    high_risk_patterns: PatternName[]
    warning_indicators: string[]
    success_patterns: PatternName[]
  }
}

// Pattern Detection Constants
export const PATTERN_LABELS: Record<PatternName, string> = {
  weekend_warrior: "Weekend Warrior",
  auth_curse: "Authentication Curse", 
  scope_creeper: "Scope Creeper",
  serial_starter: "Serial Starter",
  perfectionist_paralysis: "Perfectionist Paralysis",
  evening_coder: "Evening Coder",
  library_overload: "Library Overload",
  framework_hopper: "Framework Hopper",
  progressive_learner: "Progressive Learner",
}

export const PATTERN_EMOJIS: Record<PatternName, string> = {
  weekend_warrior: "🏖️",
  auth_curse: "🔐",
  scope_creeper: "📈",
  serial_starter: "🚀",
  perfectionist_paralysis: "⏸️",
  evening_coder: "🌙",
  library_overload: "📚",
  framework_hopper: "🦘",
  progressive_learner: "📈",
}

export const PATTERN_DESCRIPTIONS: Record<PatternName, string> = {
  weekend_warrior: "Starts projects on weekends but abandons them by Monday",
  auth_curse: "Projects that start with authentication always die quickly",
  scope_creeper: "Continuously expands project scope until it becomes unmanageable",
  serial_starter: "Starts new projects within days of abandoning previous ones",
  perfectionist_paralysis: "Spends too much time on documentation/planning, not enough on coding",
  evening_coder: "Only commits code in the evening, leading to burnout",
  library_overload: "Uses too many dependencies, creating complexity",
  framework_hopper: "Never uses the same tech stack twice, preventing mastery",
  progressive_learner: "Builds consistently on the same core technology while adding complementary tools",
}