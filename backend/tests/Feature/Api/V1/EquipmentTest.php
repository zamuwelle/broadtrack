<?php

use App\Enums\BookingStatus;
use App\Enums\EquipmentCategory;
use App\Enums\EquipmentStatus;
use App\Models\Booking;
use App\Models\Equipment;
use App\Models\User;
use App\Services\CloudinaryService;

test('authenticated user can list equipment', function () {
    $user = User::factory()->borrower()->create();
    Equipment::factory()->count(3)->create();

    $response = $this->actingAs($user)->getJson('/api/v1/equipment');

    $response->assertOk()
        ->assertJsonCount(3, 'data');
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
    'booked' => [EquipmentStatus::Booked],
    'borrowed' => [EquipmentStatus::Borrowed],
    'maintenance' => [EquipmentStatus::Maintenance],
]);

test('booking lifecycle still derives live status and restores available after return', function (): void {
    $admin = User::factory()->admin()->create();
    $equipment = Equipment::factory()->available()->create();
    $booking = Booking::factory()->approved()->create([
        'start_date' => now()->subHour(),
        'end_date' => now()->addHour(),
    ]);
    $booking->equipments()->attach($equipment->id);

    $this->actingAs($admin)->getJson('/api/v1/equipment')
        ->assertOk()->assertJsonPath('data.0.status', EquipmentStatus::Booked->value);

    $booking->update(['status' => BookingStatus::Released]);

    $this->getJson('/api/v1/equipment')
        ->assertOk()->assertJsonPath('data.0.status', EquipmentStatus::Borrowed->value);

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

test('resolveStatuses marks approved booking within window as booked and released booking as borrowed', function () {
    $equipment1 = Equipment::factory()->available()->create(['name' => 'Camera Alpha']);
    $equipment2 = Equipment::factory()->available()->create(['name' => 'Camera Beta']);

    $approvedBooking = Booking::factory()->approved()->create([
        'start_date' => now()->subHour(),
        'end_date' => now()->addHours(2),
    ]);
    $approvedBooking->equipments()->attach($equipment1->id);

    $releasedBooking = Booking::factory()->released()->create([
        'start_date' => now()->subHour(),
        'end_date' => now()->addHours(2),
    ]);
    $releasedBooking->equipments()->attach($equipment2->id);

    $resolved = Equipment::resolveStatuses(collect([$equipment1, $equipment2]));

    expect($resolved->firstWhere('id', $equipment1->id)->status)->toBe(EquipmentStatus::Booked);
    expect($resolved->firstWhere('id', $equipment2->id)->status)->toBe(EquipmentStatus::Borrowed);
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
