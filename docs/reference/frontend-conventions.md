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
│   ├── EquipmentPage.jsx        # Top-level view for Equipment catalog
│   ├── CalendarPage.jsx         # Top-level view for Calendar
│   ├── SlipsPage.jsx            # Top-level view for Booking Slips
│   ├── equipment/components/    # EquipmentCard, EquipmentExpandedCard
│   ├── calendar/components/     # CalendarGrid, CalendarHeader
│   └── slips/components/        # BookingSlipCard, Barcode
├── admin/
│   ├── DashboardPage.jsx        # Top-level view for Admin Dashboard
│   ├── ApprovalsPage.jsx        # Top-level view for Approvals
│   ├── InventoryPage.jsx        # Top-level view for Inventory
│   ├── TransactionsPage.jsx     # Top-level view for Transactions
│   ├── UsersPage.jsx            # Top-level view for User Management
│   └── [domain]/components/     # Grouped subcomponents
└── landing/
    ├── LandingPage.jsx          # Public home view
    ├── TermsPage.jsx            # Terms of service
    └── PrivacyPage.jsx          # Privacy policy
```

---

## 4. Thin Route Adapters

All route files in `src/routes/` are 3-line adapters lazy-loaded by React Router:

```jsx
// src/routes/borrow/Equipment.jsx
import { EquipmentPage } from '@/features/borrow/EquipmentPage'

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

- **Centralized Configuration:** All linting and formatting settings live in [`frontend/vite.config.ts`](file:///home/sam/git/broadtrack/frontend/vite.config.ts) under the `lint` and `fmt` blocks.
- **Oxlint:** High-performance Rust-based linter run via `vp lint`. Enforces single-component files (`react/no-multi-comp`), hooks rules, accessibility, and zero-barrel imports (`oxc/no-barrel-file`).
- **Oxfmt:** Rust-based code formatter run via `vp fmt`. Adheres to Prettier standards (tab width 4, single quotes, no semicolons, no trailing commas).
- **Automatic Ignore Resolution:** Both Oxlint and Oxfmt automatically respect [`.gitignore`](file:///home/sam/git/broadtrack/.gitignore) out of the box without requiring `.prettierignore`.
- **Validation Pipeline:** Run `vp check` to check both formatting and linting concurrently.

---

## 7. Campus Timezone & Date Standardization

Because BroadTrack manages physical media equipment located on campus, all date formatting and calculation functions in [`frontend/shared/util/date.js`](file:///home/sam/git/broadtrack/frontend/shared/util/date.js) strictly enforce the Philippine campus timezone:

- **Target Timezone:** `Asia/Manila` (UTC+8).
- **Wall-Clock Consistency:** Dates and times are displayed in campus local time regardless of the browser or operating system's local timezone.
- **Intl Formatter:** Uses native `Intl.DateTimeFormat` with `{ timeZone: 'Asia/Manila' }` across `formatDate`, `formatDateTime`, `formatSimpleDate`, `formatDateRange`, and `getTodayDateString`.
