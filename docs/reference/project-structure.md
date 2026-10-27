# Project structure

Directory layout and file annotations for the Broadtrack repository.

## Root directory

```text
broadtrack/
├── .github/              # GitHub Actions workflows and automation setup
├── backend/              # Laravel 13 API application, models, migrations, tests
├── docs/                 # System architecture, workflows, reference docs
├── frontend/             # Frontend workspace with web application and shared package
├── postman/              # Postman API collection for API v1
├── .gitignore            # Root Git ignore rules
├── LICENSE.md            # Repository open-source license
└── README.md             # Project landing guide and local development setup
```

## Backend (`backend/`)

Laravel 13 REST API using FrankenPHP Octane, Sanctum tokens, and Reverb WebSockets.

```text
backend/
├── app/
│   ├── Console/Commands/ # Scheduled and artisan CLI commands
│   │   ├── CancelExpiredPendingBookingsCommand.php
│   │   └── SendReturnDueEmailRemindersCommand.php
│   ├── Enums/            # PHP enums for models and statuses
│   │   ├── BookingStatus.php
│   │   ├── Department.php
│   │   ├── EquipmentCategory.php
│   │   ├── EquipmentStatus.php
│   │   └── UserRole.php
│   ├── Events/           # WebSocket broadcast event classes
│   │   ├── BookingUpdated.php
│   │   ├── EquipmentUpdated.php
│   │   └── UserUpdated.php
│   ├── Http/
│   │   ├── Controllers/  # Base controllers and versioned API v1 endpoints
│   │   │   ├── Api/ApiController.php
│   │   │   └── Api/V1/   # Auth, booking, equipment, profile, user controllers
│   │   ├── Middleware/   # Custom HTTP middleware (RoleMiddleware)
│   │   ├── Requests/     # Form Requests validating input and authorization
│   │   │   ├── Api/V1/   # Auth, booking, equipment, and user validation requests
│   │   │   └── Concerns/ # Validation traits (HasUserRules)
│   │   └── Resources/    # API resource classes formatting JSON responses
│   │       └── Api/V1/   # BookingResource, EquipmentResource, UserResource
│   ├── Mail/             # Email templates and notification classes
│   ├── Models/           # Eloquent models (User, Equipment, Booking)
│   ├── Observers/        # Model observers that broadcast events
│   ├── Policies/         # Authorization policies for role checks
│   ├── Providers/        # Service providers registering application bindings
│   └── Services/         # Third-party services (CloudinaryService)
├── bootstrap/            # Application bootstrap configuration and providers
├── config/               # Application configuration files
│   ├── app.php           # Base app settings, locale, and timezone defaults
│   ├── auth.php          # Authentication guards and user provider setup
│   ├── broadcasting.php  # Broadcast connection definitions
│   ├── cache.php         # Cache store options and key prefixes
│   ├── contact.php       # Contact form recipient settings
│   ├── cors.php          # Cross-Origin Resource Sharing policy rules
│   ├── database.php      # Database drivers and connection definitions
│   ├── filesystems.php   # Storage disks (local, public, S3, Cloudinary)
│   ├── logging.php       # Log channels and severity handlers
│   ├── mail.php          # Mail transport configurations (Brevo API, SMTP, log)
│   ├── octane.php        # Octane server settings for FrankenPHP runtime
│   ├── queue.php         # Queue worker connections and failed job table config
│   ├── reverb.php        # Laravel Reverb WebSocket server options
│   ├── sanctum.php       # Sanctum token expiration and guard rules
│   ├── services.php      # Third-party credentials (Google OAuth, Brevo, Cloudinary)
│   ├── session.php       # Session drivers and lifetime options
│   └── theme.php         # Dynamic styling and color palette defaults
├── database/
│   ├── factories/        # Model factory definitions for test seed data
│   ├── migrations/       # Database migrations defining schemas and foreign keys
│   └── seeders/          # Database seeders for test environments and default records
├── lang/en/              # Translation strings for auth, passwords, and validation
├── public/               # Public HTTP root with index.php entrypoint and robots.txt
├── resources/views/      # Blade templates for email layouts and PDF slips
├── routes/               # Route definitions
│   ├── api.php           # Versioned API routes under /api/v1
│   ├── channels.php      # Reverb WebSocket broadcast authorization channels
│   ├── console.php       # Artisan console routes and task scheduler rules
│   └── web.php           # Google OAuth routes and favicon
├── storage/              # Storage directory for app files, framework cache, and logs
├── tests/                # Test suites powered by Pest and PHPUnit
│   ├── Feature/          # Integration and API endpoint tests (Api/V1, Console)
│   ├── Unit/             # Low-level isolated unit tests
│   ├── Pest.php          # Pest framework hooks and helper functions
│   └── TestCase.php      # Base test case class extending Laravel test harness
├── Caddyfile             # Caddy web routing and reverse proxy rules for FrankenPHP
├── Dockerfile            # Production container image definition with FrankenPHP
├── entrypoint.sh         # Container entrypoint starting background workers and Octane
├── artisan               # Laravel command-line tool executable
├── composer.json         # PHP package dependencies and autoloading definitions
├── composer.lock         # Locked versions of backend dependencies
├── phpunit.xml           # PHPUnit testing configuration
└── pint.json             # Laravel Pint code style rules
```

