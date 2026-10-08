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

Equipment booking and inventory tracking system built with Laravel and React.

</div>

## Table of contents

- [About](#about)
- [Key features](#key-features)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
    - [1. Clone the repository](#1-clone-the-repository)
    - [2. Configure the backend](#2-configure-the-backend)
    - [3. Configure the frontend](#3-configure-the-frontend)
    - [4. Start development servers](#4-start-development-servers)
    - [Default test credentials](#default-test-credentials)
- [Documentation](#documentation)
- [Team and contributors](#team-and-contributors)
- [License](#license)

## About

Broadtrack is an equipment booking and inventory tracking system for school campuses and organizations. It replaces paper logbooks with an online borrowing workflow that includes real-time availability updates, administrative approvals, automated overdue reminders, and digital booking slips.

## Key features

- User authentication with email credentials, password resets, 15-minute verification codes, and Google OAuth for school accounts
- Equipment catalog with categories, status tracking, specifications, and serial numbers
- Booking workflow supporting borrower requests, administrative approvals or rejections, cancellations, returns, and automatic expiration of unapproved requests
- Real-time inventory and booking status updates via Laravel Reverb and Laravel Echo WebSockets
- Automated return reminders and scheduled cleanup tasks run by background workers
- Responsive borrower and administrator dashboards with calendars and booking slip summaries
- Unified API layer supporting web and mobile clients

## Tech stack

| Backend                                     | Frontend                        |
| :------------------------------------------ | :------------------------------ |
| Laravel 13 (PHP 8.3+)                       | React 19                        |
| FrankenPHP (Laravel Octane) / Artisan Serve | Vite+ and Tailwind CSS 4        |
| Laravel Reverb (WebSockets)                 | React Router DOM                |
| Laravel Sanctum and Socialite               | TanStack Query and Laravel Echo |
| Brevo API Transport (Queued Mail)           | Bun                             |
| SQLite (Local Development)                  |                                 |

## Prerequisites

Install the following tools before starting:

- PHP 8.3 or higher
- [Composer](https://getcomposer.org/)
- [Bun](https://bun.sh/) (version 1.4.4 or compatible)

## Setup

Follow these steps to configure and run Broadtrack locally.

### 1. Clone the repository

```bash
git clone https://github.com/zamuwelle/broadtrack.git
cd broadtrack
```

### 2. Configure the backend

```bash
cd backend
composer install
```

Copy the example environment file:

- **Linux and macOS**:
    ```bash
    cp .env.example .env
    ```
- **Windows**:
    ```powershell
    copy .env.example .env
    ```

Initialize the database and application key:

```bash
php artisan key:generate
php artisan migrate --seed
cd ..
```

### 3. Configure the frontend

```bash
cd frontend
bun install
```

Copy the example environment file:

- **Linux and macOS**:
    ```bash
    cp web/.env.example web/.env
    ```
- **Windows**:
    ```powershell
    copy web\.env.example web\.env
    ```

### 4. Start development servers

From `frontend/`:

```bash
bun run dev
```

On Linux and macOS, the dev runner starts Octane with FrankenPHP; on Windows, it falls back to Artisan serve.

Service URLs:

- Backend API: `http://localhost:8000`
- Frontend web app: `http://localhost:5173`
- Reverb WebSockets: `ws://localhost:8080`

To start services individually:

- Backend only: `bun run dev:backend`
- Frontend only: `bun run dev:frontend`

### Default test credentials

When running in local environments (`APP_ENV=local`), database seeding creates default test accounts with the password `broadtrack`:

| Role         | Email                                   | Name          |
| :----------- | :-------------------------------------- | :------------ |
| **Admin**    | `admin.test@laverdad.edu.ph`            | Admin Test    |
| **Sysadmin** | `sysadmin.test@laverdad.edu.ph`         | Sysadmin Test |
| **Borrower** | `borrower.test@student.laverdad.edu.ph` | Borrower Test |

## Documentation

See [docs/README.md](docs/README.md) for full documentation.

## Team and contributors

| Name                         | Role                 |
| :--------------------------- | :------------------- |
| **Rocelyn Lava**             | Project Manager      |
| **Anne Stephanne Buenaflor** | Business Analyst     |
| **Ydrey Ann Ramirez**        | UI/UX Designer       |
| **Luisa Padillon**           | UI/UX Designer       |
| **Karl Ashton Mahusay**      | Quality Assurance    |
| **Samuel Binos**             | Full-Stack Developer |

## License

See [LICENSE.md](LICENSE.md) for details.
