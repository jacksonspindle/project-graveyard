import { 
  Project, 
  ProjectMetadata, 
  UserPattern, 
  PatternAnalysis, 
  PatternName, 
  PatternType,
  UserPatternProfile,
  Trend 
} from '@/types'
import { db } from './supabase'

// Pattern detection algorithms
export class PatternDetector {
  
  /**
   * Analyze all projects for a user and detect patterns
   */
  static async analyzeUserPatterns(
    userId: string, 
    projects: Project[], 
    projectsMetadata: ProjectMetadata[]
  ): Promise<PatternAnalysis[]> {
    const detectedPatterns: PatternAnalysis[] = []
    
    // Time-based patterns
    detectedPatterns.push(...this.detectTimingPatterns(projects, projectsMetadata))
    
    // Technical patterns
    detectedPatterns.push(...this.detectTechnicalPatterns(projects, projectsMetadata))
    
    // Behavioral patterns
    detectedPatterns.push(...this.detectBehavioralPatterns(projects, projectsMetadata))
    
    return detectedPatterns.filter(pattern => pattern.confidence > 0.6)
  }

  /**
   * Detect time-based patterns (when projects start/die)
   */
  private static detectTimingPatterns(
    projects: Project[], 
    metadata: ProjectMetadata[]
  ): PatternAnalysis[] {
    const patterns: PatternAnalysis[] = []

    // Weekend Warrior Pattern
    const weekendStarts = projects.filter(p => {
      const startDay = new Date(p.created_at).getDay()
      const deathDate = new Date(p.death_date)
      const createDate = new Date(p.created_at)
      const daysAlive = (deathDate.getTime() - createDate.getTime()) / (1000 * 60 * 60 * 24)
      
      return (startDay === 5 || startDay === 6 || startDay === 0) && daysAlive <= 3
    })

    if (weekendStarts.length >= 2) {
      patterns.push({
        pattern_name: 'weekend_warrior',
        confidence: Math.min(0.95, (weekendStarts.length / projects.length) * 1.2),
        supporting_projects: weekendStarts.map(p => p.id),
        metadata: {
          weekend_projects: weekendStarts.length,
          total_projects: projects.length,
          avg_weekend_lifespan: weekendStarts.reduce((acc, p) => {
            const days = (new Date(p.death_date).getTime() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24)
            return acc + days
          }, 0) / weekendStarts.length
        },
        insight_text: `${Math.round((weekendStarts.length / projects.length) * 100)}% of your projects start on weekends but die within 3 days. Weekend projects have lower success rates - consider starting during weekdays when you have sustained energy.`
      })
    }

    // REMOVED: Evening Coder Pattern - was using mock data (peak_activity_hour is randomly generated)
    // TODO: Re-enable when we have real Git commit time data from GitHub integration

    return patterns
  }

