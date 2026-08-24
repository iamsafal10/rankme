# Phase 4: Submission Flow

This document details the end-to-end process introduced in Phase 4, taking a visitor from an anonymous arrival all the way to seeing themselves on the leaderboard.

## Recapping Previous State
After Phase 3, we had a zero-friction identity layer and a live leaderboard reading from the database, but visitors could not actually join the race. The leaderboard was entirely static, relying on seeded demo data.

## The End-to-End Submission Path

The flow now works entirely without a traditional login screen:

1. **Arrival & Silent Identity**
   - A visitor lands on the submission page (`/submit`).
   - The `<IdentifyVisitor />` component in the root layout fires silently.
   - The API generates a unique `deviceToken` and a random placeholder name (e.g., "Racer 8192"), saves a `User` record, and returns a cookie. The visitor is now tracked without knowing it.

2. **The Submit Form**
   - The visitor fills out the `SubmitForm` component, providing their `name`, `resumeUrl`, `college`, and `gradYear`.
   - On submit, the component runs client-side validation (ensuring the name is valid and the URL is well-formed) to avoid unnecessary roundtrips.
   - If valid, it sends a `POST` request to `/api/entries`.

3. **Backend Processing & Linkage**
   - The `POST /api/entries` Route Handler intercepts the request.
   - It reads the `rankme_device_token` cookie and strictly links the incoming payload to that underlying `User` record. If no cookie is present (e.g., they bypassed the frontend), it rejects the request with a `401 Unauthorized`.
   - It verifies that the visitor hasn't already submitted an entry for the `SDE Resume Race` category, enforcing a strict 1-to-1 relationship.
   - It creates an `Entry` starting exactly at `0` points.

4. **Redirection & Ranking**
   - The frontend receives the successful `201 Created` response.
   - It automatically redirects the visitor to `/leaderboard/sde-resume-race`.
   - Because the entry was created at `0` points, the visitor naturally appears at the bottom of the rankings among the other zero-point entries, instantly visualizing their starting position in the race.
