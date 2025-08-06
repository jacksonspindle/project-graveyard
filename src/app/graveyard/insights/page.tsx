"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { PinnedInsightsDashboard } from "@/components/pinned-insights-dashboard"
import { GraveyardHeader } from "@/components/graveyard-header"
import { 
  TooltipProvider,
} from "@/components/ui/tooltip"

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
    <TooltipProvider>
      <div className="min-h-screen graveyard-bg overflow-x-hidden">
        {/* Unified Header Component */}
        <GraveyardHeader 
          title="📌 Pinned Insights"
          subtitle="Your personal collection of valuable AI insights"
        />
        
        {/* Back Button Below Header */}
        <div className="container mx-auto px-4 py-4">
          <Link href="/graveyard">
            <Button variant="outline" size="sm">
              ← Back to Graveyard
            </Button>
          </Link>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <PinnedInsightsDashboard />
        </div>
      </div>
    </TooltipProvider>
  )
}