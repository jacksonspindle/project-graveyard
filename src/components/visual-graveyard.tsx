"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { Project, AIInsight } from "@/types"
import { DEATH_CAUSE_EMOJIS, INSIGHT_TYPE_EMOJIS } from "@/types"
import { db } from "@/lib/supabase"

interface GravestoneData {
  project: Project
  x: number
  y: number
  width: number
  height: number
}

interface ViewState {
  x: number
  y: number
  scale: number
}

interface VisualGraveyardProps {
  projects: Project[]
}

export function VisualGraveyard({ projects }: VisualGraveyardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  
  const [viewState, setViewState] = useState<ViewState>({ x: 0, y: 0, scale: 1 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [gravestones, setGravestones] = useState<GravestoneData[]>([])
  const [hoveredGravestone, setHoveredGravestone] = useState<GravestoneData | null>(null)
  const [grassPattern, setGrassPattern] = useState<CanvasPattern | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [hoveredInsights, setHoveredInsights] = useState<AIInsight[]>([])
  const [loadingInsights, setLoadingInsights] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  // Detect if user is on desktop
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024 && !('ontouchstart' in window))
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Load AI insights for hovered project
  const loadInsightsForProject = useCallback(async (project: Project) => {
    if (!project) return

    try {
      setLoadingInsights(true)
      // First get the post-mortem to find AI insights
      const postMortem = await db.postMortems.getByProjectId(project.id)
      if (postMortem) {
        const insights = await db.aiInsights.getByPostMortemId(postMortem.id)
        setHoveredInsights(insights || [])
      } else {
        setHoveredInsights([])
      }
    } catch (error) {
      console.log('No insights found for project:', project.name)
      setHoveredInsights([])
    } finally {
      setLoadingInsights(false)
    }
  }, [])

  // Create grass texture pattern
  const createGrassPattern = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Create a small canvas for the grass pattern
    const patternCanvas = document.createElement('canvas')
    const patternSize = 64
    patternCanvas.width = patternSize
    patternCanvas.height = patternSize
    const patternCtx = patternCanvas.getContext('2d')
    if (!patternCtx) return null

    // Base grass colors
    const grassColors = [
      '#1a4a1a', // Dark green
      '#2d5a2d', // Medium green
      '#1e4d1e', // Darker green
      '#3a6a3a', // Lighter green
      '#0f3f0f', // Very dark green
    ]

    // Fill with base grass color
    patternCtx.fillStyle = grassColors[0]
    patternCtx.fillRect(0, 0, patternSize, patternSize)

    // Add grass texture variations
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * patternSize
      const y = Math.random() * patternSize
      const size = Math.random() * 3 + 1
      const color = grassColors[Math.floor(Math.random() * grassColors.length)]
      
      patternCtx.fillStyle = color
      patternCtx.fillRect(x, y, size, size)
    }

    // Add some grass blade details
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * patternSize
      const y = Math.random() * patternSize
      const height = Math.random() * 4 + 2
      
      patternCtx.strokeStyle = '#2d5a2d'
      patternCtx.lineWidth = 1
      patternCtx.beginPath()
      patternCtx.moveTo(x, y)
      patternCtx.lineTo(x + Math.random() * 2 - 1, y - height)
      patternCtx.stroke()
    }

    // Add dirt patches
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * patternSize
      const y = Math.random() * patternSize
      const size = Math.random() * 4 + 2
      
      patternCtx.fillStyle = '#3d2914'
      patternCtx.beginPath()
      patternCtx.arc(x, y, size, 0, Math.PI * 2)
      patternCtx.fill()
    }

    return ctx.createPattern(patternCanvas, 'repeat')
  }, [])

  // Generate grass pattern on mount
  useEffect(() => {
    const pattern = createGrassPattern()
    setGrassPattern(pattern)
  }, [createGrassPattern])

  // Generate gravestone positions
  useEffect(() => {
    const stones: GravestoneData[] = []
    const rows = Math.ceil(Math.sqrt(projects.length))
    const cols = Math.ceil(projects.length / rows)
    const spacing = 160 // Increased spacing to prevent overlap
    const offsetX = 150
    const offsetY = 150
    const minDistance = 120 // Minimum distance between gravestones

    projects.forEach((project, index) => {
      const row = Math.floor(index / cols)
      const col = index % cols
      
      let attempts = 0
      let x: number = offsetX + col * spacing
      let y: number = offsetY + row * spacing
      let validPosition = false
      
      // Try to find a position that doesn't overlap with existing stones
      while (!validPosition && attempts < 50) {
        // Add some randomness to make it feel more organic, but less than before
        const randomX = (Math.random() - 0.5) * 40
        const randomY = (Math.random() - 0.5) * 40
        
        x = offsetX + col * spacing + randomX
        y = offsetY + row * spacing + randomY
        
        // Check for overlaps with existing stones
        validPosition = stones.every(stone => {
          const distance = Math.sqrt(
            Math.pow(x - stone.x, 2) + Math.pow(y - stone.y, 2)
          )
          return distance >= minDistance
        })
        
        attempts++
      }
      
      // If we couldn't find a good random position, use the grid position
      if (!validPosition) {
        x = offsetX + col * spacing
        y = offsetY + row * spacing
      }
      
      stones.push({
        project,
        x: x,
        y: y,
        width: 80,
        height: 100,
      })
    })

    setGravestones(stones)
  }, [projects])

  // Draw the graveyard
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Save context and apply transformations
    ctx.save()
    ctx.translate(viewState.x, viewState.y)
    ctx.scale(viewState.scale, viewState.scale)

    // Draw background grass texture
    if (grassPattern) {
      ctx.fillStyle = grassPattern
    } else {
      ctx.fillStyle = '#1a4a1a' // Fallback color
    }
    ctx.fillRect(-1000, -1000, 3000, 3000)

    // Draw gravestones
    gravestones.forEach((gravestone) => {
      drawGravestone(ctx, gravestone, gravestone === hoveredGravestone)
    })

    ctx.restore()
  }, [viewState, gravestones, hoveredGravestone, grassPattern])

  // Draw individual gravestone
  const drawGravestone = (ctx: CanvasRenderingContext2D, gravestone: GravestoneData, isHovered: boolean) => {
    const { x, y, width, height, project } = gravestone

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.fillRect(x + 5, y + 5, width, height)

    // Main gravestone body
    ctx.fillStyle = isHovered ? '#9ca3af' : '#6b7280'
    ctx.fillRect(x, y, width, height)

    // Gravestone top (rounded)
    ctx.beginPath()
    ctx.arc(x + width / 2, y, width / 2, Math.PI, 0)
    ctx.fill()

    // Border
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, width, height)
    ctx.beginPath()
    ctx.arc(x + width / 2, y, width / 2, Math.PI, 0)
    ctx.stroke()

    // Text styling
    ctx.fillStyle = '#111827'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Project name (truncated if too long)
    const name = project.name.length > 12 ? project.name.substring(0, 12) + '...' : project.name
    ctx.font = 'bold 12px Arial'
    ctx.fillText(name, x + width / 2, y + height / 2 - 15)

    // Death date
    ctx.font = '10px Arial'
    const deathDate = new Date(project.death_date).getFullYear().toString()
    ctx.fillText(deathDate, x + width / 2, y + height / 2)

    // Death cause emoji
    ctx.font = '16px Arial'
    const emoji = DEATH_CAUSE_EMOJIS[project.death_cause]
    ctx.fillText(emoji, x + width / 2, y + height / 2 + 15)

    // Hover highlight - outline the entire gravestone shape
    if (isHovered) {
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 3
      
      // Draw outline around the rectangular body
      ctx.strokeRect(x - 2, y - 2, width + 4, height + 4)
      
      // Draw outline around the rounded top
      ctx.beginPath()
      ctx.arc(x + width / 2, y, width / 2 + 2, Math.PI, 0)
      ctx.stroke()
    }
  }

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - viewState.x, y: e.clientY - viewState.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    // Update mouse position for desktop tooltip
    if (isDesktop) {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    if (isDragging) {
      setViewState(prev => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      }))
    } else {
      // Check for hover
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      const mouseX = (e.clientX - rect.left - viewState.x) / viewState.scale
      const mouseY = (e.clientY - rect.top - viewState.y) / viewState.scale

      const hovered = gravestones.find(stone => 
        mouseX >= stone.x && mouseX <= stone.x + stone.width &&
        mouseY >= stone.y && mouseY <= stone.y + stone.height
      )

      const previousHovered = hoveredGravestone
      setHoveredGravestone(hovered || null)

      // Load insights when hovering over a new gravestone (desktop only)
      if (isDesktop && hovered && hovered !== previousHovered) {
        loadInsightsForProject(hovered.project)
      } else if (!hovered) {
        setHoveredInsights([])
      }
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.max(0.1, Math.min(3, viewState.scale * scaleFactor))
    
    setViewState(prev => ({
      ...prev,
      scale: newScale,
    }))
  }

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const mouseX = (e.clientX - rect.left - viewState.x) / viewState.scale
    const mouseY = (e.clientY - rect.top - viewState.y) / viewState.scale

    const clicked = gravestones.find(stone => 
      mouseX >= stone.x && mouseX <= stone.x + stone.width &&
      mouseY >= stone.y && mouseY <= stone.y + stone.height
    )

    if (clicked) {
      router.push(`/graveyard/${clicked.project.id}`)
    }
  }

  // Set up canvas size
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  // Redraw when needed
  useEffect(() => {
    draw()
  }, [draw])

  return (
    <div ref={containerRef} className="w-full h-full relative bg-gray-900 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleClick}
      />
      
      {/* Controls */}
      <div className="absolute top-4 right-4 bg-gray-800/80 rounded-lg p-3">
        <div className="text-gray-300 text-sm space-y-1">
          <div>🖱️ Drag to pan</div>
          <div>🖱️ Scroll to zoom</div>
          <div>🖱️ Click gravestone to view</div>
        </div>
      </div>

      {/* Hover tooltip */}
      {hoveredGravestone && (
        <div 
          className="absolute bg-gray-800/90 border border-gray-600 rounded-lg p-3 max-w-xs z-10 pointer-events-none"
          style={
            isDesktop 
              ? {
                  left: mousePosition.x + 10,
                  top: mousePosition.y - 120,
                  transform: mousePosition.x > window.innerWidth - 300 ? 'translateX(-100%) translateX(-10px)' : 'none'
                }
              : { top: 16, left: 16 }
          }
        >
          <h3 className="font-semibold text-gray-100">{hoveredGravestone.project.name}</h3>
          <p className="text-gray-400 text-sm mt-1">"{hoveredGravestone.project.epitaph}"</p>
          <p className="text-gray-500 text-xs mt-2">
            Died: {new Date(hoveredGravestone.project.death_date).toLocaleDateString()}
          </p>
          <p className="text-gray-500 text-xs">
            Cause: {DEATH_CAUSE_EMOJIS[hoveredGravestone.project.death_cause]} {hoveredGravestone.project.death_cause.replace(/_/g, ' ')}
          </p>
          
          {/* AI Insights Section */}
          {isDesktop && (
            <div className="mt-3 pt-3 border-t border-gray-600">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-gray-300">🤖 AI Insights</span>
                {loadingInsights && <span className="text-xs text-gray-400">Loading...</span>}
              </div>
              
              {loadingInsights ? (
                <div className="text-xs text-gray-400 italic">Analyzing project...</div>
              ) : hoveredInsights.length > 0 ? (
                <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-thin scrollbar-track-gray-700 scrollbar-thumb-gray-500">
                  {hoveredInsights.slice(0, 2).map((insight) => (
                    <div key={insight.id} className="text-xs">
                      <div className="flex items-start gap-1">
                        <span className="text-blue-400 mt-0.5">
                          {INSIGHT_TYPE_EMOJIS[insight.insight_type]}
                        </span>
                        <p className="text-gray-300 leading-relaxed">
                          {insight.content.length > 120 
                            ? `${insight.content.substring(0, 117)}...` 
                            : insight.content
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                  {hoveredInsights.length > 2 && (
                    <p className="text-xs text-gray-500 italic">
                      +{hoveredInsights.length - 2} more insights...
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-xs text-gray-500 italic">No insights available</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 bg-gray-800/80 rounded-lg px-3 py-2">
        <span className="text-gray-300 text-sm">
          {Math.round(viewState.scale * 100)}%
        </span>
      </div>
    </div>
  )
}