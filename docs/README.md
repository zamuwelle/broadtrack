# BroadTrack Developer Documentation

Developer documentation for BroadTrack, the School Equipment Borrowing and Inventory Management System for La Verdad Christian College.

---

## Documentation Index

### 1. Architecture & Core Systems (`docs/architecture/`)

- [System Architecture Overview](./architecture/system-overview.md): Application areas, request flow, broadcasts, and time handling.
- [Authentication & User Lifecycle](./architecture/auth-lifecycle.md): Registration, verification, Sanctum tokens, and password reset behavior.
- [Scheduled Tasks & Console Architecture](./architecture/scheduled-tasks.md): Scheduler cadence, expiry command, reminders, and pruning.

### 2. Workflows & State Machines (`docs/workflows/`)

- [Borrowing & Equipment Lifecycle](./workflows/borrowing-lifecycle.md): Persisted booking states, equipment statuses, availability checks, and date behavior.

### 3. Technical Reference & Conventions (`docs/reference/`)

- [API Endpoints Reference](./reference/api-endpoints.md): List of versioned `/api/v1` REST endpoints, HTTP methods, and role access.
- [Backend Architecture & Conventions](./reference/backend-conventions.md): Request patterns, backed enums, booking integrity, events, and backend checks.
- [Frontend Architecture & Conventions](./reference/frontend-conventions.md): Feature structure, shared helpers, existing UI components, and frontend commands.

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

| Command                               | Action                                                                                                  |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `cd frontend && bun run dev`          | Start the Laravel server, queue worker, Reverb, Vite, and scheduler workers for full-stack development. |
| `cd frontend && bun run dev:frontend` | Start only the Vite frontend development server.                                                        |
| `cd frontend && vp check`             | Check frontend lint and formatting.                                                                     |
| `cd frontend && vp -C web build`      | Build the web application.                                                                              |
| `cd frontend && bun run test:backend` | Run backend tests.                                                                                      |
| `cd frontend && bun run lint:backend` | Run the Pint check.                                                                                     |
| `cd frontend && bun run check`        | Format the repository, run lint/build/browser checks; may modify files and does not run backend tests.  |
