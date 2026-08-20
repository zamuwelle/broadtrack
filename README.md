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
- RESTful API with Sanctum authentication

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
php artisan migrate
cd ..

# 3. Setup Frontend
cd frontend
bun install
cp web/.env.example web/.env
cd ..

# 4. Run Both Servers (Vite + FrankenPHP Octane + Reverb + Queue)
cd frontend
bun run dev
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
php artisan migrate
cd ..

# 3. Setup Frontend
cd frontend
bun install
copy web\.env.example web\.env
cd ..

# 4. Run Both Servers (Vite + FrankenPHP Octane + Reverb + Queue)
cd frontend
bun run dev
```

- Backend API: http://localhost:8000
- Frontend Web: http://localhost:5173
- Reverb WebSockets: ws://localhost:8080

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

## API Reference

| Method | Endpoint                     | Description                    | Role     | Rate Limit |
| ------ | ---------------------------- | ------------------------------ | -------- | ---------- |
| POST   | `/api/register`              | Register new user              | Public   | 5/min      |
| POST   | `/api/login`                 | Login with email/password      | Public   | 5/min      |
| POST   | `/api/forgot-password`       | Request password reset         | Public   | 5/min      |
| POST   | `/api/reset-password`        | Reset password with token      | Public   | 60/min     |
| POST   | `/api/contact`               | Send contact message           | Public   | 60/min     |
| GET    | `/api/me`                    | Get current user               | Auth     | 60/min     |
| PATCH  | `/api/profile`               | Update user profile            | Auth     | 60/min     |
| POST   | `/api/profile/picture`       | Upload user profile picture    | Auth     | 60/min     |
| POST   | `/api/logout`                | Logout current user            | Auth     | 60/min     |
| GET    | `/api/equipment`             | List all equipment             | Auth     | 60/min     |
| POST   | `/api/equipment`             | Create equipment               | Admin    | 60/min     |
| PUT    | `/api/equipment/{id}`        | Update equipment               | Admin    | 60/min     |
| POST   | `/api/equipment/{id}/upload` | Upload equipment image         | Admin    | 60/min     |
| DELETE | `/api/equipment/{id}`        | Delete equipment               | Admin    | 60/min     |
| GET    | `/api/bookings`              | List bookings                  | Auth     | 60/min     |
| GET    | `/api/bookings/{id}`         | Get booking details            | Auth     | 60/min     |
| POST   | `/api/bookings`              | Create new booking             | Borrower | 60/min     |
| PATCH  | `/api/bookings/{id}/read`    | Mark booking notification read | Borrower | 60/min     |
| PUT    | `/api/bookings/{id}/cancel`  | Cancel pending booking         | Borrower | 60/min     |
| PUT    | `/api/bookings/{id}/approve` | Approve booking                | Admin    | 60/min     |
| PUT    | `/api/bookings/{id}/reject`  | Reject booking                 | Admin    | 60/min     |
| PUT    | `/api/bookings/{id}/release` | Release equipment              | Admin    | 60/min     |
| PUT    | `/api/bookings/{id}/return`  | Return equipment               | Admin    | 60/min     |
| POST   | `/api/bookings/{id}/remind`  | Send return reminder email     | Admin    | 60/min     |
| GET    | `/api/users`                 | List users                     | Sysadmin | 60/min     |
| POST   | `/api/users`                 | Create user                    | Sysadmin | 60/min     |
| PATCH  | `/api/users/{id}`            | Update user                    | Sysadmin | 60/min     |
| DELETE | `/api/users/{id}`            | Delete user                    | Sysadmin | 60/min     |

## Testing & Linting

```bash
cd frontend
bun run lint
bun run format
```

## Deployment

- **Frontend**: Firebase Hosting (automated via GitHub Actions on `main` and `dev`)
- **Backend**: Render (FrankenPHP Octane + Reverb Caddy reverse proxy)

## License

See [LICENSE.md](./LICENSE.md) for details.

## Contributors

- Broadtrack Team
