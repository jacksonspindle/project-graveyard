"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import type { Project } from "@/types"
import { VisualGraveyard } from "@/components/visual-graveyard"

export default function VisualGraveyardPage() {
  const { user, loading: authLoading, signOut } = useAuth()
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
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-100">Visual Graveyard</h1>
              <p className="text-sm text-gray-400">
                {projects.length} projects rest here • Signed in as {user?.email}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex items-center bg-gray-800 rounded-lg p-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-gray-100 hover:bg-gray-700"
                  onClick={() => router.push('/graveyard')}
                >
                  📋 List
                </Button>
                <Button
                  size="sm"
                  className="bg-gray-700 text-gray-100 hover:bg-gray-600"
                >
                  🪦 Graveyard
                </Button>
              </div>
              
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
      <div className="h-[calc(100vh-120px)]">
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