"use client"

import { AppScreenshot } from "./AppScreenshot"

export function HowItWorks() {
  const features = [
    {
      emoji: "🪦",
      title: "Dignified Burial",
      description: "Give your dead projects the proper burial they deserve with meaningful epitaphs and final reflections.",
      screenshot: "/images/graveyard-dashboard.png",
      alt: "Project burial interface"
    },
    {
      emoji: "📖",
      title: "Post-Mortem Analysis",
      description: "Document what went wrong, what you learned, and why the project died. Turn failure into wisdom.",
      screenshot: "/images/post-mortem-screenshot.png",
      alt: "Post-mortem analysis interface showing problem statement, what went wrong, and lessons learned"
    },
    {
      emoji: "🔍",
      title: "Pattern Detection",
      description: "AI-powered insights reveal your failure patterns. See why projects die and break the cycle.",
      screenshot: "/images/graveyard-dashboard.png",
      alt: "AI pattern detection interface"
    },
    {
      emoji: "📊",
      title: "Failure Analytics",
      description: "Visual dashboards show your project graveyard statistics, failure modes, and improvement trends.",
      screenshot: "/images/analytics-dashboard.png",
      alt: "Analytics dashboard showing project statistics"
    }
  ]

  return (
    <section id="how-it-works" className="py-32 bg-black">
      <div className="container mx-auto px-8">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
             Turn Abandonment Into Wisdom
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Our platform turns your abandoned projects into a systematic learning engine. Every failure becomes fuel for future success.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="max-w-7xl mx-auto">
          <div className="space-y-32">
            {features.map((feature, index) => (
              <div key={index} className="grid lg:grid-cols-2 gap-16 items-center">
                
                {/* Screenshot (Left for even, Right for odd) */}
                <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <div className="relative">
                    <div className="bg-gray-900/50 rounded-2xl p-2 backdrop-blur-sm border border-gray-800/50">
                      <div className="relative w-full" style={{ aspectRatio: '16/10' }}>
                        <AppScreenshot 
                          src={feature.screenshot}
                          alt={feature.alt}
                          className="w-full h-full rounded-xl"
                          placeholder="Feature Preview"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content (Right for even, Left for odd) */}
                <div className={`${index % 2 === 1 ? 'lg:order-1' : ''} lg:px-8`}>
                  <div className="space-y-6">
                    <h3 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
                      {feature.title}
                    </h3>
                    <p className="text-lg text-gray-300 leading-relaxed max-w-lg">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}