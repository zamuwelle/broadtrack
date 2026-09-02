# API Endpoints Reference

All BroadTrack API endpoints are versioned under `/api/v1` and return standardized JSON resources.

---

## Authentication Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/register` | Public | Register a new user (state-aware for unverified users). |
| `POST` | `/api/v1/login` | Public | Login with email & password; returns Sanctum bearer token. |
| `POST` | `/api/v1/logout` | Authenticated | Revoke current user's bearer token. |
| `GET` | `/api/v1/me` | Authenticated | Fetch authenticated user profile and permissions. |
| `GET` | `/api/v1/auth/google/redirect` | Public | Redirect to Google OAuth consent screen. |
| `GET` | `/api/v1/auth/google/callback` | Public | Handle Google OAuth callback with domain restriction. |
| `GET` | `/api/v1/verify-email` | Public | Verify user account with token. |
| `POST` | `/api/v1/resend-verification` | Public | Resend email verification link. |

---

## Equipment Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/equipment` | Public / Borrower | List available equipment catalog with search and category filters. |
| `GET` | `/api/v1/equipment/{equipment}` | Public / Borrower | View single equipment details and availability dates. |
| `POST` | `/api/v1/equipment` | Admin | Create a new equipment item (with image upload). |
| `PUT` | `/api/v1/equipment/{equipment}` | Admin | Update equipment details, category, or status. |
| `DELETE` | `/api/v1/equipment/{equipment}` | Admin | Delete or retire an equipment item. |

---

## Booking Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/bookings` | Borrower / Admin | List bookings (Borrower sees own; Admin sees all). |
| `POST` | `/api/v1/bookings` | Borrower | Submit a new multi-item booking cart request. |
| `GET` | `/api/v1/bookings/{booking}` | Borrower / Admin | View booking slip, barcode, and equipment list. |
| `PUT` | `/api/v1/bookings/{booking}/status` | Admin | Approve, reject, or release a booking. |
| `POST` | `/api/v1/bookings/{booking}/return` | Admin | Confirm physical equipment return and inspect items. |
| `DELETE` | `/api/v1/bookings/{booking}` | Borrower / Admin | Cancel a pending booking. |

---

## User Management (Admin Only)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/users` | Admin | Paginated list of users with role and department filters. |
| `POST` | `/api/v1/users` | Admin | Manually create a user account. |
| `PUT` | `/api/v1/users/{user}` | Admin | Update user details, department, or role. |
| `DELETE` | `/api/v1/users/{user}` | Admin | Remove a user account. |
