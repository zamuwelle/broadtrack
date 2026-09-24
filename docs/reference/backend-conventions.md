# Backend Architecture and Conventions

The Laravel API, routes, and tests live in [`backend/`](../../backend/). Follow nearby code when adding or changing a feature; current conventions do not mean every existing controller follows one pattern.

## Requests, controllers, and responses

Use Form Requests for request validation, policies for authorization, and API Resources for response shaping where those patterns fit. Keep controllers focused and inspect the full flow before moving existing transactions or queries. Put PHP imports at the top of the file. Give new or changed methods, functions, and closures explicit parameter and return types.

The [`ApiController`](../../backend/app/Http/Controllers/Api/ApiController.php) helpers return success `message` and `status`, with optional `data`; error helpers return `message` and optional `errors`. Framework-generated JSON exceptions, downloads, and 204 responses can use different response shapes. Resources should use `whenLoaded(...)` for optional relationships instead of querying relationships during serialization.

## Models and domain values

Inspect [`backend/app/Enums/`](../../backend/app/Enums/) for existing backed enums before adding domain strings. Current booking values are `pending`, `approved`, `rejected`, `returned`, and `cancelled`; equipment values are `available`, `booked`, `borrowed`, and `maintenance`. See [`BookingStatus`](../../backend/app/Enums/BookingStatus.php) and [`EquipmentStatus`](../../backend/app/Enums/EquipmentStatus.php).

Models use PHP attributes for configuration and the `casts()` method for casts; see [`User`](../../backend/app/Models/User.php), [`Booking`](../../backend/app/Models/Booking.php), and [`Equipment`](../../backend/app/Models/Equipment.php). Reuse shared request rules such as [`HasUserRules`](../../backend/app/Http/Requests/Concerns/HasUserRules.php) and follow the unique-update pattern in [`UpdateUserRequest`](../../backend/app/Http/Requests/Api/V1/UpdateUserRequest.php). For an unshipped schema change, update its original migration during development.

## Booking integrity and dates

Booking creation and approval lock the affected equipment and recheck overlaps with approved bookings inside transactions. Other transitions lock the booking row and apply their own status checks. Preserve these checks when changing booking behavior. An approved booking contributes to the computed `booked` equipment status, except when equipment is under maintenance. The application does not automatically transition equipment to `borrowed` when a booking time arrives.

Booking database columns use timezone-naive `DATETIME` values. The frontend treats input without a timezone as Manila local time; Laravel parses that request under its configured timezone (`APP_TIMEZONE`, falling back to UTC). Eloquent date casts serialize as UTC ISO timestamps ending in `Z`. Format returned values with the API/frontend date helpers; do not slice the UTC timestamp to get a Manila calendar day. The booking migration and [`BookingTest`](../../backend/tests/Feature/Api/V1/BookingTest.php) show these storage and serialization details.

## Events and queued work

Inspect event contracts and observers before changing side effects. Booking and equipment observers broadcast updates; they do not invalidate cache. [`BookingUpdated`](../../backend/app/Events/BookingUpdated.php) dispatches after commit, while [`EquipmentUpdated`](../../backend/app/Events/EquipmentUpdated.php) has a different dispatch contract. A queued mail call means the message was accepted for queuing, not delivered. Keep reminder cache locks and write success markers only after enqueue succeeds so failures can retry.

Keep [`routes/console.php`](../../backend/routes/console.php) as the schedule map and put command logic in command classes. Use Eloquent `Prunable` on models that define pruning.

## Tests and checks

Pest feature tests use [`tests/Pest.php`](../../backend/tests/Pest.php), which configures `RefreshDatabase` for Feature tests and defines `fakeImage()`. Put API feature tests under `backend/tests/Feature/Api/V1`; console command tests may live elsewhere under Feature.

From `frontend/`, run `bun run test:backend` for backend tests and `bun run lint:backend` for Pint checks. These commands do not establish production behavior or mail delivery.
