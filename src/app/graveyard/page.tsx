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

        {/* Stats Section */}
        {!loading && projects.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-gray-100">
                  {projects.length}
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Projects Buried
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-gray-100">
                  {new Set(projects.flatMap(p => p.tech_stack)).size}
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Technologies Used
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-gray-100">
                  3 months
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Average Project Lifespan
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}