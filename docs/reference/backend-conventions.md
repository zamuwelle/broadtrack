# Backend conventions

The Laravel backend is in [`backend/`](../../backend/). This page covers development conventions, patterns, and testing.

## Code structure and imports

- **PHP imports**: Declare class imports with `use` at the top of the file. Do not use inline fully qualified class names.
- **Strict typing**: Add explicit parameter and return types to every method, function, and closure.
- **Short callbacks**: Use short arrow functions (`fn (...) => ...`) for short callbacks and collection transforms.

## Requests, controllers, and responses

1. **Form Requests**: All validation goes in dedicated Form Requests under [`backend/app/Http/Requests/Api/V1/`](../../backend/app/Http/Requests/Api/V1/).
    - Reuse shared rules from [`HasUserRules`](../../backend/app/Http/Requests/Concerns/HasUserRules.php) (`nameRules`, `passwordRules`, `schoolEmailRule`) across Form Requests; declare email restrictions directly when requests do not share the trait. See [Allowed email domains](../architecture/auth-lifecycle.md#allowed-email-domains).
    - Ignore the bound route model for unique constraints on update, as in [`UpdateUserRequest`](../../backend/app/Http/Requests/Api/V1/UpdateUserRequest.php).
    - Validate backed enums with `Rule::enum(...)`.
2. **Authorization policies**: Enforce permissions using policies under [`backend/app/Policies/`](../../backend/app/Policies/) via `$this->authorize(...)`.
3. **API Resources**: Format JSON responses with API Resources under [`backend/app/Http/Resources/Api/V1/`](../../backend/app/Http/Resources/Api/V1/).
    - Wrap optional relationships with `$this->whenLoaded(...)` to avoid N+1 queries.
    - Do not run database queries inside resource transformation methods.
4. **Base controller helpers**: Extend [`ApiController`](../../backend/app/Http/Controllers/Api/ApiController.php) for standard response helpers:
    - `$this->success($data, $message, $status = 200)`
    - `$this->created($data, $message)`
    - `$this->noContent()`
    - `$this->error($message, $status = 400, $errors = null)`

## Models and enums

Use backed string enums for statuses, roles, and categories:

- [`BookingStatus`](../../backend/app/Enums/BookingStatus.php): `pending`, `approved`, `rejected`, `returned`, `cancelled`.
- [`EquipmentStatus`](../../backend/app/Enums/EquipmentStatus.php): `available`, `booked`, `borrowed`, `maintenance`.
- [`UserRole`](../../backend/app/Enums/UserRole.php): `borrower`, `admin`, `sysadmin`.
- [`Department`](../../backend/app/Enums/Department.php): Institutional academic departments.
- [`EquipmentCategory`](../../backend/app/Enums/EquipmentCategory.php): Equipment classifications.

### Model conventions

- **PHP attributes**: Use attributes for model metadata (`#[Fillable(...)]`, `#[Appends(...)]`, `#[ObservedBy(...)]`, `#[Table(...)]`), matching [`User`](../../backend/app/Models/User.php), [`Booking`](../../backend/app/Models/Booking.php), and [`Equipment`](../../backend/app/Models/Equipment.php).
- **Casts method**: Define model attribute casting in `casts(): array`.
- **Model pruning**: Use `Prunable` trait and implement `prunable(): Builder`.

## Concurrency and booking integrity

- **Transactions and locks**: Booking creation, approval, and equipment status updates must execute inside database transactions using `lockForUpdate()` row locks.
- **Conflict checking**: Use half-open interval overlap in `Booking::scopeOverlapping` (`start_date < requested_end AND end_date > requested_start`) against approved bookings.
- **Status rules**: Enforce inventory status rules and deletion restrictions defined in the [borrowing lifecycle](../workflows/borrowing-lifecycle.md#equipment-inventory-statuses).

## Timezone handling

- **Database columns**: Timestamps in bookings use timezone-naive `dateTime` SQL columns.
- **Application timezone**: `APP_TIMEZONE` falls back to `UTC`, and `backend/.env.example` sets `Asia/Manila`.
- **Serialization**: Eloquent serializes date attributes as UTC ISO 8601 strings ending in `Z`.
- **Display**: Convert dates to `Asia/Manila` in API resources or frontend helpers. Never slice raw UTC strings to extract local calendar days.

## Observers, events, and background jobs

- **Observers**: Model observers ([`BookingObserver`](../../backend/app/Observers/BookingObserver.php), [`EquipmentObserver`](../../backend/app/Observers/EquipmentObserver.php), [`UserObserver`](../../backend/app/Observers/UserObserver.php)) broadcast state changes over Reverb; they do not invalidate server caches. `BookingObserver` broadcasts both `BookingUpdated` and `EquipmentUpdated`.
- **After-commit dispatch**: `BookingUpdated` implements `ShouldDispatchAfterCommit` to broadcast only after successful database commits. `EquipmentUpdated` and `UserUpdated` do not implement `ShouldDispatchAfterCommit` and broadcast immediately.
- **Queued mail**: Enqueue mail via `Mail::to(...)->queue(...)` using configured transport (such as Brevo API transport). Reminder tasks acquire atomic cache locks and set deduplication markers only after successful dispatch.
- **Console scheduler**: [`backend/routes/console.php`](../../backend/routes/console.php) is a schedule map. Place business logic in command classes under `app/Console/Commands/`.

## Testing and verification

- **Feature tests**: Write Pest PHP tests in `backend/tests/Feature/Api/V1/`.
- **Setup**: [`backend/tests/Pest.php`](../../backend/tests/Pest.php) configures `RefreshDatabase` and test helpers like `fakeImage()`.
- **Commands** (run from `frontend/`):
    - Run backend tests: `bun run test:backend`
    - Check code style: `bun run lint:backend`
    - Format code: `bun run format:backend`
