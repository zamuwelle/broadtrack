<?php

use App\Enums\EquipmentCategory;
use App\Enums\EquipmentStatus;
use App\Models\Booking;
use App\Models\Equipment;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\File;

afterEach(function (): void {
    if (! File::exists(storage_path('fonts/.gitignore'))) {
        File::ensureDirectoryExists(storage_path('fonts'));
        File::put(storage_path('fonts/.gitignore'), "*\n!.gitignore\n");
    }
});

test('standard success envelope is returned across core endpoints', function (): void {
    $sysadmin = User::factory()->sysadmin()->create();
    $borrower = User::factory()->borrower()->create();
    $equipment = Equipment::factory()->available()->create();
    $booking = Booking::factory()->approved()->create(['user_id' => $borrower->id]);
    $booking->equipments()->attach($equipment->id);

    $meResponse = $this->actingAs($borrower)->getJson('/api/v1/me');
    $meResponse->assertOk()
        ->assertJsonStructure([
            'status',
            'message',
            'data',
        ]);
    expect($meResponse->json('status'))->toBe(200)
        ->and($meResponse->json('message'))->toBe('Success.')
        ->and($meResponse->json('data.id'))->toBe($borrower->id);

    $equipmentResponse = $this->actingAs($borrower)->getJson('/api/v1/equipment');
    $equipmentResponse->assertOk()
        ->assertJsonStructure([
            'status',
            'message',
            'data',
        ]);
    expect($equipmentResponse->json('status'))->toBe(200)
        ->and($equipmentResponse->json('message'))->toBe('Success.')
        ->and($equipmentResponse->json('data'))->toBeArray()
        ->and(count($equipmentResponse->json('data')))->toBeGreaterThanOrEqual(1);

    $bookingResponse = $this->actingAs($borrower)->getJson('/api/v1/bookings');
    $bookingResponse->assertOk()
        ->assertJsonStructure([
            'status',
            'message',
            'data',
        ]);
    expect($bookingResponse->json('status'))->toBe(200)
        ->and($bookingResponse->json('message'))->toBe('Success.')
        ->and($bookingResponse->json('data'))->toBeArray()
        ->and(count($bookingResponse->json('data')))->toBeGreaterThanOrEqual(1);

    $usersResponse = $this->actingAs($sysadmin)->getJson('/api/v1/users');
    $usersResponse->assertOk()
        ->assertJsonStructure([
            'status',
            'message',
            'data',
        ]);
    expect($usersResponse->json('status'))->toBe(200)
        ->and($usersResponse->json('message'))->toBe('Success.')
        ->and($usersResponse->json('data'))->toBeArray()
        ->and(count($usersResponse->json('data')))->toBeGreaterThanOrEqual(1);
});

test('validation error envelope returns 422 with message and errors keyed by field', function (): void {
    $admin = User::factory()->admin()->create();
    $borrower = User::factory()->borrower()->create();

    $equipmentResponse = $this->actingAs($admin)->postJson('/api/v1/equipment', []);
    $equipmentResponse->assertUnprocessable()
        ->assertJsonStructure([
            'message',
            'errors' => ['category', 'name'],
        ]);
    expect($equipmentResponse->json('message'))->toBeString()
        ->and($equipmentResponse->json('errors'))->toBeArray()
        ->and($equipmentResponse->json('errors.name'))->toBeArray()
        ->and($equipmentResponse->json('errors.category'))->toBeArray();

    $bookingResponse = $this->actingAs($borrower)->postJson('/api/v1/bookings', []);
    $bookingResponse->assertUnprocessable()
        ->assertJsonStructure([
            'message',
            'errors' => ['equipment_ids', 'purpose', 'start_date', 'end_date'],
        ]);
    expect($bookingResponse->json('message'))->toBeString()
        ->and($bookingResponse->json('errors'))->toBeArray()
        ->and($bookingResponse->json('errors.equipment_ids'))->toBeArray()
        ->and($bookingResponse->json('errors.purpose'))->toBeArray()
        ->and($bookingResponse->json('errors.start_date'))->toBeArray()
        ->and($bookingResponse->json('errors.end_date'))->toBeArray();
});

test('authorization statuses enforce 401 unauthenticated and 403 wrong role', function (): void {
    $borrower = User::factory()->borrower()->create();
    $admin = User::factory()->admin()->create();
    $equipment = Equipment::factory()->available()->create();

    $this->getJson('/api/v1/me')->assertUnauthorized();
    $this->getJson('/api/v1/equipment')->assertUnauthorized();
    $this->getJson('/api/v1/bookings')->assertUnauthorized();
    $this->getJson('/api/v1/users')->assertUnauthorized();
    $this->deleteJson("/api/v1/equipment/{$equipment->id}")->assertUnauthorized();
    $this->deleteJson("/api/v1/users/{$borrower->id}")->assertUnauthorized();

    $this->actingAs($borrower)->postJson('/api/v1/equipment', [
        'name' => 'Camera',
        'category' => EquipmentCategory::Camera->value,
    ])->assertForbidden();

    $this->actingAs($borrower)->deleteJson("/api/v1/equipment/{$equipment->id}")
        ->assertForbidden();

    $this->actingAs($borrower)->getJson('/api/v1/users')
        ->assertForbidden();

    $this->actingAs($borrower)->deleteJson("/api/v1/users/{$admin->id}")
        ->assertForbidden();

    $this->actingAs($admin)->getJson('/api/v1/users')
        ->assertForbidden();

    $this->actingAs($admin)->deleteJson("/api/v1/users/{$borrower->id}")
        ->assertForbidden();
});

