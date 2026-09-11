# API Endpoints Reference

All BroadTrack API endpoints are versioned under `/api/v1` and return standardized JSON resources.

---

## Authentication & Account Endpoints

| Method | Endpoint                       | Access        | Rate Limit | Description                                                             |
| ------ | ------------------------------ | ------------- | ---------- | ----------------------------------------------------------------------- |
| `POST` | `/api/v1/register`             | Public        | 5/min      | Register a new user account with school email.                          |
| `POST` | `/api/v1/login`                | Public        | 5/min      | Login with email and password; returns Sanctum bearer token.            |
| `POST` | `/api/v1/forgot-password`      | Public        | 5/min      | Send password reset token email.                                        |
| `POST` | `/api/v1/reset-password`       | Public        | 5/min      | Reset password and revoke all existing Sanctum sessions.                |
| `POST` | `/api/v1/verify-email`         | Public        | 10/min     | Verify user email address with 6-digit OTP verification code.           |
| `POST` | `/api/v1/resend-verification`  | Public        | 5/min      | Resend 6-digit OTP verification code to unverified user (60s cooldown). |
| `GET`  | `/api/v1/auth/google/redirect` | Public        | 60/min     | Redirect to Google OAuth consent screen.                                |
| `GET`  | `/api/v1/auth/google/callback` | Public        | 60/min     | Handle Google OAuth callback with domain restriction.                   |
| `POST` | `/api/v1/logout`               | Authenticated | 60/min     | Revoke current user bearer token.                                       |

---

## Profile & Contact Endpoints

| Method | Endpoint          | Access        | Rate Limit | Description                                       |
| ------ | ----------------- | ------------- | ---------- | ------------------------------------------------- |
| `GET`  | `/api/v1/me`      | Authenticated | 60/min     | Fetch authenticated user profile and permissions. |
| `POST` | `/api/v1/contact` | Public        | 5/min      | Send contact inquiry email to administrators.     |

---

## Equipment Endpoints

| Method   | Endpoint                               | Access           | Rate Limit | Description                                                |
| -------- | -------------------------------------- | ---------------- | ---------- | ---------------------------------------------------------- |
| `GET`    | `/api/v1/equipment`                    | Authenticated    | 60/min     | List all equipment items with category, status, and specs. |
| `POST`   | `/api/v1/equipment`                    | Admin / Sysadmin | 60/min     | Create a new equipment item with generated serial number.  |
| `PUT`    | `/api/v1/equipment/{equipment}`        | Admin / Sysadmin | 60/min     | Update equipment details, category, or status.             |
| `POST`   | `/api/v1/equipment/{equipment}/upload` | Admin / Sysadmin | 60/min     | Upload or update equipment photo on Cloudinary.            |
| `DELETE` | `/api/v1/equipment/{equipment}`        | Admin / Sysadmin | 60/min     | Delete equipment item (blocked if tied to bookings).       |

---

## Booking Endpoints

Booking responses include Manila-formatted `date_range_label` and `date_time_range_label` fields alongside the raw ISO date values in `start_date`, `end_date`, and `return_date`.

| Method | Endpoint                              | Access           | Rate Limit | Description                                                                 |
| ------ | ------------------------------------- | ---------------- | ---------- | --------------------------------------------------------------------------- |
| `GET`  | `/api/v1/bookings`                    | Authenticated    | 60/min     | List bookings (borrower sees own; admin sees all).                          |
| `POST` | `/api/v1/bookings`                    | Borrower         | 60/min     | Submit new booking cart request with date validation.                       |
| `GET`  | `/api/v1/bookings/{booking}`          | Borrower / Admin | 60/min     | View single booking details, items, and return notes.                       |
| `GET`  | `/api/v1/bookings/{booking}/slip/pdf` | Borrower / Admin | 60/min     | Export official A4 portrait borrowing slip PDF with barcode manifest.       |
| `GET`  | `/api/v1/bookings/reports/pdf`        | Admin / Sysadmin | 60/min     | Export filtered transaction history as A4 landscape PDF report.             |
| `GET`  | `/api/v1/bookings/reports/csv`        | Admin / Sysadmin | 60/min     | Export filtered transaction history as UTF-8 BOM CSV spreadsheet.           |
| `PUT`  | `/api/v1/bookings/{booking}/approve`  | Admin / Sysadmin | 60/min     | Approve pending booking request (blocked if reservation period has passed). |
| `PUT`  | `/api/v1/bookings/{booking}/reject`   | Admin / Sysadmin | 60/min     | Reject pending booking request with rejection reason.                       |
| `PUT`  | `/api/v1/bookings/{booking}/release`  | Admin / Sysadmin | 60/min     | Mark approved booking equipment as released to borrower.                    |
| `PUT`  | `/api/v1/bookings/{booking}/return`   | Admin / Sysadmin | 60/min     | Mark released booking equipment as returned.                                |
| `PUT`  | `/api/v1/bookings/{booking}/cancel`   | Borrower / Admin | 60/min     | Cancel pending or approved booking request before physical release.         |
| `PUT`  | `/api/v1/bookings/{booking}/read`     | Borrower         | 60/min     | Mark booking notification status as read.                                   |
| `POST` | `/api/v1/bookings/{booking}/remind`   | Admin / Sysadmin | 60/min     | Send manual return reminder email for released booking.                     |

---

## User Management Endpoints

| Method   | Endpoint               | Access   | Rate Limit | Description                                        |
| -------- | ---------------------- | -------- | ---------- | -------------------------------------------------- |
| `GET`    | `/api/v1/users`        | Sysadmin | 60/min     | List all users excluding other sysadmin accounts.  |
| `POST`   | `/api/v1/users`        | Sysadmin | 60/min     | Manually create pre-verified user account.         |
| `PUT`    | `/api/v1/users/{user}` | Sysadmin | 60/min     | Update user account, role, or department.          |
| `DELETE` | `/api/v1/users/{user}` | Sysadmin | 60/min     | Delete user account (blocked if tied to bookings). |
