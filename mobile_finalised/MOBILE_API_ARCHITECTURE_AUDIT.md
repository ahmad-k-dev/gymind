# Mobile Frontend Architecture & API Integration Audit

## Scope and method
- Reviewed the mobile frontend under `mobile_finalised/src` with emphasis on auth, API calls, stores, and screens that directly touch backend services.
- Cross-checked against backend controllers/DTOs under `Backend/Controllers` and `Backend/DTOs`.
- Assumptions are explicitly flagged where behavior depends on runtime Axios URL joining or backend serialization details.

---

## A) Architecture map (high level)

### Intended flow (target architecture)
`Screen → Store (Zustand) → API service (services/api/*) → axios client (interceptors/refresh) → Backend → Store update → UI render`

### Actual flow in this codebase
1. **Auth app bootstrap**
   - `RootNavigator` calls `useAuth.init()` and gates navigation on `authed` state.
   - `useAuth.init()` reads tokens/userId from SecureStore and optionally fetches user profile.
2. **Request path**
   - Most network calls use `apiClient` from `services/api/api.ts`.
   - `apiClient` request interceptor dynamically imports `useAuth` and attaches `Authorization: Bearer <token>` when available.
3. **401 path**
   - `apiClient` response interceptor does single-flight refresh through a separate `refreshClient` and persists updated tokens via `state.setTokens(...)`, then retries the original request.
4. **Data hydration paths**
   - `useGyms.fetchGyms()` calls `getAllGymsApi()` then maps backend gyms into UI gym models.
   - `StatsScreen` bypasses store for history/membership and calls APIs directly, then maps to chart view models.
   - `CheckInScreen` and `SessionScreen` call session APIs directly from UI.

### Architectural deviations observed
- Mixed patterns: some API calls are store-driven (`auth`, `gyms`) while others are called directly in screens (`stats`, `check-in`, `check-out`, `forgot password`).
- Two axios client modules exist (`api.ts` and `client.ts`) with inconsistent defaults/keys.
- A logical circular dependency exists (`api.ts` dynamically imports `store/auth`, while `store/auth` imports from `api.ts`).

---

## B) File-by-file breakdown

### File: `mobile_finalised/src/services/api/api.ts`
**Objective:** Central axios client, token persistence helpers, auth request wrappers, and 401 refresh-retry logic.  
**Reason:** Shared transport/infrastructure layer so every call can reuse base URL + interceptors.  
**Depends on:** `axios`, `expo-secure-store`, `./types`, dynamic import of `../../store/auth`.  
**Used by:** `store/auth.ts`, plus API modules importing `apiClient` from this file.  
**API touchpoints:** `/auth/login`, `/auth/register`, `/auth/refresh` through `authApi`; retry refresh also `/auth/refresh`.  
**Bugs / risks:**
- Dynamic import of auth store inside interceptors creates a runtime circular dependency pattern (mitigated but still coupling infra↔state).
- No response logging/diagnostic hooks; production debugging is harder.
- `TOKEN_STORAGE_KEY` and `REFRESH_TOKEN_STORAGE_KEY` are file-private, preventing consistent reuse from other modules.
**Suggested fixes (small + safe):**
- Export storage key constants from one source-of-truth file and import everywhere.
- Extract token provider into thin module (e.g. `services/api/tokenProvider.ts`) to remove store import from `api.ts`.
- Add optional debug logging interceptor (guarded by `__DEV__`).

### File: `mobile_finalised/src/services/api/client.ts`
**Objective:** Legacy/alternate axios client with SecureStore token injection and token helpers.  
**Reason:** Likely older API layer kept during migration.  
**Depends on:** `axios`, `expo-secure-store`.  
**Used by:** No active imports in current app flow.  
**API touchpoints:** Generic; no fixed endpoints in-file.  
**Bugs / risks:**
- Duplicate axios client architecture.
- Uses `http://localhost:7179` default, which is incorrect on physical mobile devices.
- Uses storage key `token` (lowercase) vs active `Token`/`RefreshToken` keys.
**Suggested fixes (small + safe):**
- Mark deprecated and remove imports if any appear.
- If retention is required temporarily, point it to shared config + shared keys.

