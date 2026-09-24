# API Endpoints Reference

The Laravel routes are defined in [`backend/routes/api.php`](../../backend/routes/api.php) under `/api/v1`. Protected routes use Sanctum authentication. The `admin` role middleware allows administrators and system administrators; user-management routes require `sysadmin`.

## Authentication and account

| Method | Endpoint                      | Access        | Purpose                                  |
| ------ | ----------------------------- | ------------- | ---------------------------------------- |
| `POST` | `/api/v1/register`            | Public        | Register an account.                     |
| `POST` | `/api/v1/login`               | Public        | Sign in and receive a token.             |
| `POST` | `/api/v1/forgot-password`     | Public        | Request a password reset email.          |
| `POST` | `/api/v1/reset-password`      | Public        | Reset a password.                        |
| `POST` | `/api/v1/resend-verification` | Public        | Request another email verification code. |
| `POST` | `/api/v1/verify-email`        | Public        | Verify an email address.                 |
| `POST` | `/api/v1/logout`              | Authenticated | Revoke the current token.                |
| `GET`  | `/api/v1/me`                  | Authenticated | Read the current user's profile.         |
| `POST` | `/api/v1/contact`             | Public        | Submit a contact inquiry.                |

There are no Google OAuth routes in the current API route file. Public registration, login, password reset, verification resend, and contact routes are throttled; `/verify-email` allows 10 requests per minute, while the other listed public routes allow 5.

## Equipment

| Method   | Endpoint                               | Access           | Purpose                                                               |
| -------- | -------------------------------------- | ---------------- | --------------------------------------------------------------------- |
| `GET`    | `/api/v1/equipment`                    | Authenticated    | List equipment.                                                       |
| `GET`    | `/api/v1/equipment/{equipment}`        | Authenticated    | Read a single equipment record with its computed availability status. |
| `POST`   | `/api/v1/equipment`                    | Admin / Sysadmin | Create equipment.                                                     |
| `PUT`    | `/api/v1/equipment/{equipment}`        | Admin / Sysadmin | Update equipment.                                                     |
| `POST`   | `/api/v1/equipment/{equipment}/upload` | Admin / Sysadmin | Upload an equipment image.                                            |
| `DELETE` | `/api/v1/equipment/{equipment}`        | Admin / Sysadmin | Delete equipment when allowed by its booking history.                 |

## Bookings

`GET /api/v1/bookings` accepts the optional query parameter `view=calendar`. The request is authenticated and validated by [`IndexBookingRequest`](../../backend/app/Http/Requests/Api/V1/IndexBookingRequest.php); other `view` values return a validation error (422). Without the parameter, a borrower receives their own bookings, including all statuses. With `view=calendar`, a borrower receives approved and pending reservations across users. Admins receive all bookings in either view. The server applies this scope; the parameter does not grant access. The calendar response still includes booking IDs, ticket IDs, equipment, and dates. The resource hides personal details for bookings the current user does not own.

`POST /api/v1/bookings` accepts one or more `equipment_ids` and creates a separate booking for each selected equipment item. Report exports accept `category` (`All`, `Active`, `Completed`, `Overdue`, or `Cancelled`) and `search` query parameters; `search` matches ticket ID, purpose, borrower name or email, and equipment name or serial number. `Cancelled` includes rejected bookings, and the default report category omits pending bookings.

The calendar, schedule notice, and booking summary use this same `view=calendar` query, represented as a distinct TanStack Query key from the default booking list. Booking broadcasts invalidate booking and equipment queries; equipment broadcasts invalidate equipment queries. See [`useEvents`](../../frontend/web/src/hooks/queries/useEvents.js).

| Method | Endpoint                             | Access                        | Purpose                                                         |
| ------ | ------------------------------------ | ----------------------------- | --------------------------------------------------------------- |
| `GET`  | `/api/v1/bookings`                   | Authenticated                 | List bookings; see the view behavior above.                     |
| `POST` | `/api/v1/bookings`                   | Borrower                      | Create one booking per requested equipment item.                |
| `GET`  | `/api/v1/bookings/{booking}`         | Authenticated, policy checked | Read a booking the user may view.                               |
| `GET`  | `/api/v1/bookings/{booking}/slip`    | Authenticated, policy checked | Download a booking slip PDF stream (also supports `/slip/pdf`). |
| `GET`  | `/api/v1/bookings/reports/pdf`       | Admin / Sysadmin              | Export a booking report as PDF.                                 |
| `GET`  | `/api/v1/bookings/reports/csv`       | Admin / Sysadmin              | Export a booking report as CSV.                                 |
| `PUT`  | `/api/v1/bookings/{booking}/approve` | Admin / Sysadmin              | Approve a pending booking.                                      |
| `PUT`  | `/api/v1/bookings/{booking}/reject`  | Admin / Sysadmin              | Reject a pending booking.                                       |
| `PUT`  | `/api/v1/bookings/{booking}/return`  | Admin / Sysadmin              | Mark a booking returned.                                        |
| `PUT`  | `/api/v1/bookings/{booking}/cancel`  | Authenticated, policy checked | Cancel a booking when allowed.                                  |
| `PUT`  | `/api/v1/bookings/{booking}/read`    | Borrower                      | Mark a booking notification as read.                            |
| `POST` | `/api/v1/bookings/{booking}/remind`  | Admin / Sysadmin              | Queue a manual return reminder for an approved booking.         |

There is no release endpoint in the current route file. Booking responses include formatted Manila date labels and raw date fields; date storage and serialization details are described in the [borrowing lifecycle](../workflows/borrowing-lifecycle.md).

## Users

| Method   | Endpoint               | Access   | Purpose                     |
| -------- | ---------------------- | -------- | --------------------------- |
| `GET`    | `/api/v1/users`        | Sysadmin | List non-sysadmin users.    |
| `GET`    | `/api/v1/users/{user}` | Sysadmin | Read a single user account. |
| `POST`   | `/api/v1/users`        | Sysadmin | Create a user account.      |
| `PUT`    | `/api/v1/users/{user}` | Sysadmin | Update a user account.      |
| `DELETE` | `/api/v1/users/{user}` | Sysadmin | Delete a user when allowed. |

## Responses and failures

The [`ApiController`](../../backend/app/Http/Controllers/Api/ApiController.php) helpers provide success responses with `message` and `status`, and optional `data`; error helpers provide `message` and optional `errors`. Some routes return downloads or no content, and framework-generated errors may use Laravel's JSON exception format instead of these helpers. Queued mail responses mean the mail was enqueued, not delivered. If a manual reminder or configured contact message cannot be queued, the failure is logged and the endpoint returns HTTP 500. A password-reset mail queue failure is logged, but the forgot-password handler still returns its success response for a known email.
