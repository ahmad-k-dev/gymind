# Screen API Workflow (Frontend ↔ Backend)

This document explains how the screens in `src/screens` consume backend APIs with fallbacks and a clean request flow.

## 1) Authentication screens (`Auth/Login`, `Auth/Register`)

1. `login(email, password)` calls `POST /api/auth/login`.
2. Access token is stored in secure storage.
3. User ID is extracted from JWT claims.
4. `GET /api/users/{id}` hydrates the frontend user model.
5. App routes to authenticated navigators.

For registration:
1. `register(name, email, password)` calls `POST /api/auth/register`.
2. On success, login flow is executed to keep one source of truth for session bootstrap.

## 2) Home + Gym profile screens (`Home`, `GymProfile`)

1. `fetchGyms()` calls `GET /api/gyms`.
2. Backend gym DTOs are mapped into mobile UI gym cards.
3. `normalizeGymProfile` enriches missing media/social fields.
4. Search/filter logic runs on local store state for smooth UX.

## 3) Session screens (`CheckIn`, `ActiveSession/Session`)

1. Check-in button attempts `POST /api/gymsession/check-in`.
2. If API fails, the app still starts local session state (offline-first behavior).
3. Checkout attempts `POST /api/gymsession/check-out`.
4. Regardless of API status, local session state is cleaned to prevent lock-in UX.

## 4) Stats screen (`Stats`)

1. Loads gyms (if not already loaded).
2. Calls in parallel:
   - `GET /api/gymsession/my-history`
   - `GET /api/membership/my-memberships`
3. Computes weekly activity and 30-day attendance from session history.
4. Resolves linked gym card from membership + gyms list.
5. Falls back to mock data when the API is unavailable.

## Best-practice decisions used

- **Single HTTP client** with timeout + auth interceptor.
- **Secure token storage** for bearer auth.
- **DTO mappers** isolate backend contracts from UI contracts.
- **Graceful degradation** keeps screens usable during API failures.
- **Small API modules** (`authApi`, `gymsApi`, `usersApi`, `sessionApi`, `membershipApi`) improve maintainability.
