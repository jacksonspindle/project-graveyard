"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DEATH_CAUSE_EMOJIS, DEATH_CAUSES } from "@/types"
import { db } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { PatternDashboard } from "@/components/pattern-dashboard"
import type { Project } from "@/types"

export default function GraveyardPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analyzingPatterns, setAnalyzingPatterns] = useState(false)
  const [hasExistingAnalysis, setHasExistingAnalysis] = useState(false)
  const [clearingInsights, setClearingInsights] = useState(false)
  const [dashboardData, setDashboardData] = useState({ patterns: [], insights: [], metrics: [] })
  const [debugInfo, setDebugInfo] = useState<any>(null)

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

  const triggerPatternAnalysis = async () => {
    if (!user) return
    
    try {
      setAnalyzingPatterns(true)
      console.log('🧠 Triggering pattern analysis for user:', user.id)
      
      const response = await fetch('/api/patterns/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })
      
      const data = await response.json()
      console.log('🎯 Pattern analysis results:', data)
      
      if (response.ok) {
        console.log(`✅ Pattern analysis completed! Detected ${data.pass1_patterns?.length || 0} patterns, analyzed ${data.projectsAnalyzed || 0} projects`)
        console.log('Pass 1 patterns:', data.pass1_patterns)
        console.log('Pass 2 insights:', data.pass2_insights)
        console.log('Full response data:', data)
        
        // Smoothly refresh dashboard data without any visual flicker
        setTimeout(async () => {
          await refreshDashboardData()
        }, 1500) // Small delay to ensure data is fully stored
      } else {
        console.error('Pattern analysis error:', data.error)
        console.error(`❌ Pattern analysis failed: ${data.error}`)
        alert('❌ Pattern analysis failed. Check console for details.')
      }
    } catch (error) {
      console.error('Error triggering pattern analysis:', error)
      alert('❌ Error triggering pattern analysis. Check console for details.')
    } finally {
      setAnalyzingPatterns(false)
    }
  }

  const clearAllInsights = async () => {
    if (!user) return
    
    try {
      setClearingInsights(true)
      console.log('🧹 Clearing all insights for user:', user.id)
      
      const response = await fetch('/api/debug/clear-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })
      
      if (response.ok) {
        console.log('✅ Insights cleared successfully')
        // Smoothly refresh dashboard data
        await refreshDashboardData()
      } else {
        console.error('Failed to clear insights')
      }
    } catch (error) {
      console.error('Error clearing insights:', error)
    } finally {
      setClearingInsights(false)
    }
  }

  const refreshDashboardData = async () => {
    if (!user) return
    
    try {
      console.log('🔄 Smoothly refreshing dashboard data...')
      
      const response = await fetch('/api/patterns/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })

      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
        
        // Update the hasExistingAnalysis state
        const hasData = (data.patterns?.length > 0) || (data.insights?.length > 0)
        setHasExistingAnalysis(hasData)
        
        console.log('✅ Dashboard data refreshed smoothly')
      }
    } catch (error) {
      console.error('Error refreshing dashboard data:', error)
    }
  }

  const debugProjectCount = async () => {
    if (!user) return
    
    try {
      console.log('🔍 Checking actual project count in database...')
      
      // Use the same query that the pattern analysis uses
      const allProjects = await db.projects.getAll(user.id)
      
      const debugData = {
        userId: user.id,
        totalProjects: allProjects.length,
        visibleInUI: projects.length,
        projects: allProjects.map((p, i) => ({
          index: i + 1,
          id: p.id,
          name: p.name,
          created_at: p.created_at,
          death_date: p.death_date,
          death_cause: p.death_cause
        }))
      }
      
      setDebugInfo(debugData)
      console.log('🔍 Database project count debug:', debugData)
      
      alert(`Database has ${debugData.totalProjects} projects, UI shows ${debugData.visibleInUI}. Check console for details.`)
      
    } catch (error) {
      console.error('Error debugging project count:', error)
      alert('Error checking project count. Check console for details.')
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
              
              <Link href="/graveyard/insights">
                <Button variant="outline" className="border-red-500/50 text-red-300 hover:bg-red-500/10">
                  📌 My Insights
                </Button>
              </Link>
              
              <Link href="/graveyard/create">
                <Button className="bg-gray-700 hover:bg-gray-600 text-gray-100 border-gray-600">
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

        {/* Analysis Trigger Section - Large for first-time users */}
        {!loading && user && projects.length >= 2 && !hasExistingAnalysis && (
          <div className="mt-16 mb-12">
            <div className="text-center max-w-2xl mx-auto">
              <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-8">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-100 mb-3">
                    🧠 Discover Your Failure Patterns
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Let AI analyze your {projects.length} projects to identify behavioral patterns and provide 
                    personalized coaching insights to help you succeed in future projects.
                  </p>
                </div>
                
                <Button 
                  onClick={triggerPatternAnalysis}
                  disabled={analyzingPatterns}
                  className="bg-purple-600 hover:bg-purple-700 text-white border-purple-500 px-8 py-3 text-base font-medium shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
                >
                  {analyzingPatterns ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Analyzing Your Projects...
                    </>
                  ) : (
                    <>
                      🚀 Analyze My Patterns
                    </>
                  )}
                </Button>
                
                {analyzingPatterns && (
                  <p className="text-xs text-gray-500 mt-3">
                    This may take 10-15 seconds as we analyze your project data with AI
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Compact Re-analyze Section - For users with existing data */}
        {!loading && user && projects.length >= 2 && hasExistingAnalysis && (
          <div className="mt-8 mb-6">
            <div className="flex justify-center gap-3">
              <Button 
                onClick={triggerPatternAnalysis}
                disabled={analyzingPatterns}
                variant="outline"
                className="bg-gray-800/50 border-purple-500/50 text-purple-300 hover:bg-purple-600/20 hover:border-purple-500 px-6 py-2 text-sm"
              >
                {analyzingPatterns ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-purple-300 border-t-transparent mr-2"></div>
                    Re-analyzing...
                  </>
                ) : (
                  <>
                    🔄 Re-analyze Patterns
                  </>
                )}
              </Button>
              
              <Button 
                onClick={clearAllInsights}
                disabled={clearingInsights}
                variant="outline"
                className="bg-gray-800/50 border-red-500/50 text-red-300 hover:bg-red-600/20 hover:border-red-500 px-4 py-2 text-sm"
              >
                {clearingInsights ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-red-300 border-t-transparent mr-2"></div>
                    Clearing...
                  </>
                ) : (
                  <>
                    🧹 Clear Insights
                  </>
                )}
              </Button>
              
              <Button 
                onClick={debugProjectCount}
                variant="outline"
                className="bg-gray-800/50 border-yellow-500/50 text-yellow-300 hover:bg-yellow-600/20 hover:border-yellow-500 px-4 py-2 text-sm"
              >
                🔍 Debug Count
              </Button>
            </div>
          </div>
        )}

        {/* Pattern Recognition Dashboard */}
        {!loading && user && (
          <div className="mt-8">
            <PatternDashboard 
              userId={user.id} 
              projectCount={projects.length} 
              onDataStatusChange={setHasExistingAnalysis}
              externalData={dashboardData.patterns.length > 0 || dashboardData.insights.length > 0 ? dashboardData : undefined}
            />
          </div>
        )}
      </div>
    </div>
  )
}