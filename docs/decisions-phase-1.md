# Phase 1: Decisions

This document covers the non-obvious decisions and technical nuances encountered while establishing the database schema and seed script during Phase 1.

## Schema Implementation
- **Exact mapping**: The schema was mapped exactly as specified in `implementation.md §2`. No fields were altered or removed.
- **Index constraints**: The `@@index([categoryId, points])` on `Entry` was added as requested for fast leaderboard sorts.
- **Prisma v7 Adaptation**: Prisma v7 removes support for `url` inside `datasource db` in `schema.prisma`. It also deprecates the default engine execution in favor of explicit adapters. To comply:
  - We removed `url = env("DATABASE_URL")` from `schema.prisma`.
  - We updated `prisma.config.ts` to include the `url` property and configure the `seed` command script.
  - We installed `@prisma/adapter-pg` and `pg` to execute Prisma Client operations reliably within our seed script and testing environments.

## Seed Idempotency
- **Upsert mechanism**: The seed script relies purely on `prisma.category.upsert` and `prisma.user.upsert`. It checks for existing entries using `findFirst` rather than blindly creating them.
- **Is it safe to re-run?**: **Yes**. The script is fully idempotent. If re-run, it will recognize that the Category, Users, and their respective Entries already exist and simply log that it skipped creating them. It will not duplicate the point transactions or inflate points on successive runs.

## Testing Strategy
- Since the Next.js scaffold does not include a testing runner, **Vitest** was introduced as a fast, lightweight runner compatible with the Next.js ecosystem. 
- Due to the `pg` driver adapter, testing requires loading `.env` explicitly. The tests instantiate a local `Pool` and `PrismaClient` directly to test constraints.
- We deliberately tested invalid inputs (e.g., trying to write an `Entry` without valid references) to confirm Prisma correctly rejects orphaned rows.

## Revisiting Phase 0 Decisions
- **None**. The Phase 0 `docs/decisions-phase-0.md` decisions (regarding Next.js scaffolding, empty DB setup) remain fully valid and unaltered by Phase 1. (Note: Phase 0 docs were assumed implicit from the original instructions and didn't conflict here).
