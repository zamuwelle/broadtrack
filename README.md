<div align="center">

<img src="https://github.com/user-attachments/assets/2ccee4c9-5f31-4c5a-bc81-416714a765df" width="120" alt="Broadtrack Logo">

# Broadtrack

<a href="#"><img src="https://img.shields.io/badge/PHP-777BB4?logo=php&logoColor=white" alt="PHP"></a>
<a href="#"><img src="https://img.shields.io/badge/Laravel-FF2D20?logo=laravel&logoColor=white" alt="Laravel"></a>
<a href="#"><img src="https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black" alt="React"></a>
<a href="#"><img src="https://img.shields.io/badge/Tailwind-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS"></a>
<a href="#"><img src="https://img.shields.io/badge/Vite%2B-646CFF?logo=vite&logoColor=white" alt="Vite+"></a>
<a href="#"><img src="https://img.shields.io/badge/Bun-000000?logo=bun&logoColor=white" alt="Bun"></a>
<a href="#"><img src="https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black" alt="Firebase"></a>
<a href="#"><img src="https://img.shields.io/badge/GitHub_Actions-2088FF?logo=githubactions&logoColor=white" alt="GitHub Actions"></a>

Equipment booking and tracking system built with Laravel and React.

</div>

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
    - [Linux / macOS](#linux--macos)
    - [Windows](#windows-cmd--powershell)
    - [Default Test Credentials](#default-test-credentials-local-only)
- [Database Schema](#database-schema)
- [API Reference](#api-reference-v1)
- [Testing & Code Quality](#testing--code-quality)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Team & Contributors](#team--contributors)
- [License](#license)

## About

**Broadtrack** is an institutional equipment booking and tracking management system designed for schools and organizations. It simplifies how students and faculty borrow gear by replacing manual logbooks with real-time availability tracking, automated reservation approvals, overdue reminder notifications, and digital booking slips.

## Features

- User authentication (register, login, Google OAuth, password reset, email verification)
- Email verification with six-digit codes that expire after 15 minutes
- Google OAuth restricted to institutional email addresses
- Equipment catalog with categories, locations, descriptions, and specs
- Real-time equipment status and bookings via Laravel Reverb WebSockets
- Booking system with approval workflow (approve/reject/release/return/cancel)
- Equipment return reminder system via queued emails
- Serial number generation for equipment
- Borrower dashboard with calendar and booking slips
- Admin dashboard for managing equipment inventory, categories, and approvals
- Shared API and real-time Echo layer for web and future mobile (Expo) clients
- RESTful API versioned at `/api/v1/` with Sanctum authentication
- Automated feature tests with Pest PHP

## Tech Stack

| Backend                      | Frontend                      |
| ---------------------------- | ----------------------------- |
| Laravel 13 (PHP 8.3+)        | React 19                      |
| Octane (FrankenPHP)          | Vite+ + Tailwind CSS 4        |
| Laravel Reverb (WebSockets)  | React Router DOM              |
| Sanctum + Socialite (Google) | TanStack Query + Laravel Echo |
| Brevo API (queued email)     | Bun                           |

## Project Structure

```text
broadtrack/
├── backend/            # Laravel 13 API (Octane FrankenPHP, Reverb, Sanctum)
├── frontend/
│   ├── web/            # React 19 SPA (Vite+, Tailwind CSS 4, TanStack Query)
│   └── shared/         # Platform-agnostic utilities, constants, schemas
├── docs/               # Architecture, API endpoints, workflows, conventions
└── postman/            # Pre-configured Postman API collection
```

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
# bun run dev:frontend  (Frontend only: Vite+)
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
# bun run dev:frontend  (Frontend only: Vite+)
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

All API endpoints are versioned under the `/api/v1/` prefix with Sanctum authentication.

For the complete list of endpoints, request parameters, response structures, and role permissions, see the [API Endpoints Reference](docs/reference/api-endpoints.md).

### Postman Collection

A complete, pre-configured Postman collection with automatic Sanctum token handling is provided in:

```text
postman/BroadTrack_API_v1.json
```

Import it into Postman to test all endpoints out-of-the-box.

## Testing & Code Quality

```bash
cd frontend

# Run the Pest automated feature test suite
bun run test:backend

# Linting
bun run lint            # Lints ALL (Frontend + Backend)
bun run lint:frontend   # Lints Frontend only (Oxlint)
bun run lint:backend    # Lints Backend only (Laravel Pint)
bun run test:frontend   # Runs Vite Plus frontend tests

# Formatting
bun run format          # Formats ALL (Frontend + Backend)
bun run format:frontend # Formats Frontend & Repo (Oxfmt)
bun run format:backend  # Formats Backend only (Laravel Pint)

# Verification
bun run check           # Formats, lints, builds, and asserts zero browser errors
```

## Deployment

- **Frontend**: Firebase Hosting (automated via GitHub Actions on `main` and `dev`)
- **Backend**: Render (FrankenPHP Octane + Reverb Caddy reverse proxy)

## Documentation

For architectural diagrams, workflows, and code conventions, see the [Developer Documentation](./docs/README.md).

## Team & Contributors

| Name                         | Role                 |
| :--------------------------- | :------------------- |
| **Rocelyn Lava**             | Project Manager      |
| **Anne Stephanne Buenaflor** | Business Analyst     |
| **Ydrey Ann Ramirez**        | UI/UX Designer       |
| **Luisa Padillon**           | UI/UX Designer       |
| **Karl Ashton Mahusay**      | Quality Assurance    |
| **Samuel Binos**             | Full-Stack Developer |

## License

See [LICENSE.md](./LICENSE.md) for details.
