"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DEATH_CAUSES, DeathCause } from "@/types"
import { db } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"

export default function CreateProjectPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    epitaph: "",
    death_date: "",
    death_cause: "lost_interest" as DeathCause,
    tech_stack: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth")
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    if (!user) {
      setError("You must be logged in to create a project.")
      setLoading(false)
      return
    }
    
    try {
      const projectData = {
        user_id: user.id,
        name: formData.name,
        description: formData.description || null,
        death_date: formData.death_date,
        death_cause: formData.death_cause,
        epitaph: formData.epitaph || null,
        tech_stack: formData.tech_stack.split(",").map(t => t.trim()).filter(Boolean)
      }

      console.log("Creating project:", projectData)
      
      await db.projects.create(projectData)
      console.log("Project created successfully!")
      router.push("/graveyard")
      
    } catch (err: any) {
      console.error("Error creating project:", err)
      setError(err.message || "Failed to create project. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (authLoading) {
    return (
      <div className="min-h-screen graveyard-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to auth
  }

  return (
    <div className="min-h-screen graveyard-bg">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-100">Bury a Project</h1>
              <p className="text-gray-400">Give your abandoned project a proper burial</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push("/graveyard")}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100">Project Details</CardTitle>
              <CardDescription className="text-gray-300">
                Tell us about the project that has passed on
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
                    Date of Death *
                  </label>
                  <Input
                    type="date"
                    value={formData.death_date}
                    onChange={(e) => handleChange("death_date", e.target.value)}
                    required
                    className="bg-gray-900/50 border-gray-600 text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cause of Death *
                  </label>
                  <select
                    value={formData.death_cause}
                    onChange={(e) => handleChange("death_cause", e.target.value)}
                    required
                    className="flex w-full rounded-md border border-gray-600 bg-gray-900/50 px-3 py-2 text-sm text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {Object.entries(DEATH_CAUSES).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
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

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? "Burying..." : "⚰️ Bury Project"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => router.push("/graveyard")}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}