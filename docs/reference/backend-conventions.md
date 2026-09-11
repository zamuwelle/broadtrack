# Backend Architecture & Conventions

BroadTrack's backend is a Laravel 13 REST API using PHP Attributes, thin controllers, and domain separation.

---

## 1. PHP Imports & Code Cleanliness

- **Top-Level Imports Only:** Never use inline PHP imports (e.g. `\App\Models\User`, `\Illuminate\Support\Str`). All `use` statements must be declared at the top of the file.
- **Truthy-First Conditions:** Always prefer positive/truthy conditions first. Avoid unnecessary negations or double-negative logic.

---

## 2. Thin Controllers & Form Requests

Controllers never perform raw validation, manual database queries, or authorization logic inline:

```php
// app/Http/Controllers/Api/V1/EquipmentController.php
class EquipmentController extends ApiController
{
    public function store(StoreEquipmentRequest $request): JsonResponse
    {
        $this->authorize('create', Equipment::class);
        $equipment = Equipment::create($request->validated());

        return $this->created(new EquipmentResource($equipment));
    }
}
```

- **Authorization:** Handled via `$this->authorize(...)` and auto-discovered Policies.
- **Validation:** Delegated to dedicated Form Request classes (`app/Http/Requests/Api/V1/`).
- **Shared Rules:** Reusable validation concerns (e.g., `HasUserRules`) for common rules.

---

## 3. Eloquent Models & Laravel 13 Attributes

Class configuration is declared via PHP Attributes directly above the class instead of scattered protected properties:

```php
namespace App\Models;

use App\Observers\UserObserver;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Prunable;
use Illuminate\Foundation\Auth\User as Authenticatable;

#[ObservedBy(UserObserver::class)]
#[Fillable(['firstname', 'lastname', 'email', 'password', 'role', 'department'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Prunable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'role' => UserRole::class,
            'department' => Department::class,
        ];
    }

    public function prunable(): Builder
    {
        return static::whereNull('email_verified_at')
            ->where('created_at', '<=', now()->subHours(24));
    }
}
```

---

## 4. Backed Enums for Domain Values

Never use raw string literals (e.g., `'pending'`, `'admin'`) across models, queries, validation rules, or controllers. Always use backed Enums:

- `BookingStatus` (`Pending`, `Approved`, `Released`, `Returned`, `Rejected`, `Cancelled`)
- `EquipmentStatus` (`Available`, `UnderMaintenance`, `Retired`)
- `UserRole` (`Borrower`, `Admin`, `SysAdmin`)
- `Department` (`BSIS`, `BSAIS`, `BAB`, etc.)

---

## 5. Observers & Real-Time Broadcasting

Model lifecycle side-effects (cache invalidation, WebSockets, notifications) are handled in dedicated Observers:

- Attached via `#[ObservedBy(ModelObserver::class)]`.
- Broadcast typed WebSocket events via Laravel Reverb on `created`, `updated`, and `deleted`.

---

## 6. Console Schedulers & Commands

- **`routes/console.php`:** Strictly a thin scheduler map containing only `Schedule::command(...)` calls.
- **`app/Console/Commands/`:** Business logic encapsulated into dedicated Command classes using PHP attributes (`#[Signature]`, `#[Description]`).
- **`Prunable`:** Models define their own cleanup conditions via `prunable()` instead of writing custom cleanup commands.

---

## 7. Testing with Pest PHP

All backend tests are written as expressive Feature tests in `tests/Feature/Api/V1/` using Pest:

```php
test('user can re-register with unverified email', function () {
    $user = User::factory()->unverified()->create();

    $response = $this->postJson('/api/v1/register', [
        'firstname' => 'Jane',
        'lastname' => 'Doe',
        'email' => $user->email,
        'password' => 'newpassword123',
        'department' => 'BS Information Systems',
    ]);

    $response->assertCreated();
});
```
