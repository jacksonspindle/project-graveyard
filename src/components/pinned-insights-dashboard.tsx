"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Pin, MessageSquare, Search, Filter, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import { db } from "@/lib/supabase"
import { INSIGHT_TYPE_LABELS, INSIGHT_TYPE_EMOJIS } from "@/types"
import type { PinnedInsight } from "@/types"

// Helper function to safely format dates
function formatProjectDate(dateString: string | null | undefined): string {
  if (!dateString) return 'Unknown'
  
  try {
    const date = new Date(dateString)
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Unknown'
    return date.toLocaleDateString()
  } catch (error) {
    return 'Unknown'
  }
}

interface PinnedInsightsDashboardProps {
  className?: string
}

export function PinnedInsightsDashboard({ className = "" }: PinnedInsightsDashboardProps) {
  const { user } = useAuth()
  const [pinnedInsights, setPinnedInsights] = useState<PinnedInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (user) {
      loadPinnedInsights()
    }
  }, [user])

  const loadPinnedInsights = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)
      const insights = await db.pinnedInsights.getByUserId(user.id)
      setPinnedInsights(insights)
    } catch (err) {
      console.error('Error loading pinned insights:', err)
      setError('Failed to load pinned insights')
    } finally {
      setLoading(false)
    }
  }

  const handleUnpin = async (pinnedInsightId: string) => {
    if (!user) return

    try {
      await db.pinnedInsights.unpin(pinnedInsightId)
      // Remove from local state
      setPinnedInsights(prev => prev.filter(insight => insight.id !== pinnedInsightId))
    } catch (err) {
      console.error('Error unpinning insight:', err)
      // TODO: Show toast notification
    }
  }

  const handleUpdateNotes = async (pinnedInsightId: string, notes: string) => {
    if (!user) return

    console.log('Updating notes for insight:', pinnedInsightId, 'with notes:', notes)
    
    try {
      const result = await db.pinnedInsights.updateNotes(pinnedInsightId, notes)
      console.log('Notes update result:', result)
      
      // Update local state
      setPinnedInsights(prev => 
        prev.map(insight => 
          insight.id === pinnedInsightId 
            ? { ...insight, notes }
            : insight
        )
      )
      console.log('Local state updated successfully')
    } catch (err) {
      console.error('Error updating notes:', err)
      // TODO: Show toast notification
    }
  }

  // Filter insights based on search query and active tab
  const filteredInsights = pinnedInsights.filter(insight => {
    const matchesSearch = searchQuery === "" || 
      (insight.ai_insight?.content?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (insight.pattern_insight?.insight_text?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (insight.project?.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (insight.notes?.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesTab = activeTab === "all" || 
      (activeTab === "project" && insight.insight_type === "project_specific") ||
      (activeTab === "pattern" && insight.insight_type === "pattern_analysis")

    return matchesSearch && matchesTab
  })

  const projectInsights = pinnedInsights.filter(i => i.insight_type === 'project_specific')
  const patternInsights = pinnedInsights.filter(i => i.insight_type === 'pattern_analysis')

  if (loading) {
    return (
      <div className={`${className}`}>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-gray-300">Loading your pinned insights...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="text-4xl mb-4">❌</div>
              <p className="text-red-400">{error}</p>
              <Button onClick={loadPinnedInsights} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (pinnedInsights.length === 0) {
    return (
      <div className={`${className}`}>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center max-w-md">
              <div className="text-4xl mb-4">💭</div>
              <h3 className="text-xl font-semibold text-gray-200 mb-2">No Pinned Insights Yet</h3>
              <p className="text-gray-400 mb-6">
                Start pinning valuable AI insights from your projects and pattern analyses to build your personal knowledge base.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Pin size={16} className="fill-blue-500 text-blue-500" />
                <span>Look for the pin icon on insights to pin them</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <Pin className="fill-blue-500 text-blue-500" size={24} />
            My Pinned Insights
          </h1>
          <p className="text-gray-400 text-sm">
            Your personal collection of valuable AI-generated insights
          </p>
        </div>
        <Badge variant="outline" className="bg-gray-700/50 text-gray-200">
          {pinnedInsights.length} pinned
        </Badge>
      </div>

      {/* Search and Filter */}
      <Card className="bg-gray-800/30 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search pinned insights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-900/50 border-gray-600 text-gray-100"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <span className="text-sm text-gray-400">Filter:</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-gray-100"
          >
            All ({pinnedInsights.length})
          </TabsTrigger>
          <TabsTrigger 
            value="project"
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-gray-100"
          >
            Project Insights ({projectInsights.length})
          </TabsTrigger>
          <TabsTrigger 
            value="pattern"
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-gray-100"
          >
            Pattern Analysis ({patternInsights.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {filteredInsights.length === 0 ? (
                <Card className="bg-gray-800/30 border-gray-700">
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="text-3xl mb-3">🔍</div>
                      <p className="text-gray-400">
                        {searchQuery 
                          ? `No insights match "${searchQuery}"`
                          : "No insights in this category"
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                filteredInsights.map((insight, index) => (
                  <PinnedInsightCard
                    key={insight.id}
                    insight={insight}
                    index={index}
                    onUnpin={handleUnpin}
                    onUpdateNotes={handleUpdateNotes}
                  />
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Individual pinned insight card component
function PinnedInsightCard({ 
  insight, 
  index, 
  onUnpin, 
  onUpdateNotes 
}: { 
  insight: PinnedInsight
  index: number
  onUnpin: (id: string) => void
  onUpdateNotes: (id: string, notes: string) => Promise<void>
}) {
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [notesValue, setNotesValue] = useState(insight.notes || "")

  const handleSaveNotes = async () => {
    try {
      await onUpdateNotes(insight.id, notesValue)
      setIsEditingNotes(false)
    } catch (error) {
      console.error('Failed to save notes:', error)
      // Keep editing mode open on error
    }
  }

  const handleCancelNotes = () => {
    setNotesValue(insight.notes || "")
    setIsEditingNotes(false)
  }

  // Get the insight content and metadata - prefer pinned content (exact original)
  const isProjectInsight = insight.insight_type === 'project_specific'
  const content = insight.pinned_content || (isProjectInsight 
    ? insight.ai_insight?.content 
    : insight.pattern_insight?.insight_text)
  const insightType = insight.pinned_insight_type || (isProjectInsight
    ? insight.ai_insight?.insight_type
    : insight.pattern_insight?.insight_type)
  const confidence = insight.pinned_confidence_score || (isProjectInsight
    ? insight.ai_insight?.confidence_score
    : insight.pattern_insight?.confidence_score)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div>
                {isProjectInsight ? (
                  <>
                    <span className="text-lg">
                      {insightType && INSIGHT_TYPE_EMOJIS[insightType as keyof typeof INSIGHT_TYPE_EMOJIS] || '💡'}
                    </span>
                    <Badge variant="outline" className="ml-2 text-xs bg-blue-900/20 border-blue-500 text-blue-200">
                      From Project: {insight.project?.name}
                    </Badge>
                  </>
                ) : (
                  <>
                    <span className="text-lg">
                      {insightType === 'warning' ? '⚠️' :
                       insightType === 'recommendation' ? '💡' :
                       insightType === 'observation' ? '🔍' : '🎯'}
                    </span>
                    <Badge variant="outline" className="ml-2 text-xs bg-purple-900/20 border-purple-500 text-purple-200">
                      Pattern Analysis
                    </Badge>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {confidence && (
                <Badge variant="outline" className="text-xs bg-gray-700/50 border-gray-500 text-gray-200">
                  {Math.round(confidence * 100)}%
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUnpin(insight.id)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Pinned {new Date(insight.pinned_at).toLocaleDateString()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Insight Content */}
            <div className="text-gray-300 text-sm leading-relaxed">
              <FormattedInsightContent content={content || ''} />
            </div>

            {/* Project context for project insights */}
            {isProjectInsight && (insight.project_name || insight.project) && (
              <div className="border-l-2 border-blue-500 pl-3 py-2 bg-blue-900/10 rounded-r">
                <p className="text-xs text-blue-300 font-medium">Project Context</p>
                <p className="text-sm text-gray-300">
                  <strong>{insight.project_name || insight.project?.name}</strong>
                  {(insight.project_epitaph || insight.project?.epitaph) && (
                    <span> - "{insight.project_epitaph || insight.project?.epitaph}"</span>
                  )}
                  {insight.project?.death_date && (
                    <span> - Died {formatProjectDate(insight.project.death_date)}</span>
                  )}
                </p>
              </div>
            )}

            {/* Personal Notes */}
            <div className="border-t border-gray-700 pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">Your Notes</label>
                {!isEditingNotes && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingNotes(true)}
                    className="text-xs text-gray-400 hover:text-gray-300"
                  >
                    <MessageSquare size={12} className="mr-1" />
                    {insight.notes ? 'Edit' : 'Add Note'}
                  </Button>
                )}
              </div>
              
              {isEditingNotes ? (
                <div className="space-y-2">
                  <Textarea
                    value={notesValue}
                    onChange={(e) => setNotesValue(e.target.value)}
                    placeholder="Why is this insight valuable to you?"
                    className="bg-gray-900/50 border-gray-600 text-gray-100 text-sm"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveNotes}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelNotes}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-400 italic">
                  {insight.notes || "No notes added yet"}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Helper component to format insight content with proper line breaks and structure
function FormattedInsightContent({ content }: { content: string }) {
  if (!content) return null

  // Smart formatting that properly handles numbered lists, headers, and bullet points
  const processContent = (text: string) => {
    // First, normalize whitespace
    let processed = text.replace(/\s+/g, ' ').trim()
    
    // Force line breaks before numbered items (1. 2. 3. etc.) wherever they appear
    processed = processed.replace(/(\s)(\d+\.\s)/g, '\n$2')
    
    // Add line breaks before and after hyphens that are used as separators
    processed = processed.replace(/(\s)-(\s)/g, '\n- ')
    
    // Add line breaks before headers but don't wrap them yet
    processed = processed.replace(/(Action Plan|Anti-Pattern Strategy|Based On Your History|Key Insight|Recommendation|Strategy|What You Said|Pattern-Breaking Action|Implementation|Your Pattern|Historical Pattern|Current Evidence|Pattern Evolution):/gi, '\n\n$1:\n')
    
    // Handle quotes with context (like "What You Said: "...")
    processed = processed.replace(/(\w+:\s*")([^"]+)("\s)/g, '$1$2$3\n')
    
    return processed
  }

  const processedText = processContent(content)
  const lines = processedText.split('\n').filter(line => line.trim())

  return (
    <div className="space-y-3">
      {lines.map((line, index) => {
        const trimmed = line.trim()
        if (!trimmed) return null

        // Check if it's a header (ends with colon and contains key words)
        if (trimmed.match(/(Action Plan|Anti-Pattern Strategy|Based On Your History|Key Insight|Recommendation|Strategy|What You Said|Pattern-Breaking Action|Implementation|Your Pattern|Historical Pattern|Current Evidence|Pattern Evolution):/i)) {
          return (
            <div key={index} className="mt-4 mb-2">
              <h4 className="font-semibold text-blue-300 text-sm">
                {trimmed}
              </h4>
            </div>
          )
        }

        // Check if it's a numbered list item
        if (trimmed.match(/^\d+\.\s/)) {
          const match = trimmed.match(/^(\d+)\.\s(.+)/)
          if (match) {
            return (
              <div key={index} className="flex items-start gap-2 py-1">
                <span className="text-gray-400 font-medium text-sm mt-0.5 min-w-[1.2rem]">
                  {match[1]}.
                </span>
                <span className="text-gray-300 text-sm leading-relaxed">
                  {match[2]}
                </span>
              </div>
            )
          }
        }

        // Check if it's a bullet point (starts with -)
        if (trimmed.match(/^-\s/)) {
          const match = trimmed.match(/^-\s(.+)/)
          if (match) {
            return (
              <div key={index} className="flex items-start gap-2 py-1 ml-2">
                <span className="text-gray-400 font-medium text-sm mt-0.5 min-w-[0.8rem]">
                  •
                </span>
                <span className="text-gray-300 text-sm leading-relaxed">
                  {match[1]}
                </span>
              </div>
            )
          }
        }

        // Regular paragraph
        return (
          <p key={index} className="text-gray-300 text-sm leading-relaxed">
            {trimmed}
          </p>
        )
      })}
    </div>
  )
}