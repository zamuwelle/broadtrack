<?php

use App\Enums\BookingStatus;
use App\Enums\EquipmentStatus;
use App\Events\BookingUpdated;
use App\Http\Controllers\Api\V1\BookingController;
use App\Http\Requests\Api\V1\ApproveBookingRequest;
use App\Http\Requests\Api\V1\RejectBookingRequest;
use App\Http\Requests\Api\V1\StoreBookingRequest;
use App\Models\Booking;
use App\Models\Equipment;
use App\Models\User;
use Database\Seeders\EquipmentSeeder;
use GuzzleHttp\Promise\FulfilledPromise;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Broadcasting\Broadcasters\Broadcaster;
use Illuminate\Broadcasting\BroadcastEvent;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Client\Request;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;

test('public booking events omit confidential booking attributes', function (): void {
    $booking = Booking::factory()->create(['purpose' => 'Private documentary', 'approval_note' => 'Private note']);
    $event = new BookingUpdated('created', $booking->id, $booking);
    $payload = (new ReflectionMethod(BroadcastEvent::class, 'getPayloadFromEvent'))
        ->invoke(new BroadcastEvent($event), $event);

    expect($payload)->toBe(['action' => 'created', 'bookingId' => $booking->id]);
});

test('booking notifications wait for successful transaction commit', function (): void {
    $events = collect();
    Event::listen(BookingUpdated::class, static fn (BookingUpdated $event) => $events->push($event));

    DB::transaction(function () use ($events): void {
        Booking::factory()->create();
        expect($events)->toBeEmpty();
    });

    expect($events)->toHaveCount(1);

    try {
        DB::transaction(static function (): void {
            Booking::factory()->create();
            throw new RuntimeException('rollback');
        });
    } catch (RuntimeException) {
    }

    expect($events)->toHaveCount(1);
});

test('broadcast outages do not fail committed booking creation', function (): void {
    $borrower = User::factory()->borrower()->create();
    $equipment = Equipment::factory()->create();
    $broadcaster = Mockery::mock(Broadcaster::class);
    $broadcaster->shouldReceive('broadcast')->andThrow(new RuntimeException('broadcast unavailable'));
    Broadcast::extend('audit-failing', static fn (): Broadcaster => $broadcaster);
    config(['broadcasting.default' => 'audit-failing', 'broadcasting.connections.audit-failing' => ['driver' => 'audit-failing']]);

    $this->actingAs($borrower)->postJson('/api/v1/bookings', [
        'purpose' => 'Shoot', 'start_date' => now()->addDay()->toDateString(),
        'end_date' => now()->addDays(2)->toDateString(), 'equipment_ids' => [$equipment->id],
    ])->assertCreated();

    expect(Booking::count())->toBe(1);
});

test('equipment serial input rejects another equipment serial', function (): void {
    $admin = User::factory()->admin()->create();
    $first = Equipment::factory()->create(['serial_no' => 'SN-EXPLICIT-1']);
    $second = Equipment::factory()->create();

    $this->actingAs($admin)->postJson('/api/v1/equipment', [
        'category' => 'Camera', 'name' => 'Other Camera', 'serial_no' => $first->serial_no,
    ])->assertUnprocessable()->assertJsonValidationErrors('serial_no');
    $this->putJson("/api/v1/equipment/{$second->id}", ['serial_no' => $first->serial_no])->assertUnprocessable();
    $this->putJson("/api/v1/equipment/{$first->id}", ['serial_no' => $first->serial_no])->assertOk();
});

test('malformed booking fields return validation errors', function (array $overrides): void {
    $borrower = User::factory()->borrower()->create();
    $equipment = Equipment::factory()->create();

    $this->actingAs($borrower)->postJson('/api/v1/bookings', array_merge([
        'purpose' => 'Shoot',
        'start_date' => now()->addDay()->toDateString(),
        'end_date' => now()->addDays(2)->toDateString(),
        'equipment_ids' => [$equipment->id],
    ], $overrides))->assertUnprocessable();
})->with([
    'invalid date' => [['start_date' => 'nonsense']],
    'scalar equipment' => [['equipment_ids' => '1']],
    'nested equipment' => [['equipment_ids' => [[1]]]],
]);

