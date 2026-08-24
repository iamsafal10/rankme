import { LeaderboardTable } from '@/components/LeaderboardTable'

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const resolvedParams = await params;
  
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
            The Leaderboard
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Race to the top. Submit your resume, earn points, and outbid the competition.
          </p>
        </div>
        
        <LeaderboardTable categorySlug={resolvedParams.category} />
      </div>
    </main>
  )
}
