# Frontend conventions

The Broadtrack frontend consists of a React 19 single-page application in [`frontend/web/`](../../frontend/web/) and a shared library in [`frontend/shared/`](../../frontend/shared/).

## Feature and route structure

Routed pages are in `frontend/web/src/features/` with page component filenames ending in `*Page.jsx`.

- **Router lazy-loading**: [`frontend/web/src/app/router.jsx`](../../frontend/web/src/app/router.jsx) lazy-loads page components and defines route hierarchies directly.
- **Path constants**: Use route URLs defined in [`frontend/web/src/config/paths.js`](../../frontend/web/src/config/paths.js).
- **Route authorization**: Guard access at the router level with [`ProtectedRoute`](../../frontend/web/src/app/authorization.jsx) returning `children ?? <Outlet />`. Do not place access checks inside layout components.
- **Import aliases**: Use `@/` for `frontend/web/src/` and `@shared/` for `frontend/shared/`. Do not use relative imports (`../../`) or barrel files; import directly from the defining file.
- **Component exports**: Maintain one React component per `.jsx` file with component export names matching the filename. Separate component exports from non-component constants.
- **App setup**: [`frontend/web/src/main.jsx`](../../frontend/web/src/main.jsx) handles auth tokens from URL before mounting. [`frontend/web/src/app/App.jsx`](../../frontend/web/src/app/App.jsx) configures `AppProvider` (TanStack Query client and HTTP 401 redirect handler) and `AppRouter`.

## API client and server state

1. **Axios factory**: [`frontend/shared/lib/axios.js`](../../frontend/shared/lib/axios.js) creates Axios instances configured with authentication headers, normalized error handling, and null payloads on HTTP 204.
2. **API client**: [`frontend/web/src/lib/api-client.js`](../../frontend/web/src/lib/api-client.js) initializes the client with base URL and `localStorage` auth token retrieval.
3. **TanStack Query**: Defaults in [`frontend/web/src/lib/react-query.js`](../../frontend/web/src/lib/react-query.js) (`staleTime: 5m`, `gcTime: 1h`, `refetchOnWindowFocus: false`). Features supply custom `queryConfig` overrides when needed.
4. **Feature API layer**: Store API functions, Query hooks, and mutations in `frontend/web/src/features/*/api`. Mutations manage cache invalidation. Components call domain hooks rather than invoking the API client directly.
5. **Cart state**: Zustand store with local storage persistence in [`useBookingCartStore`](../../frontend/web/src/features/borrow/stores/useBookingCartStore.js) (`broadtrack-booking-cart`).

## Real-time synchronization

- **Echo factory**: [`frontend/shared/lib/echo.js`](../../frontend/shared/lib/echo.js) wraps Laravel Echo and Pusher.js for Reverb.
- **Web Echo**: [`frontend/web/src/lib/echo.js`](../../frontend/web/src/lib/echo.js) creates the client instance (returns `null` if WebSocket key is missing).
- **Event subscriptions**: [`useEvents`](../../frontend/web/src/hooks/queries/useEvents.js) listens on `bookings`, `equipment`, and `users` public channels, invalidating related Query caches upon changes.

## Shared code library

Shared code lives in [`frontend/shared/`](../../frontend/shared/):

- [`constants.js`](../../frontend/shared/constants.js): Roles, departments, categories, and statuses.
- [`schemas/`](../../frontend/shared/schemas/): Shared Zod validation schemas.
- [`util/date.js`](../../frontend/shared/util/date.js): Manila timezone date formatting and calculations.
- [`util/booking.js`](../../frontend/shared/util/booking.js): Booking badge styles and ticket helpers.
- [`util/search.js`](../../frontend/shared/util/search.js): Client search helpers.
- [`util/image.js`](../../frontend/shared/util/image.js): Image preloader using browser `Image` API.
- [`hooks/useSetState.js`](../../frontend/shared/hooks/useSetState.js): Merged state hook.

## Reusable UI primitives

Inspect existing primitives in [`frontend/web/src/components/ui/`](../../frontend/web/src/components/ui/) before adding new ones:

| Need                | Existing Primitive                                                                                                                                     | Details                                                                                                       |
| :------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------ |
| **Field wrapper**   | [`FormField`](../../frontend/web/src/components/ui/form/FormField.jsx)                                                                                 | Label typography, optional badge, and wrapper.                                                                |
| **Input fields**    | [`TextInput`](../../frontend/web/src/components/ui/form/TextInput.jsx), [`PasswordInput`](../../frontend/web/src/components/ui/form/PasswordInput.jsx) | Renders [`ErrorText`](../../frontend/web/src/components/ui/form/ErrorText.jsx) and reserves `h-4 mt-1` space. |
| **Button / select** | [`Button`](../../frontend/web/src/components/ui/Button.jsx), [`Select`](../../frontend/web/src/components/ui/Select.jsx)                               | Themed variants with loading and disabled states.                                                             |
| **Toast**           | [`Toast`](../../frontend/web/src/components/ui/Toast.jsx), [`useToast`](../../frontend/web/src/hooks/ui/useToast.js)                                   | Toast display and programmatic trigger.                                                                       |
| **Confirmation**    | [`ConfirmModal`](../../frontend/web/src/components/ui/ConfirmModal.jsx)                                                                                | Modal dialog with focus trap and Escape handler.                                                              |

## Date and time handling

- **Manila timezone**: [`frontend/shared/util/date.js`](../../frontend/shared/util/date.js) formats calendar dates and booking intervals in `Asia/Manila`. Do not slice UTC ISO strings ending in `Z` to extract local days.
- **Dynamic defaults**: [`useBookingDateDefaults`](../../frontend/web/src/features/borrow/request/useBookingDateDefaults.js) defaults start time to current minute and end time to next full hour while modal remains open.

## Testing and developer commands

Tests run via Vite Plus and jsdom with setup in [`frontend/web/src/test/setup.js`](../../frontend/web/src/test/setup.js). Place tests beside code as `*.test.js` or `*.test.jsx`.

Run from `frontend/`:

- Dev server: `bun run dev` (full stack) or `bun run dev:frontend` (Vite only)
- Lint: `vp lint` or `bun run lint:frontend`
- Format: `vp fmt`
- Build: `vp -C web build`
- Tests and checks: See [Testing reference](testing.md#running-tests) for test suite execution (`bun run test`, `bun run test:frontend`, `vp test`, `bun run test:backend`) and repository checks (`bun run check`).
