'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SubmitForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const resumeUrl = formData.get('resumeUrl') as string
    const college = formData.get('college') as string
    const gradYear = formData.get('gradYear') as string

    // Basic client validation
    if (!name || name.trim().length < 2) {
      setError('Please provide a valid name.')
      setIsSubmitting(false)
      return
    }

    try {
      // Very basic URL validation
      new URL(resumeUrl)
    } catch {
      setError('Please provide a valid URL for your resume.')
      setIsSubmitting(false)
      return
    }

    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, resumeUrl, college, gradYear }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit entry')
      }

      // Success, redirect to leaderboard
      router.push('/leaderboard/sde-resume-race')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl shadow-indigo-100/50 border border-gray-100 max-w-lg mx-auto mt-8">
      <h2 className="text-2xl font-extrabold text-gray-900 mb-6 text-center">Join the Race 🐇</h2>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
            Display Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors text-gray-900"
            placeholder="e.g. Code Ninja"
          />
        </div>

        <div>
          <label htmlFor="resumeUrl" className="block text-sm font-semibold text-gray-700 mb-1">
            Resume URL (Google Drive, Notion, etc.)
          </label>
          <input
            type="url"
            id="resumeUrl"
            name="resumeUrl"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors text-gray-900"
            placeholder="https://..."
          />
        </div>

        <div>
          <label htmlFor="college" className="block text-sm font-semibold text-gray-700 mb-1">
            College / University
          </label>
          <input
            type="text"
            id="college"
            name="college"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors text-gray-900"
            placeholder="e.g. MIT"
          />
        </div>

        <div>
          <label htmlFor="gradYear" className="block text-sm font-semibold text-gray-700 mb-1">
            Graduation Year
          </label>
          <select
            id="gradYear"
            name="gradYear"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors bg-white text-gray-900"
          >
            <option value="">Select year...</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isSubmitting ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          'Submit Resume'
        )}
      </button>
    </form>
  )
}
