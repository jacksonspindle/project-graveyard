"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DEATH_CAUSE_EMOJIS, DEATH_CAUSES } from "@/types"
import { db } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import type { Project } from "@/types"

export default function GraveyardPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mock data fallback
  const mockProjects = [
    {
      id: "1",
      user_id: "mock",
      name: "TodoApp #47",
      epitaph: "You were too ambitious for a weekend",
      death_date: "2024-01-15",
      death_cause: "over_scoped" as const,
      tech_stack: ["React", "Node.js"],
      revival_status: "buried" as const,
      created_at: "2024-01-15",
      updated_at: "2024-01-15",
    },
    {
      id: "2",
      user_id: "mock", 
      name: "AI Chatbot",
      epitaph: "Killed by ChatGPT announcement",
      death_date: "2024-02-28",
      death_cause: "better_solution_existed" as const,
      tech_stack: ["Python", "TensorFlow"],
      revival_status: "buried" as const,
      created_at: "2024-02-28",
      updated_at: "2024-02-28",
    },
    {
      id: "3",
      user_id: "mock",
      name: "Crypto Tracker",
      epitaph: "Lost interest when Bitcoin crashed",
      death_date: "2024-03-10",
      death_cause: "lost_interest" as const,
      tech_stack: ["Vue.js", "Express"],
      revival_status: "buried" as const,
      created_at: "2024-03-10",
      updated_at: "2024-03-10",
    },
  ]

  useEffect(() => {
    if (user) {
      loadProjects()
    } else if (!authLoading) {
      // Not authenticated, redirect to auth page
      window.location.href = "/auth"
    }
  }, [user, authLoading])

  const loadProjects = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      setError(null)
      
      const data = await db.projects.getAll(user.id)
      setProjects(data)
      
    } catch (err) {
      console.error("Error loading projects:", err)
      setError("Failed to load projects")
      // Fall back to mock data for demo
      setProjects(mockProjects)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen graveyard-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen graveyard-bg">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-100">Your Graveyard</h1>
              <p className="text-gray-400">
                {loading ? "Loading..." : `${projects.length} projects rest here`}
                {error && <span className="text-yellow-400 ml-2">({error})</span>}
              </p>
              <p className="text-sm text-gray-500">
                Signed in as {user?.email}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex items-center bg-gray-800 rounded-lg p-1">
                <Button
                  size="sm"
                  className="bg-gray-700 text-gray-100 hover:bg-gray-600"
                >
                  📋 List
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-gray-100 hover:bg-gray-700"
                  onClick={() => router.push('/graveyard/visual')}
                >
                  🪦 Graveyard
                </Button>
              </div>
              
              <Link href="/graveyard/create">
                <Button>
                  + Bury Project
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => signOut()}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          /* Loading State */
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-gray-100 mb-2">Loading your graveyard...</h2>
          </div>
        ) : projects.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🪦</div>
            <h2 className="text-2xl font-bold text-gray-100 mb-2">Your graveyard is empty</h2>
            <p className="text-gray-400 mb-8">
              No projects have been laid to rest yet. Start by burying your first abandoned project.
            </p>
            <Link href="/graveyard/create">
              <Button>
                Bury Your First Project
              </Button>
            </Link>
          </div>
        ) : (
          /* Project Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link key={project.id} href={`/graveyard/${project.id}`}>
                <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors cursor-pointer tombstone-shadow h-full"
                >
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2">🪦</div>
                  <CardTitle className="text-gray-100 text-lg">
                    {project.name}
                  </CardTitle>
                  <CardDescription className="text-gray-300 italic">
                    "{project.epitaph}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Died:</span>
                      <span className="text-gray-300">
                        {new Date(project.death_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Cause:</span>
                      <span className="text-gray-300 flex items-center gap-1">
                        {DEATH_CAUSE_EMOJIS[project.death_cause]}
                        {DEATH_CAUSES[project.death_cause]}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {project.tech_stack.map((tech) => (
                        <span 
                          key={tech}
                          className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Enhanced Analytics Dashboard */}
        {!loading && projects.length > 0 && (
          <div className="mt-12 space-y-8">
            
            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gray-800/30 border-gray-700">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl text-gray-100">
                    {projects.length}
                  </CardTitle>
                  <CardDescription className="text-gray-300 text-sm">
                    Projects Buried
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-gray-800/30 border-gray-700">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl text-gray-100">
                    {new Set(projects.flatMap(p => p.tech_stack)).size}
                  </CardTitle>
                  <CardDescription className="text-gray-300 text-sm">
                    Technologies Used
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-gray-800/30 border-gray-700">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl text-gray-100">
                    {Math.round(projects.reduce((acc, p) => {
                      const deathDate = new Date(p.death_date)
                      const createDate = new Date(p.created_at)
                      const days = (deathDate.getTime() - createDate.getTime()) / (1000 * 60 * 60 * 24)
                      return acc + Math.max(1, days)
                    }, 0) / projects.length)}d
                  </CardTitle>
                  <CardDescription className="text-gray-300 text-sm">
                    Avg Lifespan
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-gray-800/30 border-gray-700">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl text-gray-100">
                    {projects.filter(p => p.revival_status === 'reviving').length}
                  </CardTitle>
                  <CardDescription className="text-gray-300 text-sm">
                    Revival Attempts
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Main Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Death Cause Analysis */}
              <Card className="bg-gray-800/30 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-100 flex items-center gap-2">
                    💀 Death Cause Analysis
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Your most common project killers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(
                      projects.reduce((acc, p) => {
                        acc[p.death_cause] = (acc[p.death_cause] || 0) + 1
                        return acc
                      }, {} as Record<string, number>)
                    )
                    .sort(([,a], [,b]) => b - a)
                    .map(([cause, count]) => {
                      const percentage = Math.round((count / projects.length) * 100)
                      return (
                        <div key={cause} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{DEATH_CAUSE_EMOJIS[cause as keyof typeof DEATH_CAUSE_EMOJIS]}</span>
                            <span className="text-gray-300 text-sm">{DEATH_CAUSES[cause as keyof typeof DEATH_CAUSES]}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-gray-400 text-sm w-8">{count}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Technology Graveyard */}
              <Card className="bg-gray-800/30 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-100 flex items-center gap-2">
                    ⚰️ Technology Graveyard
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Tech stack failure rates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(
                      projects.reduce((acc, p) => {
                        p.tech_stack.forEach(tech => {
                          acc[tech] = (acc[tech] || 0) + 1
                        })
                        return acc
                      }, {} as Record<string, number>)
                    )
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 6)
                    .map(([tech, count]) => {
                      return (
                        <div key={tech} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-blue-400">📦</span>
                            <span className="text-gray-300 text-sm">{tech}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(100, (count / Math.max(...Object.values(
                                  projects.reduce((acc, p) => {
                                    p.tech_stack.forEach(tech => {
                                      acc[tech] = (acc[tech] || 0) + 1
                                    })
                                    return acc
                                  }, {} as Record<string, number>)
                                ))) * 100)}%` }}
                              />
                            </div>
                            <span className="text-gray-400 text-sm w-8">{count}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Timeline and Patterns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Recent Deaths */}
              <Card className="bg-gray-800/30 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-100 flex items-center gap-2 text-base">
                    ⏰ Recent Deaths
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-sm">
                    Your latest casualties
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {projects
                      .sort((a, b) => new Date(b.death_date).getTime() - new Date(a.death_date).getTime())
                      .slice(0, 4)
                      .map(project => (
                        <div key={project.id} className="flex items-center gap-3">
                          <span className="text-lg">{DEATH_CAUSE_EMOJIS[project.death_cause]}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-300 text-sm font-medium truncate">
                              {project.name}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {new Date(project.death_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Death Patterns */}
              <Card className="bg-gray-800/30 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-100 flex items-center gap-2 text-base">
                    📊 Death Patterns
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-sm">
                    When projects typically die
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(() => {
                      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                      const deathsByMonth = projects.reduce((acc, p) => {
                        const month = new Date(p.death_date).getMonth()
                        acc[month] = (acc[month] || 0) + 1
                        return acc
                      }, {} as Record<number, number>)
                      
                      const maxDeaths = Math.max(...Object.values(deathsByMonth), 1)
                      
                      return months.map((month, index) => {
                        const count = deathsByMonth[index] || 0
                        const percentage = (count / maxDeaths) * 100
                        return (
                          <div key={month} className="flex items-center justify-between">
                            <span className="text-gray-300 text-sm w-8">{month}</span>
                            <div className="flex items-center gap-2 flex-1 ml-3">
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-gray-400 text-sm w-4">{count || ''}</span>
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                </CardContent>
              </Card>

              {/* Revival Opportunities */}
              <Card className="bg-gray-800/30 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-100 flex items-center gap-2 text-base">
                    🧟 Revival Candidates
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-sm">
                    Projects worth revisiting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {projects
                      .filter(p => p.death_cause === 'lost_interest' || p.death_cause === 'life_got_in_way')
                      .sort((a, b) => new Date(b.death_date).getTime() - new Date(a.death_date).getTime())
                      .slice(0, 4)
                      .map(project => (
                        <div key={project.id} className="flex items-center gap-3">
                          <span className="text-lg">🔄</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-300 text-sm font-medium truncate">
                              {project.name}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {project.tech_stack.slice(0, 2).join(', ')}
                            </p>
                          </div>
                          <Link href={`/graveyard/${project.id}`}>
                            <Button size="sm" variant="ghost" className="text-xs text-green-400 hover:text-green-300">
                              Revive
                            </Button>
                          </Link>
                        </div>
                      ))}
                    {projects.filter(p => p.death_cause === 'lost_interest' || p.death_cause === 'life_got_in_way').length === 0 && (
                      <p className="text-gray-500 text-sm italic text-center py-4">
                        No obvious revival candidates found
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Insights Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Learning Insights */}
              <Card className="bg-gray-800/30 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-100 flex items-center gap-2">
                    💡 Pattern Insights
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    AI-detected patterns in your project failures
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(() => {
                      const insights = []
                      
                      // Most common death cause insight
                      const topCause = Object.entries(
                        projects.reduce((acc, p) => {
                          acc[p.death_cause] = (acc[p.death_cause] || 0) + 1
                          return acc
                        }, {} as Record<string, number>)
                      ).sort(([,a], [,b]) => b - a)[0]
                      
                      if (topCause) {
                        insights.push({
                          icon: "🎯",
                          title: "Primary Failure Pattern",
                          description: `${Math.round((topCause[1] / projects.length) * 100)}% of your projects die from ${DEATH_CAUSES[topCause[0] as keyof typeof DEATH_CAUSES].toLowerCase()}`
                        })
                      }
                      
                      // Technology pattern
                      const topTech = Object.entries(
                        projects.reduce((acc, p) => {
                          p.tech_stack.forEach(tech => {
                            acc[tech] = (acc[tech] || 0) + 1
                          })
                          return acc
                        }, {} as Record<string, number>)
                      ).sort(([,a], [,b]) => b - a)[0]
                      
                      if (topTech && topTech[1] > 1) {
                        insights.push({
                          icon: "🔧",
                          title: "Technology Pattern",
                          description: `${topTech[0]} appears in ${topTech[1]} failed projects - consider if this tech adds too much complexity`
                        })
                      }
                      
                      // Timing pattern
                      const avgLifespan = Math.round(projects.reduce((acc, p) => {
                        const deathDate = new Date(p.death_date)
                        const createDate = new Date(p.created_at)
                        const days = (deathDate.getTime() - createDate.getTime()) / (1000 * 60 * 60 * 24)
                        return acc + Math.max(1, days)
                      }, 0) / projects.length)
                      
                      if (avgLifespan < 30) {
                        insights.push({
                          icon: "⚡",
                          title: "Quick Abandonment",
                          description: `Projects typically die within ${avgLifespan} days - try smaller scopes or better planning`
                        })
                      }
                      
                      return insights.slice(0, 3).map((insight, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg">
                          <span className="text-lg">{insight.icon}</span>
                          <div>
                            <p className="text-gray-200 font-medium text-sm">{insight.title}</p>
                            <p className="text-gray-400 text-sm mt-1">{insight.description}</p>
                          </div>
                        </div>
                      ))
                    })()}
                    
                    {projects.length < 3 && (
                      <div className="text-center py-4">
                        <p className="text-gray-500 text-sm italic">
                          Bury more projects to unlock pattern insights
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Action Items */}
              <Card className="bg-gray-800/30 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-100 flex items-center gap-2">
                    🎯 Recommended Actions
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Improve your project success rate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    
                    {/* Post-mortem completion */}
                    {(() => {
                      const projectsWithoutPostMortem = projects.filter(p => !p.epitaph || p.epitaph.length < 10).length
                      if (projectsWithoutPostMortem > 0) {
                        return (
                          <div className="flex items-start gap-3 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                            <span className="text-blue-400">📝</span>
                            <div className="flex-1">
                              <p className="text-blue-300 font-medium text-sm">Complete Post-Mortems</p>
                              <p className="text-gray-400 text-sm mt-1">
                                {projectsWithoutPostMortem} project{projectsWithoutPostMortem > 1 ? 's' : ''} need detailed analysis
                              </p>
                            </div>
                            <Button size="sm" variant="outline" className="text-xs border-blue-600 text-blue-400">
                              Review
                            </Button>
                          </div>
                        )
                      }
                    })()}

                    {/* Scope management */}
                    {projects.filter(p => p.death_cause === 'over_scoped').length > 1 && (
                      <div className="flex items-start gap-3 p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
                        <span className="text-yellow-400">📏</span>
                        <div className="flex-1">
                          <p className="text-yellow-300 font-medium text-sm">Scope Management</p>
                          <p className="text-gray-400 text-sm mt-1">
                            Multiple over-scoped failures - try MVPs and smaller iterations
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Technology choices */}
                    {(() => {
                      const techCount = new Set(projects.flatMap(p => p.tech_stack)).size
                      if (techCount > projects.length * 2) {
                        return (
                          <div className="flex items-start gap-3 p-3 bg-purple-900/20 border border-purple-700/30 rounded-lg">
                            <span className="text-purple-400">🔧</span>
                            <div className="flex-1">
                              <p className="text-purple-300 font-medium text-sm">Tech Stack Focus</p>
                              <p className="text-gray-400 text-sm mt-1">
                                Using {techCount} different technologies - consider standardizing
                              </p>
                            </div>
                          </div>
                        )
                      }
                    })()}

                    {/* Revival opportunities */}
                    {projects.filter(p => p.revival_status === 'buried' && (p.death_cause === 'lost_interest' || p.death_cause === 'life_got_in_way')).length > 0 && (
                      <div className="flex items-start gap-3 p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
                        <span className="text-green-400">🧟</span>
                        <div className="flex-1">
                          <p className="text-green-300 font-medium text-sm">Revival Opportunity</p>
                          <p className="text-gray-400 text-sm mt-1">
                            Some projects died from external factors - good revival candidates
                          </p>
                        </div>
                        <Button size="sm" variant="outline" className="text-xs border-green-600 text-green-400">
                          Review
                        </Button>
                      </div>
                    )}

                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}