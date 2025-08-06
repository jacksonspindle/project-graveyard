"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Pin, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { db } from "@/lib/supabase"
import { useToast } from "@/components/ui/toast"

interface PinInsightButtonProps {
  insightId: string
  insightType: 'project_specific' | 'pattern_analysis'
  projectId?: string
  isPinned: boolean
  onPinChange?: (isPinned: boolean) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showLabel?: boolean
  // New: capture the exact content at time of pinning
  insightContent: string
  insightTypeCategory?: string
  confidenceScore?: number
  projectName?: string
  projectEpitaph?: string
}

export function PinInsightButton({ 
  insightId, 
  insightType, 
  projectId,
  isPinned: initialPinned,
  onPinChange,
  size = 'sm',
  showLabel = false,
  className = '',
  insightContent,
  insightTypeCategory,
  confidenceScore,
  projectName,
  projectEpitaph
}: PinInsightButtonProps) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [isPinned, setIsPinned] = useState(initialPinned)
  const [isLoading, setIsLoading] = useState(false)
  
  console.log('🏗️ PinInsightButton mounted for:', insightId, 'Initial pinned state:', initialPinned)
  
  // Sync internal state with prop changes
  useEffect(() => {
    setIsPinned(initialPinned)
    console.log('🔄 Syncing internal state with prop:', initialPinned)
  }, [initialPinned])

  const handlePin = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user || isLoading) return

    setIsLoading(true)
    
    try {
      if (isPinned) {
        // Find and unpin the insight
        const pinnedInsights = await db.pinnedInsights.getByUserId(user.id)
        const pinnedInsight = pinnedInsights.find(p => 
          insightType === 'project_specific' 
            ? p.ai_insight_id === insightId
            : p.pattern_insight_id === insightId
        )
        
        if (pinnedInsight) {
          await db.pinnedInsights.unpin(pinnedInsight.id)
        }
      } else {
        // Pin the insight with exact content
        await db.pinnedInsights.pin({
          user_id: user.id,
          insight_type: insightType,
          pinned_content: insightContent,
          pinned_insight_type: insightTypeCategory,
          pinned_confidence_score: confidenceScore,
          project_name: projectName,
          project_epitaph: projectEpitaph,
          ...(insightType === 'project_specific' 
            ? { ai_insight_id: insightId, project_id: projectId }
            : { pattern_insight_id: insightId }
          )
        })
      }
      
      const newPinnedState = !isPinned
      console.log('🎯 Pin action completed. New state:', newPinnedState)
      setIsPinned(newPinnedState)
      onPinChange?.(newPinnedState)
      console.log('📤 onPinChange callback called with:', newPinnedState)
      
      // Show success toast
      showToast(
        newPinnedState ? 'Insight pinned! 📌' : 'Insight unpinned',
        'success',
        2000
      )
      
    } catch (error: any) {
      console.error('Error toggling pin status:', error)
      
      // Handle duplicate pin error specifically
      if (error?.code === '23505') {
        showToast('This insight is already pinned', 'info')
        // Refresh the pin status to sync UI
        setIsPinned(true)
        onPinChange?.(true)
      } else {
        showToast('Failed to update pin status', 'error')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10', 
    lg: 'h-12 w-12'
  }

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20
  }

  if (!user) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePin}
        disabled={isLoading}
        className={`
          ${sizeClasses[size]} 
          hover:bg-blue-500/10 hover:border-blue-500/20 
          transition-all duration-200
          ${className}
        `}
        title={isPinned ? "Unpin insight" : "Pin insight"}
      >
        {isLoading ? (
          <Loader2 size={iconSizes[size]} className="animate-spin text-gray-400" />
        ) : (
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.1 }}
            animate={isPinned ? { 
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0]
            } : {}}
          >
            <Pin 
              size={iconSizes[size]} 
              className={`
                transition-all duration-300
                ${isPinned 
                  ? 'fill-blue-500 text-blue-500 drop-shadow-sm' 
                  : 'text-gray-400 hover:text-blue-400'
                }
              `}
            />
          </motion.div>
        )}
        
        {showLabel && (
          <span className="ml-2 text-xs">
            {isPinned ? 'Pinned' : 'Pin'}
          </span>
        )}
      </Button>
    </motion.div>
  )
}

// Note: usePinStatus hook is now in /src/hooks/use-pinned-insights.ts