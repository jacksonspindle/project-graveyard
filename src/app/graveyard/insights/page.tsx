"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { PinnedInsightsDashboard } from "@/components/pinned-insights-dashboard"

export default function PinnedInsightsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth")
    }
  }, [user, authLoading, router])

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
            <div className="flex items-center gap-4">
              <Link href="/graveyard">
                <Button variant="outline">
                  ← Back to Graveyard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-100">Pinned Insights</h1>
                <p className="text-gray-400">
                  Your personal collection of valuable AI insights
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/graveyard/create">
                <Button variant="outline">
                  + Bury Project
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => router.push("/auth")}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <PinnedInsightsDashboard />
      </div>
    </div>
  )
}