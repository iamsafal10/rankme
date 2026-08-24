# Phase 2: Anonymous Identity Flow

This document outlines the identity layer added in Phase 2, which builds on the data structures from Phase 1 to silently track users.

## Recapping Phase 1 State
At the end of Phase 1, our database had the `SDE Resume Race` category and a set of seeded `User`, `Entry`, and `PointTransaction` records used for demo purposes. However, the application had no way of knowing *who* the current visitor was.

## The Anonymous Identity Flow

We implemented a zero-friction, cookie-based identity layer that automatically tags visitors without requiring a login screen.

### 1. The Cold Start (New Visitor)
When a brand-new visitor loads any page on the app:
1. The Next.js layout renders a client-side component (`<IdentifyVisitor />`).
2. This component fires a background `POST` request to `/api/users/identify`.
3. The server checks the request for the `rankme_device_token` cookie. Finding none, it:
   - Generates a new random UUID.
   - Creates a new `User` record in the database with that token and a placeholder name (e.g., "Racer 4921").
   - Sets the `rankme_device_token` cookie on the response with a 1-year expiration.
   - Returns the new user's ID.

### 2. The Returning Visitor
When a visitor who has previously received a cookie returns to the app:
1. The `<IdentifyVisitor />` component fires its background request again on load.
2. The server receives the `rankme_device_token` cookie.
3. The server queries the database for a `User` matching that token.
4. Instead of creating a duplicate, the server simply returns the existing user's ID.
5. The frontend proceeds, now implicitly knowing which identity the visitor holds.

This flow ensures that when we build the submission and outbid mechanics in the next phases, we can seamlessly attach the `userId` to any new `Entry` or `PointTransaction` without ever asking the user for a password.
