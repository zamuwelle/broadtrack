# BroadTrack Developer Documentation

Developer documentation for BroadTrack, the School Equipment Borrowing and Inventory Management System for La Verdad Christian College.

---

## Documentation Index

### 1. Architecture & Core Systems (`docs/architecture/`)

- [System Architecture Overview](./architecture/system-overview.md): Architecture diagram, monorepo layout, and key package dependencies.
- [Authentication & User Lifecycle](./architecture/auth-lifecycle.md): Registration flow, 24-hour unverified account pruning, and Google OAuth.
- [Scheduled Tasks & Console Architecture](./architecture/scheduled-tasks.md): Daily scheduler map, email reminder commands, and database pruning tasks.

### 2. Workflows & State Machines (`docs/workflows/`)

- [Borrowing & Equipment Lifecycle](./workflows/borrowing-lifecycle.md): Booking state transitions (`Pending` -> `Approved` -> `Released` -> `Returned`) and equipment availability statuses.

### 3. Technical Reference & Conventions (`docs/reference/`)

- [API Endpoints Reference](./reference/api-endpoints.md): List of versioned `/api/v1` REST endpoints, HTTP methods, and role access.
- [Backend Architecture & Conventions](./reference/backend-conventions.md): Laravel 13 PHP attributes, thin controllers, backed enums, and Pest tests.
- [Frontend Architecture & Conventions](./reference/frontend-conventions.md): Zero-barrel direct file imports, feature directories, and router guards.

---

## Quickstart & Setup

### 1. Backend Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Backend API runs at `http://localhost:8000`.

### 2. Frontend Setup

```bash
cd frontend
bun install
bun run dev
```

Frontend Web application runs at `http://localhost:5173`.

---

## Common Developer Commands

| Command                               | Action                                       |
| ------------------------------------- | -------------------------------------------- |
| `cd frontend && bun run dev`          | Start full-stack dev server (Laravel + Vite) |
| `cd frontend && bun run check`        | Run format, lint, build, and browser checks  |
| `cd frontend && bun run test:backend` | Run the backend Pest test suite              |
| `cd frontend && bun run format`       | Format entire project (Pint + Oxfmt)         |
| `cd frontend && bun run lint`         | Lint entire project (Pint + Oxlint)          |
