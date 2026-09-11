<?php

use App\Models\Booking;
use App\Models\User;
use Illuminate\Broadcasting\Broadcasters\Broadcaster;
use Illuminate\Support\Facades\Broadcast;

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

test('sysadmin can create a user without a phone number', function () {
    $sysadmin = User::factory()->sysadmin()->create();

    $response = $this->actingAs($sysadmin)->postJson('/api/v1/users', [
        'firstname' => 'New',
        'lastname' => 'Admin',
        'email' => 'newadmin.no-phone@laverdad.edu.ph',
        'password' => 'password123',
        'role' => 'admin',
    ]);

    $response->assertCreated()
        ->assertJsonMissingPath('data.phone');
    $this->assertDatabaseHas('users', ['email' => 'newadmin.no-phone@laverdad.edu.ph']);
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

test('user mutations succeed when the broadcast transport fails', function (string $method, string $action, int $status): void {
    $sysadmin = User::factory()->sysadmin()->create();
    $user = User::factory()->borrower()->create();
    $payloads = collect();
    $broadcaster = Mockery::mock(Broadcaster::class);
    $broadcaster->shouldReceive('broadcast')->andReturnUsing(static function (array $channels, string $event, array $payload) use ($payloads): never {
        $payloads->push(['event' => $event, 'payload' => $payload]);
        throw new RuntimeException('transport unavailable');
    });
    Broadcast::extend('audit-failing', static fn (): Broadcaster => $broadcaster);
    config(['broadcasting.default' => 'audit-failing', 'broadcasting.connections.audit-failing' => ['driver' => 'audit-failing']]);
    $uri = $method === 'POST' ? '/api/v1/users' : "/api/v1/users/{$user->id}";
    $data = $method === 'POST'
        ? ['firstname' => 'New', 'lastname' => 'Admin', 'email' => 'broadcast@laverdad.edu.ph', 'password' => 'password123', 'role' => 'admin']
        : ['firstname' => 'Updated'];

    $response = $this->actingAs($sysadmin)->json($method, $uri, $data)->assertStatus($status);

    $id = $method === 'POST' ? $response->json('data.id') : $user->id;
    expect($payloads->first())->toBe(['event' => 'user.changed', 'payload' => ['action' => $action, 'userId' => $id]]);
    $method === 'DELETE'
        ? $this->assertDatabaseMissing('users', ['id' => $id])
        : $this->assertDatabaseHas('users', ['id' => $id, 'firstname' => $method === 'POST' ? 'New' : 'Updated']);
})->with([['POST', 'created', 201], ['PUT', 'updated', 200], ['DELETE', 'deleted', 204]]);
