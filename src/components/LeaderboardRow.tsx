import { RankBadge } from './RankBadge'
import { OutbidButton } from './OutbidButton'

interface LeaderboardRowProps {
  rank: number
  entry: {
    id: string
    name: string
    college: string
    points: number
    avatarUrl?: string | null
  }
  onOutbidSuccess: () => void
}

export function LeaderboardRow({ rank, entry, onOutbidSuccess }: LeaderboardRowProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 text-center flex justify-center">
          <RankBadge rank={rank} />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold overflow-hidden shrink-0">
            {entry.avatarUrl ? (
              <img src={entry.avatarUrl} alt={entry.name} className="w-full h-full object-cover" />
            ) : (
              entry.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div className="font-semibold text-gray-900">{entry.name}</div>
            <div className="text-sm text-gray-500">{entry.college}</div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="font-bold text-gray-900 text-lg">{entry.points.toLocaleString()}</div>
          <div className="text-xs text-gray-500 uppercase font-semibold tracking-wider">pts</div>
        </div>
        <OutbidButton entryId={entry.id} onOutbidSuccess={onOutbidSuccess} />
      </div>
    </div>
  )
}
