<?php

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
    expect($available->imagePublicId())->toBe('sn-cam-00001');

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
