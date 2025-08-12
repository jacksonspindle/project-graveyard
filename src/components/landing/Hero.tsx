"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AppScreenshot } from "./AppScreenshot"

export function Hero() {
  return (
    <section className="relative min-h-screen bg-black overflow-hidden pt-16">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 items-center min-h-screen py-20">
          
          {/* Left Column - Content (Larger) */}
          <div className="lg:col-span-7 space-y-10">
            {/* Main headline */}
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[0.95]">
                Transform your
                <br />
                <span className="text-5xl lg:text-6xl xl:text-7xl">dead projects</span>
                <br />
                <span className="text-amber-200">into wisdom</span>
              </h1>
              
              <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
                Understand your patterns, refine your approach, and accelerate your development success — all in one place
              </p>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-6">
              <Link href="/auth">
                <Button className="bg-amber-100 hover:bg-amber-200 text-black font-medium px-8 py-4 rounded-lg text-lg transition-colors">
                  Start for free
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4">
              <div className="text-green-500 text-sm">✓</div>
              <span className="text-gray-400 text-sm">Free Beta Access</span>
            </div>

            {/* User Reviews */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-black flex items-center justify-center text-white text-sm font-bold">
                  J
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-600 border-2 border-black flex items-center justify-center text-white text-sm font-bold">
                  A
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 border-2 border-black flex items-center justify-center text-white text-sm font-bold">
                  S
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 border-2 border-black flex items-center justify-center text-white text-sm font-bold">
                  M
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-black flex items-center justify-center text-white text-sm font-bold">
                  K
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex text-amber-400">
                  <span>★★★★★</span>
                </div>
                <span className="text-gray-400 text-sm">Early access users</span>
              </div>
            </div>
          </div>

          {/* Right Column - App Screenshot (Smaller) */}
          <div className="lg:col-span-5 relative">
            <div className="relative">
              {/* Main screenshot */}
              <div className="bg-gray-900 rounded-2xl p-1 shadow-2xl transform rotate-2">
                <AppScreenshot 
                  src="/images/graveyard-dashboard.png"
                  alt="Project Graveyard Dashboard - Visual graveyard with tombstones and AI insights" 
                  className="w-full h-[400px] lg:h-[500px] rounded-xl"
                  placeholder="Dashboard Preview"
                />
              </div>
              
              {/* Floating elements */}
              <div className="absolute -bottom-4 -left-4 bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700 transform -rotate-3">
                <div className="text-white text-sm font-medium mb-1">Projects Analyzed</div>
                <div className="text-2xl font-bold text-amber-400">47</div>
              </div>
              
              <div className="absolute -top-4 -right-4 bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700 transform rotate-6">
                <div className="text-white text-sm font-medium mb-1">Patterns Found</div>
                <div className="text-2xl font-bold text-green-400">12</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-400 hover:text-gray-300 animate-pulse flex flex-col items-center gap-1"
          onClick={() => document.getElementById('problem-section')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <span className="text-xs">Watch Project Graveyard In Action</span>
          <div className="text-lg">↓</div>
        </Button>
      </div>
    </section>
  )
}