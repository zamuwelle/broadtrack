<?php

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Broadcasting\Broadcasters\Broadcaster;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Hash;

test('sysadmin can recreate a deleted account while retaining its booking history', function (): void {
    $sysadmin = User::factory()->sysadmin()->create();
    $user = User::factory()->borrower()->create(['email' => 'returning@student.laverdad.edu.ph']);
    $booking = Booking::factory()->returned()->create(['user_id' => $user->id]);
    $this->actingAs($sysadmin)->deleteJson("/api/v1/users/{$user->id}")->assertNoContent();

    $this->postJson('/api/v1/users', [
        'firstname' => 'Returning', 'lastname' => 'User', 'email' => $user->email,
        'password' => 'newpassword123', 'role' => 'borrower', 'department' => 'BS Information Systems',
    ])->assertCreated()->assertJsonPath('data.id', $user->id);

    expect($user->fresh()->firstname)->toBe('Returning')
        ->and(Hash::check('newpassword123', $user->fresh()->password))->toBeTrue()
        ->and($booking->fresh()->user_id)->toBe($user->id);

    $this->postJson('/api/v1/users', [
        'firstname' => 'Another', 'lastname' => 'User', 'email' => $user->email,
        'password' => 'password123', 'role' => 'borrower', 'department' => 'BS Information Systems',
    ])->assertUnprocessable()->assertJsonValidationErrors('email');
});

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

test('sysadmin can delete user with a pending booking', function (): void {
    $sysadmin = User::factory()->sysadmin()->create();
    $borrower = User::factory()->borrower()->create();
    $booking = Booking::factory()->pending()->create(['user_id' => $borrower->id]);

    $this->actingAs($sysadmin)->deleteJson("/api/v1/users/{$borrower->id}")->assertNoContent();
    $this->assertSoftDeleted('users', ['id' => $borrower->id]);
    expect($booking->fresh()->user->id)->toBe($borrower->id)
        ->and($booking->fresh()->status)->toBe(BookingStatus::Cancelled);
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
        ? $this->assertSoftDeleted('users', ['id' => $id])
        : $this->assertDatabaseHas('users', ['id' => $id, 'firstname' => $method === 'POST' ? 'New' : 'Updated']);
})->with([['POST', 'created', 201], ['PUT', 'updated', 200], ['DELETE', 'deleted', 204]]);

test('sysadmin can view single user', function () {
    $sysadmin = User::factory()->sysadmin()->create();
    $user = User::factory()->borrower()->create(['firstname' => 'Specific', 'lastname' => 'Borrower']);

    $response = $this->actingAs($sysadmin)->getJson("/api/v1/users/{$user->id}");

    $response->assertOk()
        ->assertJsonPath('data.id', $user->id)
        ->assertJsonPath('data.firstname', 'Specific');
});

test('non-sysadmin cannot view single user', function () {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->borrower()->create();

    $response = $this->actingAs($admin)->getJson("/api/v1/users/{$user->id}");

    $response->assertForbidden();
});

test('guest cannot view single user', function () {
    $user = User::factory()->borrower()->create();

    $response = $this->getJson("/api/v1/users/{$user->id}");

    $response->assertUnauthorized();
});

test('staff email is accepted for borrower creation', function (): void {
    $sysadmin = User::factory()->sysadmin()->create();
    $this->actingAs($sysadmin)->postJson('/api/v1/users', [
        'firstname' => 'Test', 'lastname' => 'Borrower', 'email' => 'wrong@laverdad.edu.ph',
        'password' => 'password123', 'role' => 'borrower', 'department' => 'BS Accountancy',
    ])->assertCreated();
});

test('student email is accepted for admin creation', function (): void {
    $sysadmin = User::factory()->sysadmin()->create();
    $this->actingAs($sysadmin)->postJson('/api/v1/users', [
        'firstname' => 'Test', 'lastname' => 'Admin', 'email' => 'wrong@student.laverdad.edu.ph',
        'password' => 'password123', 'role' => 'admin',
    ])->assertCreated();
});

test('changing a token id cannot authenticate as another user', function (): void {
    $borrower = User::factory()->borrower()->create();
    $sysadmin = User::factory()->sysadmin()->create();
    $borrowerToken = $borrower->createToken('test')->plainTextToken;
    $adminToken = $sysadmin->createToken('test')->plainTextToken;
    [, $secret] = explode('|', $borrowerToken, 2);
    [$adminId] = explode('|', $adminToken, 2);

    $this->withToken($adminId.'|'.$secret)->getJson('/api/v1/users')->assertUnauthorized();
    $this->withToken($borrowerToken)->getJson('/api/v1/users')->assertForbidden();
});

test('user with returned booking can be soft deleted without losing history or retaining tokens', function (): void {
    $sysadmin = User::factory()->sysadmin()->create();
    $borrower = User::factory()->borrower()->create();
    $token = $borrower->createToken('test');
    $booking = Booking::factory()->returned()->create(['user_id' => $borrower->id]);

    $this->actingAs($sysadmin)->deleteJson("/api/v1/users/{$borrower->id}")->assertNoContent();
    $this->assertSoftDeleted('users', ['id' => $borrower->id]);
    expect($booking->fresh()->user->id)->toBe($borrower->id);
    $this->actingAs($sysadmin)->getJson("/api/v1/bookings/{$booking->id}")
        ->assertOk()->assertJsonPath('data.user.id', $borrower->id);
    $this->assertDatabaseMissing('personal_access_tokens', ['id' => $token->accessToken->id]);
});

test('approved booking prevents user deletion', function (): void {
    $sysadmin = User::factory()->sysadmin()->create();
    $borrower = User::factory()->borrower()->create();
    Booking::factory()->approved()->create(['user_id' => $borrower->id]);
    $this->actingAs($sysadmin)->deleteJson("/api/v1/users/{$borrower->id}")->assertUnprocessable();
    $this->assertNotSoftDeleted('users', ['id' => $borrower->id]);
});
