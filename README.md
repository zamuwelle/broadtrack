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
- Equipment catalog with categories and locations
- Booking system with approval workflow (approve/reject/release/return)
- Admin dashboard for managing equipment, categories, locations
- RESTful API with Sanctum authentication

## Tech Stack

| Backend | Frontend |
|---------|----------|
| Laravel 13 (PHP 8.3+) | React 19 |
| Octane (FrankenPHP) | Vite + Tailwind CSS 4 |
| Sanctum + Socialite (Google) | React Router DOM |
| Mail (SMTP, queued) | TanStack Query |
| SQLite | Bun |

## Prerequisites

- PHP 8.3+
- Composer
- Bun

## Getting Started

```bash
# Clone
git clone https://github.com/zamuwelle/broadtrack.git && cd broadtrack

# Backend
cd backend && composer install && cp .env.example .env && php artisan key:generate && php artisan migrate

# Frontend
cd ../frontend && bun install && cp web/.env.example web/.env
```

**Run both servers:**
```bash
cd frontend && bun run dev:all
```

- Backend: http://localhost:8000
- Frontend: http://localhost:5173

## Database Schema

| Database Schema | ERD |
|-----------------|-----|
| <img src="https://github.com/user-attachments/assets/d0c9bf72-390a-4b54-976b-5b8c5e661c33" width="400" alt="Database Schema"> | <img src="https://github.com/user-attachments/assets/92961cfb-9ba0-4033-ab26-d9fe954c898f" width="400" alt="ERD"> |

| Model | Description |
|-------|-------------|
| User | Application users (admin/customer) |
| Equipment | Bookable items with details |
| Category | Equipment categorization |
| Location | Where equipment is stored |
| Booking | Equipment reservation with status workflow |

## API Reference

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/api/register` | Register new user | Public |
| POST | `/api/login` | Login with email/password | Public |
| POST | `/api/forgot-password` | Request password reset | Public |
| POST | `/api/reset-password` | Reset password with token | Public |
| GET | `/api/verify-email` | Verify email via token link | Public |
| GET | `/api/auth/google/redirect` | Redirect to Google OAuth | Public |
| GET | `/api/auth/google/callback` | Google OAuth callback | Public |
| POST | `/api/contact` | Send contact message | Public |
| POST | `/api/logout` | Logout current user | Auth |
| GET | `/api/me` | Get current user | Auth |
| PATCH | `/api/profile` | Update user profile | Auth |
| GET | `/api/equipment` | List all equipment | Auth |
| GET | `/api/equipment/{id}` | Get equipment details | Auth |
| POST | `/api/equipment` | Create equipment | Admin |
| PUT | `/api/equipment/{id}` | Update equipment | Admin |
| DELETE | `/api/equipment/{id}` | Delete equipment | Admin |
| POST | `/api/equipment/{id}/upload` | Upload equipment image | Admin |
| GET | `/api/categories` | List categories | Auth |
| POST | `/api/categories` | Create category | Admin |
| PUT | `/api/categories/{id}` | Update category | Admin |
| DELETE | `/api/categories/{id}` | Delete category | Admin |
| GET | `/api/locations` | List locations | Auth |
| POST | `/api/locations` | Create location | Admin |
| PUT | `/api/locations/{id}` | Update location | Admin |
| DELETE | `/api/locations/{id}` | Delete location | Admin |
| GET | `/api/bookings` | List user bookings | Auth |
| GET | `/api/bookings/{id}` | Get booking details | Auth |
| POST | `/api/bookings` | Create new booking | Auth |
| PUT | `/api/bookings/{id}/approve` | Approve booking | Admin |
| PUT | `/api/bookings/{id}/reject` | Reject booking | Admin |
| PUT | `/api/bookings/{id}/release` | Release equipment | Admin |
| PUT | `/api/bookings/{id}/return` | Return equipment | Admin |

> [!NOTE]
> Rate limits (per IP): register 5/min, login 10/min, forgot-password 5/min.

## Testing

> [!NOTE]
> Coming soon.

## Deployment

- **Frontend**: Firebase Hosting
- **Backend**: Render

## License

See [LICENSE.md](./LICENSE.md) for details.

## Contributors

- Broadtrack Team