"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DEATH_CAUSE_EMOJIS, DEATH_CAUSES } from "@/types"
import { db } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import type { Project, PostMortem } from "@/types"
import { formatDate, getTimeAgo } from "@/lib/utils"

interface ProjectDetailPageProps {
  params: {
    projectId: string
  }
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [postMortem, setPostMortem] = useState<PostMortem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadProjectData()
    } else if (!authLoading) {
      router.push("/auth")
    }
  }, [user, authLoading, params.projectId])

  const loadProjectData = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // Load project data
      const projectData = await db.projects.getById(params.projectId)
      
      // Verify user owns this project
      if (projectData.user_id !== user.id) {
        setError("Project not found or you don't have permission to view it")
        return
      }

      setProject(projectData)

      // Load post-mortem if it exists
      try {
        const postMortemData = await db.postMortems.getByProjectId(params.projectId)
        setPostMortem(postMortemData)
      } catch (err) {
        // No post-mortem exists yet, that's fine
        console.log("No post-mortem found")
      }

    } catch (err: any) {
      console.error("Error loading project:", err)
      setError(err.message || "Failed to load project")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!project || !user) return
    
    if (!confirm("Are you sure you want to permanently delete this project? This cannot be undone.")) {
      return
    }

    try {
      await db.projects.delete(project.id)
      router.push("/graveyard")
    } catch (err: any) {
      console.error("Error deleting project:", err)
      setError(err.message || "Failed to delete project")
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen graveyard-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-300">Loading project...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen graveyard-bg">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-100 mb-4">
              {error || "Project not found"}
            </h1>
            <Link href="/graveyard">
              <Button>← Back to Graveyard</Button>
            </Link>
          </div>
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
            <div className="flex items-center gap-4">
              <Link href="/graveyard">
                <Button variant="outline">
                  ← Back to Graveyard
                </Button>  
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-100">{project.name}</h1>
                <p className="text-gray-400">
                  Died {formatDate(project.death_date)} ({getTimeAgo(project.death_date)})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/graveyard/${params.projectId}/edit`}>
                <Button variant="outline">
                  ✏️ Edit
                </Button>
              </Link>
              <Button 
                variant="destructive"
                onClick={handleDelete}
              >
                🗑️ Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Project Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tombstone Card */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="text-center">
                <div className="text-6xl mb-4">🪦</div>
                <CardTitle className="text-gray-100 text-2xl">
                  {project.name}
                </CardTitle>
                {project.epitaph && (
                  <CardDescription className="text-gray-300 italic text-lg">
                    "{project.epitaph}"
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {project.description && (
                    <div>
                      <h3 className="font-semibold text-gray-200 mb-2">About this project</h3>
                      <p className="text-gray-300">{project.description}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-200 mb-1">Date of Death</h4>
                      <p className="text-gray-300">{formatDate(project.death_date)}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-200 mb-1">Cause of Death</h4>
                      <p className="text-gray-300 flex items-center gap-1">
                        {DEATH_CAUSE_EMOJIS[project.death_cause]}
                        {DEATH_CAUSES[project.death_cause]}
                      </p>
                    </div>
                  </div>

                  {project.tech_stack.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-200 mb-2">Tech Stack</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.tech_stack.map((tech) => (
                          <span 
                            key={tech}
                            className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium text-gray-200 mb-1">Status</h4>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      project.revival_status === 'buried' ? 'bg-gray-700 text-gray-300' :
                      project.revival_status === 'reviving' ? 'bg-yellow-900 text-yellow-300' :
                      'bg-green-900 text-green-300'
                    }`}>
                      {project.revival_status === 'buried' ? '⚰️ Buried' :
                       project.revival_status === 'reviving' ? '🧟 Reviving' :
                       '✨ Revived'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Post-Mortem Section */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-100 flex items-center gap-2">
                  📝 Post-Mortem Analysis
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Reflect on what went wrong and what you learned
                </CardDescription>
              </CardHeader>
              <CardContent>
                {postMortem ? (
                  <div className="space-y-4">
                    {postMortem.what_problem && (
                      <div>
                        <h4 className="font-medium text-gray-200 mb-2">What problem was this trying to solve?</h4>
                        <p className="text-gray-300">{postMortem.what_problem}</p>
                      </div>
                    )}
                    {postMortem.what_went_wrong && (
                      <div>
                        <h4 className="font-medium text-gray-200 mb-2">What went wrong?</h4>
                        <p className="text-gray-300">{postMortem.what_went_wrong}</p>
                      </div>
                    )}
                    {postMortem.lessons_learned && (
                      <div>
                        <h4 className="font-medium text-gray-200 mb-2">What did you learn?</h4>
                        <p className="text-gray-300">{postMortem.lessons_learned}</p>
                      </div>
                    )}
                    <div className="pt-4">
                      <Link href={`/graveyard/${params.projectId}/post-mortem`}>
                        <Button variant="outline">
                          ✏️ Edit Post-Mortem
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">💭</div>
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">No post-mortem yet</h3>
                    <p className="text-gray-400 mb-6">
                      Take a moment to reflect on this project and extract valuable lessons from its journey.
                    </p>
                    <Link href={`/graveyard/${params.projectId}/post-mortem`}>
                      <Button>
                        📝 Create Post-Mortem
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-100 text-lg">Project Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Buried</p>
                  <p className="text-gray-300">{getTimeAgo(project.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Last Updated</p>
                  <p className="text-gray-300">{getTimeAgo(project.updated_at)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-100 text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                >
                  🧟 Mark for Revival
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                >
                  💾 Extract Code Snippets
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                >
                  📊 View Similar Projects
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}