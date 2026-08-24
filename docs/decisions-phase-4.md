# Phase 4: Decisions

This document covers the non-obvious decisions made while building the submission flow.

## Validation & UX
- **Native vs Client vs Server Validation**: We employed a three-tier validation approach:
  1. HTML5 native validation (`required` attributes, `type="url"`) for immediate browser feedback.
  2. A lightweight manual check in `SubmitForm.tsx` (using `new URL()`) to catch edge cases that bypass native validation, ensuring a smoother React-controlled error state.
  3. Server-side validation in `POST /api/entries` as the final source of truth to protect the database against malicious payloads or bypassed UI.
- **Strict 1-to-1 Mapping**: The API explicitly checks `prisma.entry.findFirst({ where: { userId, categoryId } })`. This ensures that a single anonymous browser cookie can only have *one* entry on the leaderboard for the given race. Without this, a visitor could spam the submission endpoint and clutter the bottom ranks.

## UI Decisions
- **Redirect on Success**: Instead of showing a "Success" modal, the form automatically uses `router.push('/leaderboard/sde-resume-race')` upon a `201 Created` response. This is a deliberate UX choice inspired by high-conversion flows (like Outbid.lol), removing friction and immediately delivering the dopamine hit of seeing their name on the live board.

## Testing Setup
- **Event Firing in JSDom**: During testing, we specifically used `fireEvent.submit(form)` instead of `fireEvent.click(button)` because `jsdom`'s simulation of native HTML5 validation (like `type="url"`) behaves slightly differently than a real browser, preventing `onClick` from triggering the React `onSubmit` handler when an invalid value is present.

## Revisiting Previous Decisions
- No prior decisions required revisiting. The identity flow (Phase 2) successfully passed the cookie into the POST request without any modifications needed to the Phase 2 logic. The leaderboard read path (Phase 3) also automatically accommodated the new 0-point entries without any changes.
