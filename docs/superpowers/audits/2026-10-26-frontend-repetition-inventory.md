# Frontend Repetition Audit

## Scope

This audit covers the React/Vite frontend under `frontend/web` and the browser-shared
code under `frontend/shared`. It records a baseline before the approved refactor and
will be updated after the refactor with the actual final counts and diff review.

Tests are intentionally out of scope for this pass while the folder structure and
test organization are being revised.

## Baseline

- Date: 2026-10-26
- Branch: `dev`
- Baseline state: working tree was already dirty before this audit.
- Existing unrelated changes must be preserved, including backend report/logging/PDF
  work, existing frontend `cn` and RHF/Zod changes, `backend/storage/fonts/`, and
  `mermaid.md`.
- The final review must compare only the audit/refactor changes with this baseline.

## Initial findings

Counts below are search evidence, not reduction claims. Final counts must be
recomputed after the refactor.

| Category | Baseline evidence | Initial decision |
| --- | --- | --- |
| Query defaults and overrides | Global defaults in `web/src/lib/react-query.js`; provider consumes them once; query hooks accept optional `queryConfig`; `/me` has intentional auth-specific options | Keep the split, document the boundary, do not duplicate defaults |
| Mutation configuration | Multiple user and booking mutations repeat `useMutation`, caller callback forwarding, and domain invalidation | Audit first; keep invalidation explicit; extract only if the final contract is identical |
| `useSend` wrapper | One wrapper around `useMutation`; four auth call sites were identified in the current code | Prefer direct TanStack Query usage if it preserves the returned mutation surface and Toast behavior |
| Form state and validation | Auth, user, and contact forms were migrated to RHF/Zod; equipment and booking forms remain candidates | Finish only the two remaining major forms; keep image and booking-domain state outside RHF |
| Partial local state | `useSetState` is used in 14 frontend locations, including pages, modals, auth, inventory, and booking | Keep where grouped UI state is clearer; do not mechanically replace it |
| Loading/empty/error rendering | Repeated `isLoading`, `isError`, empty-state, and fallback branches appear across admin, borrowing, and contact features | Compare behavior before extracting; prefer existing `EmptyState` and feature-local copy |
| Modal and confirmation flows | `ConfirmModal` has four current feature usages; other feature-specific modal shells also exist | Reuse existing `ConfirmModal`; do not create a universal modal without identical behavior |
| Side effects | Browser storage, timers, event listeners, and subscriptions occur across auth, Toast, dropdowns, booking, navigation, and Echo hooks | Audit lifecycle and cleanup; keep auth and booking effects domain-local |
| API request functions | API modules use Axios request functions; auth feature APIs also call Axios directly; downloads have special response behavior | Keep API contracts domain-local; review only redundant wrappers |
| Date and booking logic | Booking request logic and shared date utilities contain substantial domain-specific behavior, including Asia/Manila handling | Keep existing date helpers and booking calculations; no new date library |
| Tailwind composition | Existing `cn` package is used by shared UI primitives; many feature class strings remain | Use `cn` where conditional/override composition benefits; do not rewrite static markup mechanically |
| Dependencies | `package.json` includes React Query, RHF, Zod, Zustand, Axios, Echo, routing, date/UI packages, and `cn` | Map imports before adding or removing packages; no new dependency in this audit phase |

## Planned audit decisions

### Keep

- TanStack Query for server state, caching, mutations, invalidation, and query
  defaults.
- React Hook Form and Zod for forms and validation.
- Zustand for booking/cart client state.
- Existing Toast, UI primitives, `useSetState`, and date/image helpers where their
  behavior is already shared and intentional.

### Candidate cleanup

- Remove `useSend` if direct `useMutation` has the same behavior.
- Consolidate API error extraction only when identical logic exists across at least
  three features.
- Normalize repeated mutation module structure without hiding query invalidation.
- Remove helpers and imports proven unused after the migration.

### Explicitly feature-local

- Authentication URL/storage synchronization.
- Booking date defaults, overlap checks, and timezone-sensitive formatting.
- Equipment image preview/upload lifecycle.
- Domain-specific modal copy, status presentation, and notification behavior.

## Final review table

This section is intentionally completed after implementation.

| Category | Baseline evidence | Final evidence | Actual reduction | Decision | Validation |
| --- | --- | --- | --- | --- | --- |
| Query configuration | Global defaults in `lib/react-query.js`; provider consumes them once; API hooks expose optional `queryConfig` | Same behavior; boundary documented in `docs/reference/frontend-conventions.md` | No code duplication removed; documentation clarified | Keep global defaults and intentional per-query overrides | `bun run build` passed |
| Forms and validation | Auth, users, and contact migrated; equipment and booking still use feature state | Equipment and booking intentionally unchanged; remaining migration is isolated as deferred work | No additional reduction in this audit | Keep RHF/Zod for migrated forms; dedicated follow-up for equipment/booking | Existing lint baseline and build passed |
| API errors | Auth has domain-specific mapping; user forms repeat simple email/global fallback | No generic helper added because identical extraction was not proven across three features | 0 helpers added; avoided premature abstraction | Keep special cases local; revisit after remaining form work | Lint passed with existing warnings |
| Mutation configuration | User and booking modules repeat explicit `useMutation` and invalidation structure | Domain invalidation remains explicit; no opaque factory added | 0 behavior-hiding abstractions | Keep domain API modules readable and explicit | Build passed |
| `useSend` wrapper | One wrapper around `useMutation` with four auth consumers | Auth uses `useMutation` directly; wrapper deleted and search confirms no callers | Removed one wrapper file and one indirection layer | Prefer direct TanStack Query when no behavior is added | Lint and build passed |
| UI and modal abstractions | `ConfirmModal` used by four features; other modal shells differ | No universal modal added; existing primitives remain | 0 unsafe cross-feature extractions | Keep feature-specific modal behavior local | No UI behavior changes |
| Side effects and derived state | Storage, timers, listeners, Echo, and booking date effects are domain-specific | No generic lifecycle helper added | 0 behavior-risky extractions | Keep auth, booking, and Echo effects domain-aware | No side-effect code changed |
| Dependencies | Existing React Query, RHF, Zod, Zustand, Axios, routing, Echo, date/UI packages, and `cn` are actively used | No dependency added or removed | 0 package changes | Keep current minimum set; audit again after folder restructuring | Build passed |
