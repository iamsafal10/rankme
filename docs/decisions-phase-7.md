# Phase 7: Decisions & QA Log

This document lists the bugs discovered during the comprehensive Phase 7 QA pass, their root causes, and how they were resolved.

## Bugs Found & Fixed

### 1. Inadequate API Validation on Submission
- **Bug**: The `POST /api/entries` endpoint relied on basic truthy checks (e.g., `if (!name)`). A malicious or bypassed client could submit `gradYear: "invalid_string"`, which would bypass the truthy check but cause a Prisma crash (HTTP 500) when it attempted to cast it to an `Int` in the database.
- **Fix**: Replaced the naive checks with strict type verification (`typeof name === 'string'`), length bounds (`name.trim().length < 2`), server-side URL formatting (`new URL(resumeUrl)`), and integer parsing (`parseInt`) coupled with `isNaN` checks.
- **Testing**: Updated `__tests__/submit.test.tsx` to assert the new `"Missing or invalid required fields"` error message. Added a malformed payload step to the master integration test (`scripts/test-integration-phase-7.ts`).

### 2. Integration Test Data Pollution (Skipped per user instruction)
- **Bug**: `__tests__/identity.test.ts` and `__tests__/schema.test.ts` began failing locally because previous integration tests had polluted the persistent development database (causing unique constraint errors on hardcoded tokens and messing up absolute array length counts).
- **Note**: Per user instructions, we skipped fixing the specific unit tests for this local run to focus on the core product QA rather than automated test cleanup. (A standard fix would be replacing `prisma.user.create` with `prisma.user.upsert` in tests, or wiping the DB in `beforeEach`).

## Revisiting Previous Decisions
- No core architecture or decisions from Phases 0–6 required reverting. The database schema, identity flow, and centralized `awardPoints` helper remain robust and unchanged.
