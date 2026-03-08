# Mobile Frontend → Backend API Integration Gaps

This audit lists mobile app features that are **not integrated** or only **partially integrated** with the current backend API in `Backend/Controllers`.

## Not integrated yet

1. **Forgot / reset password flow is not connected to backend**
   - Mobile still exposes the Forgot Password screen, but the API wrapper intentionally throws "not available yet".
   - Backend currently has `login`, `register`, and `refresh` endpoints only under `AuthController`, with no reset endpoints.

2. **Announcements are local-only (no backend fetch)**
   - Home announcement content comes from a hardcoded `DEFAULT_ANNOUNCEMENT` persisted in AsyncStorage.
   - Backend already exposes announcement endpoints (`/api/announcements/me`, branch/gym scoped create, delete), but mobile does not call them.

3. **Notifications are not integrated**
   - Notification badge count in UI store is a static number (`2`) and there is no mobile notifications API module/hydration flow.
   - Backend already has notifications endpoints (`/api/notifications/me`, mark as read, create for gym/branch).

4. **AI Assistant is mock UI only**
   - AI chat uses local seeded messages and delayed `setTimeout` responses; no HTTP call exists for assistant prompts.
   - There is no dedicated AI/chat backend endpoint in current controllers.

5. **Membership QR/check-in identity data in Check-In screen is static UI**
   - Membership ID (`#8829-X`) and tier label (`ELITE MEMBER`) are hardcoded in the screen.
   - Backend has membership verification/details endpoints that are not used by this screen.

6. **Gym "favorite" action is not persisted or synced**
   - Tapping favorite in Gym Profile only shows a success alert.
   - There is no favorite endpoint in backend controllers and no local persistence/store for favorites.

## Partially integrated (works, but with backend sync gaps)

1. **Session lifecycle can diverge from backend state**
   - Check-in/check-out call backend, but app intentionally proceeds with local session behavior on failure.
   - This is good offline UX, but creates possible server/client state mismatch when sync fails.

2. **Stats have mock fallback data**
   - Stats are hydrated from backend history + memberships, but default mock datasets remain in store and are kept when requests fail.

## Quick priority order

1. Implement/reset password endpoints and wire `requestResetApi`/`resetPasswordApi`.
2. Integrate announcements + notifications APIs (badge + inbox + read-state).
3. Decide AI backend contract (or hide AI tab until endpoint exists).
4. Replace static membership card data with `/membership` reads.
5. Add favorites domain (backend + mobile store/api).
