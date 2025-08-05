import Anthropic from '@anthropic-ai/sdk'

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Types for AI Pattern Analysis
export interface AIPatternAnalysis {
  detected_patterns: Array<{
    pattern_name: string
    confidence: number
    insight_text: string
    evidence: string[]
    recommendations: string[]
  }>
  behavioral_insights: Array<{
    insight_type: 'warning' | 'recommendation' | 'observation' | 'prediction'
    insight_text: string
    confidence: number
  }>
  learning_velocity_analysis: {
    strengths: string[]
    areas_for_improvement: string[]
    trajectory: 'improving' | 'stable' | 'declining'
    personalized_advice: string
  }
}

export interface PostMortemAnalysisInput {
  projectName: string
  projectDescription?: string
  deathCause: string
  techStack: string[]
  whatProblem?: string
  whatWentWrong?: string
  lessonsLearned?: string
  projectHistory?: Array<{
    name: string
    deathCause: string
    lessonsLearned?: string
    whatWentWrong?: string
    techStack?: string[]
  }>
  // New pattern-aware inputs
  userPatterns?: Array<{
    pattern_name: string
    pattern_type: string
    frequency: number
    confidence_score: number
    metadata: Record<string, any>
  }>
  learningVelocity?: {
    avg_project_lifespan_trend: string
    scope_management_score: number
    technology_consistency_score: number
    completion_rate_trend: string
  }
  projectCount?: number
  isFirstProject?: boolean
}

export interface AIInsight {
  type: 'pattern_recognition' | 'coaching' | 'questions' | 'strategies'
  content: string
  confidenceScore: number
}

export async function analyzePostMortem(input: PostMortemAnalysisInput): Promise<AIInsight[]> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured')
  }

  const prompt = buildPostMortemAnalysisPrompt(input)

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    // Parse the response and extract insights
    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude')
    }

    return parseClaudeResponse(content.text)
  } catch (error) {
    console.error('Error analyzing post-mortem with Claude:', error)
    throw new Error('Failed to generate AI insights')
  }
}