test('duplicate equipment selections do not create duplicate requests', function (): void {
    $borrower = User::factory()->borrower()->create();
    $equipment = Equipment::factory()->create();

    $this->actingAs($borrower)->postJson('/api/v1/bookings', [
        'purpose' => 'Shoot',
        'start_date' => now()->addDay()->toDateString(),
        'end_date' => now()->addDays(2)->toDateString(),
        'equipment_ids' => [$equipment->id, $equipment->id],
    ])->assertUnprocessable()->assertJsonValidationErrors('equipment_ids.0');

    expect(Booking::count())->toBe(0);
});

test('seeder continues the serial counter beyond four digits', function (): void {
    Equipment::factory()->create(['brand' => 'Behringer', 'serial_no' => 'SN-BEH-10000']);
    $this->seed(EquipmentSeeder::class);

    $this->assertDatabaseHas('equipments', ['serial_no' => 'SN-BEH-10001']);
    $this->assertDatabaseHas('equipments', ['serial_no' => 'SN-BEH-10002']);
});

test('equipment uploads isolate legacy duplicate serial assets', function (): void {
    Schema::table('equipments', static function (Blueprint $table): void {
        $table->dropUnique(['serial_no']);
    });
    config(['services.cloudinary.cloud_name' => 'test']);
    Http::fake(['api.cloudinary.com/*' => Http::response(['secure_url' => 'https://res.cloudinary.com/test/image/upload/new.webp'])]);
    $admin = User::factory()->admin()->create();
    $first = Equipment::factory()->create(['serial_no' => 'LEGACY-DUPLICATE']);
    $second = Equipment::factory()->create(['serial_no' => 'LEGACY-DUPLICATE']);

    $this->actingAs($admin)->postJson("/api/v1/equipment/{$first->id}/upload", ['image' => fakeImage()])->assertOk();
    $this->actingAs($admin)->postJson("/api/v1/equipment/{$second->id}/upload", ['image' => fakeImage()])->assertOk();

    $ids = Http::recorded()->map(static fn (array $pair): string => collect($pair[0]->data())->firstWhere('name', 'public_id')['contents']);
    expect($ids->unique())->toHaveCount(2);
});

test('deleting equipment preserves shared legacy images', function (): void {
    Http::fake();
    $admin = User::factory()->admin()->create();
    $equipment = Equipment::factory()->create([
        'serial_no' => 'LEGACY-DUPLICATE',
        'image' => 'https://res.cloudinary.com/test/image/upload/v1/broadtrack/legacy.webp',
    ]);

    $this->actingAs($admin)->deleteJson("/api/v1/equipment/{$equipment->id}")->assertNoContent();

    Http::assertNothingSent();
});

test('deleting equipment removes only its new dedicated image', function (): void {
    config(['services.cloudinary.cloud_name' => 'test']);
    Http::fake(static function (Request $request): FulfilledPromise {
        $parameters = collect($request->data())->pluck('contents', 'name');

        return Http::response(['secure_url' => 'https://res.cloudinary.com/test/image/upload/v1/broadtrack/'.$parameters->get('public_id').'.webp']);
    });
    $admin = User::factory()->admin()->create();
    $equipment = Equipment::factory()->create();
    $this->actingAs($admin)->postJson("/api/v1/equipment/{$equipment->id}/upload", ['image' => fakeImage()])->assertOk();
    $image = $equipment->fresh()->image;
    Http::fake(['api.cloudinary.com/*' => Http::response(['result' => 'ok'])]);

    $this->deleteJson("/api/v1/equipment/{$equipment->id}")->assertNoContent();

    Http::assertSent(static fn (Request $request): bool => str_ends_with($request->url(), '/destroy')
        && $request['public_id'] === 'broadtrack/'.pathinfo(parse_url($image, PHP_URL_PATH), PATHINFO_FILENAME));
});

test('legacy duplicate serial equipment remains editable when serial is unchanged', function (): void {
    Schema::table('equipments', static function (Blueprint $table): void {
        $table->dropUnique(['serial_no']);
    });
    $admin = User::factory()->admin()->create();
    $first = Equipment::factory()->create(['serial_no' => 'LEGACY-SHARED']);
    Equipment::factory()->create(['serial_no' => 'LEGACY-SHARED']);

    $this->actingAs($admin)->putJson("/api/v1/equipment/{$first->id}", [
        'serial_no' => 'LEGACY-SHARED', 'description' => 'Updated description',
    ])->assertOk()->assertJsonPath('data.description', 'Updated description');
});

