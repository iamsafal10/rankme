export function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-2xl" title="Rank 1">🥇</span>
  if (rank === 2) return <span className="text-2xl" title="Rank 2">🥈</span>
  if (rank === 3) return <span className="text-2xl" title="Rank 3">🥉</span>
  
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold text-sm">
      {rank}
    </span>
  )
}
