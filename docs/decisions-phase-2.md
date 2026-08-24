# Phase 2: Decisions

This document covers the non-obvious decisions made while building the anonymous identity layer.

## Identity Flow Decisions
- **Cookie configuration**: 
  - `httpOnly: true` (prevents XSS attacks from reading it)
  - `secure: process.env.NODE_ENV === 'production'` (allows localhost testing over HTTP, strictly HTTPS in prod)
  - `maxAge: 60 * 60 * 24 * 365` (1 year, to persist their identity nicely as a returning visitor without frequent expiration).
- **Client vs Server identification**: We chose to implement a `<IdentifyVisitor />` **client component** and injected it into the root `layout.tsx`. Because Next.js App Router root layouts are Server Components, attempting to set a cookie directly during the render pass is restricted unless using Middleware or a Route Handler. Injecting a small client component that calls `POST /api/users/identify` asynchronously on mount achieves the same goal transparently without blocking the initial page load or fighting the Next.js cache.
- **Random UUIDs vs browser fingerprinting**: We rely purely on `uuidv4()` generated server-side. This keeps identity fully anonymous and avoids the privacy/complexity issues of device fingerprinting. If they clear cookies, they simply become a new user, which is acceptable for a demo environment.

## Infrastructure Decisions
- **Prisma Client Singleton**: We implemented the standard `globalThis` singleton for `PrismaClient` to avoid exhausting database connections during Next.js hot-reloads (`npm run dev`). This instantiation was specifically adapted to use the `@prisma/adapter-pg` driver required by Prisma v7.
- **Testing Approach**: 
  - For unit tests, we mocked `next/headers` to emulate the `cookies()` store, ensuring we could test the API route logic directly in Node without spinning up an actual Next.js context. 
  - For integration tests, we hit the running dev server over HTTP to test the end-to-end cookie behavior across multiple requests.

## Revisiting Previous Decisions
- Nothing from `docs/decisions-phase-0.md` or `docs/decisions-phase-1.md` needed to be revisited or changed. The schema created in Phase 1 seamlessly supported the identity logic in this phase.