  /**
   * Detect technical patterns (tech choices, complexity)
   */
  private static detectTechnicalPatterns(
    projects: Project[], 
    metadata: ProjectMetadata[]
  ): PatternAnalysis[] {
    const patterns: PatternAnalysis[] = []

    // DISABLED: Auth Curse Pattern - uses mock metadata (first_commit_type is randomly generated)
    // TODO: Re-enable when we have real Git commit data
    
    // DISABLED: Library Overload Pattern - uses mock metadata (libraries_count is estimated)
    // TODO: Re-enable when we have real package.json analysis

    // Framework Hopper Pattern - Fixed to detect ACTUAL framework changes
    const frontendFrameworks = ['React', 'Vue', 'Angular', 'Svelte', 'Solid', 'Preact']
    const backendFrameworks = ['Express', 'Fastify', 'Koa', 'NestJS', 'Django', 'Flask', 'Rails', 'Laravel']
    
    const projectFrameworks = projects.map(p => {
      const frontend = p.tech_stack.find(tech => frontendFrameworks.some(fw => tech.toLowerCase().includes(fw.toLowerCase())))
      const backend = p.tech_stack.find(tech => backendFrameworks.some(fw => tech.toLowerCase().includes(fw.toLowerCase())))
      return { frontend, backend, projectId: p.id }
    })
    
    const uniqueFrontends = new Set(projectFrameworks.map(p => p.frontend).filter(Boolean))
    const uniqueBackends = new Set(projectFrameworks.map(p => p.backend).filter(Boolean))
    
    // Only trigger if using 3+ different core frameworks
    if ((uniqueFrontends.size >= 3 && projects.length >= 3) || (uniqueBackends.size >= 3 && projects.length >= 3)) {
      patterns.push({
        pattern_name: 'framework_hopper',
        confidence: Math.min(0.90, Math.max(uniqueFrontends.size, uniqueBackends.size) / projects.length),
        supporting_projects: projects.map(p => p.id),
        metadata: {
          unique_frontends: Array.from(uniqueFrontends),
          unique_backends: Array.from(uniqueBackends),
          total_projects: projects.length
        },
        insight_text: `You've used ${uniqueFrontends.size} different frontend frameworks (${Array.from(uniqueFrontends).join(', ')}) and ${uniqueBackends.size} backend frameworks. True framework hopping detected. Consider mastering one ecosystem before exploring others.`
      })
    }

    // Progressive Learner Pattern - Builds on same foundation (POSITIVE pattern)
    const coreFramework = this.getMostUsedTech(projects)
    const projectsWithCore = projects.filter(p => p.tech_stack.some(tech => tech.toLowerCase().includes(coreFramework.toLowerCase())))
    
    if (projectsWithCore.length >= 2 && projects.length >= 3) {
      const avgStackSize = projects.reduce((acc, p) => acc + p.tech_stack.length, 0) / projects.length
      
      if (avgStackSize > 1.5) { // Using multiple tools but consistently
        patterns.push({
          pattern_name: 'progressive_learner',
          confidence: Math.min(0.85, (projectsWithCore.length / projects.length) * 1.1),
          supporting_projects: projectsWithCore.map(p => p.id),
          metadata: {
            core_framework: coreFramework,
            consistent_projects: projectsWithCore.length,
            avg_stack_size: Math.round(avgStackSize * 10) / 10
          },
          insight_text: `You consistently build on ${coreFramework} while progressively adding complementary tools (avg ${Math.round(avgStackSize * 10) / 10} technologies per project). This shows healthy skill building within an ecosystem rather than aimless framework hopping.`
        })
      }
    }

    return patterns
  }

