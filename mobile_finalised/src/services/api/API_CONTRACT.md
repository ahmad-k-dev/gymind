# Backend API Contract Map

## Auth
- `POST /api/auth/login`
  - Request: `LoginRequestDto` (`Email`, `Password`)
  - Response: `TokenExchangeRequestDto` (`Token`, `RefreshToken`, `Roles`, `UserID`)
- `POST /api/auth/register`
  - Request: `CreateUserDto` (`FullName`, `Email`, `Phone`, `Password`, `Gender`, `Location`, `DateOfBirth`)
  - Response: `GetUserDto`
- `POST /api/auth/refresh`
  - Request: `TokenExchangeRequestDto` (`Token`, `RefreshToken` required)
  - Response: `TokenExchangeRequestDto`

## Users
- `GET /api/users/{id}`
  - Response: `GetUserDto`
- `PATCH /api/users/edit-profile` (multipart/form-data)
  - Request: `EditProfileDto` (`FullName`, `Biography`, `ImageFile`, `MedicalConditions`, `EmergencyContact`)
  - Response: `string` (success message)

## Dashboard/Stats
- `GET /api/gyms`
  - Response: `GymDto[]`
- `GET /api/gymsession/my-history`
  - Response: `GymSessionHistoryDto[]`
- `GET /api/membership/my-memberships`
  - Response: `MembershipSummaryDto[]`

## Contract Gaps
- `ForgotPasswordScreen` requires request/reset password endpoints (`/api/auth/request-password-reset`, `/api/auth/reset-password`) that are not currently implemented in backend controllers.
