# Phase 7: The Master MVP Flow

This document outlines the complete, end-to-end user journey of the **RankMe** MVP (Points-Only V1) as it stands after Phase 7.

## Architecture Overview
The MVP is a Next.js (App Router) application backed by a PostgreSQL database via Prisma ORM. It operates on a frictionless, anonymous basis: there are no login screens, no passwords, and no third-party OAuth providers.

## The Complete User Journey

### 1. Anonymous Arrival
- A visitor lands on `http://localhost:3000/`.
- The `HareTortoiseHero` component presents the project's unique "SDE Resume Race" visual identity (🐇 VS 🐢).
- **Under the hood**: The root `layout.tsx` injects a client-side `<IdentifyVisitor />` component. This silently triggers `POST /api/users/identify`. 
- The backend checks for a `rankme_device_token` cookie. If none exists, it generates a UUID, creates a `User` row with a fallback display name (e.g., "Racer 1234"), and sets a secure `httpOnly` cookie.

### 2. Entering the Race (Submission)
- The visitor clicks "Enter the Race" and lands on `/submit`.
- They fill out the `SubmitForm` with their `name`, `resumeUrl`, `college`, and `gradYear`.
- **Validation**: 
  - Native HTML5 validation runs first.
  - Basic React-state validation runs second.
  - The `POST /api/entries` Route Handler performs strict backend validation (types, URL parsing, integer casting).
- **Creation**: If valid, the backend reads the visitor's underlying identity cookie, verifies they haven't already entered this specific category, and creates an `Entry` starting at `0` points.
- On success, the visitor is instantly redirected to the leaderboard.

### 3. The Interactive Leaderboard
- The visitor lands on `/leaderboard/sde-resume-race`.
- The `<LeaderboardTable>` fetches `GET /api/entries?category=sde-resume-race`.
- The backend queries the database, taking advantage of the `@@index([categoryId, points])` to instantly return a perfectly sorted list of entries.
- The top 3 entries display 🥇🥈🥉 badges, while the rest display grey numerical ranks. The visitor's new entry is visible at the bottom at `0 pts`.

### 4. The Core Loop: Outbidding
- The visitor decides to boost an entry by clicking the "OUTBID +10" button.
- The UI briefly shows a loading spinner and enters a 500ms cooldown to prevent accidental double-clicks.
- `POST /api/entries/[id]/outbid` validates the visitor's cookie.
- It calls the `awardPoints` helper, executing a strict `prisma.$transaction`. This atomically writes a `PointTransaction` log (for auditability) and safely `increments` the entry's points by 10.
- Upon a `200 OK` response, the leaderboard silently re-fetches its data. 
- The points text briefly flashes emerald green and scales up via `framer-motion` to confirm the action, and the row instantly snaps to its new rank if it overtook a competitor.