## Frontend (`frontend/`)

Bun monorepo workspace containing React 19 web app and shared library.

```text
frontend/
├── scripts/                        # Build validation and dev runner scripts
│   ├── assert-no-browser-errors.js # Headless browser check for clean console output
│   └── serve.js                    # Development runner spawning the PHP backend server
├── shared/                         # Shared logic for web or other clients
│   ├── constants.js                # Roles, departments, statuses, and categories
│   ├── hooks/                      # Custom React hooks (useSetState)
│   ├── lib/                        # Axios HTTP and Echo WebSocket client instances
│   ├── schemas/                    # Zod validation schemas for forms and models
│   └── util/                       # Utility helpers for dates, intervals, and search
├── web/                            # React 19 SPA built with Vite and Tailwind CSS 4
│   ├── plugins/                    # Vite plugins for error logging and shared deps
│   ├── public/                     # Static web assets, favicons, logos, and banners
│   ├── src/
│   │   ├── app/                    # Core app configuration, router, and providers
│   │   ├── assets/                 # Bundled images, illustrations, and graphics
│   │   ├── components/ui/          # Reusable UI primitives (buttons, modals, forms)
│   │   ├── config/                 # Environment variables and route path constants
│   │   ├── features/               # Feature-driven domain modules
│   │   │   ├── admin/              # Admin dashboards, approvals, inventory, users
│   │   │   ├── auth/               # Login, register, password reset, and verify
│   │   │   ├── bookings/           # Borrower booking lists and history management
│   │   │   ├── borrow/             # Catalog, borrow cart, checkout, and slips
│   │   │   ├── equipment/          # Equipment data hooks and mutation requests
│   │   │   ├── landing/            # Landing pages, features, teams, contact forms
│   │   │   └── users/              # User profiles and account settings
│   │   ├── hooks/                  # Shared application hooks (UI, query, actions)
│   │   ├── layouts/                # Layout shells (AdminLayout, BorrowLayout)
│   │   ├── lib/                    # Frontend clients (api-client, auth, echo)
│   │   ├── test/                   # Vite Plus test setup and testing utilities
│   │   ├── index.css               # Tailwind CSS entrypoint and theme styles
│   │   ├── main.jsx                # React DOM mounting entrypoint
│   │   └── root.css                # CSS variables and base styling
│   ├── firebase.json               # Firebase Hosting config and SPA rewrite rules
│   ├── index.html                  # HTML page entrypoint
│   ├── jsconfig.json               # Path aliases config (@/* mapped to ./src/*)
│   ├── package.json                # Web package configuration and dependencies
│   └── vite.config.js              # Vite config for React, plugins, and dev server
├── bun.lock                        # Locked dependencies for Bun package manager
├── package.json                    # Monorepo scripts for lint, format, test, build
└── vite.config.js                  # Root Vite workspace configuration
```

## Documentation (`docs/`)

Architecture, workflows, and conventions.

```text
docs/
├── architecture/               # System architecture and runtime behavior documents
│   ├── auth-lifecycle.md       # Auth flows, token management, OAuth, and verification
│   ├── scheduled-tasks.md      # Scheduled background commands, cleanup, and reminders
│   └── system-overview.md      # Component architecture, data flows, and hosting summary
├── reference/                  # Technical reference and convention guides
│   ├── api-endpoints.md        # API v1 routes, methods, access permissions, and payloads
│   ├── backend-conventions.md  # Backend standards, form requests, and Pest tests
│   ├── database.md             # Core tables, foreign keys, and Eloquent models
│   ├── frontend-conventions.md # Frontend patterns, query conventions, and styling
│   ├── project-structure.md    # Repository directory layout and file annotations
│   └── testing.md              # Testing frameworks, test setup, and runner commands
├── workflows/                  # Core business workflows
│   └── borrowing-lifecycle.md  # Equipment status transitions, conflicts, and rules
└── README.md                   # Documentation index and table of contents
```

## CI/CD and automation (`.github/`)

GitHub Actions workflows for continuous integration, dependency checks, and frontend-only Firebase Hosting deployments.

```text
.github/
├── dependabot.yml              # Automated package dependency update rules
├── scripts/                    # Shared test, build, and deployment commands
└── workflows/
    ├── dependencies.yml        # Dependabot repair and auto-merge
    ├── deploy.yml              # Firebase Hosting deployment
    ├── sync-dependencies.yml   # Dependency updates from main to dev
    └── tests.yml               # Backend and frontend checks
```

## Postman (`postman/`)

API testing collection for endpoint verification.

```text
postman/
└── BroadTrack_API_v1.json      # Pre-configured API v1 collection with test scripts
```
