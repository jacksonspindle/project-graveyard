"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DEATH_CAUSE_EMOJIS, DEATH_CAUSES } from "@/types"
import { db } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import type { Project, PostMortem } from "@/types"
import { formatDate, getTimeAgo } from "@/lib/utils"
import { AIInsights } from "@/components/ai-insights"

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
              <Link href="/graveyard/insights">
                <Button variant="outline" className="border-red-500/50 text-red-300 hover:bg-red-500/10">
                  📌 My Insights
                </Button>
              </Link>
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
        {/* Dashboard Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
          className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Project Title Card */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-gray-800/50 border-gray-700 h-full">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🪦</div>
                  <div className="flex-1">
                    <CardTitle className="text-gray-100 text-xl mb-1">
                      {project.name}
                    </CardTitle>
                    {project.epitaph && (
                      <CardDescription className="text-gray-300 italic">
                        "{project.epitaph}"
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {project.description && (
                  <p className="text-gray-300 text-sm line-clamp-3">{project.description}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-gray-800/50 border-gray-700 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-gray-100 text-sm">Project Stats</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div>
                <p className="text-xs text-gray-400">Death Date</p>
                <p className="text-gray-300 text-sm">{formatDate(project.death_date)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Buried</p>
                <p className="text-gray-300 text-sm">{getTimeAgo(project.created_at)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Status</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                  project.revival_status === 'buried' ? 'bg-gray-700 text-gray-300' :
                  project.revival_status === 'reviving' ? 'bg-yellow-900 text-yellow-300' :
                  'bg-green-900 text-green-300'
                }`}>
                  {project.revival_status === 'buried' ? '⚰️ Buried' :
                   project.revival_status === 'reviving' ? '🧟 Reviving' :
                   '✨ Revived'}
                </span>
              </div>
            </CardContent>
            </Card>
          </motion.div>

          {/* Tech & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-gray-800/50 border-gray-700 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-gray-100 text-sm">Tech & Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {project.tech_stack.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">Tech Stack</p>
                  <div className="flex flex-wrap gap-1">
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
              )}
              <div>
                <p className="text-xs text-gray-400 mb-2">Cause of Death</p>
                <div className="flex items-center gap-1 text-sm text-gray-300">
                  {DEATH_CAUSE_EMOJIS[project.death_cause]}
                  <span className="text-xs">{DEATH_CAUSES[project.death_cause]}</span>
                </div>
              </div>
            </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Main Dashboard Content */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, type: "spring", stiffness: 100, damping: 20 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Left Column - Post Mortem (smaller) */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >

            {/* Post-Mortem Section */}
            <div>
              <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-gray-100 flex items-center gap-2 text-lg">
                  📝 Post-Mortem
                </CardTitle>
                <CardDescription className="text-gray-400 text-sm">
                  Your reflection & learnings
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {postMortem ? (
                  <div className="space-y-5">
                    {postMortem.what_problem && (
                      <div className="border-l-2 border-blue-500 pl-4">
                        <h4 className="font-medium text-blue-300 mb-2 text-sm uppercase tracking-wide">
                          Problem Statement
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed">{postMortem.what_problem}</p>
                      </div>
                    )}
                    {postMortem.what_went_wrong && (
                      <div className="border-l-2 border-red-500 pl-4">
                        <h4 className="font-medium text-red-300 mb-2 text-sm uppercase tracking-wide">
                          What Went Wrong
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed">{postMortem.what_went_wrong}</p>
                      </div>
                    )}
                    {postMortem.lessons_learned && (
                      <div className="border-l-2 border-green-500 pl-4">
                        <h4 className="font-medium text-green-300 mb-2 text-sm uppercase tracking-wide">
                          Lessons Learned
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed">{postMortem.lessons_learned}</p>
                      </div>
                    )}
                    <div className="pt-4 border-t border-gray-700">
                      <Link href={`/graveyard/${params.projectId}/post-mortem`}>
                        <Button variant="outline" size="sm" className="text-xs">
                          ✏️ Edit Post-Mortem
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="text-3xl mb-3">💭</div>
                    <h3 className="text-base font-semibold text-gray-200 mb-2">No reflection yet</h3>
                    <p className="text-gray-400 mb-4 text-sm">
                      Reflect on this project to extract valuable lessons.
                    </p>
                    <Link href={`/graveyard/${params.projectId}/post-mortem`}>
                      <Button size="sm" className="text-sm">
                        📝 Create Post-Mortem
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-100 text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full text-sm">
                  🧟 Mark for Revival
                </Button>
                <Button variant="outline" className="w-full text-sm">
                  💾 Extract Code Snippets
                </Button>
                <Button variant="outline" className="w-full text-sm">
                  📊 View Similar Projects
                </Button>
              </CardContent>
              </Card>
            </div>

            {/* Project Timeline */}
            <div>
              <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-100 text-base">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Last Updated</p>
                  <p className="text-gray-300 text-sm">{getTimeAgo(project.updated_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Created</p>
                  <p className="text-gray-300 text-sm">{getTimeAgo(project.created_at)}</p>
                </div>
              </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Right Column - AI Insights (wider) */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {/* AI Insights Section */}
            {postMortem ? (
              <AIInsights project={project} postMortem={postMortem} />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-100 flex items-center gap-2">
                      🤖 AI-Powered Insights
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Claude analyzes your post-mortem to provide personalized growth insights
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">💭</div>
                      <h3 className="text-lg font-semibold text-gray-200 mb-2">
                        Create a Post-Mortem to Unlock AI Insights
                      </h3>
                      <p className="text-gray-400 mb-6 max-w-sm mx-auto">
                        Reflect on your project's journey first. Then Claude will analyze your 
                        reflections to provide personalized coaching and pattern recognition.
                      </p>
                      <Link href={`/graveyard/${params.projectId}/post-mortem`}>
                        <Button size="sm" className="text-sm">
                          📝 Create Post-Mortem
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}