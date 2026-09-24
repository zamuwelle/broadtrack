# Frontend Architecture and Conventions

The web app is in [`frontend/web`](../../frontend/web/); browser-shared code is in [`frontend/shared`](../../frontend/shared/).

## Feature and route structure

Organize routed pages by business feature in `web/src/features`, with page components named `*Page.jsx`. The [`router.jsx`](../../frontend/web/src/app/router.jsx) file lazy-loads page components directly and owns route composition. Keep route paths in [`paths.js`](../../frontend/web/src/config/paths.js). Route access is checked by [`ProtectedRoute`](../../frontend/web/src/app/authorization.jsx); keep feature behavior in the feature and use layouts for the application shell and navigation.

Keep one React component per `.jsx` file. Name component exports to match their files. Local helpers may stay beside a component when that keeps the code clear. Import directly from defining files rather than adding barrel files. Use `@/` for web modules and `@shared/` for shared modules.

The entry point in [`main.jsx`](../../frontend/web/src/main.jsx) initializes auth data from the URL before rendering the app under `StrictMode`. [`App.jsx`](../../frontend/web/src/app/App.jsx) composes the app provider and router. The provider creates the QueryClient and registers the unauthorized-response handler; the router owns role checks through `ProtectedRoute` around protected route groups.

## API data and shared code

The shared [`axios.js`](../../frontend/shared/lib/axios.js) module provides the
transport factory. The web [`api-client.js`](../../frontend/web/src/lib/api-client.js)
owns browser-specific client configuration. Domain request functions, TanStack
Query hooks, query keys, and invalidation belong in
`web/src/features/*/api`; keep state used by one screen with that feature and
reuse domain API hooks where screens share server data.

### TanStack Query configuration

Application-wide QueryClient defaults live in [`react-query.js`](../../frontend/web/src/lib/react-query.js) and are passed to the QueryClient once by [`provider.jsx`](../../frontend/web/src/app/provider.jsx). Keep defaults such as stale time, garbage-collection time, refetch behavior, and retry policy there rather than copying them into every API module.

API hooks under `web/src/features/*/api` may accept a `queryConfig` override when a particular consumer needs different behavior. Use overrides only for intentional differences, such as authentication-specific settings, disabled queries, or a screen-specific freshness requirement. The API module owns the query key and query function; the feature owns why it needs an override. Mutations own invalidation for the domain data they change, while the provider owns no domain behavior.

Use TanStack Query for server data. Keep screen-only state in its feature. The borrow equipment selection cart is an exception to in-memory screen state: [`useBookingCartStore`](../../frontend/web/src/features/borrow/stores/useBookingCartStore.js) uses Zustand persistence in browser storage so selected equipment survives a reload. Keep this behavior in the borrow feature rather than moving it into shared code.

Platform-independent helpers belong in `frontend/shared`. Existing sources include [`constants.js`](../../frontend/shared/constants.js), [`schemas/`](../../frontend/shared/schemas/), [`util/date.js`](../../frontend/shared/util/date.js), [`util/booking.js`](../../frontend/shared/util/booking.js), [`util/search.js`](../../frontend/shared/util/search.js), [`util/image.js`](../../frontend/shared/util/image.js), [`useSetState.js`](../../frontend/shared/hooks/useSetState.js), and the [`axios.js`](../../frontend/shared/lib/axios.js) and [`echo.js`](../../frontend/shared/lib/echo.js) client factories. The image helper uses the browser `Image` API to preload images; reuse it instead of duplicating that behavior.

The web app's Echo client in [`lib/echo.js`](../../frontend/web/src/lib/echo.js) configures the shared factory for Reverb. The factory returns `null` when no app key is configured, so consumers must account for realtime being unavailable in that environment.

## Existing UI building blocks

Check the nearest component under [`components/ui`](../../frontend/web/src/components/ui/) before adding a new primitive.

| Need                   | Existing component or hook                                                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Labeled form control   | [`FormField`](../../frontend/web/src/components/ui/form/FormField.jsx)                                                                                 |
| Text or password input | [`TextInput`](../../frontend/web/src/components/ui/form/TextInput.jsx), [`PasswordInput`](../../frontend/web/src/components/ui/form/PasswordInput.jsx) |
| Field error            | [`ErrorText`](../../frontend/web/src/components/ui/form/ErrorText.jsx); the two inputs above already render it and reserve its row                     |
| Button or select       | [`Button`](../../frontend/web/src/components/ui/Button.jsx), [`Select`](../../frontend/web/src/components/ui/Select.jsx)                               |
| Toast                  | [`Toast`](../../frontend/web/src/components/ui/Toast.jsx) with [`useToast`](../../frontend/web/src/hooks/ui/useToast.js)                               |
| Confirmation dialog    | [`ConfirmModal`](../../frontend/web/src/components/ui/ConfirmModal.jsx)                                                                                |

`ConfirmModal` handles focus and Escape for confirmation dialogs. Other modal shells have feature-specific behavior; check their implementation before relying on the same keyboard handling.

## Dates and time

[`frontend/shared/util/date.js`](../../frontend/shared/util/date.js) parses booking dates and formats date labels and calendar keys in `Asia/Manila`. Use its helpers for booking dates, including API timestamps that serialize with a UTC `Z`; do not slice the timestamp text to derive a Manila calendar day. The booking table uses timezone-naive `DATETIME` fields, so those database values are not inherently UTC.

The booking request summary uses [`useBookingDateDefaults`](../../frontend/web/src/features/borrow/request/useBookingDateDefaults.js). Its automatic start tracks the current minute while open; the automatic end is the next full hour. Manual choices are preserved while the summary stays open, and closing it resets the defaults.

## Forms and linting

Use React Hook Form and Zod for web form state and validation. Keep reusable
schemas in `frontend/shared/schemas`; keep React Hook Form wiring in the owning
web feature. The Vite Plus lint configuration has scoped exceptions for the
React Hook Form compiler-compatibility warning and complexity/line-count
thresholds in the existing auth and user form components. These exceptions are
limited to those files; new forms should still satisfy the normal lint rules.

## Testing

Vite Plus provides the frontend test runner; do not add a separate Vitest
runner. Place tests beside the code they verify using `*.test.js` or
`*.test.jsx`. Test deterministic shared schemas and helpers first, then
feature forms and API hooks, and add page-flow tests only for important user
journeys. Presentational components do not need individual tests unless they
own meaningful behavior.

Run frontend tests from `frontend/`:

```bash
bun run test:frontend
bun run test:frontend:watch
```

The existing `bun run test` command remains the backend test command. Frontend
tests use jsdom and the shared setup in
[`web/src/test/setup.js`](../../frontend/web/src/test/setup.js); network
boundaries should be mocked rather than requiring Laravel or a real HTTP
server.

## Tooling

The workspace lint configuration is [`vite.config.js`](../../frontend/vite.config.js), and web aliases, plugins, and the jsdom test setup are in [`web/vite.config.js`](../../frontend/web/vite.config.js). Tailwind CSS v4 theme tokens and global styles are in [`root.css`](../../frontend/web/src/root.css); feature-specific styles are imported by [`index.css`](../../frontend/web/src/index.css). From `frontend/`, use `vp check` for lint and formatting checks, `bun run lint:frontend` for the repository’s frontend lint command, `vp fmt` for formatting, and `vp -C web build` to build the web app. `bun run check` formats the repository and runs frontend checks/build/browser checks; it can modify files. It does not run backend tests.
