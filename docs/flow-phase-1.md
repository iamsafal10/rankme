# Phase 1: Database Schema Flow

This document extends the flows established in Phase 0 by detailing the actual data structures and relationships introduced in Phase 1.

## What exists in the DB after seeding

The development database now has the core tables defined and seeded with initial demo data. 
Currently, the database contains:
1. **Category**: A single active category `SDE Resume Race` (slug: `sde-resume-race`).
2. **Users**: 3 anonymous users representing the demo participants (Alice, Bob, Charlie) identified strictly by a `deviceToken`.
3. **Entries**: 3 resume submissions, one for each user, linked to the `SDE Resume Race` category. Each entry stores a denormalized `points` total to enable fast querying.
4. **Point Transactions**: 3 transaction records, each matching the initial point balances given to the seeded entries, logged with type `MANUAL_ADJUST`.

## Data Flow in Practice

### How entities relate to each other
When interacting with the system, data flows across the following relationships:
- **Category ↔ Entries**: A category (like "SDE Resume Race") serves as a container for many `Entry` records. The leaderboard view will query `Entry` where `categoryId` matches the slug's resolved ID.
- **User ↔ Entries & Transactions**: A `User` represents the identity tied to a device. A user can own multiple `Entry` records (e.g. they can submit to different categories) and multiple `PointTransaction` records (e.g. they can initiate Outbids on their own or other entries).
- **Entry ↔ Point Transactions**: This is the core integrity mechanism. The `Entry.points` field is purely a denormalized sum for fast reads (supported by the `@@index([categoryId, points])` for rapid sorting). The *source of truth* is the append-only `PointTransaction` log. Every time points change (like an outbid), a transaction is recorded linking the target `Entry` to the acting `User`.

### Real-world scenario: An Outbid Action
1. User clicks "+10 Outbid" on an entry.
2. The system locates the `Entry` by ID and the actor `User` by their device token cookie.
3. A `PointTransaction` is appended linking both, with an amount of `10` and type `DEMO_OUTBID`.
4. In the same atomic transaction, the `Entry.points` field increments by `10`.
5. The leaderboard query fetches `Entry` sorted by `points DESC`, instantly reflecting the new rank.