function buildPostMortemAnalysisPrompt(input: PostMortemAnalysisInput): string {
  const { 
    projectName, 
    projectDescription, 
    deathCause, 
    techStack,
    whatProblem,
    whatWentWrong,
    lessonsLearned,
    projectHistory = [],
    userPatterns = [],
    learningVelocity,
    projectCount = 0,
    isFirstProject = false
  } = input

  // Adaptive prompting based on user's progress
  const experienceLevel = isFirstProject ? 'newcomer' : 
                         projectCount < 3 ? 'early' :
                         projectCount < 10 ? 'experienced' : 'veteran'

  const patternContext = userPatterns.length > 0 ? `
**YOUR DETECTED PATTERNS:**
${userPatterns.map(p => {
  const confidence = Math.round(p.confidence_score * 100)
  const description = getPatternDescription(p.pattern_name)
  return `- ${p.pattern_name.replace('_', ' ').toUpperCase()} (${confidence}% confidence, detected ${p.frequency} times)
  Pattern: ${description}
  Evidence: ${JSON.stringify(p.metadata).replace(/[{}]/g, '').substring(0, 100)}...`
}).join('\n\n')}
` : ''

  const velocityContext = learningVelocity ? `
**YOUR LEARNING VELOCITY:**
- Project Lifespan Trend: ${learningVelocity.avg_project_lifespan_trend}
- Scope Management Score: ${learningVelocity.scope_management_score}/100
- Technology Consistency: ${learningVelocity.technology_consistency_score}/100  
- Completion Rate Trend: ${learningVelocity.completion_rate_trend}
` : ''

  return `You are an expert developer coach who specializes in helping developers learn from project failures. You have deep knowledge of this specific developer's history and patterns.

CRITICAL REQUIREMENTS FOR ${experienceLevel.toUpperCase()} DEVELOPER:
1. You MUST reference their specific patterns and historical data
2. ${isFirstProject ? 'This is their FIRST project burial - be encouraging but insightful' : 
      projectCount < 5 ? 'They are still learning patterns - focus on emerging trends' :
      'They are experienced - provide advanced insights about breaking established patterns'}
3. Quote their exact words AND connect to their established patterns
4. Provide insights that acknowledge their growth trajectory

**PROJECT DETAILS:**
Name: "${projectName}"
Description: ${projectDescription || 'No description provided'}
Death Cause: ${deathCause.replace('_', ' ')}
Tech Stack: ${techStack.join(', ') || 'Not specified'}
Project #${projectCount + 1} in their graveyard

**DEVELOPER'S POST-MORTEM ANALYSIS:**

Problem Statement: "${whatProblem || 'Not provided'}"

What Went Wrong: "${whatWentWrong || 'Not provided'}"

Lessons Learned: "${lessonsLearned || 'Not provided'}"

${patternContext}

${velocityContext}

${projectHistory.length > 0 ? `
**PREVIOUS PROJECT CONTEXT:**
${projectHistory.map(p => {
  let historyText = `- "${p.name}" (abandoned due to: ${p.deathCause.replace('_', ' ')})`
  if (p.whatWentWrong) historyText += `\n  What went wrong: "${p.whatWentWrong}"`
  if (p.lessonsLearned) historyText += `\n  Lessons learned: "${p.lessonsLearned}"`
  if (p.techStack && p.techStack.length > 0) historyText += `\n  Tech: ${p.techStack.join(', ')}`
  return historyText
}).join('\n\n')}
` : ''}

**ANALYSIS TASK:**
${isFirstProject ? 
  `Since this is their first buried project, focus on encouraging initial pattern recognition and building good habits.` :
  userPatterns.length > 0 ? 
    `Given their established patterns (${userPatterns.map(p => p.pattern_name).join(', ')}), provide insights that help them break or leverage these patterns.` :
    `With ${projectCount} projects buried, look for emerging patterns in their behavior.`
}

Provide exactly 3-4 insights that are:
- SPECIFIC to their detected patterns and historical data
- Connect their current project to their established behavioral trends  
- REFERENCE their exact words AND their pattern history
- Provide insights that acknowledge their ${experienceLevel} level

Format each insight with enhanced pattern awareness:

**PATTERN_RECOGNITION:**
Historical Pattern: [Reference their specific detected pattern]
Current Evidence: "quote their exact phrase from this project"
Pattern Evolution: [How this project fits their established pattern or breaks from it]

**COACHING:**
Your Pattern: [Name their relevant pattern with frequency: "auth_curse (3 times)"]
What You Said: "quote their exact words"
Pattern-Breaking Action: [Specific advice based on their pattern history]
Implementation: [Concrete steps that address their specific behavioral tendency]

**QUESTIONS:**
Pattern Context: [Their pattern + this project's evidence]
Your Statement: "quote exact phrase"
Pattern-Aware Question: [Question that helps them see the deeper pattern]
Growth Opportunity: [How answering this could break their cycle]

**STRATEGIES:**
Based On Your History: [Reference their pattern + quote]
Anti-Pattern Strategy: [Strategy specifically designed to counter their tendency]  
Action Plan:
1. [Step that directly addresses their pattern]
2. [Step that builds new positive pattern]
3. [Step that tracks pattern-breaking success]

QUALITY CHECK: Every insight must reference both their current words AND their historical patterns. Connect this project to their larger behavioral story.`
}

function parseClaudeResponse(response: string): AIInsight[] {
  const insights: AIInsight[] = []
  
  // Improved parser - look for the section headers and extract content
  const sections = [
    { type: 'pattern_recognition' as const, marker: '**PATTERN_RECOGNITION:**' },
    { type: 'coaching' as const, marker: '**COACHING:**' },
    { type: 'questions' as const, marker: '**QUESTIONS:**' },
    { type: 'strategies' as const, marker: '**STRATEGIES:**' },
  ]

  sections.forEach(section => {
    const startIndex = response.indexOf(section.marker)
    if (startIndex === -1) return

    const contentStart = startIndex + section.marker.length
    let contentEnd = response.length

    // Find the next section marker or end of relevant content
    const allMarkers = sections.map(s => s.marker)
    let nextMarkerIndex = response.length
    
    for (const marker of allMarkers) {
      const markerIndex = response.indexOf(marker, contentStart)
      if (markerIndex > contentStart && markerIndex < nextMarkerIndex) {
        nextMarkerIndex = markerIndex
      }
    }
    
    contentEnd = nextMarkerIndex

    let content = response.slice(contentStart, contentEnd).trim()
    
    // Clean up the content - remove extra whitespace and formatting
    content = content
      .replace(/\n\s*\n/g, '\n') // Remove extra line breaks
      .replace(/^\[|\]$/g, '')   // Remove square brackets if present
      .trim()
    
    // Quality control - reject generic insights
    if (isGenericInsight(content)) {
      console.log(`Rejected generic ${section.type} insight:`, content.substring(0, 100))
      return // Skip this insight
    }
    
    // Calculate confidence score based on content quality
    let confidenceScore = calculateInsightQuality(content)
    
    if (content && content.length > 20 && confidenceScore > 0.3) {
      insights.push({
        type: section.type,
        content: content,
        confidenceScore: confidenceScore,
      })
    }
  })

  return insights
}

