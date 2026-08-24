'use client'

import { useState } from 'react'

interface OutbidButtonProps {
  entryId: string
  onOutbidSuccess: () => void
}

export function OutbidButton({ entryId, onOutbidSuccess }: OutbidButtonProps) {
  const [isOutbidding, setIsOutbidding] = useState(false)
  const [isCooledDown, setIsCooledDown] = useState(false)

  const handleOutbid = async () => {
    if (isOutbidding || isCooledDown) return
    
    setIsOutbidding(true)

    try {
      const res = await fetch(`/api/entries/${entryId}/outbid`, {
        method: 'POST'
      })

      if (!res.ok) {
        throw new Error('Outbid failed')
      }

      onOutbidSuccess()
      
      // Double-click guard (500ms cooldown)
      setIsCooledDown(true)
      setTimeout(() => setIsCooledDown(false), 500)
    } catch (err) {
      console.error(err)
    } finally {
      setIsOutbidding(false)
    }
  }

  return (
    <button 
      onClick={handleOutbid}
      disabled={isOutbidding || isCooledDown}
      className={`px-4 py-2 font-bold rounded-lg transition-all flex items-center justify-center min-w-[100px] ${
        isOutbidding || isCooledDown
          ? 'bg-indigo-300 text-white cursor-not-allowed'
          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 active:scale-95'
      }`}
    >
      {isOutbidding ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      ) : (
        '+10 OUTBID'
      )}
    </button>
  )
}
