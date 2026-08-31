<?php

use App\Models\Category;
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
    $category = Category::factory()->create();

    $response = $this->actingAs($admin)->postJson('/api/v1/equipment', [
        'category_id' => $category->id,
        'name' => 'Canon EOS R5',
        'brand' => 'Canon',
        'model' => 'EOS-R5',
        'status' => 'available',
        'description' => 'Professional 8K camera',
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.name', 'Canon EOS R5')
        ->assertJsonPath('data.status', 'available');

    $this->assertDatabaseHas('equipments', [
        'name' => 'Canon EOS R5',
    ]);
});

test('borrower cannot create equipment', function () {
    $borrower = User::factory()->borrower()->create();
    $category = Category::factory()->create();

    $response = $this->actingAs($borrower)->postJson('/api/v1/equipment', [
        'category_id' => $category->id,
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