// Quality control functions
function isGenericInsight(content: string): boolean {
  const genericPhrases = [
    'consider breaking down',
    'start small and iterate',
    'focus on the mvp',
    'developers often',
    'common pattern',
    'try to be more specific',
    'consider your target audience',
    'make sure to validate',
    'this is a common issue',
    'many projects fail because'
  ]
  
  const lowerContent = content.toLowerCase()
  const hasGenericPhrase = genericPhrases.some(phrase => lowerContent.includes(phrase))
  const hasNoQuotes = !content.includes('"')
  const tooVague = lowerContent.includes('consider') && lowerContent.includes('general') || 
                   lowerContent.includes('might want to') && !lowerContent.includes('you said')
  
  return hasGenericPhrase || (hasNoQuotes && tooVague)
}

function calculateInsightQuality(content: string): number {
  let score = 0.4 // Base score
  
  // Positive quality indicators
  if (content.includes('"')) score += 0.3 // Has direct quotes
  if (content.match(/you (said|mentioned|wrote|described)/i)) score += 0.2 // References user's words
  if (content.length > 150) score += 0.1 // Substantial content
  if (content.includes('specifically')) score += 0.1 // Uses specific language
  if (content.match(/\b(because|since|given that)\b/i)) score += 0.1 // Shows reasoning
  
  // Negative quality indicators
  if (content.includes('consider') && !content.includes('you')) score -= 0.2 // Generic advice
  if (content.includes('developers') && !content.includes('you')) score -= 0.15 // Generic about developers
  if (content.includes('many') || content.includes('most')) score -= 0.1 // Overgeneralization
  
  return Math.max(0.1, Math.min(1.0, score))
}

// Helper function for pattern descriptions
function getPatternDescription(patternName: string): string {
  const descriptions: Record<string, string> = {
    weekend_warrior: "Starts projects on weekends but abandons them by Monday",
    auth_curse: "Projects that start with authentication always die quickly", 
    scope_creeper: "Continuously expands project scope until it becomes unmanageable",
    serial_starter: "Starts new projects within days of abandoning previous ones",
    perfectionist_paralysis: "Spends too much time on documentation/planning, not enough on coding",
    evening_coder: "Only commits code in the evening, leading to burnout",
    library_overload: "Uses too many dependencies, creating complexity",
    framework_hopper: "Never uses the same tech stack twice, preventing mastery"
  }
  
  return descriptions[patternName] || "Unknown pattern"
}

