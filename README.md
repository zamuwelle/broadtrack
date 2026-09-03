<div align="center">

<img src="https://github.com/user-attachments/assets/2ccee4c9-5f31-4c5a-bc81-416714a765df" width="120" alt="Broadtrack Logo">

# Broadtrack

<a href="#"><img src="https://img.shields.io/badge/PHP-777BB4?logo=php&logoColor=white" alt="PHP"></a>
<a href="#"><img src="https://img.shields.io/badge/Laravel-FF2D20?logo=laravel&logoColor=white" alt="Laravel"></a>
<a href="#"><img src="https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black" alt="React"></a>
<a href="#"><img src="https://img.shields.io/badge/Tailwind-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS"></a>
<a href="#"><img src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white" alt="Vite"></a>
<a href="#"><img src="https://img.shields.io/badge/Bun-000000?logo=bun&logoColor=white" alt="Bun"></a>
<a href="#"><img src="https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black" alt="Firebase"></a>
<a href="#"><img src="https://img.shields.io/badge/GitHub_Actions-2088FF?logo=githubactions&logoColor=white" alt="GitHub Actions"></a>

Equipment booking and tracking system built with Laravel and React.

</div>

## Features

- User authentication (register, login, Google OAuth, password reset, email verification)
- Email verification with 15-minute one-time links (Google sign-ins auto-verified)
- Equipment catalog with categories, locations, descriptions, and specs
- Real-time equipment status and bookings via Laravel Reverb WebSockets
- Booking system with approval workflow (approve/reject/release/return/cancel)
- Equipment return reminder system via queued emails
- Serial number generation for equipment
- Borrower dashboard with calendar and booking slips
- Admin dashboard for managing equipment inventory, categories, and approvals
- Shared API and real-time Echo layer for web and future mobile (Expo) clients
- RESTful API versioned at `/api/v1/` with Sanctum authentication
- Automated Feature Test Suite with Pest PHP (52/52 passing)

## Tech Stack

| Backend                      | Frontend                      |
| ---------------------------- | ----------------------------- |
| Laravel 13 (PHP 8.3+)        | React 19                      |
| Octane (FrankenPHP)          | Vite + Tailwind CSS 4         |
| Laravel Reverb (WebSockets)  | React Router DOM              |
| Sanctum + Socialite (Google) | TanStack Query + Laravel Echo |
| Mail (SMTP, queued)          | Bun                           |
| SQLite                       |                               |

## Prerequisites

- PHP 8.3+
- Composer
- Bun

## Getting Started

### Linux / macOS

```bash
# 1. Clone repository
git clone https://github.com/zamuwelle/broadtrack.git
cd broadtrack

# 2. Setup Backend
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
cd ..

# 3. Setup Frontend
cd frontend
bun install
cp web/.env.example web/.env
cd ..

# 4. Run Development Servers
cd frontend
bun run dev          # Runs both Frontend & Backend
# Or run individually:
# bun run dev:backend   (Backend only: Octane + Reverb + Queue)
# bun run dev:frontend  (Frontend only: Vite)
```

### Windows (CMD / PowerShell)

```powershell
# 1. Clone repository
git clone https://github.com/zamuwelle/broadtrack.git
cd broadtrack

# 2. Setup Backend
cd backend
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate --seed
cd ..

# 3. Setup Frontend
cd frontend
bun install
copy web\.env.example web\.env
cd ..

# 4. Run Development Servers
cd frontend
bun run dev          # Runs both Frontend & Backend
# Or run individually:
# bun run dev:backend   (Backend only: Octane + Reverb + Queue)
# bun run dev:frontend  (Frontend only: Vite)
```

- Backend API: http://localhost:8000
- Frontend Web: http://localhost:5173
- Reverb WebSockets: ws://localhost:8080

### Default Test Credentials (Local Only)

All seeded test accounts use the password: `password123`

| Role         | Email                                     | Name                |
| :----------- | :---------------------------------------- | :------------------ |
| **Admin**    | `karladmin.test@laverdad.edu.ph`          | Karl Ashton Mahusay |
| **Sysadmin** | `karlsysadmin.test@laverdad.edu.ph`       | Karl Ashton Mahusay |
| **Borrower** | `karlborrow.test@student.laverdad.edu.ph` | Karl Ashton Mahusay |

## Database Schema

| Database Schema                                                                                                               | ERD                                                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| <img src="https://github.com/user-attachments/assets/d0c9bf72-390a-4b54-976b-5b8c5e661c33" width="400" alt="Database Schema"> | <img src="https://github.com/user-attachments/assets/92961cfb-9ba0-4033-ab26-d9fe954c898f" width="400" alt="ERD"> |

