"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { db } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import type { Project } from "@/types"
import { VisualGraveyard } from "@/components/visual-graveyard"
import { GraveyardHeader } from "@/components/graveyard-header"
import { Button } from "@/components/ui/button"

export default function VisualGraveyardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadProjects()
    } else if (!authLoading) {
      router.push("/auth")
    }
  }, [user, authLoading, router])

  const loadProjects = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)
      const userProjects = await db.projects.getAll(user.id)
      setProjects(userProjects)
    } catch (err: any) {
      console.error("Error loading projects:", err)
      setError(err.message || "Failed to load projects")
    } finally {
      setLoading(false)
    }
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
      {/* Unified Header Component */}
      <GraveyardHeader 
        projectCount={projects.length}
        loading={loading}
        error={error}
      />

      {/* Main Content */}
      <div className="h-[calc(100vh-88px)]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">⏳</div>
              <h2 className="text-2xl font-bold text-gray-100 mb-2">Loading your graveyard...</h2>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-gray-100 mb-2">Error loading projects</h2>
              <p className="text-gray-400 mb-4">{error}</p>
              <Button onClick={loadProjects}>Try Again</Button>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">🌙</div>
              <h2 className="text-2xl font-bold text-gray-100 mb-2">Your graveyard is empty</h2>
              <p className="text-gray-400 mb-6">
                No projects have been buried yet. When you abandon your first project, it will appear here as a gravestone.
              </p>
              <Button onClick={() => router.push('/graveyard/create')}>
                + Bury Your First Project
              </Button>
            </div>
          </div>
        ) : (
          <VisualGraveyard projects={projects} />
        )}
      </div>
    </div>
  )
}