### File: `mobile_finalised/src/services/api/authApi.ts`
**Objective:** Auth endpoint wrappers used primarily by forgot-password screen and potentially other auth paths.  
**Reason:** Keep endpoint definitions separated by domain.  
**Depends on:** `apiClient` from `./api`, DTO types from `./types`.  
**Used by:** `screens/Auth/ForgotScreen.tsx` (request reset).  
**API touchpoints:** `/api/auth/login`, `/api/auth/register`, `/api/auth/refresh`, `/api/auth/request-password-reset`, `/api/auth/reset-password`.  
**Bugs / risks:**
- `apiClient` baseURL already ends with `/api`; using URL paths starting `/api/...` likely resolves to `/api/api/...` (assumption based on Axios URL join behavior), causing 404s.
- Forgot/reset endpoints are not implemented in backend controller.
- Duplicates auth wrappers already present in `api.ts` (`authApi` object).
**Suggested fixes (small + safe):**
- Remove leading `/api` from all paths in this file (`/auth/...`).
- Keep one auth API module only.
- Disable or guard forgot/reset UI until backend endpoints exist.

### File: `mobile_finalised/src/services/api/usersApi.ts`
**Objective:** User profile fetch and profile/avatar update API wrappers.  
**Reason:** User domain API abstraction used by auth store profile flows.  
**Depends on:** `apiClient`, types, RN `FormData`.  
**Used by:** `store/auth.ts`.  
**API touchpoints:** `GET /users/{id}`, `PATCH /users/edit-profile` (multipart).  
**Bugs / risks:**
- `EditProfilePayload` frontend casing is camelCase and remapped manually; acceptable but should be centralized via mappers/types.
- No explicit max-file-size/type validation before avatar upload.
**Suggested fixes (small + safe):**
- Keep backend payload mapping in dedicated mapper file only (already partially done).
- Add pre-flight image validation and typed backend response envelope.

### File: `mobile_finalised/src/services/api/sessionApi.ts`
**Objective:** Check-in/check-out/history calls.  
**Reason:** Session domain network wrappers.  
**Depends on:** `apiClient`, session DTO types.  
**Used by:** `CheckInScreen`, `SessionScreen`, `StatsScreen`.  
**API touchpoints:** `/api/gymsession/check-in`, `/api/gymsession/check-out`, `/api/gymsession/my-history`.  
**Bugs / risks:**
- Same duplicated `/api` prefix risk (base already has `/api`) → potential `/api/api/gymsession/...` requests.
- `checkIn` payload field `gymBranchID` differs in case from backend `GymBranchID`; binder is usually case-insensitive, but consistency is weak.
**Suggested fixes (small + safe):**
- Change paths to `/gymsession/...`.
- Define a `CheckInRequestDto` in `types.ts` with backend-compatible field names and map from UI model.

### File: `mobile_finalised/src/services/api/gymsApi.ts`
**Objective:** Fetch all gyms.  
**Reason:** Gyms list data source for home/location/stats linking.  
**Depends on:** `apiClient`, gym DTO types.  
**Used by:** `store/gyms.ts`.  
**API touchpoints:** `/api/gyms`.  
**Bugs / risks:**
- `/api` duplication risk.
**Suggested fixes (small + safe):**
- Switch path to `/gyms`.

### File: `mobile_finalised/src/services/api/membershipApi.ts`
**Objective:** Fetch current user memberships for stats/linking.  
**Reason:** Membership domain data access.  
**Depends on:** `apiClient`, membership DTO types.  
**Used by:** `StatsScreen.tsx`.  
**API touchpoints:** `/api/membership/my-memberships`.  
**Bugs / risks:**
- `/api` duplication risk.
**Suggested fixes (small + safe):**
- Switch path to `/membership/my-memberships`.

### File: `mobile_finalised/src/services/api/types.ts`
**Objective:** Frontend DTO contracts for requests/responses and errors.  
**Reason:** Shared typing across API/services/store.  
**Depends on:** none.  
**Used by:** most API modules and store/auth.  
**API touchpoints:** Defines payload/response shapes for auth/user/gym/session/membership.
**Bugs / risks:**
- Mixed casing strategy across DTOs (`LoginRequestDto` PascalCase vs many response DTOs camelCase).
- `TokenExchangeRequestDto` name semantically represents response too; naming ambiguity.
**Suggested fixes (small + safe):**
- Split into `AuthDtos`, `UserDtos`, etc. and define separate `TokenExchangeResponseDto`.

