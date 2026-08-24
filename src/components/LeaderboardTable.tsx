'use client'

import { useEffect, useState } from 'react'
import { LeaderboardRow } from './LeaderboardRow'

interface Entry {
  id: string
  name: string
  college: string
  gradYear: number
  points: number
  avatarUrl: string | null
}

export function LeaderboardTable({ categorySlug }: { categorySlug: string }) {
  const [entries, setEntries] = useState<Entry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboard = async (isSilent = false) => {
    try {
      if (!isSilent) setIsLoading(true)
      setError(null)
      const res = await fetch(`/api/entries?category=${categorySlug}`)
      
      if (!res.ok) {
        throw new Error('Failed to fetch leaderboard')
      }
      
      const data = await res.json()
      setEntries(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      if (!isSilent) setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    async function initialFetch() {
      try {
        setIsLoading(true)
        setError(null)
        const res = await fetch(`/api/entries?category=${categorySlug}`)
        
        if (!res.ok) {
          throw new Error('Failed to fetch leaderboard')
        }
        
        const data = await res.json()
        if (isMounted) setEntries(data)
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    initialFetch()

    return () => {
      isMounted = false
    }
  }, [categorySlug])

  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-8 bg-white rounded-2xl shadow-sm border border-red-100 p-12 text-center text-red-600">
        <p className="font-semibold">Oops!</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="text-4xl mb-4">🐢</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No entries yet</h3>
        <p className="text-gray-500">Be the first to join the race and claim the top spot!</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-gray-100 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <h2 className="font-bold text-gray-700 text-sm tracking-wider uppercase">Rankings</h2>
        <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
          {entries.length} Racers
        </span>
      </div>
      <div className="divide-y divide-gray-100">
        {entries.map((entry, index) => (
          <LeaderboardRow 
            key={entry.id} 
            rank={index + 1} 
            entry={entry} 
            onOutbidSuccess={() => fetchLeaderboard(true)} 
          />
        ))}
      </div>
    </div>
  )
}
