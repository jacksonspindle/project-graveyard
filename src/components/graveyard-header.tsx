"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { Menu, X } from "lucide-react"

interface GraveyardHeaderProps {
  projectCount?: number
  loading?: boolean
  error?: string | null
  title?: string
  subtitle?: string
}

export function GraveyardHeader({ 
  projectCount = 0, 
  loading = false, 
  error = null,
  title = "Your Graveyard",
  subtitle
}: GraveyardHeaderProps) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Determine active view based on pathname
  const isListView = pathname === '/graveyard'
  const isVisualView = pathname === '/graveyard/visual'
  
  // Generate subtitle if not provided
  const displaySubtitle = subtitle || (loading ? "Loading..." : `${projectCount} projects rest here`)

  return (
    <div className="border-b border-gray-700 bg-gray-900/50">
      <div className="container mx-auto px-4 py-4">
        {/* Mobile Layout */}
        <div className="flex flex-col gap-4 md:hidden">
          {/* Top row: Title, subtitle and menu toggle */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-100">{title}</h1>
              <p className="text-sm text-gray-400">
                {displaySubtitle}
                {error && <span className="text-yellow-400 ml-2">({error})</span>}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
          
          {/* Mobile menu - collapsible */}
          {mobileMenuOpen && (
            <div className="flex flex-col gap-2 pb-2">
              {/* View Toggle - full width on mobile */}
              <div className="flex items-center bg-gray-800 rounded-lg p-1 w-full gap-1">
                <Button
                  size="sm"
                  variant={isListView ? "default" : "ghost"}
                  className={`flex-1 rounded-md ${isListView ? 'bg-purple-600 text-white hover:bg-purple-600' : 'bg-transparent text-gray-400 hover:bg-gray-700 border border-gray-600'}`}
                  onClick={() => {
                    router.push('/graveyard')
                    setMobileMenuOpen(false)
                  }}
                >
                  📋 List
                </Button>
                <Button
                  size="sm"
                  variant={isVisualView ? "default" : "ghost"}
                  className={`flex-1 rounded-md ${isVisualView ? 'bg-purple-600 text-white hover:bg-purple-600' : 'bg-transparent text-gray-400 hover:bg-gray-700 border border-gray-600'}`}
                  onClick={() => {
                    router.push('/graveyard/visual')
                    setMobileMenuOpen(false)
                  }}
                >
                  🪦 Visual
                </Button>
              </div>
              
              {/* Primary actions - stack on mobile */}
              <Link href="/graveyard/create" className="w-full">
                <Button 
                  className="bg-gray-700 hover:bg-gray-600 text-gray-100 border-gray-600 w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  + Bury Project
                </Button>
              </Link>
              
              <Link href="/graveyard/insights" className="w-full">
                <Button 
                  variant="outline" 
                  className="border-red-500/50 text-red-300 hover:bg-red-500/10 w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  📌 My Insights
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  signOut()
                  setMobileMenuOpen(false)
                }}
                className="w-full"
              >
                Sign Out
              </Button>
              
              {user && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  Signed in as {user.email}
                </p>
              )}
            </div>
          )}
        </div>
        
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">{title}</h1>
            <p className="text-gray-400">
              {displaySubtitle}
              {error && <span className="text-yellow-400 ml-2">({error})</span>}
            </p>
            {user && (
              <p className="text-sm text-gray-500">
                Signed in as {user.email}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center bg-gray-800 rounded-lg p-1">
              <Button
                size="sm"
                variant={isListView ? "default" : "ghost"}
                className={isListView ? 'bg-purple-600 text-white hover:bg-purple-600' : 'text-gray-400 hover:bg-gray-600'}
                onClick={() => router.push('/graveyard')}
              >
                📋 List
              </Button>
              <Button
                size="sm"
                variant={isVisualView ? "default" : "ghost"}
                className={isVisualView ? 'bg-purple-600 text-white hover:bg-purple-600' : 'text-gray-400 hover:bg-gray-600'}
                onClick={() => router.push('/graveyard/visual')}
              >
                🪦 Graveyard
              </Button>
            </div>
            
            <Link href="/graveyard/insights">
              <Button variant="outline" className="border-red-500/50 text-red-300 hover:bg-red-500/10">
                📌 My Insights
              </Button>
            </Link>
            
            <Link href="/graveyard/create">
              <Button className="bg-gray-700 hover:bg-gray-600 text-gray-100 border-gray-600">
                + Bury Project
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              onClick={() => signOut()}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}