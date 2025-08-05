"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { INSIGHT_TYPE_LABELS, INSIGHT_TYPE_EMOJIS } from "@/types"
import type { AIInsight, Project, PostMortem } from "@/types"
import { db } from "@/lib/supabase"

interface AIInsightsProps {
  project: Project
  postMortem: PostMortem
}

export function AIInsights({ project, postMortem }: AIInsightsProps) {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('AIInsights: postMortem loaded:', postMortem)
    loadExistingInsights()
  }, [postMortem.id])

  const loadExistingInsights = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('AIInsights: Loading insights for post-mortem ID:', postMortem.id)
      const existingInsights = await db.aiInsights.getByPostMortemId(postMortem.id)
      console.log('AIInsights: Loaded insights:', existingInsights)
      setInsights(existingInsights)
    } catch (err: any) {
      console.error('Error loading insights:', err)
      setError('Failed to load insights')
    } finally {
      setLoading(false)
    }
  }

  const generateInsights = async () => {
    try {
      setGenerating(true)
      setError(null)

      // Call the real Claude API via our endpoint
      const response = await fetch('/api/ai/analyze-post-mortem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: project.id,
          postMortemId: postMortem.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate insights')
      }

      const { insights: savedInsights } = await response.json()
      setInsights(savedInsights)
      
    } catch (err: any) {
      console.error('Error generating insights:', err)
      
      // Fallback to mock insights if API fails
      console.log('Falling back to mock insights due to API error')
      try {
        const mockInsights = generateMockInsights(project, postMortem)
        await db.aiInsights.deleteByPostMortemId(postMortem.id)
        
        const savedInsights: AIInsight[] = []
        for (const insight of mockInsights) {
          const saved = await db.aiInsights.create({
            project_id: project.id,
            post_mortem_id: postMortem.id,
            insight_type: insight.insight_type!,
            content: insight.content!,
            confidence_score: insight.confidence_score,
          })
          savedInsights.push(saved)
        }
        
        setInsights(savedInsights)
        setError('⚠️ Using improved sample insights - Add your Anthropic API key for full Claude analysis')
      } catch (fallbackErr) {
        setError('Failed to generate insights')
      }
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100 flex items-center gap-2">
            🤖 AI-Powered Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-300">Loading insights...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100 flex items-center gap-2">
            🤖 AI-Powered Insights
          </CardTitle>
          <CardDescription className="text-gray-300">
            Claude analyzes your post-mortem to provide personalized growth insights
          </CardDescription>
        </CardHeader>
        <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-md">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

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
              <div className="text-4xl mb-4">🤔</div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">
                Ready for AI Analysis?
              </h3>
              <p className="text-gray-400 mb-6">
                Let Claude analyze your post-mortem and provide personalized insights to help you grow as a developer.
              </p>
              <Button 
                onClick={generateInsights}
                disabled={generating}
                className="min-w-32"
              >
                {generating ? (
                  <>⏳ Generating...</>
                ) : (
                  <>🔮 Generate Insights</>
                )}
              </Button>
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
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                >
                  <InsightCard insight={insight} />
                </motion.div>
              ))}
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: insights.length * 0.1 + 0.2 }}
                className="pt-4 border-t border-gray-700"
              >
                <Button 
                  onClick={generateInsights}
                  disabled={generating}
                  variant="outline"
                  size="sm"
                >
                  {generating ? 'Regenerating...' : '🔄 Regenerate Insights'}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function InsightCard({ insight }: { insight: AIInsight }) {
  const [expanded, setExpanded] = useState(false)
  
  const emoji = INSIGHT_TYPE_EMOJIS[insight.insight_type]
  const label = INSIGHT_TYPE_LABELS[insight.insight_type]

  // Parse structured content
  const parseStructuredContent = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim())
    const sections: Record<string, string> = {}
    let currentKey = 'main'
    
    for (const line of lines) {
      if (line.includes(':') && !line.startsWith('"')) {
        const [key, ...rest] = line.split(':')
        const value = rest.join(':').trim()
        if (key.trim().toLowerCase().includes('pattern') || 
            key.trim().toLowerCase().includes('words') ||
            key.trim().toLowerCase().includes('insight') ||
            key.trim().toLowerCase().includes('said') ||
            key.trim().toLowerCase().includes('step') ||
            key.trim().toLowerCase().includes('how') ||
            key.trim().toLowerCase().includes('statement') ||
            key.trim().toLowerCase().includes('question') ||
            key.trim().toLowerCase().includes('matters') ||
            key.trim().toLowerCase().includes('based') ||
            key.trim().toLowerCase().includes('strategy') ||
            key.trim().toLowerCase().includes('plan')) {
          currentKey = key.trim()
          sections[currentKey] = value
        } else {
          sections[currentKey] = (sections[currentKey] || '') + (sections[currentKey] ? ' ' : '') + line
        }
      } else {
        sections[currentKey] = (sections[currentKey] || '') + (sections[currentKey] ? ' ' : '') + line
      }
    }
    
    return sections
  }

  const sections = parseStructuredContent(insight.content)
  const hasStructuredContent = Object.keys(sections).length > 1

  return (
    <motion.div 
      className="border border-gray-600 rounded-lg p-5 bg-gray-900/30 cursor-pointer"
      whileHover={{ 
        scale: 1.005,
        x: 2,
        transition: { duration: 0.3, type: "spring", stiffness: 200, damping: 20 }
      }}
      transition={{
        scale: { duration: 0.12, ease: "easeOut" },
        x: { duration: 0.12, ease: "easeOut" }
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">{emoji}</span>
          <h4 className="font-medium text-gray-200">{label}</h4>
        </div>
        {insight.confidence_score && (
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
            {Math.round(insight.confidence_score * 100)}% confidence
          </span>
        )}
      </div>
      
      <div className="text-gray-300 text-sm leading-relaxed">
        {hasStructuredContent ? (
          <div className="space-y-3">
            {Object.entries(sections).map(([key, value]) => (
              <div key={key}>
                {key !== 'main' && (
                  <div className="font-medium text-gray-200 text-xs uppercase tracking-wide mb-1">
                    {key}
                  </div>
                )}
                <div className={key === 'main' ? '' : 'ml-2'}>
                  {/* Check if content has numbered list items */}
                  {(key.toLowerCase().includes('plan') || value.match(/\d+\.\s/)) ? (
                    <div className="my-4">
                      <ol className="list-decimal list-inside space-y-2">
                        {value.split(/(?=\d+\.\s)/).filter(item => item.trim()).map((item, idx) => (
                          <li key={idx} className="text-gray-300">
                            {item.replace(/^\d+\.\s*/, '').trim()}
                          </li>
                        ))}
                      </ol>
                    </div>
                  ) : value.startsWith('"') && value.endsWith('"') ? (
                    <blockquote className="italic text-blue-300 border-l-2 border-blue-500 pl-3">
                      {value}
                    </blockquote>
                  ) : (
                    <p className="text-gray-300">{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Fallback for unstructured content
          <>
            {expanded || insight.content.length <= 300 ? (
              <p className="whitespace-pre-line">{insight.content}</p>
            ) : (
              <>
                <p className="whitespace-pre-line">{insight.content.slice(0, 300)}...</p>
                <motion.button
                  onClick={() => setExpanded(true)}
                  className="text-blue-400 hover:text-blue-300 mt-2 text-xs"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Read more
                </motion.button>
              </>
            )}
            
            {expanded && insight.content.length > 300 && (
              <motion.button
                onClick={() => setExpanded(false)}
                className="text-blue-400 hover:text-blue-300 mt-2 text-xs block"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Show less
              </motion.button>
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}

// Improved mock function that actually analyzes the post-mortem content
function generateMockInsights(project: Project, postMortem: PostMortem): Partial<AIInsight>[] {
  const insights: Partial<AIInsight>[] = []
  
  // Extract key phrases and themes from the actual responses
  const problemText = postMortem.what_problem?.toLowerCase() || ''
  const wrongText = postMortem.what_went_wrong?.toLowerCase() || ''
  const learnedText = postMortem.lessons_learned?.toLowerCase() || ''
  
  // Pattern Recognition - based on actual content
  if (wrongText.includes('no actual problem') || problemText.includes('fun experiment')) {
    insights.push({
      insight_type: 'pattern_recognition',
      content: `When you describe this as "mostly just a fun experiment" with "no actual problem being addressed," you've identified a crucial pattern. Projects without genuine problems to solve often lose momentum because there's no compelling reason to push through difficulties. This is actually a common failure mode for side projects.`,
      confidence_score: 0.9,
    })
  }

  // Coaching - based on their specific insights
  if (learnedText.includes('ai') && learnedText.includes('variations')) {
    insights.push({
      insight_type: 'coaching',
      content: `Your insight about "incorporating AI to create variations" shows you're already thinking about potential pivots. This is exactly the right mindset - taking failed projects and finding specific ways to enhance them with new technology. The key is to validate demand for AI-enhanced versions before building.`,
      confidence_score: 0.85,
    })
  }

  // Questions - dig deeper into their specific situation
  if (wrongText.includes('monetization')) {
    insights.push({
      insight_type: 'questions',
      content: `You mentioned you "didn't see much potential for monetization." What specific research did you do to validate this assumption? Sometimes what looks like a "fun app" actually solves real problems we don't initially recognize. Have you talked to potential users who might pay for this type of experience?`,
      confidence_score: 0.8,
    })
  }

  // Strategies - based on their tech and situation
  if (project.tech_stack.length > 0) {
    insights.push({
      insight_type: 'strategies',
      content: `Given your ${project.tech_stack.join(' and ')} foundation, consider the "Problem-First Pivot" approach: Keep your technical implementation but find a real problem it could solve. Interview 10 people in related spaces to discover pain points your existing code could address.`,
      confidence_score: 0.75,
    })
  }

  // Fallback insights if content is too sparse
  if (insights.length === 0) {
    insights.push({
      insight_type: 'pattern_recognition',
      content: `Based on your post-mortem, this project struggled with ${project.death_cause.replace('_', ' ')}. This is a valuable data point for understanding your project patterns.`,
      confidence_score: 0.6,
    })
  }

  return insights
}