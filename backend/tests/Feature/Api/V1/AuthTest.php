<?php

use App\Mail\VerifyEmailMail;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\GoogleProvider;
use Laravel\Socialite\Two\User as SocialiteUser;

test('borrower can register with valid student email', function () {
    Mail::fake();

    $response = $this->postJson('/api/v1/register', [
        'firstname' => 'John',
        'lastname' => 'Doe',
        'email' => 'johndoe.test@student.laverdad.edu.ph',
        'password' => 'password123',
        'phone' => '+639123456789',
        'department' => 'BS Information Systems',
    ]);

    $response->assertCreated()
        ->assertJsonPath('status', 201)
        ->assertJsonPath('data.email', 'johndoe.test@student.laverdad.edu.ph');

    $this->assertDatabaseHas('users', [
        'email' => 'johndoe.test@student.laverdad.edu.ph',
    ]);
});

test('user can re-register with unverified email', function () {
    Mail::fake();

    $user = User::factory()->unverified()->create([
        'firstname' => 'Old',
        'lastname' => 'Name',
        'email' => 'reregister.test@student.laverdad.edu.ph',
        'password' => Hash::make('oldpassword123'),
        'verification_sent_at' => now()->subMinutes(5),
    ]);

    $response = $this->postJson('/api/v1/register', [
        'firstname' => 'New',
        'lastname' => 'User',
        'email' => 'reregister.test@student.laverdad.edu.ph',
        'password' => 'newpassword123',
        'phone' => '+639123456789',
        'department' => 'BS Information Systems',
    ]);

    $response->assertCreated()
        ->assertJsonPath('status', 201)
        ->assertJsonPath('data.email', 'reregister.test@student.laverdad.edu.ph');

    $user->refresh();
    expect($user->firstname)->toBe('New');
    expect($user->lastname)->toBe('User');
    expect(Hash::check('newpassword123', $user->password))->toBeTrue();

    Mail::assertQueued(VerifyEmailMail::class);
});

