<?php

use App\Models\Booking;
use App\Models\User;

test('sysadmin can list all users excluding sysadmins', function () {
    $sysadmin = User::factory()->sysadmin()->create();
    User::factory()->count(2)->borrower()->create();

    $response = $this->actingAs($sysadmin)->getJson('/api/v1/users');

    $response->assertOk()
        ->assertJsonCount(2, 'data');
});

test('sysadmin can create new admin user', function () {
    $sysadmin = User::factory()->sysadmin()->create();

    $response = $this->actingAs($sysadmin)->postJson('/api/v1/users', [
        'firstname' => 'New',
        'lastname' => 'Admin',
        'email' => 'newadmin.test@laverdad.edu.ph',
        'phone' => '+639123456789',
        'password' => 'password123',
        'role' => 'admin',
        'department' => 'BS Information Systems',
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.email', 'newadmin.test@laverdad.edu.ph');

    $this->assertDatabaseHas('users', [
        'email' => 'newadmin.test@laverdad.edu.ph',
        'role' => 'admin',
    ]);
});

test('sysadmin can update user', function () {
    $sysadmin = User::factory()->sysadmin()->create();
    $user = User::factory()->borrower()->create(['firstname' => 'OldName']);

    $response = $this->actingAs($sysadmin)->putJson("/api/v1/users/{$user->id}", [
        'firstname' => 'UpdatedSysadminName',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.firstname', 'UpdatedSysadminName');

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'firstname' => 'UpdatedSysadminName',
    ]);
});

test('sysadmin cannot delete their own account', function () {
    $sysadmin = User::factory()->sysadmin()->create();

    $response = $this->actingAs($sysadmin)->deleteJson("/api/v1/users/{$sysadmin->id}");

    $response->assertForbidden();

    $this->assertDatabaseHas('users', [
        'id' => $sysadmin->id,
    ]);
});

test('borrower cannot access users management', function () {
    $borrower = User::factory()->borrower()->create();

    $response = $this->actingAs($borrower)->getJson('/api/v1/users');

    $response->assertForbidden();
});

test('sysadmin cannot delete user with existing booking records', function () {
    $sysadmin = User::factory()->sysadmin()->create();
    $borrower = User::factory()->borrower()->create();
    Booking::factory()->create(['user_id' => $borrower->id]);

    $response = $this->actingAs($admin = $sysadmin)->deleteJson("/api/v1/users/{$borrower->id}");

    $response->assertStatus(422)
        ->assertJsonPath('message', 'Cannot delete a user with existing booking records.');

    $this->assertDatabaseHas('users', ['id' => $borrower->id]);
});
