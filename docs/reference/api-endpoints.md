# API endpoints reference

Backend routes are defined in [`backend/routes/api.php`](../../backend/routes/api.php) under `/api/v1`. Protected routes use Sanctum bearer authentication. The `admin` role middleware allows administrators and system administrators; user management requires `sysadmin`.

## Authentication and account

| Method | Endpoint                      | Access        | Purpose                                           |
| :----- | :---------------------------- | :------------ | :------------------------------------------------ |
| `POST` | `/api/v1/register`            | Public        | Register an account.                              |
| `POST` | `/api/v1/login`               | Public        | Sign in and receive a Sanctum token.              |
| `POST` | `/api/v1/forgot-password`     | Public        | Request a password reset email.                   |
| `POST` | `/api/v1/check-reset-token`   | Public        | Verify reset token validity without consuming it. |
| `POST` | `/api/v1/reset-password`      | Public        | Reset password using verified token.              |
| `POST` | `/api/v1/resend-verification` | Public        | Resend email verification code.                   |
| `POST` | `/api/v1/verify-email`        | Public        | Verify email address with 6-digit code.           |
| `POST` | `/api/v1/logout`              | Authenticated | Revoke current access token.                      |
| `GET`  | `/api/v1/me`                  | Authenticated | Retrieve authenticated user profile.              |
| `PUT`  | `/api/v1/profile`             | Authenticated | Update user name or department.                   |
| `POST` | `/api/v1/contact`             | Public        | Submit contact inquiry.                           |

Google OAuth routes are in [`backend/routes/web.php`](../../backend/routes/web.php):

- `GET /api/v1/auth/google/redirect`: Redirect to Google consent screen.
- `GET /api/v1/auth/google/callback`: Handle provider response and issue auth token.

### Rate limiting

- `/verify-email`: 10 requests per minute.
- `/register`, `/login`, `/forgot-password`, `/check-reset-token`, `/reset-password`, `/resend-verification`, `/contact`: 5 requests per minute.

## Equipment

| Method   | Endpoint                               | Access           | Purpose                                                  |
| :------- | :------------------------------------- | :--------------- | :------------------------------------------------------- |
| `GET`    | `/api/v1/equipment`                    | Authenticated    | List equipment catalog.                                  |
| `GET`    | `/api/v1/equipment/{equipment}`        | Authenticated    | Get equipment details with resolved availability status. |
| `POST`   | `/api/v1/equipment`                    | Admin / Sysadmin | Create equipment item.                                   |
| `PUT`    | `/api/v1/equipment/{equipment}`        | Admin / Sysadmin | Update equipment item.                                   |
| `POST`   | `/api/v1/equipment/{equipment}/upload` | Admin / Sysadmin | Upload equipment image to Cloudinary.                    |
| `DELETE` | `/api/v1/equipment/{equipment}`        | Admin / Sysadmin | Delete equipment (blocked if booking records exist).     |

## Bookings

`GET /api/v1/bookings` accepts an optional `view=calendar` query parameter validated by [`IndexBookingRequest`](../../backend/app/Http/Requests/Api/V1/IndexBookingRequest.php). Other values return HTTP 422.

- Default: Borrowers receive only their own bookings; admins receive all bookings.
- `view=calendar`: Borrowers receive approved and pending reservations across all users (with third-party personal details hidden). Admins receive all bookings.

`POST /api/v1/bookings` accepts one or more `equipment_ids` and creates one booking record per item inside a transaction.

Report exports accept `category` (`All`, `Active`, `Completed`, `Overdue`, `Cancelled`) and `search` query parameters.

| Method | Endpoint                             | Access                        | Purpose                                              |
| :----- | :----------------------------------- | :---------------------------- | :--------------------------------------------------- |
| `GET`  | `/api/v1/bookings`                   | Authenticated                 | List bookings (supports `view=calendar`).            |
| `POST` | `/api/v1/bookings`                   | Borrower                      | Create bookings for requested equipment IDs.         |
| `GET`  | `/api/v1/bookings/{booking}`         | Authenticated, policy checked | View booking details.                                |
| `GET`  | `/api/v1/bookings/{booking}/slip`    | Authenticated, policy checked | Download booking slip PDF stream (also `/slip/pdf`). |
| `GET`  | `/api/v1/bookings/reports/pdf`       | Admin / Sysadmin              | Export booking report PDF.                           |
| `GET`  | `/api/v1/bookings/reports/xlsx`       | Admin / Sysadmin              | Export booking report as Excel.                           |
| `PUT`  | `/api/v1/bookings/{booking}/approve` | Admin / Sysadmin              | Approve pending booking.                             |
| `PUT`  | `/api/v1/bookings/{booking}/reject`  | Admin / Sysadmin              | Reject pending or approved booking.                  |
| `PUT`  | `/api/v1/bookings/{booking}/return`  | Admin / Sysadmin              | Mark booking returned.                               |
| `PUT`  | `/api/v1/bookings/{booking}/cancel`  | Authenticated, policy checked | Cancel pending or approved booking.                  |
| `PUT`  | `/api/v1/bookings/{booking}/read`    | Borrower                      | Mark borrower notification as read.                  |
| `POST` | `/api/v1/bookings/{booking}/remind`  | Admin / Sysadmin              | Queue manual return reminder email.                  |

## Users

| Method   | Endpoint               | Access   | Purpose                                         |
| :------- | :--------------------- | :------- | :---------------------------------------------- |
| `GET`    | `/api/v1/users`        | Sysadmin | List non-sysadmin users.                        |
| `GET`    | `/api/v1/users/{user}` | Sysadmin | View user details.                              |
| `POST`   | `/api/v1/users`        | Sysadmin | Create user account.                            |
| `PUT`    | `/api/v1/users/{user}` | Sysadmin | Update user account.                            |
| `DELETE` | `/api/v1/users/{user}` | Sysadmin | Delete user (blocked if active bookings exist). |

## Responses and failures

API responses use helper methods from [`ApiController`](../../backend/app/Http/Controllers/Api/ApiController.php).

### Success (200 OK)

The `success($data = null, string $message = 'Success.', int $status = 200)` helper outputs `message` and `status`. The `data` property is included when non-null.

With `data`:

```json
{
    "message": "Success.",
    "status": 200,
    "data": {
        "key": "value"
    }
}
```

Without `data`:

```json
{
    "message": "Success.",
    "status": 200
}
```

### Created (201 Created)

The `created($data = null, string $message = 'Created successfully.')` helper returns HTTP 201:

```json
{
    "message": "Created successfully.",
    "status": 201,
    "data": {
        "key": "value"
    }
}
```

### No Content (204 No Content)

The `noContent()` helper returns HTTP status 204 with an empty body:

```
HTTP/1.1 204 No Content
```

### Errors (400, 401, 403, 404)

Error helpers return JSON with `message`. The `errors` property is included when non-null.

- `error(string $message = 'An error occurred.', int $status = 400, $errors = null)`
- `unauthorized(string $message = 'Unauthorized.')` (HTTP 401)
- `forbidden(string $message = 'Forbidden.')` (HTTP 403)
- `notFound(string $message = 'Resource not found.')` (HTTP 404)

Example:

```json
{
    "message": "An error occurred."
}
```

### Validation error (422 Unprocessable Content)

The `validationError($errors = null, string $message = 'Validation failed.')` helper returns HTTP 422:

```json
{
    "message": "Validation failed.",
    "errors": {
        "field": ["The field is required."]
    }
}
```
