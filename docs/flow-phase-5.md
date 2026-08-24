# Phase 5: Outbid Flow

This document details the core interaction loop introduced in Phase 5: the ability to actively change rankings via outbidding.

## Recapping Previous State
At the end of Phase 4, visitors could receive an anonymous identity, submit an entry, and view themselves on a static leaderboard at 0 points. There was no way to increase points or climb the ranks.

## The Interactive Outbid Path

The leaderboard is now a dynamic, interactive race:

1. **The Outbid Action**
   - A visitor viewing the leaderboard sees an "OUTBID +10" button next to every entry.
   - When clicked, the `<OutbidButton>` component instantly enters a loading state (spinner) and triggers a 500ms cooldown to prevent accidental double-clicks.
   - A `POST` request is sent to `/api/entries/[id]/outbid`.

2. **Backend Validation & Transaction**
   - The Route Handler checks the visitor's `rankme_device_token` cookie to confirm their identity.
   - It calls the central `awardPoints` helper function (`src/lib/points.ts`).
   - `awardPoints` executes a `prisma.$transaction`, ensuring strict database atomicity:
     1. It writes a `PointTransaction` record linking the visitor (`userId`), the target (`entryId`), an amount (`10`), and the type (`DEMO_OUTBID`).
     2. It increments the target `Entry`'s `points` by 10.
   - If either the log write or the increment fails, the entire transaction rolls back, preventing "free" unlogged points or lost logs.

3. **Re-sorting the Leaderboard**
   - The Route Handler returns a `200 OK` response.
   - The `<OutbidButton>` signals success to the parent `<LeaderboardTable>` component.
   - The `<LeaderboardTable>` triggers a silent re-fetch (`GET /api/entries`).
   - The backend runs its optimized query using the `@@index([categoryId, points])`, and immediately returns the newly sorted array.
   - The UI updates, showing the entry's increased points and potentially its new, higher rank.