### File: `mobile_finalised/src/services/api/mappers.ts`
**Objective:** Map backend DTOs into app models and computed stats.
**Reason:** Prevent backend schema leaking into UI components.
**Depends on:** app model types, backend DTO types.
**Used by:** `store/auth.ts`, `store/gyms.ts`, `StatsScreen.tsx`.
**API touchpoints:** none directly.
**Bugs / risks:**
- Contains synthetic values for gym fields not supplied by backend (distance/rating/reviews etc.), which can mask missing real data.
- `mapUserPatchToBackendPayload` requires `name` and always maps to `fullName`, which may force full-name updates when not intended.
**Suggested fixes (small + safe):**
- Separate "mock fallback enrichments" from real backend mappers.
- Allow partial patch mapping with optional `name`.

### File: `mobile_finalised/src/store/auth.ts`
**Objective:** Zustand auth state and actions (init/login/register/logout/profile updates/token persistence).  
**Reason:** Central auth/session state and side effects.  
**Depends on:** `services/api/api.ts`, `usersApi.ts`, mappers, error parser, SecureStore.  
**Used by:** auth screens, profile screens, root navigator, API interceptor dynamic import path.  
**API touchpoints:** login/register via `authApi` wrappers from `api.ts`; user fetch/edit/avatar via `usersApi.ts`.  
**Bugs / risks:**
- Participates in circular dependency with API client.
- Stores `userId` separately in SecureStore and trusts it on init; if stale, user fetch can fail silently.
- On login user-fetch failure, sets `user` to `{ email } as any`, weakening type safety.
**Suggested fixes (small + safe):**
- Derive `userId` from token when possible (fallback to response UserID), and validate consistency.
- Replace `as any` fallback with typed minimal `User` placeholder.
- Move fetch-user side effect into dedicated `hydrateUser()` action with explicit error state.

### File: `mobile_finalised/src/store/gyms.ts`
**Objective:** Zustand store for gym catalog/search/selection.  
**Reason:** Shared gym data cache across multiple screens.  
**Depends on:** `gymsApi`, `mappers`, `mockGyms` normalizer.  
**Used by:** Home, Location, GymProfile, Session, Stats screens.  
**API touchpoints:** `getAllGymsApi()` via service layer.
**Bugs / risks:**
- Errors in `fetchGyms` are swallowed; no user-visible reason.
**Suggested fixes (small + safe):**
- Add `error` field and last fetch timestamp.

### File: `mobile_finalised/src/screens/Stats/StatsScreen.tsx`
**Objective:** Show user analytics, attendance, and linked gym card.  
**Reason:** Dashboard UX using session and membership data.  
**Depends on:** `useAuth`, `useGyms`, `sessionApi`, `membershipApi`, mappers, mock fallbacks.  
**Used by:** tab navigation (`StatsTab`).  
**API touchpoints:** calls `getMyHistoryApi()` and `getMyMembershipsApi()` directly in screen effect.
**Bugs / risks:**
- API calls are made directly in UI (bypassing store/service orchestration pattern).
- Silent catch hides operational issues.
**Suggested fixes (small + safe):**
- Move history/membership fetching into `store/stats.ts` (or existing store).
- Preserve fallback UI but store/display non-blocking error banner in dev.

### File: `mobile_finalised/src/screens/CheckIn/CheckInScreen.tsx`
**Objective:** Start a gym session from check-in UI.  
**Reason:** Entry point to active workout/session flow.  
**Depends on:** session slice store + `checkInApi` directly.  
**Used by:** Home navigation to CheckIn route.
**API touchpoints:** `checkInApi` call.
**Bugs / risks:**
- On API failure, local session still starts intentionally; can create backend/frontend state divergence.
- Direct API call in screen.
**Suggested fixes (small + safe):**
- Route check-in through a session store action returning status (`remote_ok`, `local_only`).

### File: `mobile_finalised/src/screens/ActiveSession/SessionScreen.tsx`
**Objective:** Show active session timer and check-out controls.  
**Reason:** Session lifecycle UI.  
**Depends on:** session store, gyms store, `checkOutApi` directly.  
**Used by:** `HomeStack` session route.  
**API touchpoints:** `checkOutApi` on end session.
**Bugs / risks:**
- Direct API call in UI and silent catch may hide backend check-out failures.
**Suggested fixes (small + safe):**
- Move check-out side effect into session store with explicit sync state.

### File: `mobile_finalised/src/screens/Auth/ForgotScreen.tsx`
**Objective:** Submit password reset email request.  
**Reason:** Auth recovery UX.  
**Depends on:** `requestResetApi`, error parser.
**Used by:** `AuthNavigator`.  
**API touchpoints:** `/auth/request-password-reset` wrapper (currently defined as `/api/auth/...` in `authApi.ts`).
**Bugs / risks:**
- Backend endpoint not implemented; guaranteed failure unless backend adds it.
- Path prefix likely wrong due `/api` duplication.
**Suggested fixes (small + safe):**
- Feature-flag/hide screen until endpoint exists, or show explicit "not available" message.