  /**
   * Detect behavioral patterns (how user works)
   */
  private static detectBehavioralPatterns(
    projects: Project[], 
    metadata: ProjectMetadata[]
  ): PatternAnalysis[] {
    const patterns: PatternAnalysis[] = []

    // Serial Starter Pattern
    const sortedProjects = [...projects].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

    let quickStarts = 0
    for (let i = 1; i < sortedProjects.length; i++) {
      const prevDeath = new Date(sortedProjects[i-1].death_date)
      const currentStart = new Date(sortedProjects[i].created_at)
      const daysBetween = (currentStart.getTime() - prevDeath.getTime()) / (1000 * 60 * 60 * 24)
      
      if (daysBetween <= 3) quickStarts++
    }

    if (quickStarts >= 2) {
      patterns.push({
        pattern_name: 'serial_starter',
        confidence: Math.min(0.90, (quickStarts / (projects.length - 1)) * 1.1),
        supporting_projects: sortedProjects.slice(1, quickStarts + 1).map(p => p.id),
        metadata: {
          quick_starts: quickStarts,
          avg_gap_days: 2.1
        },
        insight_text: `You start new projects within 3 days of abandoning the previous one ${quickStarts} times. Take time to reflect before starting anew - what could you apply from the last attempt?`
      })
    }

    // Perfectionist Paralysis Pattern
    const paralysisProjects = projects.filter(p => {
      const meta = metadata.find(m => m.project_id === p.id)
      return meta?.has_readme && 
             (meta?.estimated_lines_of_code || 0) <= 100 && 
             (meta?.total_days_active || 0) >= 14
    })

    if (paralysisProjects.length >= 2) {
      patterns.push({
        pattern_name: 'perfectionist_paralysis',
        confidence: Math.min(0.85, (paralysisProjects.length / projects.length) * 1.2),
        supporting_projects: paralysisProjects.map(p => p.id),
        metadata: {
          paralysis_projects: paralysisProjects.length,
          avg_planning_days: paralysisProjects.reduce((acc, p) => {
            const meta = metadata.find(m => m.project_id === p.id)
            return acc + (meta?.total_days_active || 0)
          }, 0) / paralysisProjects.length
        },
        insight_text: `${paralysisProjects.length} projects had extensive documentation but minimal code (${Math.round(paralysisProjects.reduce((acc, p) => {
          const meta = metadata.find(m => m.project_id === p.id)
          return acc + (meta?.estimated_lines_of_code || 0)
        }, 0) / paralysisProjects.length)} lines avg). Balance planning with doing - start coding sooner.`
      })
    }

    // Scope Creeper Pattern  
    const scopeCreepers = projects.filter(p => {
      const meta = metadata.find(m => m.project_id === p.id)
      return p.death_cause === 'over_scoped' && 
             (meta?.libraries_count || 0) > 5 && 
             (meta?.files_count || 0) > 20
    })

    if (scopeCreepers.length >= 2) {
      patterns.push({
        pattern_name: 'scope_creeper',
        confidence: Math.min(0.90, (scopeCreepers.length / projects.length) * 1.3),
        supporting_projects: scopeCreepers.map(p => p.id),
        metadata: {
          scope_creep_projects: scopeCreepers.length,
          avg_files: scopeCreepers.reduce((acc, p) => {
            const meta = metadata.find(m => m.project_id === p.id)
            return acc + (meta?.files_count || 0)
          }, 0) / scopeCreepers.length
        },
        insight_text: `${scopeCreepers.length} projects died from scope creep with ${Math.round(scopeCreepers.reduce((acc, p) => {
          const meta = metadata.find(m => m.project_id === p.id)
          return acc + (meta?.files_count || 0)
        }, 0) / scopeCreepers.length)} files on average. Define a clear MVP before coding - what's the smallest useful version?`
      })
    }

    return patterns
  }

