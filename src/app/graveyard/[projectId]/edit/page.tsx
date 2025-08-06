"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DEATH_CAUSES, DeathCause } from "@/types"
import { db } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import type { Project } from "@/types"
import { GraveyardHeader } from "@/components/graveyard-header"

interface EditProjectPageProps {
  params: {
    projectId: string
  }
}

export default function EditProjectPage({ params }: EditProjectPageProps) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    epitaph: "",
    death_date: "",
    death_cause: "lost_interest" as DeathCause,
    tech_stack: "",
  })

  useEffect(() => {
    if (user) {
      loadProject()
    } else if (!authLoading) {
      router.push("/auth")
    }
  }, [user, authLoading, params.projectId])

  const loadProject = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const projectData = await db.projects.getById(params.projectId)
      
      // Verify user owns this project
      if (projectData.user_id !== user.id) {
        setError("Project not found or you don't have permission to edit it")
        return
      }

      setProject(projectData)
      setFormData({
        name: projectData.name,
        description: projectData.description || "",
        epitaph: projectData.epitaph || "",
        death_date: projectData.death_date,
        death_cause: projectData.death_cause,
        tech_stack: projectData.tech_stack.join(", "),
      })

    } catch (err: any) {
      console.error("Error loading project:", err)
      setError(err.message || "Failed to load project")
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
      await db.projects.update(project.id, {
        name: formData.name,
        description: formData.description || null,
        epitaph: formData.epitaph || null,
      })

      // Redirect back to project detail page
      router.push(`/graveyard/${params.projectId}`)

    } catch (err: any) {
      console.error("Error updating project:", err)
      setError(err.message || "Failed to update project")
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
      {/* Unified Header Component */}
      <GraveyardHeader 
        title={`✏️ Edit Project`}
        subtitle={`Update "${project.name}" details`}
      />
      
      {/* Back Button Below Header */}
      <div className="container mx-auto px-4 py-4">
        <Link href={`/graveyard/${params.projectId}`}>
          <Button variant="outline" size="sm">
            ← Back to Project
          </Button>
        </Link>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100">Project Details</CardTitle>
              <CardDescription className="text-gray-300">
                Update the information about this buried project
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-md">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Project Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g., TodoApp #47"
                    required
                    className="bg-gray-900/50 border-gray-600 text-gray-100 placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="What was this project supposed to do?"
                    rows={3}
                    className="flex w-full rounded-md border border-gray-600 bg-gray-900/50 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Epitaph
                  </label>
                  <Input
                    value={formData.epitaph}
                    onChange={(e) => handleChange("epitaph", e.target.value)}
                    placeholder="e.g., You were too ambitious for a weekend"
                    maxLength={100}
                    className="bg-gray-900/50 border-gray-600 text-gray-100 placeholder:text-gray-400"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    A short, memorable farewell ({formData.epitaph.length}/100)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tech Stack
                  </label>
                  <Input
                    value={formData.tech_stack}
                    onChange={(e) => handleChange("tech_stack", e.target.value)}
                    placeholder="React, Node.js, PostgreSQL"
                    className="bg-gray-900/50 border-gray-600 text-gray-100 placeholder:text-gray-400"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate technologies with commas
                  </p>
                </div>

                <div className="bg-gray-900/30 p-4 rounded-md">
                  <p className="text-sm text-gray-400 mb-2">
                    <strong>Note:</strong> Death date and cause cannot be changed after creation.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Death Date:</span>
                      <span className="text-gray-300 ml-2">{formData.death_date}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Cause:</span>
                      <span className="text-gray-300 ml-2">{DEATH_CAUSES[formData.death_cause]}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="flex-1"
                  >
                    {saving ? "Saving..." : "💾 Save Changes"}
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
        </div>
      </div>
    </div>
  )
}