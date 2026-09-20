# Frontend Architecture Audit

## Scope

This audit covers the browser application in [`frontend/web`](../../frontend/web/)
and the intended cross-platform layer in [`frontend/shared`](../../frontend/shared/).
It focuses on folder ownership and dependency boundaries, especially the
relationship between:

- `web/src/api`
- `web/src/components`
- `web/src/features`
- `web/src/layouts`
- `frontend/shared`

This document records the completed domain API migration and the later route
cleanup. The migration moved domain modules and updated imports without
changing runtime behavior, dependencies, or tests. Shared API infrastructure
was intentionally left unchanged; route adapters were later removed after the
router was updated to lazy-load feature pages directly. Layouts were not
reorganized.

## Baseline

- Date: 2026-10-26
- Application: Vite React web app
- Reference considered: local Bulletproof React example in
  [`scratch/bulletproof-react`](../../scratch/bulletproof-react/)
- The working tree already contains unrelated frontend, backend, documentation,
  and generated-file changes. This audit does not assume those changes belong to
  an architecture migration.

## Current structure

```text
frontend/
├── shared/
│   ├── constants.js
│   ├── hooks/
│   ├── lib/
│   ├── schemas/
│   └── util/
└── web/
    └── src/
        ├── app/
        ├── components/
        │   └── ui/
        ├── config/
        ├── features/
        │   ├── admin/
        │   ├── auth/
        │   ├── borrow/
        │   ├── landing/
        │   └── users/
        ├── hooks/
        ├── layouts/
        └── lib/
```

The application uses feature folders for UI and domain APIs. Authentication,
bookings, equipment, users, and contact now own their API modules under
`features/*/api`.

## Evidence inventory

### Pre-migration global API inventory

Before the migration, `web/src/api` contained 20 modules:

| Domain | Modules | Main behavior |
| --- | ---: | --- |
| `bookings` | 10 | Booking queries, lifecycle mutations, downloads, and exports |
| `equipment` | 5 | Equipment query, CRUD, and image upload |
| `users` | 4 | User query and CRUD mutations |
| `contact` | 1 | Contact form mutation |

These are not simple request-only files. Most modules combine:

- Axios request functions
- TanStack Query `useQuery` or `useMutation` hooks
- Query keys and query options
- Domain cache invalidation
- Optional per-consumer configuration

For example, [`get-bookings.js`](../../../frontend/web/src/features/bookings/api/get-bookings.js)
owns the bookings query key, query function, query options, and hook.
[`return-booking.js`](../../../frontend/web/src/features/bookings/api/return-booking.js)
also invalidates both bookings and equipment because the mutation changes both
domains.

### API consumers

The global APIs are consumed across multiple application areas:

| Domain | Consumers |
| --- | --- |
| Bookings | Admin approvals, admin dashboard, admin transactions, borrower calendar, borrower request, borrower slips, borrower notifications, and both protected layouts |
| Equipment | Admin inventory, admin dashboard, borrower equipment, borrower calendar, borrower request-related UI, and both protected layouts |
| Users | Admin users, admin layout, and user/profile UI indirectly |
| Contact | Landing contact feature |

This explains why blindly placing booking APIs under one screen such as
`features/admin/approvals` would be incorrect: the same domain is used by both
admin and borrower workflows.

### Feature-owned API modules

Authentication already follows a different pattern:

```text
features/auth/api/
├── forgot-password.js
├── login.js
├── register.js
├── resend-verification.js
├── reset-password.js
└── verify-email.js
```

Those modules are consumed by authentication components and use the same web API
client as the global modules. This is the clearest evidence that the project has
two API ownership models at the same time.

### Shared UI components

[`web/src/components/ui`](../../frontend/web/src/components/ui/) contains 18
components and form primitives. These components are imported by many features
and layouts and do not own booking, equipment, user, or authentication behavior.

Examples include:

- [`Button.jsx`](../../frontend/web/src/components/ui/Button.jsx)
- [`Select.jsx`](../../frontend/web/src/components/ui/Select.jsx)
- [`ConfirmModal.jsx`](../../frontend/web/src/components/ui/ConfirmModal.jsx)
- [`Toast.jsx`](../../frontend/web/src/components/ui/Toast.jsx)
- [`TextInput.jsx`](../../frontend/web/src/components/ui/form/TextInput.jsx)

This folder is correctly acting as a reusable **web UI** layer. It should not be
combined with API modules.

### Feature components

Feature-specific components are already colocated under their feature:

```text
features/
├── admin/
│   ├── approvals/
│   ├── dashboard/
│   ├── inventory/
│   ├── transactions/
│   └── users/
├── auth/
├── borrow/
│   ├── calendar/
│   ├── equipment/
│   ├── notifications/
│   ├── request/
│   └── slips/
├── landing/
└── users/
```