test('verified user cannot register again', function () {
    User::factory()->borrower()->create([
        'email' => 'verified.test@student.laverdad.edu.ph',
    ]);

    $response = $this->postJson('/api/v1/register', [
        'firstname' => 'Jane',
        'lastname' => 'Doe',
        'email' => 'verified.test@student.laverdad.edu.ph',
        'password' => 'password123',
        'phone' => '+639123456789',
        'department' => 'BS Information Systems',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['email']);
});

test('cannot register with non-school email', function () {
    $response = $this->postJson('/api/v1/register', [
        'firstname' => 'John',
        'lastname' => 'Doe',
        'email' => 'johndoe@gmail.com',
        'password' => 'password123',
        'phone' => '+639123456789',
        'department' => 'BS Information Systems',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['email']);
});

test('user can login with valid credentials', function () {
    $user = User::factory()->borrower()->create([
        'email' => 'student.test@student.laverdad.edu.ph',
        'password' => Hash::make('secret123'),
    ]);

    $response = $this->postJson('/api/v1/login', [
        'email' => 'student.test@student.laverdad.edu.ph',
        'password' => 'secret123',
    ]);

    $response->assertOk()
        ->assertJsonStructure([
            'data' => [
                'user' => ['id', 'email', 'role'],
                'token',
            ],
        ]);
});

test('login fails with invalid password using translation string', function () {
    User::factory()->borrower()->create([
        'email' => 'student.test@student.laverdad.edu.ph',
        'password' => Hash::make('secret123'),
    ]);

    $response = $this->postJson('/api/v1/login', [
        'email' => 'student.test@student.laverdad.edu.ph',
        'password' => 'wrongpassword',
    ]);

    $response->assertUnauthorized()
        ->assertJsonPath('message', __('auth.failed'));
});

test('unverified user cannot login', function () {
    User::factory()->unverified()->create([
        'email' => 'unverified.test@student.laverdad.edu.ph',
        'password' => Hash::make('secret123'),
    ]);

    $response = $this->postJson('/api/v1/login', [
        'email' => 'unverified.test@student.laverdad.edu.ph',
        'password' => 'secret123',
    ]);

    $response->assertForbidden();
});

test('authenticated user can logout', function () {
    $user = User::factory()->borrower()->create();

    $response = $this->actingAs($user)
        ->postJson('/api/v1/logout');

    $response->assertOk()
        ->assertJsonPath('message', 'Logged out successfully.');
});

test('oauth callback redirects unverified user with error message', function () {
    $user = User::factory()->unverified()->create([
        'email' => 'unverified@student.laverdad.edu.ph',
    ]);

    $socialiteUser = Mockery::mock(SocialiteUser::class);
    $socialiteUser->shouldReceive('getEmail')->andReturn('unverified@student.laverdad.edu.ph');
    $socialiteUser->shouldReceive('getAvatar')->andReturn(null);

    $provider = Mockery::mock(GoogleProvider::class);
    $provider->shouldReceive('stateless')->andReturnSelf();
    $provider->shouldReceive('user')->andReturn($socialiteUser);

    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $response = $this->get('/api/v1/auth/google/callback?code=mock-code');

    $response->assertRedirect();
    expect($response->headers->get('Location'))->toContain('error=Please+verify+your+email+first.+We+sent+you+a+link.');
});

test('oauth callback redirects unregistered user to register tab', function () {
    $socialiteUser = Mockery::mock(SocialiteUser::class);
    $socialiteUser->shouldReceive('getEmail')->andReturn('new.oauth@student.laverdad.edu.ph');
    $socialiteUser->shouldReceive('getAvatar')->andReturn(null);
    $socialiteUser->shouldReceive('getName')->andReturn('New Student');
    $socialiteUser->user = ['given_name' => 'New', 'family_name' => 'Student'];

    $provider = Mockery::mock(GoogleProvider::class);
    $provider->shouldReceive('stateless')->andReturnSelf();
    $provider->shouldReceive('user')->andReturn($socialiteUser);

    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $response = $this->get('/api/v1/auth/google/callback?code=mock-code');

    $response->assertRedirect();
    expect($response->headers->get('Location'))->toContain('tab=register');
    expect($response->headers->get('Location'))->toContain('email=new.oauth%40student.laverdad.edu.ph');
});

test('unverified users created over 24 hours ago are pruned', function () {
    $oldUnverified = User::factory()->unverified()->create([
        'created_at' => now()->subHours(25),
    ]);

    $recentUnverified = User::factory()->unverified()->create([
        'created_at' => now()->subHours(1),
    ]);

    $oldVerified = User::factory()->borrower()->create([
        'created_at' => now()->subDays(5),
    ]);

    $this->artisan('model:prune', [
        '--model' => [User::class],
    ])->assertSuccessful();

    $this->assertDatabaseMissing('users', ['id' => $oldUnverified->id]);
    $this->assertDatabaseHas('users', ['id' => $recentUnverified->id]);
    $this->assertDatabaseHas('users', ['id' => $oldVerified->id]);
});

test('cannot register with spoofed domain without at symbol', function () {
    $response = $this->postJson('/api/v1/register', [
        'firstname' => 'Attacker',
        'lastname' => 'User',
        'email' => 'attacker@fake-student.laverdad.edu.ph',
        'password' => 'password123',
        'phone' => '+639123456789',
        'department' => 'BS Information Systems',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['email']);
});

test('verification with missing token renders failure view', function () {
    $response = $this->get('/api/v1/verify-email');

    $response->assertOk()
        ->assertViewIs('emails.verify-result')
        ->assertViewHas('success', false);
});

test('password reset revokes existing sanctum tokens', function () {
    $user = User::factory()->borrower()->create([
        'email' => 'reset.tokens@student.laverdad.edu.ph',
        'password' => Hash::make('oldpassword123'),
    ]);

    $token = $user->createToken('test-token')->plainTextToken;
    expect($user->tokens()->count())->toBe(1);

    DB::table('password_reset_tokens')->insert([
        'email' => $user->email,
        'token' => 'valid-reset-token',
        'created_at' => now(),
    ]);

    $response = $this->postJson('/api/v1/reset-password', [
        'email' => $user->email,
        'token' => 'valid-reset-token',
        'password' => 'newpassword123',
    ]);

    $response->assertOk();
    expect($user->tokens()->count())->toBe(0);
});
