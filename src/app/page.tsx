import { HareTortoiseHero } from '@/components/HareTortoiseHero'

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <HareTortoiseHero />
        
        {/* Footer / Extra Context */}
        <div className="mt-16 text-center text-slate-500 text-sm max-w-xl mx-auto">
          <p>
            An open-source experiment to see what the community values most in a resume. 
            No logins, no friction, just pure competitive ranking.
          </p>
        </div>
      </div>
    </main>
  )
}
