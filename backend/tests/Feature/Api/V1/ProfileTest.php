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

test('authenticated user cannot update their profile or upload a picture', function (): void {
    $user = User::factory()->borrower()->create(['firstname' => 'Alice']);

    $this->actingAs($user)
        ->putJson('/api/v1/profile', ['firstname' => 'Updated'])
        ->assertNotFound();
    $this->postJson('/api/v1/profile/picture')->assertNotFound();
    $this->getJson('/api/v1/me')->assertOk()->assertJsonPath('data.firstname', 'Alice');
});

test('bearer authentication returns typed or empty department shorthand', function (?Department $department, ?string $shorthand): void {
    $admin = User::factory()->admin()->create(['department' => $department]);
    $token = $admin->createToken('profile-test')->plainTextToken;

    $this->withToken($token)->getJson('/api/v1/me')->assertOk()
        ->assertJsonPath('data.id', $admin->id)
        ->assertJsonPath('data.department_shorthand', $shorthand);
})->with([[Department::InformationSystems, 'BSIS'], [null, null]]);
