"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { db } from "@/lib/supabase"
import type { PinnedInsight } from "@/types"

interface UsePinnedInsightsReturn {
  pinnedInsights: PinnedInsight[]
  loading: boolean
  error: string | null
  refreshPinnedInsights: () => Promise<void>
  pinInsight: (insightId: string, insightType: 'project_specific' | 'pattern_analysis', projectId?: string, notes?: string) => Promise<void>
  unpinInsight: (insightId: string, insightType: 'project_specific' | 'pattern_analysis') => Promise<void>
  updateInsightNotes: (pinnedInsightId: string, notes: string) => Promise<void>
  isPinned: (insightId: string, insightType: 'project_specific' | 'pattern_analysis') => boolean
  getPinnedInsightId: (insightId: string, insightType: 'project_specific' | 'pattern_analysis') => string | null
}

export function usePinnedInsights(): UsePinnedInsightsReturn {
  const { user } = useAuth()
  const [pinnedInsights, setPinnedInsights] = useState<PinnedInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshPinnedInsights = useCallback(async () => {
    if (!user) {
      setPinnedInsights([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const insights = await db.pinnedInsights.getByUserId(user.id)
      setPinnedInsights(insights)
    } catch (err) {
      console.error('Error loading pinned insights:', err)
      setError(err instanceof Error ? err.message : 'Failed to load pinned insights')
    } finally {
      setLoading(false)
    }
  }, [user])

  // Load pinned insights when user changes
  useEffect(() => {
    refreshPinnedInsights()
  }, [refreshPinnedInsights])

  const pinInsight = useCallback(async (
    insightId: string, 
    insightType: 'project_specific' | 'pattern_analysis',
    projectId?: string,
    notes?: string
  ) => {
    if (!user) return

    try {
      const pinnedInsight = await db.pinnedInsights.pin({
        user_id: user.id,
        insight_type: insightType,
        notes,
        ...(insightType === 'project_specific' 
          ? { ai_insight_id: insightId, project_id: projectId }
          : { pattern_insight_id: insightId }
        )
      })

      // Add to local state (optimistic update)
      setPinnedInsights(prev => [pinnedInsight, ...prev])
    } catch (err) {
      console.error('Error pinning insight:', err)
      throw err
    }
  }, [user])

  const unpinInsight = useCallback(async (
    insightId: string, 
    insightType: 'project_specific' | 'pattern_analysis'
  ) => {
    if (!user) return

    // Find the pinned insight
    const column = insightType === 'project_specific' ? 'ai_insight_id' : 'pattern_insight_id'
    const pinnedInsight = pinnedInsights.find(p => 
      p.insight_type === insightType && 
      (insightType === 'project_specific' ? p.ai_insight_id === insightId : p.pattern_insight_id === insightId)
    )

    if (!pinnedInsight) {
      throw new Error('Pinned insight not found')
    }

    try {
      await db.pinnedInsights.unpin(pinnedInsight.id)

      // Remove from local state (optimistic update)
      setPinnedInsights(prev => prev.filter(p => p.id !== pinnedInsight.id))
    } catch (err) {
      console.error('Error unpinning insight:', err)
      throw err
    }
  }, [user, pinnedInsights])

  const updateInsightNotes = useCallback(async (pinnedInsightId: string, notes: string) => {
    if (!user) return

    try {
      await db.pinnedInsights.updateNotes(pinnedInsightId, notes)

      // Update local state (optimistic update)
      setPinnedInsights(prev => 
        prev.map(insight => 
          insight.id === pinnedInsightId 
            ? { ...insight, notes }
            : insight
        )
      )
    } catch (err) {
      console.error('Error updating insight notes:', err)
      throw err
    }
  }, [user])

  const isPinned = useCallback((
    insightId: string, 
    insightType: 'project_specific' | 'pattern_analysis'
  ): boolean => {
    return pinnedInsights.some(insight => 
      insight.insight_type === insightType &&
      (insightType === 'project_specific' 
        ? insight.ai_insight_id === insightId 
        : insight.pattern_insight_id === insightId
      )
    )
  }, [pinnedInsights])

  const getPinnedInsightId = useCallback((
    insightId: string, 
    insightType: 'project_specific' | 'pattern_analysis'
  ): string | null => {
    const pinnedInsight = pinnedInsights.find(insight => 
      insight.insight_type === insightType &&
      (insightType === 'project_specific' 
        ? insight.ai_insight_id === insightId 
        : insight.pattern_insight_id === insightId
      )
    )
    return pinnedInsight?.id || null
  }, [pinnedInsights])

  return {
    pinnedInsights,
    loading,
    error,
    refreshPinnedInsights,
    pinInsight,
    unpinInsight,
    updateInsightNotes,
    isPinned,
    getPinnedInsightId
  }
}

// Hook for checking individual insight pin status (lighter weight)
export function usePinStatus(insightId: string, insightType: 'project_specific' | 'pattern_analysis') {
  const { user } = useAuth()
  const [isPinned, setIsPinned] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const checkPinStatus = useCallback(async () => {
    if (!user) {
      setIsPinned(false)
      setIsLoading(false)
      return
    }

    try {
      const pinned = await db.pinnedInsights.isPinned(user.id, insightId, insightType)
      setIsPinned(pinned)
    } catch (error) {
      console.error('Error checking pin status:', error)
      setIsPinned(false)
    } finally {
      setIsLoading(false)
    }
  }, [user, insightId, insightType])

  useEffect(() => {
    checkPinStatus()
  }, [user?.id, insightId, insightType]) // ✅ Direct dependencies

  const refreshPinStatus = useCallback(() => {
    checkPinStatus()
  }, [checkPinStatus])

  return { 
    isPinned, 
    isLoading, 
    refreshPinStatus 
  }
}