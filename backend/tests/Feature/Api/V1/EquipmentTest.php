<?php

use App\Enums\BookingStatus;
use App\Enums\EquipmentCategory;
use App\Enums\EquipmentStatus;
use App\Models\Booking;
use App\Models\Equipment;
use App\Models\User;
use App\Services\CloudinaryService;
use Illuminate\Broadcasting\Broadcasters\Broadcaster;
use Illuminate\Support\Facades\Broadcast;

test('authenticated user can list equipment', function () {
    $user = User::factory()->borrower()->create();
    Equipment::factory()->count(3)->create();

    $response = $this->actingAs($user)->getJson('/api/v1/equipment');

    $response->assertOk()
        ->assertJsonCount(3, 'data');
});

test('equipment list includes the last updated time', function () {
    $user = User::factory()->borrower()->create();
    $equipment = Equipment::factory()->create();

    $this->actingAs($user)->getJson('/api/v1/equipment')
        ->assertOk()
        ->assertJsonPath('data.0.updated_at', $equipment->updated_at->toJSON());
});

test('admin can create equipment', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->postJson('/api/v1/equipment', [
        'category' => EquipmentCategory::Camera->value,
        'name' => 'Canon EOS R5',
        'brand' => 'Canon',
        'model' => 'EOS-R5',
        'status' => 'available',
        'description' => 'Professional 8K camera',
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.name', 'Canon EOS R5')
        ->assertJsonPath('data.category', EquipmentCategory::Camera->value)
        ->assertJsonPath('data.status', 'available');

    $this->assertDatabaseHas('equipments', [
        'name' => 'Canon EOS R5',
        'category' => EquipmentCategory::Camera->value,
    ]);
});

test('borrower cannot create equipment', function () {
    $borrower = User::factory()->borrower()->create();

    $response = $this->actingAs($borrower)->postJson('/api/v1/equipment', [
        'category' => EquipmentCategory::Camera->value,
        'name' => 'Forbidden Camera',
    ]);

    $response->assertForbidden();
});

test('admin can update equipment', function () {
    $admin = User::factory()->admin()->create();
    $equipment = Equipment::factory()->create(['name' => 'Original Name']);

    $response = $this->actingAs($admin)->putJson("/api/v1/equipment/{$equipment->id}", [
        'name' => 'Updated Camera Name',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.name', 'Updated Camera Name');

    $this->assertDatabaseHas('equipments', [
        'id' => $equipment->id,
        'name' => 'Updated Camera Name',
    ]);
});

test('admin selected live equipment status survives refetch', function (EquipmentStatus $status): void {
    $admin = User::factory()->admin()->create();
    $equipment = Equipment::factory()->available()->create();

    $this->actingAs($admin)->putJson("/api/v1/equipment/{$equipment->id}", [
        'status' => $status->value,
    ])->assertOk()->assertJsonPath('data.status', $status->value);

    $this->getJson('/api/v1/equipment')
        ->assertOk()
        ->assertJsonPath('data.0.status', $status->value);

    expect($equipment->fresh()->status)->toBe($status);
})->with([
    'available' => [EquipmentStatus::Available],
    'borrowed' => [EquipmentStatus::Borrowed],
    'maintenance' => [EquipmentStatus::Maintenance],
]);

test('admin cannot manually set equipment status to booked without active booking', function (): void {
    $admin = User::factory()->admin()->create();
    $equipment = Equipment::factory()->available()->create();

    $response = $this->actingAs($admin)->putJson("/api/v1/equipment/{$equipment->id}", [
        'status' => EquipmentStatus::Booked->value,
    ]);

    $response->assertStatus(422)
        ->assertJsonPath('message', 'Equipment can only be marked as booked through an approved booking.');
});

test('marking equipment borrowed leaves pending requests pending', function (): void {
    $admin = User::factory()->admin()->create();
    $equipment = Equipment::factory()->available()->create();
    $booking = Booking::factory()->pending()->create();
    $booking->equipments()->attach($equipment->id);

    $this->actingAs($admin)->putJson("/api/v1/equipment/{$equipment->id}", [
        'status' => EquipmentStatus::Borrowed->value,
    ])->assertOk()->assertJsonPath('data.status', EquipmentStatus::Borrowed->value);

    expect($booking->fresh()->status)->toBe(BookingStatus::Pending);
});

test('active approved booking keeps equipment booked until returned', function (): void {
    $admin = User::factory()->admin()->create();
    $equipment = Equipment::factory()->available()->create();
    $booking = Booking::factory()->approved()->create([
        'start_date' => now()->subHour(),
        'end_date' => now()->addHour(),
    ]);
    $booking->equipments()->attach($equipment->id);

    $this->actingAs($admin)->getJson('/api/v1/equipment')
        ->assertOk()->assertJsonPath('data.0.status', EquipmentStatus::Booked->value);

    $booking->update(['status' => BookingStatus::Returned]);

    $this->getJson('/api/v1/equipment')
        ->assertOk()->assertJsonPath('data.0.status', EquipmentStatus::Available->value);

    expect($equipment->fresh()->status)->toBe(EquipmentStatus::Available);
});

test('admin can upload equipment image', function () {
    $admin = User::factory()->admin()->create();
    $equipment = Equipment::factory()->create();

    $mockCloudinary = Mockery::mock(CloudinaryService::class);
    $mockCloudinary->shouldReceive('upload')
        ->once()
        ->andReturn(['secure_url' => 'https://res.cloudinary.com/test/equipment.webp']);
    $this->app->instance(CloudinaryService::class, $mockCloudinary);

    $file = fakeImage('camera.png');

    $response = $this->actingAs($admin)->postJson("/api/v1/equipment/{$equipment->id}/upload", [
        'image' => $file,
    ]);

    $response->assertOk()
        ->assertJsonPath('data.image', 'https://res.cloudinary.com/test/equipment.webp');
});

test('admin can delete equipment', function () {
    $admin = User::factory()->admin()->create();
    $equipment = Equipment::factory()->create();

    $response = $this->actingAs($admin)->deleteJson("/api/v1/equipment/{$equipment->id}");

    $response->assertNoContent();

    $this->assertDatabaseMissing('equipments', [
        'id' => $equipment->id,
    ]);
});

test('equipment helper methods and scopes work correctly', function () {
    $available = Equipment::factory()->available()->create([
        'category' => EquipmentCategory::Camera->value,
        'serial_no' => 'SN-CAM-00001',
    ]);
    $maintenance = Equipment::factory()->maintenance()->create([
        'category' => EquipmentCategory::Audio->value,
    ]);

    expect($available->isAvailable())->toBeTrue();
    expect($available->isUnderMaintenance())->toBeFalse();
    expect($available->imagePublicId())->toBe("equipment-{$available->id}");

    expect($maintenance->isAvailable())->toBeFalse();
    expect($maintenance->isUnderMaintenance())->toBeTrue();

    $cameras = Equipment::category(EquipmentCategory::Camera)->get();
    expect($cameras)->toHaveCount(1);
    expect($cameras->first()->id)->toBe($available->id);
});

test('admin cannot delete equipment that is booked or borrowed', function () {
    $admin = User::factory()->admin()->create();
    $booked = Equipment::factory()->create(['status' => EquipmentStatus::Booked]);
    $borrowed = Equipment::factory()->borrowed()->create();

    $res1 = $this->actingAs($admin)->deleteJson("/api/v1/equipment/{$booked->id}");
    $res1->assertStatus(422)
        ->assertJsonPath('message', 'Cannot delete equipment that is currently booked or borrowed.');

    $res2 = $this->actingAs($admin)->deleteJson("/api/v1/equipment/{$borrowed->id}");
    $res2->assertStatus(422);

    $this->assertDatabaseHas('equipments', ['id' => $booked->id]);
    $this->assertDatabaseHas('equipments', ['id' => $borrowed->id]);
});

test('admin cannot delete equipment with historical bookings', function () {
    $admin = User::factory()->admin()->create();
    $equipment = Equipment::factory()->available()->create();
    $booking = Booking::factory()->returned()->create();
    $booking->equipments()->attach($equipment->id);

    $response = $this->actingAs($admin)->deleteJson("/api/v1/equipment/{$equipment->id}");
    $response->assertStatus(422)
        ->assertJsonPath('message', 'Cannot delete equipment that has associated booking records.');

    $this->assertDatabaseHas('equipments', ['id' => $equipment->id]);
});

test('resolveStatuses keeps active approved bookings booked until they are returned', function (): void {
    $equipment = Equipment::factory()->available()->create(['name' => 'Camera Alpha']);
    $booking = Booking::factory()->approved()->create([
        'start_date' => now()->subHour(),
        'end_date' => now()->addHours(2),
    ]);
    $booking->equipments()->attach($equipment->id);

    $resolved = Equipment::resolveStatuses(collect([$equipment]));

    expect($resolved->first()->status)->toBe(EquipmentStatus::Booked);
});

test('generateSerial computes unit number based on count rather than id', function () {
    $first = Equipment::create([
        'name' => 'Tripod Pro',
        'category' => EquipmentCategory::Support->value,
    ]);
    expect($first->serial_no)->toBe('SN-TRI-0001');

    Equipment::create([
        'name' => 'Studio Light',
        'category' => EquipmentCategory::Lighting->value,
    ]);

    $second = Equipment::create([
        'name' => 'Tripod Pro',
        'category' => EquipmentCategory::Support->value,
    ]);
    expect($second->serial_no)->toBe('SN-TRI-0002');
});

test('equipment mutations succeed when the broadcast transport fails', function (string $method, string $action, int $status): void {
    $admin = User::factory()->admin()->create();
    $equipment = Equipment::factory()->create();
    $payloads = collect();
    $broadcaster = Mockery::mock(Broadcaster::class);
    $broadcaster->shouldReceive('broadcast')->andReturnUsing(static function (array $channels, string $event, array $payload) use ($payloads): never {
        $payloads->push(['event' => $event, 'payload' => $payload]);
        throw new RuntimeException('transport unavailable');
    });
    Broadcast::extend('audit-failing', static fn (): Broadcaster => $broadcaster);
    config(['broadcasting.default' => 'audit-failing', 'broadcasting.connections.audit-failing' => ['driver' => 'audit-failing']]);
    $uri = $method === 'POST' ? '/api/v1/equipment' : "/api/v1/equipment/{$equipment->id}";

    $response = $this->actingAs($admin)->json($method, $uri, ['name' => 'Studio Camera', 'category' => 'Camera'])->assertStatus($status);

    $id = $method === 'POST' ? $response->json('data.id') : $equipment->id;
    expect($payloads->first())->toBe(['event' => 'equipment.changed', 'payload' => ['action' => $action, 'equipmentId' => $id]]);
    $method === 'DELETE'
        ? $this->assertDatabaseMissing('equipments', ['id' => $id])
        : $this->assertDatabaseHas('equipments', ['id' => $id, 'name' => 'Studio Camera']);
})->with([['POST', 'created', 201], ['PUT', 'updated', 200], ['DELETE', 'deleted', 204]]);

test('authenticated user can view single equipment', function () {
    $user = User::factory()->borrower()->create();
    $equipment = Equipment::factory()->create(['name' => 'Specific Camera']);

    $response = $this->actingAs($user)->getJson("/api/v1/equipment/{$equipment->id}");

    $response->assertOk()
        ->assertJsonPath('data.id', $equipment->id)
        ->assertJsonPath('data.name', 'Specific Camera');
});

test('guest cannot view single equipment', function () {
    $equipment = Equipment::factory()->create();

    $response = $this->getJson("/api/v1/equipment/{$equipment->id}");

    $response->assertUnauthorized();
});

test('admin cannot change status to available or borrowed when equipment has active approved bookings', function (EquipmentStatus $targetStatus): void {
    $admin = User::factory()->admin()->create();
    $equipment = Equipment::factory()->available()->create();
    $booking = Booking::factory()->approved()->create([
        'start_date' => now()->subHour(),
        'end_date' => now()->addHour(),
    ]);
    $booking->equipments()->attach($equipment->id);

    $response = $this->actingAs($admin)->putJson("/api/v1/equipment/{$equipment->id}", [
        'status' => $targetStatus->value,
    ]);

    $response->assertStatus(422)
        ->assertJsonPath('message', 'Cannot change status while equipment is currently booked.');
})->with([
    'available' => [EquipmentStatus::Available],
    'borrowed' => [EquipmentStatus::Borrowed],
]);

test('admin changing equipment to maintenance auto-rejects pending and approved bookings', function (): void {
    $admin = User::factory()->admin()->create();
    $equipment = Equipment::factory()->available()->create();
    $pendingBooking = Booking::factory()->pending()->create();
    $pendingBooking->equipments()->attach($equipment->id);
    $approvedBooking = Booking::factory()->approved()->create();
    $approvedBooking->equipments()->attach($equipment->id);
    $returnedBooking = Booking::factory()->returned()->create();
    $returnedBooking->equipments()->attach($equipment->id);

    $response = $this->actingAs($admin)->putJson("/api/v1/equipment/{$equipment->id}", [
        'status' => EquipmentStatus::Maintenance->value,
    ]);

    $response->assertOk()
        ->assertJsonPath('data.status', EquipmentStatus::Maintenance->value);

    expect($equipment->fresh()->status)->toBe(EquipmentStatus::Maintenance);

    $pendingFresh = $pendingBooking->fresh();
    expect($pendingFresh->status)->toBe(BookingStatus::Rejected)
        ->and($pendingFresh->rejection_reason)->toBe('Equipment is under maintenance.');

    $approvedFresh = $approvedBooking->fresh();
    expect($approvedFresh->status)->toBe(BookingStatus::Rejected)
        ->and($approvedFresh->rejection_reason)->toBe('Equipment is under maintenance.');

    expect($returnedBooking->fresh()->status)->toBe(BookingStatus::Returned);
});
