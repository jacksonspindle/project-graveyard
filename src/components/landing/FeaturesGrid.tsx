import { AppScreenshot } from "./AppScreenshot"

export function FeaturesGrid() {
  const features = [
    {
      emoji: "🪦",
      title: "Dignified Burial",
      description: "Give your dead projects the proper burial they deserve with meaningful epitaphs and final reflections.",
      color: "from-blue-600 to-blue-800"
    },
    {
      emoji: "📖",
      title: "Post-Mortem Analysis",
      description: "Document what went wrong, what you learned, and why the project died. Turn failure into wisdom.",
      color: "from-blue-600 to-blue-800"
    },
    {
      emoji: "🔍",
      title: "Pattern Detection",
      description: "AI-powered insights reveal your failure patterns. See why projects die and break the cycle.",
      color: "from-green-600 to-green-800"
    },
    {
      emoji: "📊",
      title: "Failure Analytics",
      description: "Visual dashboards show your project graveyard statistics, failure modes, and improvement trends.",
      color: "from-green-600 to-green-800"
    },
    {
      emoji: "💾",
      title: "Code Archaeology",
      description: "Extract and preserve valuable code snippets from dead projects. Nothing valuable gets lost.",
      color: "from-orange-600 to-orange-800"
    },
    {
      emoji: "🧟",
      title: "Revival Insights",
      description: "Get recommendations on which dead projects are worth resurrecting and how to do it right.",
      color: "from-orange-600 to-orange-800"
    }
  ]

  return (
    <section id="features-section" className="py-20 bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-100 mb-6">
            Transform Death Into Wisdom
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our platform turns your abandoned projects into a systematic learning engine. 
            Every failure becomes fuel for future success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group glass-card rounded-xl p-8 glass-hover"
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`}></div>
              
              <div className="relative z-10">
                <div className="text-5xl mb-6 group-hover:scale-103 transition-transform duration-200">
                  {feature.emoji}
                </div>
                <h3 className="text-2xl font-bold text-gray-100 mb-4 group-hover:text-white transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>

              {/* Subtle corner accent */}
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl ${feature.color} opacity-20 rounded-tr-xl rounded-bl-full group-hover:opacity-30 transition-opacity duration-300`}></div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}