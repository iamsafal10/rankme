# Phase 3: Leaderboard Read Flow

This document details the read path established in Phase 3, connecting the data structures from Phase 1 and the zero-friction tracking from Phase 2 into a real user-facing leaderboard.

## Recapping Previous State
At the end of Phase 2, we had the `SDE Resume Race` category populated with seeded `Entry` records, and visitors were receiving an automatic, silent cookie-based `User` identity upon visiting the app. However, there was no way to actually view the leaderboard.

## The Leaderboard Display Flow

When a visitor navigates to `/leaderboard/sde-resume-race`:

1. **Page Load (Server & Client Collaboration)**
   - The Next.js App Router matches the dynamic `[category]` parameter (`sde-resume-race`).
   - The `LeaderboardPage` (Server Component) renders the shell of the page (title, description) and mounts the `<LeaderboardTable>` Client Component, passing down the `categorySlug`.
   - Concurrently, the `<IdentifyVisitor />` component in the root layout executes its background `POST /api/users/identify` request to ensure the visitor has a cookie, keeping our identity layer intact.

2. **Fetching Data (Client Side)**
   - The `<LeaderboardTable>` component mounts and immediately enters a loading state.
   - It fires a `GET /api/entries?category=sde-resume-race` request to the backend.

3. **Database Query (API Route)**
   - The `GET /api/entries` Route Handler receives the request.
   - It looks up the `Category` by slug.
   - It queries the `Entry` table for all records matching that `categoryId`.
   - **Crucially**, it leverages the `@@index([categoryId, points])` established in Phase 1 by requesting `orderBy: { points: 'desc' }`. This ensures the database can instantly return the exact ranked order without doing an expensive in-memory sort.
   - Only necessary fields (name, college, gradYear, points, avatarUrl) are selected and returned as JSON.

4. **Rendering the Ranks**
   - The `<LeaderboardTable>` receives the JSON array and removes its loading spinner.
   - It maps over the array, passing each entry to a `<LeaderboardRow>` component along with its calculated `rank` (its index + 1).
   - The `<RankBadge>` component inspects the rank:
     - Rank 1 gets a 🥇
     - Rank 2 gets a 🥈
     - Rank 3 gets a 🥉
     - Ranks 4+ get a generic grey circle with their number.
   - The UI is presented to the user, showing the exact point values that were seeded in Phase 1 (e.g., Alice at 150 points, Bob at 90, Charlie at 20).
