import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <main className="min-h-screen graveyard-bg">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-bold text-gray-100">
            🪦 Project Graveyard
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Where side projects rest in peace. Transform your abandoned projects 
            into lessons learned and patterns discovered.
          </p>
          <div className="pt-8">
            <Link href="/auth">
              <Button size="lg" className="text-lg">
                Enter the Graveyard
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Feature Preview */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center space-y-4">
            <div className="text-4xl">💀</div>
            <h3 className="text-xl font-semibold text-gray-100">Bury with Dignity</h3>
            <p className="text-gray-400">
              Give your abandoned projects a proper burial with epitaphs and post-mortems
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="text-4xl">📊</div>
            <h3 className="text-xl font-semibold text-gray-100">Learn from Patterns</h3>
            <p className="text-gray-400">
              Discover why your projects die and break the cycle of abandoned ideas
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="text-4xl">🧟</div>
            <h3 className="text-xl font-semibold text-gray-100">Revive the Best</h3>
            <p className="text-gray-400">
              Resurrect promising projects with focused revival sprints
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}