test('sysadmin can update a managed user department', function (): void {
    $sysadmin = User::factory()->sysadmin()->create();
    $response = $this->actingAs($sysadmin)->postJson('/api/v1/users', [
        'firstname' => 'New', 'lastname' => 'Admin', 'email' => 'optional@laverdad.edu.ph',
        'password' => 'password123', 'role' => 'admin',
    ])->assertCreated()->assertJsonPath('data.department', null);

    $this->putJson('/api/v1/users/'.$response->json('data.id'), ['department' => null])->assertOk();
});

test('changing an admin without department to borrower requires department', function (): void {
    $sysadmin = User::factory()->sysadmin()->create();
    $admin = User::factory()->admin()->create(['department' => null]);

    $this->actingAs($sysadmin)->putJson("/api/v1/users/{$admin->id}", ['role' => 'borrower'])
        ->assertUnprocessable()->assertJsonValidationErrors('department');

    expect($admin->fresh()->isAdmin())->toBeTrue();
});

test('stale booking transitions cannot overwrite a terminal state', function (string $transition, BookingStatus $initial): void {
    $admin = User::factory()->admin()->create();
    $booking = Booking::factory()->create(['status' => $initial]);
    $stale = $booking->fresh();
    $booking->update(['status' => BookingStatus::Returned, 'return_date' => now()]);
    $this->actingAs($admin);
    $controller = app(BookingController::class);

    try {
        $response = match ($transition) {
            'approve' => $controller->approve(tap(app(ApproveBookingRequest::class), static fn (ApproveBookingRequest $request) => $request->validateResolved()), $stale),
            'reject' => $controller->reject(tap(RejectBookingRequest::create('/', 'PUT', ['rejection_reason' => 'Declined']), function (RejectBookingRequest $request) use ($admin): void {
                $request->setContainer(app())->setRedirector(app('redirect'));
                $request->setUserResolver(fn (): User => $admin);
                $request->validateResolved();
            }), $stale),
            'return' => $controller->markAsReturned(tap(HttpRequest::create('/'), static fn (HttpRequest $request) => $request->setUserResolver(static fn (): User => $admin)), $stale),
            'cancel' => $controller->cancel($stale),
        };
        expect($response->getStatusCode())->toBe(422);
    } catch (AuthorizationException $exception) {
        expect($exception->status() ?? 403)->toBe(403);
    }

    expect($booking->fresh()->status)->toBe(BookingStatus::Returned);
})->with([
    ['approve', BookingStatus::Pending],
    ['reject', BookingStatus::Approved],
    ['return', BookingStatus::Approved],
    ['cancel', BookingStatus::Approved],
]);

test('maintenance equipment cannot be approved', function (string $transition, BookingStatus $status): void {
    $admin = User::factory()->admin()->create();
    $equipment = Equipment::factory()->maintenance()->create();
    $booking = Booking::factory()->create(['status' => $status]);
    $booking->equipments()->attach($equipment);

    $this->actingAs($admin)->putJson("/api/v1/bookings/{$booking->id}/{$transition}")->assertUnprocessable();
    expect($booking->fresh()->status)->toBe($status);
})->with([['approve', BookingStatus::Pending]]);

test('booking store rechecks equipment maintenance after validation', function (): void {
    $borrower = User::factory()->borrower()->create();
    $equipment = Equipment::factory()->create();
    $this->actingAs($borrower);
    $request = StoreBookingRequest::create('/', 'POST', [
        'purpose' => 'Shoot', 'start_date' => now()->addDay()->toDateString(),
        'end_date' => now()->addDays(2)->toDateString(), 'equipment_ids' => [$equipment->id],
    ]);
    $request->setContainer(app())->setRedirector(app('redirect'));
    $request->setUserResolver(static fn (): User => $borrower);
    $request->validateResolved();
    $equipment->update(['status' => EquipmentStatus::Maintenance]);

    expect(app(BookingController::class)->store($request)->getStatusCode())->toBe(422);
    expect(Booking::count())->toBe(0);
});

test('reports export bookings with no department', function (): void {
    $admin = User::factory()->admin()->create(['department' => null]);
    Booking::factory()->approved()->create(['user_id' => $admin->id]);

    $this->actingAs($admin)->get('/api/v1/bookings/reports/xlsx')->assertOk();
    $this->get('/api/v1/bookings/reports/pdf')->assertOk();
});
