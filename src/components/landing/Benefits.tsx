export function Benefits() {
  const benefits = [
    {
      icon: "🧠",
      title: "Self-Awareness",
      description: "Understand your patterns, triggers, and tendencies that lead to project abandonment.",
      stat: "85% better project selection"
    },
    {
      icon: "⏰",
      title: "Time Savings", 
      description: "Stop wasting months on doomed projects. Identify red flags before you're too deep.",
      stat: "3x faster project validation"
    },
    {
      icon: "💡",
      title: "Better Ideas",
      description: "Learn what types of projects you actually finish vs. what excites you in the moment.",
      stat: "60% higher completion rate"
    },
    {
      icon: "🎯",
      title: "Strategic Focus",
      description: "Make data-driven decisions about which projects deserve your precious time and energy.",
      stat: "2x more successful launches"
    },
    {
      icon: "😌",
      title: "Guilt Relief",
      description: "Transform shame about abandoned projects into pride about lessons learned and growth achieved.",
      stat: "100% less developer guilt"
    },
    {
      icon: "🚀",
      title: "Execution Power",
      description: "Use failure patterns to structure new projects for maximum probability of completion.",
      stat: "4x better project outcomes"
    }
  ]

  return (
    <section className="py-20 bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-100 mb-6">
            Why Developers Love Their Graveyard
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Stop seeing abandoned projects as failures. Start seeing them as your secret weapon for success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="glass-card rounded-xl p-8 text-center glass-hover group"
            >
              <div className="text-5xl mb-4 group-hover:scale-103 transition-transform duration-200">
                {benefit.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-100 mb-4">
                {benefit.title}
              </h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                {benefit.description}
              </p>
              <div className="glass-button rounded-lg px-4 py-2 inline-block">
                <span className="text-blue-300 font-semibold text-sm">
                  {benefit.stat}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}