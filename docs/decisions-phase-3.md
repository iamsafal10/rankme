# Phase 3: Decisions

This document covers the non-obvious decisions made while building the leaderboard read path.

## Leaderboard Fetching & Rendering
- **Client vs Server Fetching**: We opted to make `<LeaderboardTable>` a Client Component that fetches data via `useEffect`. While Next.js App Router easily supports fetching data inside Server Components, a Client Component was chosen because:
  1. It aligns seamlessly with the requested "loading and empty states" requirement, providing immediate visual feedback (a spinner) without requiring a full page navigation or complex Suspense boundaries.
  2. In future phases, when users click "Outbid", we will likely want to mutate and re-fetch (or poll) the leaderboard in real-time. A client-side fetch makes transitioning to polling or SWR/React Query much easier later on.
- **Empty & Error States**: The `<LeaderboardTable>` explicitly checks for `entries.length === 0` and renders a friendly empty state (featuring the Tortoise 🐢 theme) instead of a blank table. It also gracefully catches network/API errors and displays a red boundary warning, preventing the entire page from crashing.

## API Route Design
- **Single DB Query**: The `GET /api/entries` route fetches the exact format needed for the frontend in a single query using Prisma's `select`. It trusts the `@@index([categoryId, points])` for performance, sorting by `points: 'desc'`.
- **Category Lookup**: We lookup the `category` by `slug` rather than ID, as the URL naturally contains the slug (`/leaderboard/sde-resume-race`). If the slug is missing or invalid, the API returns a `404`, which the frontend catches and renders as an error state.

## Testing Setup
- **Vitest + JSdom**: We extended our unit testing setup by installing `@testing-library/react` and `@vitejs/plugin-react`, and updating `vitest.config.ts` to use `jsdom`. This allowed us to mount and test the `<RankBadge>` React component directly to verify the 🥇🥈🥉 logic, proving that the visual badges map correctly to the rank numbers without manual browser checks.

## Revisiting Previous Decisions
- Nothing from the Phase 0, 1, or 2 decisions needed to be revisited. The database schema from Phase 1 fully supported the required read query, and the identity layer from Phase 2 continues to operate transparently via the layout injection without interfering with the leaderboard read path.