// Focused Pattern Detection (Pass 1)
export async function detectUserPatterns(projects: any[], userId: string): Promise<Array<{
  pattern_name: string
  confidence: number
  evidence: string[]
  description: string
}>> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured')
  }

  const prompt = `You are an expert behavioral analyst specializing in developer project patterns. Your ONLY task is to identify genuine behavioral patterns from project data.

**USER'S PROJECT HISTORY:**
${projects.map((p, i) => `
Project ${i + 1}: "${p.name}"
- Created: ${new Date(p.created_at).toLocaleDateString()}
- Died: ${new Date(p.death_date).toLocaleDateString()}  
- Lifespan: ${Math.max(1, Math.round((new Date(p.death_date).getTime() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24)))} days
- Death Cause: ${p.death_cause.replace('_', ' ')}
- Tech Stack: ${p.tech_stack.join(', ')}
- Epitaph: "${p.epitaph}"
`).join('\n')}

**TASK: PATTERN DETECTION ONLY**

Identify 2-4 genuine behavioral patterns. Look for:
- Technology evolution and consistency patterns
- Project timing and lifecycle patterns
- Abandonment trigger patterns
- Learning progression patterns

**QUALITY REQUIREMENTS:**
- Only identify patterns with clear evidence from multiple projects
- Be specific, not generic
- Focus on actionable behavioral insights
- Confidence must reflect actual evidence strength
- AVOID GENERATING SIMILAR OR OVERLAPPING PATTERNS
- Each pattern must address a DISTINCT behavioral aspect
- Do not create multiple variations of the same core concept

**OUTPUT FORMAT (must be valid JSON):**
{
  "patterns": [
    {
      "pattern_name": "descriptive_snake_case_name",
      "confidence": 0.85,
      "evidence": [
        "Specific evidence from Project X showing...",
        "Pattern confirmed by Project Y where..."
      ],
      "description": "Clear description with 1-2 actionable recommendations"
    }
  ]
}

**CRITICAL: ENSURE PATTERN UNIQUENESS**
Before finalizing your response:
1. Review all patterns to ensure they address DIFFERENT aspects of behavior
2. Combine similar patterns into one stronger pattern rather than creating duplicates
3. Each pattern should have a unique behavioral focus (timing, technology, abandonment, etc.)
4. No two patterns should have similar names or overlapping descriptions

Focus ONLY on pattern identification. No coaching advice or recommendations.`

  try {
    console.log('🤖 Sending request to Claude...')
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      temperature: 0.3, // Lower temperature for more consistent pattern detection
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    console.log('📥 Claude response received')
    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    console.log('📄 Raw Claude response:', content.text)

    // Parse Claude's JSON response
    let result
    try {
      result = JSON.parse(content.text)
      console.log('✅ JSON parsed successfully:', result)
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError)
      console.error('Raw content:', content.text)
      throw new Error('Failed to parse Claude response as JSON')
    }

    return result.patterns || []

  } catch (error) {
    console.error('❌ Error calling Claude for pattern detection:', error)
    throw new Error('Failed to detect patterns with Claude: ' + error.message)
  }
}

// Focused Coaching Insights (Pass 2)
export async function generateCoachingInsights(
  patterns: any[], 
  recentProjects: any[], 
  userId: string
): Promise<Array<{
  insight_type: 'warning' | 'recommendation' | 'observation' | 'prediction'
  insight_text: string
  confidence: number
  related_patterns: string[]
}>> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured')
  }

  const prompt = `You are an expert software engineering coach. Your ONLY task is to generate personalized coaching insights based on detected behavioral patterns.

**DETECTED PATTERNS:**
${patterns.map(p => `
Pattern: "${p.pattern_name}" (${Math.round(p.confidence_score * 100)}% confidence)
Evidence: ${Array.isArray(p.pattern_value?.evidence) ? p.pattern_value.evidence.join('; ') : 'Pattern evidence available'}
Frequency: Detected ${p.frequency} time(s)
`).join('\n')}

**RECENT PROJECT CONTEXT (last 5 projects):**
${recentProjects.map((p, i) => `
Project ${i + 1}: "${p.name}"
- Lifespan: ${Math.max(1, Math.round((new Date(p.death_date).getTime() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24)))} days
- Death Cause: ${p.death_cause.replace('_', ' ')}
- Tech Stack: ${p.tech_stack.join(', ')}
- Epitaph: "${p.epitaph}"
`).join('\n')}

**TASK: COACHING INSIGHTS ONLY**

Generate 3-4 DIVERSE personalized coaching insights that:
- Reference specific detected patterns and evidence
- Provide actionable advice based on their behavior
- Are coaching-oriented (supportive but direct)
- Connect patterns to specific project outcomes
- Offer concrete next steps
- AVOID repetitive advice or similar recommendations
- Address DIFFERENT aspects of their development journey

**INSIGHT TYPES & VARIETY REQUIREMENTS:**
- warning: Pattern that could lead to future failures
- recommendation: Specific action to take (vary the domain: technical, process, mindset)
- observation: Positive pattern recognition or neutral behavioral insight
- prediction: Likely future outcome based on patterns

**CONTENT DIVERSITY REQUIREMENTS:**
- Generate insights with DIFFERENT themes and approaches
- Mix immediate actions with long-term strategies  
- Vary focus areas: planning, execution, technology choices, motivation, etc.
- Use different coaching angles for similar patterns
- Timestamp: ${new Date().toISOString()} (for unique perspective)
- Session: ${Math.random().toString(36).substring(7)}

**OUTPUT FORMAT (must be valid JSON):**
{
  "insights": [
    {
      "insight_type": "recommendation",
      "insight_text": "Based on your [specific pattern], I recommend [specific action] because [specific evidence from projects].",
      "confidence": 0.85,
      "related_patterns": ["pattern_name_1", "pattern_name_2"]
    }
  ]
}

Focus ONLY on coaching insights. No pattern detection.`

  try {
    console.log('🤖 Sending coaching request to Claude...')
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      temperature: 0.7, // Higher temperature for more personalized coaching
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    console.log('📥 Claude coaching response received')
    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    console.log('📄 Raw coaching response:', content.text)

    // Parse Claude's JSON response
    let result
    try {
      result = JSON.parse(content.text)
      console.log('✅ Coaching JSON parsed successfully:', result)
    } catch (parseError) {
      console.error('❌ Coaching JSON parse error:', parseError)
      console.error('Raw coaching content:', content.text)
      throw new Error('Failed to parse coaching response as JSON')
    }

    return result.insights || []

  } catch (error) {
    console.error('❌ Error calling Claude for coaching insights:', error)
    throw new Error('Failed to generate coaching insights with Claude: ' + (error instanceof Error ? error.message : String(error)))
  }
}

