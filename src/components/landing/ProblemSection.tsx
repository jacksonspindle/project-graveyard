export function ProblemSection() {
  return (
    <section id="problem-section" className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Section header */}
          <h2 className="text-4xl md:text-5xl font-bold text-gray-100 mb-8">
            Why Projects Really Fail
          </h2>
          <p className="text-xl text-gray-300 mb-16">
            Every developer has a graveyard of abandoned projects. It's time to face the music.
          </p>

          {/* Problem grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="glass-card glass-gradient-blue rounded-lg p-8 text-left glass-hover">
              <div className="text-4xl mb-4">😰</div>
              <h3 className="text-2xl font-semibold text-blue-300 mb-4">The Guilt Spiral</h3>
              <p className="text-gray-300 leading-relaxed">
                You start projects with excitement, then abandon them when reality hits. 
                The guilt compounds with each new "revolutionary" idea that ends up in digital limbo.
              </p>
            </div>

            <div className="glass-card glass-gradient-orange rounded-lg p-8 text-left glass-hover">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-2xl font-semibold text-orange-300 mb-4">Endless Cycle</h3>
              <p className="text-gray-300 leading-relaxed">
                Same mistakes, different projects. You're trapped in patterns you can't see, 
                destined to repeat the same failure modes over and over.
              </p>
            </div>

            <div className="glass-card glass-gradient-green rounded-lg p-8 text-left glass-hover">
              <div className="text-4xl mb-4">💭</div>
              <h3 className="text-2xl font-semibold text-green-300 mb-4">Lost Wisdom</h3>
              <p className="text-gray-300 leading-relaxed">
                Each abandoned project contains valuable lessons, but they're buried in your memory. 
                The insights fade, and you lose the growth that failure should provide.
              </p>
            </div>

            <div className="glass-card glass-gradient-blue rounded-lg p-8 text-left glass-hover">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-2xl font-semibold text-blue-300 mb-4">Poor Decisions</h3>
              <p className="text-gray-300 leading-relaxed">
                Without understanding why projects fail, you can't make better choices. 
                You keep picking the wrong technologies, scope, and timing.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}