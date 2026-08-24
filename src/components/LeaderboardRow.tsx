import { RankBadge } from './RankBadge'
import { OutbidButton } from './OutbidButton'
import { motion } from 'framer-motion'

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
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between p-4 bg-white border-b border-gray-100 last:border-0 hover:bg-slate-50 transition-colors"
    >
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
            <div className="font-semibold text-slate-900">{entry.name}</div>
            <div className="text-sm text-slate-500">{entry.college}</div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-right flex flex-col items-end">
          <motion.div 
            key={entry.points}
            initial={{ scale: 1.2, color: '#10b981' }}
            animate={{ scale: 1, color: '#0f172a' }} // text-slate-900
            transition={{ duration: 0.5 }}
            className="font-bold text-lg"
          >
            {entry.points.toLocaleString()}
          </motion.div>
          <div className="text-xs text-slate-500 uppercase font-semibold tracking-wider -mt-1">pts</div>
        </div>
        <OutbidButton entryId={entry.id} onOutbidSuccess={onOutbidSuccess} />
      </div>
    </motion.div>
  )
}
