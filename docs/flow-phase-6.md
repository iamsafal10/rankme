# Phase 6: Landing Page & Visual Identity

This document details the polished visitor experience introduced in Phase 6, taking a visitor from the initial landing page through the interactive loop.

## Recapping Previous State
After Phase 5, the core mechanics worked, but there was no landing page to explain the product, and the styling was functional but not cohesive or polished.

## The Polished Visitor Experience

1. **The Landing Page (`/`)**
   - Visitors now arrive at a dedicated landing page featuring the `HareTortoiseHero` component.
   - The hero section uses `framer-motion` for a premium, animated visual (🐇 VS 🐢) set against a dark gradient background, establishing a unique identity distinct from Outbid.lol.
   - Clear copy explains the "SDE Resume Race" concept.
   - Two CTAs guide the user: "Enter the Race" (primary) and "View Leaderboard" (secondary).

2. **The Submission Flow (`/submit`)**
   - The background and typography now share the exact same `slate` color palette as the landing page (`bg-slate-50`, `text-slate-900`), making it feel like a seamless transition rather than a separate app.

3. **The Interactive Leaderboard (`/leaderboard/sde-resume-race`)**
   - The leaderboard adopts the cohesive `slate` theme.
   - **Points Animation**: When a visitor clicks "OUTBID" and the points update, the points number in the `LeaderboardRow` explicitly animates (scaling up slightly and flashing emerald green before settling back to slate). This micro-interaction leverages `framer-motion` to provide immediate, satisfying visual feedback that their action was registered, even before they notice a rank change.