test('delete endpoints return 204 no content on successful deletion', function (): void {
    $sysadmin = User::factory()->sysadmin()->create();
    $admin = User::factory()->admin()->create();
    $equipment = Equipment::factory()->available()->create();
    $targetUser = User::factory()->borrower()->create();

    $equipmentResponse = $this->actingAs($admin)->deleteJson("/api/v1/equipment/{$equipment->id}");
    $equipmentResponse->assertNoContent();
    $this->assertDatabaseMissing('equipments', ['id' => $equipment->id]);

    $userResponse = $this->actingAs($sysadmin)->deleteJson("/api/v1/users/{$targetUser->id}");
    $userResponse->assertNoContent();
    $this->assertSoftDeleted('users', ['id' => $targetUser->id]);
});

test('booking borrower identity is redacted for non-owners in calendar view', function (): void {
    $borrower = User::factory()->borrower()->create([
        'firstname' => 'Secret',
        'lastname' => 'Borrower',
    ]);
    $viewer = User::factory()->borrower()->create();
    $equipment = Equipment::factory()->available()->create();

    $booking = Booking::factory()->approved()->create([
        'user_id' => $borrower->id,
        'purpose' => 'Confidential Project',
    ]);
    $booking->equipments()->attach($equipment->id);

    $response = $this->actingAs($viewer)->getJson('/api/v1/bookings?view=calendar');
    $response->assertOk();

    $item = collect($response->json('data'))->firstWhere('id', $booking->id);
    expect($item)->not->toBeNull()
        ->and($item['user'])->toBeNull()
        ->and($item['user_id'])->toBeNull()
        ->and($item['purpose'])->toBeNull()
        ->and(isset($item['borrower_name']))->toBeFalse();
});

test('booking resource formats date labels in Asia Manila timezone', function (): void {
    $borrower = User::factory()->borrower()->create();
    $equipment = Equipment::factory()->available()->create();

    $booking = Booking::factory()->approved()->create([
        'user_id' => $borrower->id,
        'start_date' => Carbon::parse('2026-12-01 08:00:00', 'Asia/Manila'),
        'end_date' => Carbon::parse('2026-12-03 17:00:00', 'Asia/Manila'),
    ]);
    $booking->equipments()->attach($equipment->id);

    $response = $this->actingAs($borrower)->getJson("/api/v1/bookings/{$booking->id}");
    $response->assertOk();

    $data = $response->json('data');
    expect($data['date_range_label'])->toBe('December 1-3, 2026')
        ->and($data['date_time_range_label'])->toBe('December 1, 2026, 08:00 AM – December 3, 2026, 05:00 PM');
});

test('equipment dynamic status resolves to booked for active approved booking', function (): void {
    $borrower = User::factory()->borrower()->create();
    $equipment = Equipment::factory()->available()->create();

    $booking = Booking::factory()->approved()->create([
        'user_id' => $borrower->id,
        'start_date' => now()->subHour(),
        'end_date' => now()->addHours(2),
    ]);
    $booking->equipments()->attach($equipment->id);

    $response = $this->actingAs($borrower)->getJson('/api/v1/equipment');
    $response->assertOk();

    $item = collect($response->json('data'))->firstWhere('id', $equipment->id);
    expect($item['status'])->toBe(EquipmentStatus::Booked->value);

    $singleResponse = $this->actingAs($borrower)->getJson("/api/v1/equipment/{$equipment->id}");
    $singleResponse->assertOk();
    expect($singleResponse->json('data.status'))->toBe(EquipmentStatus::Booked->value);
});

test('booking report PDF export succeeds when fonts directory is deleted and recreates it', function (): void {
    $admin = User::factory()->admin()->create();
    $borrower = User::factory()->borrower()->create();
    $equipment = Equipment::factory()->available()->create();

    $booking = Booking::factory()->approved()->create(['user_id' => $borrower->id]);
    $booking->equipments()->attach($equipment->id);

    $fontsPath = storage_path('fonts');
    File::deleteDirectory($fontsPath);
    expect(File::isDirectory($fontsPath))->toBeFalse();

    $response = $this->actingAs($admin)->get('/api/v1/bookings/reports/pdf');

    $response->assertOk()
        ->assertHeader('content-type', 'application/pdf');
    expect($response->getContent())->not->toBeEmpty()
        ->and(File::isDirectory($fontsPath))->toBeTrue();
});

test('booking slip PDF export succeeds when fonts directory is deleted and recreates it', function (): void {
    $borrower = User::factory()->borrower()->create();
    $equipment = Equipment::factory()->available()->create();

    $booking = Booking::factory()->approved()->create(['user_id' => $borrower->id]);
    $booking->equipments()->attach($equipment->id);

    $fontsPath = storage_path('fonts');
    File::deleteDirectory($fontsPath);
    expect(File::isDirectory($fontsPath))->toBeFalse();

    $response = $this->actingAs($borrower)->get("/api/v1/bookings/{$booking->id}/slip/pdf");

    $response->assertOk()
        ->assertHeader('content-type', 'application/pdf');
    expect($response->getContent())->not->toBeEmpty()
        ->and(File::isDirectory($fontsPath))->toBeTrue();
});