The feature UI structure is not the primary source of confusion. The API
directory is the outlier.

### Layout responsibilities

[`AdminLayout.jsx`](../../frontend/web/src/layouts/AdminLayout.jsx) loads
equipment, bookings, and users. [`BorrowLayout.jsx`](../../frontend/web/src/layouts/BorrowLayout.jsx)
loads equipment and bookings.

The layouts also own shell concerns such as navigation, route-aware active tabs,
scroll reset, readiness gating, and notification counts. Therefore they are
currently both:

1. Application shell and navigation composition.
2. Protected-area data preloading and readiness coordination.

This is a coupling point worth documenting, but it should not be changed during
an API folder move. Moving layout data loading is a separate behavior-sensitive
refactor.

### Route composition

The route adapters under `web/src/routes` were removed. The
[`app/router.jsx`](../../frontend/web/src/app/router.jsx) file now owns the
route tree and uses direct lazy imports that return each feature page as the
route component. This keeps route-level code splitting without a second
adapter layer.

The current route boundary is:

```text
features/*/*Page.jsx  page implementation and feature behavior
app/router.jsx        route tree and access composition
```

## Ownership classification

### Application composition

These belong to the web application composition layer:

- [`app/provider.jsx`](../../frontend/web/src/app/provider.jsx)
- [`app/router.jsx`](../../frontend/web/src/app/router.jsx)
- [`app/authorization.jsx`](../../frontend/web/src/app/authorization.jsx)
- Protected layouts under [`layouts/`](../../frontend/web/src/layouts/)

They connect features and infrastructure. They should not become a dumping
ground for domain request logic.

### Reusable web UI

These belong under `web/src/components`:

- Presentational controls
- Form primitives
- Toasts
- Confirmation dialogs
- Shared navigation primitives

They may use web-specific React behavior. “Shared” here means shared within the
web application, not automatically shared with React Native.

### Web infrastructure

These belong under `web/src/lib`, `web/src/config`, or `web/src/hooks`:

- The configured browser API client
- React Query defaults
- Browser authentication state
- Echo setup
- Web environment variables
- React Router paths
- Browser event and document hooks

The configured API client in [`lib/api-client.js`](../../frontend/web/src/lib/api-client.js)
correctly remains web-specific because it supplies browser storage and browser
unauthorized handling to the shared Axios factory.

### Domain feature modules

These should own domain API and server-cache behavior:

- Authentication
- Bookings
- Equipment
- Users
- Contact

TanStack Query hooks are web/React behavior, so they should not move to
`frontend/shared` merely because their HTTP endpoints are domain-related.

### Cross-platform shared code

[`frontend/shared`](../../frontend/shared/) is appropriate for code that can run
without browser APIs, React DOM, or React Router, and that is intentionally
useful to another client.

Current good candidates include:

- [`schemas/`](../../frontend/shared/schemas/)
- Domain constants in [`constants.js`](../../frontend/shared/constants.js)
- Pure booking helpers in [`util/booking.js`](../../frontend/shared/util/booking.js)
- Search helpers in [`util/search.js`](../../frontend/shared/util/search.js)
- Date rules in [`util/date.js`](../../frontend/shared/util/date.js), provided
  the mobile app follows the same Asia/Manila booking semantics

These are candidates, not a requirement to create a React Native package today.

## Findings

### Finding 1: The global API folder is the main source of confusion

`web/src/api` sits beside `components`, `features`, and `layouts`, but its files
are not application-wide infrastructure. They are domain modules containing
React Query and cache behavior.

The name `api` also makes it easy to confuse:

- The Axios client in `web/src/lib/api-client.js`
- Request functions
- Query hooks
- Mutation hooks
- Domain cache invalidation

The folder is not wrong technically, but it is unclear architecturally.

### Finding 2: Authentication already demonstrates the preferred direction

`features/auth/api` keeps authentication request modules close to the feature
that owns their behavior. The remaining domains use a different placement
without a documented reason.

This is an inconsistency, not evidence that the auth placement should be
reversed.

### Finding 3: Domain sharing does not require a global API folder

Bookings and equipment are used by both admin and borrower screens. That is a
reason to give them domain-level feature modules, not a reason to keep them in a
global API directory.

A domain module can be imported by multiple user-facing features while still
having one clear owner.

### Finding 4: `components` and `api` should remain separate

Shared UI components answer “how is this rendered?” Domain API modules answer
“how is this server state read or changed?” Combining them would make ownership
less clear and create a mixed-purpose folder.

### Finding 5: `constants.js` is not causing the architecture problem

[`frontend/shared/constants.js`](../../frontend/shared/constants.js) contains
domain values used by authentication, authorization, equipment, and booking
flows. It is currently a small, coherent module.

Deleting it or splitting it immediately would add file movement without fixing
the API boundary. It should remain until its size or ownership becomes a real
problem.