  /**
   * Get the most frequently used technology
   */
  private static getMostUsedTech(projects: Project[]): string {
    const techCount: Record<string, number> = {}
    
    projects.forEach(project => {
      project.tech_stack.forEach(tech => {
        techCount[tech] = (techCount[tech] || 0) + 1
      })
    })

    return Object.entries(techCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'
  }

  /**
   * Store detected patterns in the database
   */
  static async storePatterns(userId: string, patterns: PatternAnalysis[]): Promise<void> {
    for (const pattern of patterns) {
      try {
        // Check if pattern already exists
        const existingPatterns = await db.userPatterns.getByUserId(userId)
        const existing = existingPatterns?.find(p => p.pattern_name === pattern.pattern_name)

        if (existing) {
          // Increment frequency if pattern already exists
          await db.userPatterns.incrementFrequency(existing.id)
        } else {
          // Create new pattern
          await db.userPatterns.create({
            user_id: userId,
            pattern_type: this.getPatternType(pattern.pattern_name),
            pattern_name: pattern.pattern_name,
            pattern_value: pattern.metadata,
            frequency: 1,
            confidence_score: pattern.confidence
          })
        }

        // Store insight
        await db.patternInsights.create({
          user_id: userId,
          insight_text: pattern.insight_text,
          insight_type: 'observation',
          confidence_score: pattern.confidence,
          projects_analyzed: pattern.supporting_projects.length
        })

      } catch (error) {
        console.error(`Error storing pattern ${pattern.pattern_name}:`, error)
      }
    }
  }

  /**
   * Determine pattern type from pattern name
   */
  private static getPatternType(patternName: PatternName): PatternType {
    const timeBasedPatterns: PatternName[] = ['weekend_warrior', 'evening_coder']
    const technicalPatterns: PatternName[] = ['auth_curse', 'library_overload', 'framework_hopper']
    const behavioralPatterns: PatternName[] = ['serial_starter', 'perfectionist_paralysis', 'scope_creeper']

    if (timeBasedPatterns.includes(patternName)) return 'time_based'
    if (technicalPatterns.includes(patternName)) return 'technical'
    if (behavioralPatterns.includes(patternName)) return 'behavioral'
    
    return 'behavioral' // default
  }

  /**
   * Generate user learning velocity metrics
   */
  static calculateLearningVelocity(
    projects: Project[], 
    historicalMetrics: any[]
  ): { 
    avg_project_lifespan_trend: Trend
    scope_management_score: number
    technology_consistency_score: number
    completion_rate_trend: Trend
  } {
    // Calculate average project lifespan trend
    const lifespans = projects.map(p => {
      const days = (new Date(p.death_date).getTime() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24)
      return Math.max(1, days)
    })

    const avgLifespan = lifespans.reduce((acc, days) => acc + days, 0) / lifespans.length
    const recentLifespan = lifespans.slice(-3).reduce((acc, days) => acc + days, 0) / Math.min(3, lifespans.length)
    
    const lifespanTrend: Trend = recentLifespan > avgLifespan * 1.2 ? 'improving' : 
                                 recentLifespan < avgLifespan * 0.8 ? 'declining' : 'stable'

    // Calculate scope management score (lower over-scoped percentage = better)
    const overscopedCount = projects.filter(p => p.death_cause === 'over_scoped').length
    const scopeScore = Math.max(0, 100 - (overscopedCount / projects.length) * 100)

    // Calculate technology consistency score
    const uniqueTechs = new Set(projects.flatMap(p => p.tech_stack))
    const consistencyScore = Math.max(0, 100 - (uniqueTechs.size / projects.length) * 10)

    // Calculate completion rate trend (revival attempts vs failures)
    const revivals = projects.filter(p => p.revival_status === 'revived' || p.revival_status === 'reviving').length
    const completionTrend: Trend = revivals > 0 ? 'improving' : 'stable'

    return {
      avg_project_lifespan_trend: lifespanTrend,
      scope_management_score: Math.round(scopeScore),
      technology_consistency_score: Math.round(consistencyScore), 
      completion_rate_trend: completionTrend
    }
  }
}

/**
 * Generate mock project metadata for existing projects
 */
export function generateMockMetadata(project: Project): Partial<ProjectMetadata> {
  const createdDate = new Date(project.created_at)
  const deathDate = new Date(project.death_date)
  const daysActive = Math.max(1, Math.floor((deathDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)))
  
  // Mock realistic values based on project characteristics
  const librariesCount = project.tech_stack.length + Math.floor(Math.random() * 3)
  const estimatedLoc = Math.floor(Math.random() * 500) + daysActive * 20
  const filesCount = Math.floor(estimatedLoc / 50) + librariesCount
  
  return {
    total_days_active: daysActive,
    first_commit_date: project.created_at,
    last_commit_date: project.death_date,
    peak_activity_day: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][Math.floor(Math.random() * 7)],
    peak_activity_hour: Math.floor(Math.random() * 24),
    estimated_lines_of_code: estimatedLoc,
    estimated_commit_count: Math.floor(daysActive * 2.5),
    libraries_count: librariesCount,
    files_count: filesCount,
    first_commit_type: (['setup', 'auth', 'ui', 'data_model', 'api'] as const)[Math.floor(Math.random() * 5)],
    has_readme: Math.random() > 0.3,
    has_tests: Math.random() > 0.7,
    has_documentation: Math.random() > 0.8,
    github_stars: 0,
    github_forks: 0
  }
}