### File: `mobile_finalised/src/navigation/RootNavigator.tsx`
**Objective:** Bootstrap app and route between onboarding/auth/main flows.  
**Reason:** Central navigation gate based on hydrated auth/UI/session state.  
**Depends on:** auth store, UI store, announcement/session slices.
**Used by:** app root.  
**API touchpoints:** indirect (via `useAuth.init`).
**Bugs / risks:**
- `Promise.all` startup means one rejected hydration can delay readiness unless internally caught.
**Suggested fixes (small + safe):**
- Use `Promise.allSettled` and log failed hydrations while still booting app.

### File: `mobile_finalised/src/services/api/API_CONTRACT.md`
**Objective:** Documents expected frontend↔backend API contract and known gaps.  
**Reason:** Team alignment/reference.
**Depends on:** manual maintenance.
**Used by:** developers only.
**API touchpoints:** lists auth/users/dashboard routes and forgot-password gap.
**Bugs / risks:**
- Already indicates gaps, but code has drift (e.g., duplicate auth module + prefix behavior).
**Suggested fixes (small + safe):**
- Add note: if base URL includes `/api`, endpoint paths must omit `/api`.

### File: `Backend/Controllers/AuthController.cs`
**Objective:** Backend auth endpoints login/register/refresh.  
**Reason:** token issuance + account creation + token rotation entrypoint.
**Depends on:** `IUserService`, DTOs.
**Used by:** mobile auth calls.
**API touchpoints:** `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/refresh`.
**Bugs / risks:**
- No forgot/reset password endpoints present.
**Suggested fixes (small + safe):**
- Add missing endpoints or remove mobile feature until available.

### File: `Backend/Controllers/UserController.cs` (`UsersController`)
**Objective:** Backend user management and profile edit endpoints.
**Reason:** profile retrieval + update.
**Depends on:** `IUserService`, auth claims.
**Used by:** mobile user/profile flows.
**API touchpoints:** `GET /api/users/{id}`, `PATCH /api/users/edit-profile`, etc.
**Bugs / risks:**
- File name `UserController.cs` vs class `UsersController` can confuse discoverability only.
**Suggested fixes (small + safe):**
- Rename file to `UsersController.cs` for consistency.

### File: `Backend/Program.cs`
**Objective:** App setup (Kestrel URL, JSON policy, JWT auth, DI, controllers).
**Reason:** runtime composition root.
**Depends on:** ASP.NET host/services.
**Used by:** entire backend runtime.
**API touchpoints:** indirect.
**Bugs / risks:**
- Global camelCase JSON policy while some DTOs explicitly force PascalCase (`TokenExchangeRequestDto`), so casing behavior is mixed by design.
**Suggested fixes (small + safe):**
- Document casing exceptions in API contract; keep consistency per DTO intent.

---

## API integration validation (requested checks)

### 1) Base URL handling (device vs localhost)
- **Partially correct in active path:** `api.ts` default is LAN IP (`http://192.168.0.108:7179`) and warns not to use localhost on device.
- **Incorrect in duplicate path:** `client.ts` still defaults to `http://localhost:7179`.
- **Conclusion:** base URL strategy is inconsistent because of duplicate clients.

### 2) Endpoints and `/api` prefix behavior
- Backend routes are under `/api/...` (e.g., `/api/auth/*`, `/api/users/*`, `/api/gyms`, `/api/gymsession/*`, `/api/membership/*`).
- `api.ts` normalizes base URL to include `/api`.
- Several API modules still call endpoints prefixed with `/api/...`; this likely yields `/api/api/...` and route mismatch.
- Calls using `/auth/...` and `/users/...` with this baseURL are correct.

### 3) DTO payload casing
- Login/Register from auth store use PascalCase payload fields (`Email`, `Password`, `FullName`, etc.) matching backend DTO property names.
- Refresh payload also uses `Token` and `RefreshToken` matching backend.
- Check-in payload currently uses `gymBranchID` (camel start, uppercase suffix) while backend uses `GymBranchID`; likely bound due case-insensitive model binding, but not stylistically aligned.
- Response DTO casing is mixed (backend default camelCase + explicit PascalCase on token DTO). Frontend types currently mirror this mixed model.