### Finding 6: Layout data loading is a separate concern

The layouts preload shared data and gate rendering on readiness. This may be
intentional for the protected areas, but it increases the amount of domain
behavior in layout files.

It should be reviewed separately after the API ownership decision. It should
not be mixed into a simple import-path migration.

### Finding 7: Direct lazy page imports remove redundant route adapters

The route files were thin adapters rather than barrel files, but the router can
preserve code splitting with direct lazy imports that return the feature page.
The adapter directory was therefore removed without changing route paths,
authorization, layouts, or the not-found behavior.

### Finding 8: Layouts are valid boundaries but have mixed responsibilities

Public, borrower, and admin layouts are appropriate places for shared shell
elements and nested route outlets. The borrower and admin layouts also preload
domain queries and calculate notification/readiness state.

The layout boundary itself should remain. If the data-loading responsibility is
later separated, that should be a dedicated behavior-preserving refactor. It
should not be combined with route-adapter removal or API file moves.

## Options considered

### Option A: Keep `web/src/api`

```text
web/src/api/bookings/
web/src/api/equipment/
web/src/api/users/
web/src/features/auth/api/
```

**Advantages**

- No file moves
- Minimal immediate risk
- Resource-based grouping is easy to search

**Disadvantages**

- Keeps two API ownership styles
- Leaves domain ownership unclear
- Makes `web/src/api` look like a special global layer when it contains
  feature/domain behavior

This is acceptable as a temporary state, but it should not remain undocumented.

### Option B: Put every API module under its consuming screen

For example:

```text
features/admin/approvals/api/
features/borrow/request/api/
```

**Advantages**

- API code appears close to one consumer

**Disadvantages**

- Duplicates or splits shared booking and equipment behavior
- Makes cache keys and invalidation harder to reason about
- Couples domain operations to one screen

This is not recommended.

### Option C: Use domain feature modules

```text
features/
├── auth/api/
├── bookings/api/
├── equipment/api/
├── landing/api/
└── users/api/
```

**Advantages**

- One ownership model for all domains
- Shared domain APIs remain reusable by admin and borrower features
- TanStack Query behavior stays with the domain it caches
- Removes the confusing global `web/src/api` layer

**Disadvantages**

- Requires import updates
- Requires deciding whether contact belongs to `landing` or a separate
  `contact` domain
- Does not by itself solve layout data loading

This is the recommended direction.

## Recommendation and migration status

The recommended **Option C** is now complete:

```text
frontend/web/src/
├── app/
├── components/ui/
├── features/
│   ├── auth/api/
│   ├── bookings/api/
│   ├── equipment/api/
│   ├── landing/api/
│   └── users/api/
├── hooks/
├── layouts/
└── lib/
```

The following boundaries are now in effect:

```text
frontend/shared
  Pure or intentionally cross-platform domain code.

frontend/web/src/components
  Reusable web UI primitives and presentational components.

frontend/web/src/features/*/api
  Domain request functions, React Query hooks, query keys, and invalidation.

frontend/web/src/lib
  Web infrastructure such as the configured API client and Query defaults.

frontend/web/src/app
  Providers, router, authorization composition, and application wiring.
```

The migration was mechanical: files were moved, imports were updated, and
exports and behavior were preserved. No tests were added. The shared transport
factory (`frontend/shared/lib/axios.js`) and web client configuration
(`frontend/web/src/lib/api-client.js`) were intentionally left unchanged.
Route adapters were removed, and layouts remain in `web/src/layouts` without
reorganization.

Suggested migration order:

1. `api/contact` to `features/landing/api`
2. `api/users` to `features/users/api`
3. `api/equipment` to `features/equipment/api`
4. `api/bookings` to `features/bookings/api`
5. Re-run import searches and inspect the final diff
6. Review layout data loading as a separate follow-up

The migration is complete; any future layout data-loading review remains a
separate behavior-sensitive refactor.

## Non-goals

This audit does not authorize or include:

- Moving files
- Changing API behavior
- Changing query keys or invalidation
- Changing the QueryClient configuration
- Moving React Query hooks into `frontend/shared`
- Replacing Axios, React Query, React Router, or Zustand
- Splitting or deleting `constants.js`
- Creating a React Native app or package
- Adding dependencies
- Adding tests
- Reorganizing layouts
- Rewriting feature boundaries

## Audit conclusion

The frontend is not fundamentally disorganized. Its feature UI structure,
shared UI primitives, and shared domain utilities are reasonable. The specific
architecture problem is that API code has two competing homes:

```text
features/auth/api
features/bookings/api
features/equipment/api
features/landing/api
features/users/api
```

The migration established the intended boundary: shared UI remains separate
from domain API modules, domain APIs live under feature folders, and
cross-platform code remains in `frontend/shared`. Direct lazy page imports
remain in the router, and layouts stay as a separate application-shell
boundary.
