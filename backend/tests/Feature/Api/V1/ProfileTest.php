<?php

use App\Enums\Department;
use App\Models\User;
use App\Services\CloudinaryService;

test('unauthenticated user cannot access profile', function () {
    $response = $this->getJson('/api/v1/me');

    $response->assertUnauthorized();
});

test('authenticated user can view their profile', function () {
    $user = User::factory()->borrower()->create([
        'firstname' => 'Alice',
        'lastname' => 'Walker',
    ]);

    $response = $this->actingAs($user)->getJson('/api/v1/me');

    $response->assertOk()
        ->assertJsonPath('data.firstname', 'Alice')
        ->assertJsonPath('data.lastname', 'Walker')
        ->assertJsonMissingPath('data.phone');
});

test('user can update their profile information', function () {
    $user = User::factory()->borrower()->create();

    $response = $this->actingAs($user)->putJson('/api/v1/profile', [
        'firstname' => 'UpdatedName',
        'lastname' => 'UpdatedLast',
        'department' => 'BS Information Systems',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.firstname', 'UpdatedName')
        ->assertJsonPath('data.lastname', 'UpdatedLast');

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'firstname' => 'UpdatedName',
    ]);
});

test('user can upload profile picture', function () {
    $user = User::factory()->borrower()->create();

    $mockCloudinary = Mockery::mock(CloudinaryService::class);
    $mockCloudinary->shouldReceive('upload')
        ->once()
        ->andReturn(['secure_url' => 'https://res.cloudinary.com/test/avatar.webp']);
    $this->app->instance(CloudinaryService::class, $mockCloudinary);

    $file = fakeImage('avatar.png');

    $response = $this->actingAs($user)->postJson('/api/v1/profile/picture', [
        'image' => $file,
    ]);

    $response->assertOk()
        ->assertJsonPath('data.profile_picture', 'https://res.cloudinary.com/test/avatar.webp');

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'profile_picture' => 'https://res.cloudinary.com/test/avatar.webp',
    ]);
});

test('bearer authentication returns typed or empty department shorthand', function (?Department $department, ?string $shorthand): void {
    $admin = User::factory()->admin()->create(['department' => $department]);
    $token = $admin->createToken('profile-test')->plainTextToken;

    $this->withToken($token)->getJson('/api/v1/me')->assertOk()
        ->assertJsonPath('data.id', $admin->id)
        ->assertJsonPath('data.department_shorthand', $shorthand);
})->with([[Department::InformationSystems, 'BSIS'], [null, null]]);
