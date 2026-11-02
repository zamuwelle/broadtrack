# Testing

Test setup, locations, and commands.

## Test configuration and setup

### Frontend

- **Framework**: Vite Plus (`vp test` / Vitest compatible) with `jsdom` environment.
- **Config file**: [`frontend/vite.config.js`](../../frontend/vite.config.js) defines workspace `test` settings (`environment: 'jsdom'`, `globals: true`, setup file `./web/src/test/setup.js`, include pattern `'**/*.{test,spec}.?(c|m)[jt]s?(x)'`).
- **Setup file**: [`frontend/web/src/test/setup.js`](../../frontend/web/src/test/setup.js) imports `@testing-library/jest-dom/vitest`, runs React Testing Library `cleanup()` in `afterEach`, and mocks `window.matchMedia`.
- **Test locations**:
    - Web UI and hooks: [`frontend/web/src/`](../../frontend/web/src/) colocated alongside source files as `*.test.js` or `*.test.jsx` (e.g. components, hooks, API hooks).
    - Shared schemas and utilities: [`frontend/shared/`](../../frontend/shared/) as `*.test.js` (e.g. [`frontend/shared/schemas/`](../../frontend/shared/schemas/) and [`frontend/shared/util/`](../../frontend/shared/util/)).

### Backend

- **Framework**: Pest PHP running on top of PHPUnit and Laravel's test suite.
- **Base setup**: [`backend/tests/Pest.php`](../../backend/tests/Pest.php) configures `TestCase::class`, binds `RefreshDatabase::class` to tests in `Feature`, extends expectations (`toBeOne`), and provides the `fakeImage()` helper.
- **Base class**: [`backend/tests/TestCase.php`](../../backend/tests/TestCase.php) extends `Illuminate\Foundation\Testing\TestCase`.
- **Test locations**:
    - Feature tests: [`backend/tests/Feature/Api/V1/`](../../backend/tests/Feature/Api/V1/) for versioned API endpoints, [`backend/tests/Feature/Console/`](../../backend/tests/Feature/Console/) for scheduled console commands, and root [`backend/tests/Feature/`](../../backend/tests/Feature/) for feature mail transport.
    - Unit tests: [`backend/tests/Unit/`](../../backend/tests/Unit/) for isolated tests.

## Running tests

Run commands from the `frontend/` directory:

| Task                            | Command                 | Target / Behavior                                                                                  |
| :------------------------------ | :---------------------- | :------------------------------------------------------------------------------------------------- |
| **Frontend tests (single run)** | `bun run test:frontend` | Runs frontend tests once via `vp test run` across all frontend and shared tests.                   |
| **Frontend tests (watch mode)** | `vp test`               | Runs `vp test` in watch mode from `frontend/`, rerunning tests as files change.                    |
| **Backend tests**               | `bun run test:backend`  | Runs `(cd ../backend && php artisan test)` with Pest / PHPUnit.                                    |
| **Default test script**         | `bun run test`          | Runs frontend then backend and stops on failure (`bun run test:frontend && bun run test:backend`). |

> [!WARNING]
> Running `bun run check` from `frontend/` runs formatting (`bun run format`), linting (`bun run lint`), production build (`bun run build`), and browser error checks (`bun scripts/assert-no-browser-errors.js`). It can modify files and does not run backend tests.
