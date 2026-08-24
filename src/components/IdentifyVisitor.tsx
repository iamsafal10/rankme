'use client'

import { useEffect, useRef } from 'react'

export function IdentifyVisitor() {
  const hasFired = useRef(false)

  useEffect(() => {
    // Only fire once per mount even in React StrictMode
    if (hasFired.current) return
    hasFired.current = true

    fetch('/api/users/identify', { method: 'POST' })
      .catch((error) => console.error('Failed to identify visitor:', error))
  }, [])

  return null
}