### 4) Token + refresh flow consistency
- Core refresh flow in `api.ts` is implemented correctly at high level: attach token → on 401 use refresh token → update store/tokens → retry original request.
- Single-flight refresh (`refreshPromise`) avoids refresh storm.
- Inconsistency risk comes from duplicate/unused client (`client.ts`) and a separate `authApi.ts` module with route prefix issues.

---

## Architectural problems found (explicit checklist)

- **Duplicated axios clients:** Yes (`services/api/api.ts` and `services/api/client.ts`).
- **Circular imports (auth store ↔ api client):** Logical cycle exists (`store/auth.ts` imports from `api.ts`; `api.ts` imports `store/auth` dynamically in interceptors).
- **Inconsistent token storage keys:** Yes (`Token`/`RefreshToken` in `api.ts` vs `token` in `client.ts`; plus separate `UserID` key in store).
- **Missing error handling / response logging:** Common silent catches in stores/screens and no shared response logging interceptors.
- **Screens calling APIs directly instead of service/store layer:** Yes (`StatsScreen`, `CheckInScreen`, `SessionScreen`, `ForgotScreen`).

---

## Recommended target structure (without full rewrite)

```text
src/
  services/
    api/
      client.ts              # single axios client + interceptors only
      auth.service.ts        # login/register/refresh/logout calls
      users.service.ts       # profile calls
      gyms.service.ts
      sessions.service.ts
      memberships.service.ts
      endpoints.ts           # route constants (no duplicated '/api')
      tokenStorage.ts        # SecureStore keys + get/set/clear
      errors.ts              # extract + normalize API errors
  store/
    auth.store.ts
    gyms.store.ts
    stats.store.ts           # move StatsScreen direct API calls here
    session.store.ts         # wrap check-in/check-out remote sync
  types/
    auth.dto.ts
    user.dto.ts
    gym.dto.ts
    session.dto.ts
    membership.dto.ts
    models.ts                # app-level UI models
  mappers/
    auth.mapper.ts
    user.mapper.ts
    gym.mapper.ts
    stats.mapper.ts
  screens/
    ...                      # UI + dispatch store actions only
```

Migration approach (safe, incremental):
1. Freeze on **one** axios client.
2. Normalize all endpoint paths to be relative to base (`/auth/...`, `/users/...`).
3. Move screen-level API calls into small store actions one screen at a time.
4. Add non-breaking debug logs and structured error state.

---

## C) Priority fixes list (Top 10)

### Must-fix (breaks auth/navigation/API)
1. **Fix endpoint prefixing** in `authApi.ts`, `sessionApi.ts`, `gymsApi.ts`, `membershipApi.ts` to remove duplicated `/api` segment risk.
2. **Unify axios client** (deprecate/remove `client.ts`) to prevent localhost/device and token key divergence.
3. **Disable/guard forgot-password flow** until backend adds endpoints, or backend adds `request-password-reset` and `reset-password`.
4. **Centralize token keys** in one exported module and consume everywhere.

### Should-fix (stability)
5. Break the logical **auth-store ↔ api-client cycle** via token provider abstraction.
6. Move direct API calls from `StatsScreen`, `CheckInScreen`, `SessionScreen` into stores/actions.
7. Add standardized API error state instead of silent catches.
8. Add optional request/response debug logging in dev builds.

### Nice-to-have (cleanliness)
9. Split DTO/type files by domain and clarify response-vs-request names.
10. Separate real backend mappers from synthetic/mock enrichment logic.

---

## D) Consistency checklist

- [ ] **Token storage keys match everywhere:** **No** (mismatch exists across `api.ts` and `client.ts`).
- [x] **Refresh endpoint matches backend:** **Yes in active client path** (`/auth/refresh` + base `/api` => `/api/auth/refresh`).
- [ ] **Request payload casing matches backend DTOs:** **Mostly yes**, but check-in payload casing is inconsistent and should be aligned.
- [ ] **User ID source is consistent (token claim vs returned UserID):** **No**, current flow persists `UserID` from response/store; token claim parsing utility exists but is not used in auth store.
- [x] **All protected calls include Authorization header:** **Yes for calls using `apiClient` from `api.ts`** due request interceptor; this assumes all protected calls continue using that client.

---

## Cautious assumptions flagged
- Axios URL composition with `baseURL` ending in `/api` and request URLs starting `/api/...` is assumed to produce `/api/api/...`; this should be quickly confirmed with a one-line runtime check in the app environment.
- ASP.NET Core model binding is assumed case-insensitive for JSON/form keys, so some casing mismatches may still work while remaining brittle/inconsistent.
