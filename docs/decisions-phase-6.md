# Phase 6: Decisions

This document covers the non-obvious decisions made while polishing the visual identity of the app.

## Visual Identity & Theme
- **The "Slate" Palette**: We explicitly chose Tailwind's `slate` palette (e.g., `bg-slate-50`, `text-slate-900`) instead of the default `gray`. Slate has a subtle blue undertone that feels more premium, modern, and distinct from bare prototypes, while avoiding the hyper-specific branding colors of competitors like Outbid.lol.
- **The Hare vs Tortoise Concept**: We brought this to life using standard emojis (🐇 vs 🐢) combined with sleek CSS drop-shadows and `framer-motion` keyframe animations. This achieves the requested "original" visual identity quickly without requiring custom SVGs or heavy asset loading, keeping the initial payload light and the aesthetic playful but polished.

## Micro-Interactions
- **Points Highlight Animation**: We implemented the "nice-to-have" points animation using a `<motion.div>` tied to a `key={entry.points}`. When the points update via the server re-fetch, the key changes, forcing Framer Motion to re-run the `initial` state (scaling up slightly and flashing emerald green before settling back to the default text color). This was chosen because it provides critical UX feedback for the core loop—confirming to the user that their click registered—without meaningfully slowing down the development phase.

## Responsive Design
- The landing page hero was built with flexible max-widths and scalable text (`sm:text-7xl`) to ensure it looks equally impressive on narrow mobile screens (where this will likely be shared first) and wide desktop monitors.
- The `LeaderboardTable` and `LeaderboardRow` flex layouts were already structurally responsive, and the standard Tailwind padding (`px-4 sm:px-6`) ensures it doesn't break the viewport on phones.

## Revisiting Previous Decisions
- No previous architectural decisions needed revisiting. The frontend and backend separation allowed us to heavily modify the UI, introduce animations, and add a landing page without touching the core Prisma logic, identity cookies, or API routes.
