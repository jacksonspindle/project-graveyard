"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import type { Project, PostMortem } from "@/types"

interface PostMortemPageProps {
  params: {
    projectId: string
  }
}

export default function PostMortemPage({ params }: PostMortemPageProps) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [postMortem, setPostMortem] = useState<PostMortem | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    what_problem: "",
    what_went_wrong: "",
    lessons_learned: "",
  })

  useEffect(() => {
    if (user) {
      loadData()
    } else if (!authLoading) {
      router.push("/auth")
    }
  }, [user, authLoading, params.projectId])

  const loadData = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // Load project data
      const projectData = await db.projects.getById(params.projectId)
      
      // Verify user owns this project
      if (projectData.user_id !== user.id) {
        setError("Project not found or you don't have permission to edit it")
        return
      }

      setProject(projectData)

      // Load existing post-mortem if it exists
      try {
        const postMortemData = await db.postMortems.getByProjectId(params.projectId)
        setPostMortem(postMortemData)
        setFormData({
          what_problem: postMortemData.what_problem || "",
          what_went_wrong: postMortemData.what_went_wrong || "",
          lessons_learned: postMortemData.lessons_learned || "",
        })
      } catch (err) {
        // No post-mortem exists yet, use empty form
        console.log("Creating new post-mortem")
      }

    } catch (err: any) {
      console.error("Error loading data:", err)
      setError(err.message || "Failed to load project data")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project || !user) return

    setSaving(true)
    setError(null)

    try {
      if (postMortem) {
        // Update existing post-mortem
        await db.postMortems.update(postMortem.id, {
          what_problem: formData.what_problem || null,
          what_went_wrong: formData.what_went_wrong || null, 
          lessons_learned: formData.lessons_learned || null,
        })
      } else {
        // Create new post-mortem
        await db.postMortems.create({
          project_id: params.projectId,
          what_problem: formData.what_problem || null,
          what_went_wrong: formData.what_went_wrong || null,
          lessons_learned: formData.lessons_learned || null,
        })
      }

      // Redirect back to project detail page
      router.push(`/graveyard/${params.projectId}`)

    } catch (err: any) {
      console.error("Error saving post-mortem:", err)
      setError(err.message || "Failed to save post-mortem")
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen graveyard-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-300">Loading...</p>
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
              <Link href={`/graveyard/${params.projectId}`}>
                <Button variant="outline">
                  ← Back to Project
                </Button>  
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-100">
                  {postMortem ? "Edit Post-Mortem" : "Create Post-Mortem"}
                </h1>
                <p className="text-gray-400">
                  Reflect on "{project.name}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100 flex items-center gap-2">
                📝 Post-Mortem Analysis
              </CardTitle>
              <CardDescription className="text-gray-300">
                Take time to reflect on this project and extract valuable lessons. Be honest about what went wrong and what you learned.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-md">
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    What problem was this project trying to solve?
                  </label>
                  <textarea
                    value={formData.what_problem}
                    onChange={(e) => handleChange("what_problem", e.target.value)}
                    placeholder="Describe the original motivation and goals for this project..."
                    rows={4}
                    className="w-full rounded-md border border-gray-600 bg-gray-900/50 px-3 py-2 text-gray-100 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    What went wrong? Why did this project die?
                  </label>
                  <textarea
                    value={formData.what_went_wrong}
                    onChange={(e) => handleChange("what_went_wrong", e.target.value)}
                    placeholder="Be specific about the challenges, roadblocks, or reasons that led to abandoning this project..."
                    rows={4}
                    className="w-full rounded-md border border-gray-600 bg-gray-900/50 px-3 py-2 text-gray-100 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    What did you learn? What would you do differently next time?
                  </label>
                  <textarea
                    value={formData.lessons_learned}
                    onChange={(e) => handleChange("lessons_learned", e.target.value)}
                    placeholder="Extract the key insights and lessons that will help you with future projects..."
                    rows={4}
                    className="w-full rounded-md border border-gray-600 bg-gray-900/50 px-3 py-2 text-gray-100 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="flex-1"
                  >
                    {saving ? "Saving..." : (postMortem ? "💾 Update Post-Mortem" : "📝 Create Post-Mortem")}
                  </Button>
                  <Link href={`/graveyard/${params.projectId}`}>
                    <Button 
                      type="button" 
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="mt-8 bg-gray-800/30 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100 text-lg">💡 Reflection Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-300">
                <p>• <strong>Be specific:</strong> Vague answers like "lost motivation" aren't helpful. What specifically caused you to lose motivation?</p>
                <p>• <strong>Look for patterns:</strong> If this is similar to other failed projects, note the common themes.</p>
                <p>• <strong>Focus on actionable insights:</strong> What concrete changes would prevent this failure in the future?</p>
                <p>• <strong>Consider scope:</strong> Was the project too ambitious? Too boring? Just right but poorly timed?</p>
                <p>• <strong>Technical vs. Non-technical:</strong> Was it a technical roadblock or a motivation/life issue?</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}