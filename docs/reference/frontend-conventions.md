# Frontend Architecture and Conventions

The web app is in [`frontend/web`](../../frontend/web/); browser-shared code is in [`frontend/shared`](../../frontend/shared/).

## Feature and route structure

Organize routed pages by business feature in `web/src/features`, with page components named `*Page.jsx`. Route adapters live in `web/src/routes`, are lazy-loaded by [`router.jsx`](../../frontend/web/src/app/router.jsx), and export a `Component` that renders the feature page. Keep route paths in [`paths.js`](../../frontend/web/src/config/paths.js). Route access is checked by [`ProtectedRoute`](../../frontend/web/src/app/authorization.jsx); keep feature behavior in the feature and use layouts for the application shell and navigation.

Keep one React component per `.jsx` file. Name component exports to match their files. Local helpers may stay beside a component when that keeps the code clear. Import directly from defining files rather than adding barrel files. Use `@/` for web modules and `@shared/` for shared modules.

## API data and shared code

TanStack Query hooks and mutations are grouped by domain in `web/src/api`; the `QueryClient` is configured in [`provider.jsx`](../../frontend/web/src/app/provider.jsx). The [`api-client.js`](../../frontend/web/src/lib/api-client.js) module creates the Axios HTTP client. Keep state used by one screen with that feature. Reuse domain API hooks where screens share server data.

Platform-independent helpers belong in `frontend/shared`. Existing sources include [`constants.js`](../../frontend/shared/constants.js), [`schemas/`](../../frontend/shared/schemas/), [`util/date.js`](../../frontend/shared/util/date.js), [`util/booking.js`](../../frontend/shared/util/booking.js), [`util/search.js`](../../frontend/shared/util/search.js), [`util/image.js`](../../frontend/shared/util/image.js), [`useSetState.js`](../../frontend/shared/hooks/useSetState.js), and the [`axios.js`](../../frontend/shared/lib/axios.js) and [`echo.js`](../../frontend/shared/lib/echo.js) client factories. The image helper uses the browser `Image` API to preload images; reuse it instead of duplicating that behavior.

## Existing UI building blocks

Check the nearest component under [`components/ui`](../../frontend/web/src/components/ui/) before adding a new primitive.

| Need | Existing component or hook |
| --- | --- |
| Labeled form control | [`FormField`](../../frontend/web/src/components/ui/form/FormField.jsx) |
| Text or password input | [`TextInput`](../../frontend/web/src/components/ui/form/TextInput.jsx), [`PasswordInput`](../../frontend/web/src/components/ui/form/PasswordInput.jsx) |
| Field error | [`ErrorText`](../../frontend/web/src/components/ui/form/ErrorText.jsx); the two inputs above already render it and reserve its row |
| Button or select | [`Button`](../../frontend/web/src/components/ui/Button.jsx), [`Select`](../../frontend/web/src/components/ui/Select.jsx) |
| Toast | [`Toast`](../../frontend/web/src/components/ui/Toast.jsx) with [`useToast`](../../frontend/web/src/hooks/ui/useToast.js) |
| Confirmation dialog | [`ConfirmModal`](../../frontend/web/src/components/ui/ConfirmModal.jsx) |

`ConfirmModal` handles focus and Escape for confirmation dialogs. Other modal shells have feature-specific behavior; check their implementation before relying on the same keyboard handling.

## Dates and time

[`frontend/shared/util/date.js`](../../frontend/shared/util/date.js) parses booking dates and formats date labels and calendar keys in `Asia/Manila`. Use its helpers for booking dates, including API timestamps that serialize with a UTC `Z`; do not slice the timestamp text to derive a Manila calendar day. The booking table uses timezone-naive `DATETIME` fields, so those database values are not inherently UTC.

The booking request summary uses [`useBookingDateDefaults`](../../frontend/web/src/features/borrow/request/useBookingDateDefaults.js). Its automatic start tracks the current minute while open; the automatic end is the next full hour. Manual choices are preserved while the summary stays open, and closing it resets the defaults.

## Tooling

The frontend configuration is [`vite.config.js`](../../frontend/vite.config.js). From `frontend/`, use `vp check` for lint and formatting checks, `vp lint` for linting, `vp fmt` for formatting, and `vp -C web build` to build the web app. `bun run check` formats the repository and runs frontend checks/build/browser checks; it can modify files. It does not run backend tests.