| Model     | Description                                          |
| --------- | ---------------------------------------------------- |
| User      | Application users (admin/customer)                   |
| Equipment | Bookable items with details, descriptions, and specs |
| Category  | Equipment categorization                             |
| Location  | Where equipment is stored                            |
| Booking   | Equipment reservation with status workflow           |

## API Reference (v1)

All API endpoints are versioned under the `/api/v1/` prefix.

| Method | Endpoint                        | Description                    | Role     | Rate Limit |
| ------ | ------------------------------- | ------------------------------ | -------- | ---------- |
| POST   | `/api/v1/register`              | Register new user              | Public   | 5/min      |
| POST   | `/api/v1/login`                 | Login with email/password      | Public   | 5/min      |
| POST   | `/api/v1/forgot-password`       | Request password reset         | Public   | 5/min      |
| POST   | `/api/v1/reset-password`        | Reset password with token      | Public   | 5/min      |
| POST   | `/api/v1/resend-verification`   | Resend email verification      | Public   | 5/min      |
| POST   | `/api/v1/contact`               | Send contact message           | Public   | 5/min      |
| GET    | `/api/v1/me`                    | Get current user profile       | Auth     | 60/min     |
| PUT    | `/api/v1/profile`               | Update user profile            | Auth     | 60/min     |
| POST   | `/api/v1/profile/picture`       | Upload user profile picture    | Auth     | 60/min     |
| POST   | `/api/v1/logout`                | Logout current user            | Auth     | 60/min     |
| GET    | `/api/v1/equipment`             | List all equipment             | Auth     | 60/min     |
| POST   | `/api/v1/equipment`             | Create equipment               | Admin    | 60/min     |
| PUT    | `/api/v1/equipment/{id}`        | Update equipment               | Admin    | 60/min     |
| POST   | `/api/v1/equipment/{id}/upload` | Upload equipment image         | Admin    | 60/min     |
| DELETE | `/api/v1/equipment/{id}`        | Delete equipment               | Admin    | 60/min     |
| GET    | `/api/v1/bookings`              | List bookings                  | Auth     | 60/min     |
| GET    | `/api/v1/bookings/{id}`         | Get booking details            | Auth     | 60/min     |
| POST   | `/api/v1/bookings`              | Create new booking             | Borrower | 60/min     |
| PUT    | `/api/v1/bookings/{id}/read`    | Mark booking notification read | Borrower | 60/min     |
| PUT    | `/api/v1/bookings/{id}/cancel`  | Cancel pending booking         | Borrower | 60/min     |
| PUT    | `/api/v1/bookings/{id}/approve` | Approve booking                | Admin    | 60/min     |
| PUT    | `/api/v1/bookings/{id}/reject`  | Reject booking                 | Admin    | 60/min     |
| PUT    | `/api/v1/bookings/{id}/release` | Release equipment              | Admin    | 60/min     |
| PUT    | `/api/v1/bookings/{id}/return`  | Return equipment               | Admin    | 60/min     |
| POST   | `/api/v1/bookings/{id}/remind`  | Send return reminder email     | Admin    | 60/min     |
| GET    | `/api/v1/users`                 | List users                     | Sysadmin | 60/min     |
| POST   | `/api/v1/users`                 | Create user                    | Sysadmin | 60/min     |
| PUT    | `/api/v1/users/{id}`            | Update user                    | Sysadmin | 60/min     |
| DELETE | `/api/v1/users/{id}`            | Delete user                    | Sysadmin | 60/min     |

### Postman Collection

A complete, pre-configured Postman collection with automatic Sanctum token handling is provided in:

```text
postman/BroadTrack_API_v1.json
```

Import it into Postman to test all endpoints out-of-the-box.

## Testing & Code Quality

```bash
cd frontend

# Run Pest automated feature test suite (52 tests)
bun run test:backend

# Linting
bun run lint            # Lints ALL (Frontend + Backend)
bun run lint:frontend   # Lints Frontend only (Oxlint)
bun run lint:backend    # Lints Backend only (Laravel Pint)

# Formatting
bun run format          # Formats ALL (Frontend + Backend)
bun run format:frontend # Formats Frontend only (Prettier)
bun run format:backend  # Formats Backend only (Laravel Pint + Prettier)
```

## Deployment

- **Frontend**: Firebase Hosting (automated via GitHub Actions on `main` and `dev`)
- **Backend**: Render (FrankenPHP Octane + Reverb Caddy reverse proxy)

## Documentation

For architectural diagrams, workflows, and code conventions, see the [Developer Documentation](./docs/README.md).

## License

See [LICENSE.md](./LICENSE.md) for details.

## Contributors

- Broadtrack Team