export async function analyzeUserPatterns(projects: any[], _userId: string): Promise<AIPatternAnalysis> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured')
  }

  const prompt = `You are an expert software engineering coach analyzing a developer's project patterns to provide personalized insights.

**USER'S PROJECT HISTORY:**
${projects.map((p, i) => `
Project ${i + 1}: "${p.name}"
- Created: ${new Date(p.created_at).toLocaleDateString()}
- Died: ${new Date(p.death_date).toLocaleDateString()}  
- Lifespan: ${Math.max(1, Math.round((new Date(p.death_date).getTime() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24)))} days
- Death Cause: ${p.death_cause.replace('_', ' ')}
- Tech Stack: ${p.tech_stack.join(', ')}
- Epitaph: "${p.epitaph}"
- Revival Status: ${p.revival_status}
`).join('\n')}

**ANALYSIS REQUIREMENTS:**

1. **DETECT BEHAVIORAL PATTERNS** - Look for genuine patterns in:
   - Technology choices and consistency
   - Project timing and lifecycle patterns  
   - Abandonment reasons and triggers
   - Scope management tendencies
   - Learning progression

2. **BEHAVIORAL INSIGHTS** - Generate 3-4 insights that are:
   - Specific to THIS user's actual data
   - Evidence-based (reference their actual projects)
   - Actionable and coaching-oriented
   - Nuanced (not generic advice)

3. **LEARNING VELOCITY** - Analyze their progression:
   - What they're doing well
   - Growth areas
   - Overall trajectory
   - Personalized next steps

**OUTPUT FORMAT** (must be valid JSON):
{
  "detected_patterns": [
    {
      "pattern_name": "descriptive_name_like_progressive_react_learner",
      "confidence": 0.85,
      "insight_text": "Detailed analysis of this pattern with specific evidence",
      "evidence": ["Project X shows...", "The progression from Y to Z demonstrates..."],
      "recommendations": ["Specific actionable advice", "Next step suggestion"]
    }
  ],
  "behavioral_insights": [
    {
      "insight_type": "observation",
      "insight_text": "Specific insight about their behavior with evidence",
      "confidence": 0.9
    }
  ],
  "learning_velocity_analysis": {
    "strengths": ["What they're doing well"],
    "areas_for_improvement": ["Specific areas to focus on"],
    "trajectory": "improving",
    "personalized_advice": "Specific coaching advice based on their data"
  }
}

Analyze ONLY what the data actually shows. Be specific, evidence-based, and coaching-oriented.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    // Parse Claude's JSON response
    const analysis = JSON.parse(content.text)
    return analysis

  } catch (error) {
    console.error('Error calling Claude for pattern analysis:', error)
    throw new Error('Failed to analyze patterns with Claude')
  }
}

export default anthropic