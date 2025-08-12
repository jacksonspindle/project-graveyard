"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="text-2xl">🪦</div>
            <span className="text-xl font-semibold text-white">Project Graveyard</span>
          </Link>

          {/* Navigation Menu */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              className="text-gray-300 hover:text-white transition-colors"
              onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Features
            </button>
            <button 
              className="text-gray-300 hover:text-white transition-colors"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              How It Works
            </button>
            <button 
              className="text-gray-300 hover:text-white transition-colors"
              onClick={() => document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              FAQ
            </button>
          </div>

          {/* CTA Button */}
          <Link href="/auth">
            <Button className="bg-amber-100 hover:bg-amber-200 text-black font-medium px-6 py-2 rounded-lg transition-colors">
              Start Free Beta
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}