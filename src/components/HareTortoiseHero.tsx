'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export function HareTortoiseHero() {
  return (
    <div className="relative overflow-hidden bg-slate-900 py-24 sm:py-32 w-full rounded-3xl shadow-2xl">
      {/* Background Gradients */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center relative z-10">
        
        {/* Animated Icons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex justify-center items-end space-x-8 mb-8"
        >
          <motion.div 
            animate={{ y: [0, -15, 0] }} 
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="text-7xl drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
          >
            🐇
          </motion.div>
          
          <div className="text-3xl font-extrabold text-slate-500 italic pb-4">VS</div>
          
          <motion.div 
            animate={{ x: [0, 10, 0] }} 
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="text-7xl drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
          >
            🐢
          </motion.div>
        </motion.div>

        {/* Hero Text */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white to-emerald-300">
            The SDE Resume Race
          </h1>
          <p className="mt-6 text-xl leading-8 text-slate-300 max-w-2xl mx-auto font-medium">
            Are you the fast-moving Hare or the slow-and-steady Tortoise? 
            Drop your resume, join the anonymous leaderboard, and let the community decide who wins the race.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 flex items-center justify-center gap-x-6"
        >
          <Link
            href="/submit"
            className="rounded-full bg-indigo-500 px-8 py-4 text-sm font-bold text-white shadow-lg hover:bg-indigo-400 hover:scale-105 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
          >
            Enter the Race
          </Link>
          <Link 
            href="/leaderboard/sde-resume-race" 
            className="text-sm font-bold leading-6 text-white hover:text-indigo-300 transition-colors flex items-center gap-2 group"
          >
            View Leaderboard <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
