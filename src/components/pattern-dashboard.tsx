"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PinInsightButton, usePinStatus } from "@/components/pin-insight-button"
import { 
  UserPattern, 
  PatternInsight, 
  UserLearningMetric, 
  PATTERN_LABELS, 
  PATTERN_EMOJIS, 
  PATTERN_DESCRIPTIONS,
  Trend 
} from "@/types"
import { db } from "@/lib/supabase"

interface PatternDashboardProps {
  userId: string
  projectCount: number
  onDataStatusChange?: (hasData: boolean) => void
  externalData?: {
    patterns: UserPattern[]
    insights: PatternInsight[]
    metrics: UserLearningMetric[]
  }
}

export function PatternDashboard({ userId, projectCount, onDataStatusChange, externalData }: PatternDashboardProps) {
  const [patterns, setPatterns] = useState<UserPattern[]>([])
  const [insights, setInsights] = useState<PatternInsight[]>([])
  const [learningMetrics, setLearningMetrics] = useState<UserLearningMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [hasExistingData, setHasExistingData] = useState(false)

  useEffect(() => {
    if (externalData) {
      // Use external data if provided (for smooth updates)
      setPatterns(externalData.patterns || [])
      setInsights(externalData.insights || [])
      setLearningMetrics(externalData.metrics || [])
      
      const hasData = (externalData.patterns?.length > 0) || (externalData.insights?.length > 0)
      setHasExistingData(hasData)
      onDataStatusChange?.(hasData)
      setLoading(false)
    } else {
      // Load data normally on first render
      loadPatternData()
    }
  }, [userId, externalData])

  const loadPatternData = async (skipLoading = false) => {
    try {
      if (!skipLoading) {
        setLoading(true)
      }
      console.log('🔍 Loading pattern data via API for user:', userId)
      
      const response = await fetch('/api/patterns/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      if (!response.ok) {
        throw new Error('Failed to load dashboard data')
      }

      const data = await response.json()

      console.log('📊 API loaded patterns:', data.patterns?.length || 0)
      console.log('💡 API loaded insights:', data.insights?.length || 0)
      console.log('📈 API loaded metrics:', data.metrics?.length || 0)
      
      if (data.errors.insights) {
        console.error('Insights error:', data.errors.insights)
      }

      setPatterns(data.patterns || [])
      setInsights(data.insights || [])
      setLearningMetrics(data.metrics || [])
      
      // Check if user has existing data
      const hasData = (data.patterns?.length > 0) || (data.insights?.length > 0)
      setHasExistingData(hasData)
      onDataStatusChange?.(hasData)
    } catch (error) {
      console.error('Error loading pattern data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInsightFeedback = async (insightId: string, feedback: 'helpful' | 'not_helpful' | 'irrelevant') => {
    try {
      await db.patternInsights.submitFeedback(insightId, feedback)
      // Update local state
      setInsights(prev => prev.map(insight => 
        insight.id === insightId ? { ...insight, user_feedback: feedback } : insight
      ))
    } catch (error) {
      console.error('Error submitting feedback:', error)
    }
  }

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="h-32 bg-gray-800/30 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </motion.div>
    )
  }

  if (projectCount < 2) {
    return (
      <Card className="bg-gray-800/30 border-gray-700">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🧠</div>
          <CardTitle className="text-gray-100">Pattern Recognition Loading...</CardTitle>
          <CardDescription className="text-gray-400">
            Bury {2 - projectCount} more project{2 - projectCount === 1 ? '' : 's'} to unlock intelligent pattern detection and personalized insights
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        
        {/* Clean Side-by-Side Layout */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
        
        {/* Your Failure DNA */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-gray-800/30 border-gray-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-gray-100 flex items-center gap-2 text-xl">
              🧬 Your Failure DNA
            </CardTitle>
            <CardDescription className="text-gray-400 text-sm">
              Behavioral patterns detected from your project data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {patterns.length === 0 ? (
                <motion.div 
                  key="empty-patterns"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="text-center py-8"
                >
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-gray-400 text-sm">
                    Still analyzing your patterns...
                  </p>
                </motion.div>
              ) : (
                <motion.div 
                  key="patterns-list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {patterns.map((pattern, index) => (
                    <motion.div 
                      key={pattern.id} 
                      initial={{ opacity: 0, y: 30, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      whileHover={{ 
                        scale: 1.005,
                        transition: { duration: 0.3, type: "spring", stiffness: 200, damping: 20 }
                      }}
                      whileTap={{ scale: 0.998 }}
                      transition={{ 
                        duration: 0.5, 
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 100,
                        damping: 15,
                        // Fast exit animation when hover ends
                        scale: { duration: 0.15, ease: "easeOut" }
                      }}
                      className="p-4 bg-gray-700/40 rounded-lg border border-gray-600/40 cursor-pointer"
                    >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {PATTERN_EMOJIS[pattern.pattern_name] || '🔍'}
                        </span>
                        <h3 className="font-semibold text-gray-100 text-base">
                          {PATTERN_LABELS[pattern.pattern_name] || 
                           pattern.pattern_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h3>
                      </div>
                      <Badge variant="secondary" className="text-xs font-medium">
                        {Math.round((pattern.confidence_score || 0) * 100)}%
                      </Badge>
                    </div>
                    
                    <p className="text-gray-300 text-sm leading-relaxed mb-3">
                      {PATTERN_DESCRIPTIONS[pattern.pattern_name] || 
                       pattern.pattern_value?.description ||
                       'AI-detected behavioral pattern'}
                    </p>
                    
                    {/* Evidence pill at bottom */}
                    {pattern.pattern_value?.evidence && (
                      <div className="flex justify-end">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-xs text-blue-300 hover:bg-blue-600/30 hover:border-blue-500/50 transition-colors">
                              View Evidence
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs bg-gray-800 border-gray-600">
                            <div className="space-y-1">
                              <p className="font-medium text-gray-100 text-xs">Evidence:</p>
                              {Array.isArray(pattern.pattern_value.evidence) ? (
                                <ul className="text-xs text-gray-300 space-y-1">
                                  {pattern.pattern_value.evidence.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-1">
                                      <span className="text-gray-500">•</span>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-xs text-gray-300">{pattern.pattern_value.evidence}</p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
          </Card>
        </motion.div>

        {/* AI Pattern Insights */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-gray-800/30 border-gray-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-gray-100 flex items-center gap-2 text-xl">
              🤖 AI Coaching Insights
            </CardTitle>
            <CardDescription className="text-gray-400 text-sm">
              Personalized recommendations based on your patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {insights.length === 0 ? (
                <motion.div 
                  key="empty-insights"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="text-center py-8"
                >
                  <div className="text-4xl mb-3">💭</div>
                  <p className="text-gray-400 text-sm">
                    No insights generated yet...
                  </p>
                </motion.div>
              ) : (
                <motion.div 
                  key="insights-list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {insights.map((insight, index) => (
                    <PatternInsightCard 
                      key={insight.id} 
                      insight={insight} 
                      index={index} 
                      onFeedback={handleInsightFeedback}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
          </Card>
        </motion.div>
        </motion.div>
      </div>
    </TooltipProvider>
  )
}

// Separate component for pattern insight cards with pin functionality
function PatternInsightCard({ 
  insight, 
  index, 
  onFeedback 
}: { 
  insight: PatternInsight
  index: number
  onFeedback: (insightId: string, feedback: 'helpful' | 'not_helpful' | 'irrelevant') => void
}) {
  const { isPinned, refreshPinStatus } = usePinStatus(insight.id, 'pattern_analysis')
  
  // Color-code insights based on related patterns
  const patternColors = ['bg-blue-900/20 border-blue-500', 'bg-purple-900/20 border-purple-500', 'bg-green-900/20 border-green-500']
  const colorIndex = index % patternColors.length
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -30, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      whileHover={{ 
        scale: 1.005, 
        x: 2,
        transition: { duration: 0.3, type: "spring", stiffness: 200, damping: 20 }
      }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.15,
        type: "spring",
        stiffness: 100,
        damping: 15,
        // Fast exit animation when hover ends
        scale: { duration: 0.12, ease: "easeOut" },
        x: { duration: 0.12, ease: "easeOut" }
      }}
      className={`p-4 rounded-lg border-l-4 cursor-pointer ${
        insight.insight_type === 'warning' ? 'bg-red-900/20 border-red-500' :
        patternColors[colorIndex]
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">
            {insight.insight_type === 'warning' ? '⚠️' :
             insight.insight_type === 'recommendation' ? '💡' :
             insight.insight_type === 'observation' ? '🔍' : '🎯'}
          </span>
          <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">
            {insight.insight_type}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {insight.confidence_score && (
            <Badge variant="outline" className="text-xs bg-gray-700/50 border-gray-500 text-gray-200">
              {Math.round(insight.confidence_score * 100)}%
            </Badge>
          )}
          <PinInsightButton
            insightId={insight.id}
            insightType="pattern_analysis"
            isPinned={isPinned}
            onPinChange={refreshPinStatus}
            size="sm"
            insightContent={insight.insight_text}
            insightTypeCategory={insight.insight_type}
            confidenceScore={insight.confidence_score}
          />
        </div>
      </div>
      
      <p className="text-gray-200 text-sm leading-relaxed mb-3">
        {insight.insight_text}
      </p>
      
      <div className="flex items-center justify-between">
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="text-xs text-gray-500 hover:text-gray-400 transition-colors cursor-help">
              Based on {insight.projects_analyzed} project{insight.projects_analyzed !== 1 ? 's' : ''} 🔍
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm bg-gray-800 border-gray-600">
            <div className="space-y-1">
              <p className="font-medium text-gray-100 text-xs">Analysis Context:</p>
              <p className="text-xs text-gray-300">
                This insight was generated by analyzing {insight.projects_analyzed} of your most recent projects, 
                looking at patterns in technology choices, project duration, abandonment reasons, and completion rates.
              </p>
              {insight.related_pattern_ids && insight.related_pattern_ids.length > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  Related to {insight.related_pattern_ids.length} detected pattern{insight.related_pattern_ids.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
        
        {!insight.user_feedback ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 + 0.3 }}
            className="flex items-center gap-2"
          >
            <span className="text-xs text-gray-500 mr-1">Helpful?</span>
            <motion.div 
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.3, type: "spring", stiffness: 150, damping: 15 }
              }} 
              whileTap={{ 
                scale: 0.98,
                transition: { duration: 0.1 }
              }}
            >
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-xs text-green-400 hover:text-green-300"
                onClick={() => onFeedback(insight.id, 'helpful')}
              >
                👍
              </Button>
            </motion.div>
            <motion.div 
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.3, type: "spring", stiffness: 150, damping: 15 }
              }} 
              whileTap={{ 
                scale: 0.98,
                transition: { duration: 0.1 }
              }}
            >
              <Button
                size="sm"
                variant="ghost" 
                className="h-6 px-2 text-xs text-red-400 hover:text-red-300"
                onClick={() => onFeedback(insight.id, 'not_helpful')}
              >
                👎
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <Badge variant="outline" className="text-xs">
            {insight.user_feedback === 'helpful' ? '👍 Helpful' :
             insight.user_feedback === 'not_helpful' ? '👎 Not Helpful' :
             '🤷 Irrelevant'}
          </Badge>
        )}
      </div>
    </motion.div>
  )
}