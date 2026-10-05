<?php

use App\Enums\Department;
use App\Models\User;

test('unauthenticated user cannot access profile', function (): void {
    $response = $this->getJson('/api/v1/me');

    $response->assertUnauthorized();
});

test('authenticated user can view their profile', function (): void {
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

test('borrower can update their own profile', function (): void {
    $user = User::factory()->borrower()->create(['firstname' => 'Alice']);
    $other = User::factory()->borrower()->create(['firstname' => 'Other']);
    $this->actingAs($user)->putJson('/api/v1/profile', [
        'firstname' => 'Updated', 'lastname' => 'Name',
        'department' => Department::InformationSystems->value, 'role' => 'admin',
    ])->assertOk()->assertJsonPath('data.firstname', 'Updated');
    $this->assertDatabaseHas('users', ['id' => $user->id, 'firstname' => 'Updated', 'role' => $user->role->value]);
    $this->assertDatabaseHas('users', ['id' => $other->id, 'firstname' => 'Other']);
});

test('profile updates require authentication and valid details', function (): void {
    $this->putJson('/api/v1/profile', ['firstname' => 'Updated'])->assertUnauthorized();
    $this->actingAs(User::factory()->borrower()->create())
        ->putJson('/api/v1/profile', ['firstname' => '', 'department' => 'invalid'])
        ->assertUnprocessable()->assertJsonValidationErrors(['firstname', 'department']);
});

test('profile picture upload remains unavailable', function (): void {
    $this->actingAs(User::factory()->borrower()->create())->postJson('/api/v1/profile/picture')->assertNotFound();
});

test('bearer authentication returns typed or empty department shorthand', function (?Department $department, ?string $shorthand): void {
    $admin = User::factory()->admin()->create(['department' => $department]);
    $token = $admin->createToken('profile-test')->plainTextToken;

    $this->withToken($token)->getJson('/api/v1/me')->assertOk()
        ->assertJsonPath('data.id', $admin->id)
        ->assertJsonPath('data.department_shorthand', $shorthand);
})->with([[Department::InformationSystems, 'BSIS'], [null, null]]);
