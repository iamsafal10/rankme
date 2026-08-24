# Phase 5: Decisions

This document covers the non-obvious decisions made while building the outbid and points system.

## Points Architecture
- **Centralized `awardPoints` Helper**: We placed the point incrementing logic inside a shared helper (`src/lib/points.ts`) rather than directly inside the route handler. This guarantees that whether points are awarded via the UI demo button, or (in a future phase) via a Razorpay webhook after a real payment, the core integrity mechanism (`PointTransaction` log + `Entry` increment) remains identical and atomic.
- **Database Atomicity**: We utilized `prisma.$transaction` combined with `{ increment: amount }`. The `increment` keyword is critical: it tells the database to atomically add to the current value, completely avoiding race conditions where multiple rapid clicks read stale point values and overwrite each other.

## UI/UX Decisions
- **Re-fetch vs Optimistic Sorting**: When an outbid succeeds, the UI performs a silent re-fetch of the leaderboard API rather than attempting to locally sort the array in memory. Why? Because in a competitive environment, other visitors might be outbidding simultaneously. A server re-fetch guarantees the client sees the true, absolute state of the race, preventing desync issues.
- **Double-Click Guard**: The `<OutbidButton>` disables itself via React state `isOutbidding` while the network request is pending, and introduces a hardcoded `500ms` cooldown (`isCooledDown`). This prevents impatient visitors from spamming clicks faster than the network can resolve, while still feeling highly responsive.

## Revisiting Previous Decisions
- No previous decisions needed changing. The `@@index([categoryId, points])` decided in Phase 1 is now actively shining, keeping the re-fetches incredibly fast even as points change constantly.
