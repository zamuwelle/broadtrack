# Frontend Architecture & Conventions

BroadTrack's frontend is a React 19 Single Page Application built on Vite, adhering to strict Zero-Barrel Direct Import and Feature-Grouped architectural rules.

---

## 1. Zero Barrels & Direct File Imports

- Never create or use barrel files (`index.js` or `index.jsx`).
- Every import must point directly to its exact file name:
    ```javascript
    // Bad (Barrel import)
    import { Button, FormField } from '@/components/ui'
    import { formatDate } from '@shared'

    // Good (Direct file import)
    import { Button } from '@/components/ui/Button'
    import { FormField } from '@/components/ui/form/FormField'
    import { formatDate } from '@shared/util/date'
    ```

---

## 2. Path Aliases

- In `frontend/web`: Always use the `@/...` alias for internal web modules.
- In `frontend/shared`: Always use the `@shared/...` alias for shared platform-agnostic modules.
- Never use relative imports (`./` or `../`).

---

## 3. Feature Directory Organization

Features are located in `frontend/web/src/features/` and organized by domain:

```text
src/features/
├── borrow/
│   ├── equipment/
│   │   ├── EquipmentPage.jsx
│   │   └── components/          # EquipmentCard, EquipmentExpandedCard
│   ├── calendar/
│   │   ├── CalendarPage.jsx
│   │   └── components/          # CalendarGrid, CalendarHeader
│   └── slips/
│       ├── SlipsPage.jsx
│       └── components/          # BookingSlipCard, Barcode
├── admin/
│   ├── dashboard/DashboardPage.jsx
│   ├── approvals/ApprovalsPage.jsx
│   ├── inventory/InventoryPage.jsx
│   ├── transactions/TransactionsPage.jsx
│   └── users/UsersPage.jsx
└── landing/
    ├── LandingPage.jsx
    ├── TermsPage.jsx
    └── PrivacyPage.jsx
```

Feature pages and their domain components live together in the matching subfeature directory. Layout shells live in `src/layouts/`; their navigation components live in `src/layouts/components/`.

---

## 4. Thin Route Adapters

All route files in `src/routes/` are 3-line adapters lazy-loaded by React Router:

```jsx
// src/routes/borrow/Equipment.jsx
import { EquipmentPage } from '@/features/borrow/equipment/EquipmentPage'

export const Component = () => <EquipmentPage />
```

---

## 5. Router-Level Protection

Route access is guarded at the router level in `src/app/router.jsx` via `<ProtectedRoute allowedRoles={...} />`.

- Intercepts unauthenticated or unauthorized users before layouts or data-fetching hooks ever mount.
- Prevents unauthorized layout renders and eliminates N+1 flash redirects.

---

## 6. Toolchain, Linting & Formatting (Vite+)

BroadTrack uses **Vite+** (`vp` CLI) as its unified frontend toolchain:

- **Centralized Configuration:** All linting and formatting settings live in [`frontend/vite.config.js`](../../frontend/vite.config.js) under the `lint` and `fmt` blocks.
- **Oxlint:** High-performance Rust-based linter run via `vp lint`. Enforces single-component files (`react/no-multi-comp`), hooks rules, accessibility, and zero-barrel imports (`oxc/no-barrel-file`).
- **Oxfmt:** Rust-based code formatter run via `vp fmt`. Adheres to Prettier standards (tab width 4, single quotes, no semicolons, no trailing commas).
- **Automatic Ignore Resolution:** Both Oxlint and Oxfmt automatically respect [`frontend/.gitignore`](../../frontend/.gitignore) out of the box without requiring `.prettierignore`.
- **Validation Pipeline:** Run `vp check` to check both formatting and linting concurrently.

---

## 7. Campus Timezone & Date Standardization

Because BroadTrack manages physical media equipment located on campus, all date formatting and calculation functions in [`frontend/shared/util/date.js`](file:///home/sam/git/broadtrack/frontend/shared/util/date.js) strictly enforce the Philippine campus timezone:

- **Target Timezone:** `Asia/Manila` (UTC+8).
- **Wall-Clock Consistency:** Dates and times are displayed in campus local time regardless of the browser or operating system's local timezone.
- **Intl Formatter:** Uses native `Intl.DateTimeFormat` with `{ timeZone: 'Asia/Manila' }` across `formatDate`, `formatDateTime`, `formatSimpleDate`, `formatDateRange`, and `getTodayDateString`.
