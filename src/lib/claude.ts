import Anthropic from '@anthropic-ai/sdk'

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

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
    projectHistory = []
  } = input

  return `You are an expert developer coach who specializes in helping developers learn from project failures. Your goal is to provide highly specific, actionable insights that directly reference the developer's own words and experiences.

CRITICAL REQUIREMENTS:
1. You MUST quote or reference specific phrases from the developer's responses
2. Each insight must be tailored to THIS specific project, not generic advice
3. Build upon what the developer already discovered, don't repeat it
4. If the responses are vague, ask specific follow-up questions to dig deeper

**PROJECT DETAILS:**
Name: "${projectName}"
Description: ${projectDescription || 'No description provided'}
Death Cause: ${deathCause.replace('_', ' ')}
Tech Stack: ${techStack.join(', ') || 'Not specified'}

**DEVELOPER'S POST-MORTEM ANALYSIS:**

Problem Statement: "${whatProblem || 'Not provided'}"

What Went Wrong: "${whatWentWrong || 'Not provided'}"

Lessons Learned: "${lessonsLearned || 'Not provided'}"

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
Provide exactly 3-4 insights that are:
- SPECIFIC to this developer's exact words and situation
- ACTIONABLE with concrete next steps
- EMPATHETIC but not generic
- REFERENCE specific phrases from their responses

Format each insight with this structure for maximum readability:

**PATTERN_RECOGNITION:**
Key Pattern: [One sentence identifying the main pattern]
Your Words: "quote their exact phrase"
Insight: [2-3 sentences explaining the pattern and why it matters]

**COACHING:**
What You Said: "quote their exact words"
Actionable Next Step: [One clear, specific action they can take]
How To Do It: [2-3 concrete steps to implement this action]

**QUESTIONS:**
Your Statement: "quote exact phrase"
Deeper Question: [One focused follow-up question]
Why It Matters: [One sentence explaining the importance]

**STRATEGIES:**
Based On: "quote their words"
Strategy: [Name the strategy in 3-5 words]
Action Plan:
1. [First concrete step]
2. [Second concrete step]
3. [Third concrete step]

QUALITY CHECK: Every insight must include a direct quote or reference to something specific the developer wrote. Generic advice will be rejected.`
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

export default anthropic