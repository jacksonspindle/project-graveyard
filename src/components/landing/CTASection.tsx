"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section id="cta" className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Combined CTA */}
          <div className="glass-card rounded-2xl p-12 mb-12 relative overflow-hidden border border-gray-800/50 bg-gray-950/30 backdrop-blur-xl">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-800/20 to-gray-700/20"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-100 mb-6">
                Ready to Transform Your Failures?
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Join hundreds of developers who've turned their project graveyards into wisdom engines. 
                Stop feeling guilty. Start learning strategically.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Link href="/auth">
                  <Button size="lg" className="text-xl px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white font-bold transform hover:scale-102 transition-all duration-200 shadow-lg hover:shadow-blue-500/30">
                    Start Your Free Beta
                  </Button>
                </Link>
                <div className="text-gray-400 text-sm">
                  <div>✅ No credit card required</div>
                  <div>✅ Full access to all features</div>
                </div>
              </div>

              {/* Features inline */}
              

              <div className="text-gray-500 text-sm italic mb-2">
                "Transform your project failures into your competitive advantage."
              </div>
              
              <div className="text-gray-500 text-sm">
                Join the beta and help shape the future of failure-driven development
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="mt-12">
            <p className="text-gray-400 mb-6">
              What are you waiting for? Your future self will thank you.
            </p>
            <Link href="/auth">
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-gray-600 text-gray-200 hover:bg-gray-800/50 hover:border-gray-500 backdrop-blur-sm">
                Start Your Journey →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}