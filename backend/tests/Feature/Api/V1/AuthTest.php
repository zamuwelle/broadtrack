<?php

use App\Mail\VerifyEmailMail;
use App\Models\User;
use Illuminate\Mail\PendingMail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\GoogleProvider;
use Laravel\Socialite\Two\User as SocialiteUser;
use RuntimeException;

test('borrower can register with valid student email', function () {
    Mail::fake();

    $response = $this->postJson('/api/v1/register', [
        'firstname' => 'John',
        'lastname' => 'Doe',
        'email' => 'johndoe.test@student.laverdad.edu.ph',
        'password' => 'password123',
        'department' => 'BS Information Systems',
    ]);

    $response->assertCreated()
        ->assertJsonPath('status', 201)
        ->assertJsonPath('data.email', 'johndoe.test@student.laverdad.edu.ph');

    $this->assertDatabaseHas('users', [
        'email' => 'johndoe.test@student.laverdad.edu.ph',
    ]);
});

test('borrower can register without a phone number', function () {
    Mail::fake();

    $response = $this->postJson('/api/v1/register', [
        'firstname' => 'John',
        'lastname' => 'Doe',
        'email' => 'john.no-phone@student.laverdad.edu.ph',
        'password' => 'password123',
        'department' => 'BS Information Systems',
    ]);

    $response->assertCreated();
    $this->assertDatabaseHas('users', ['email' => 'john.no-phone@student.laverdad.edu.ph']);
});

test('user can re-register with unverified email', function () {
    Mail::fake();

    $user = User::factory()->unverified()->create([
        'firstname' => 'Old',
        'lastname' => 'Name',
        'email' => 'reregister.test@student.laverdad.edu.ph',
        'password' => Hash::make('oldpassword123'),
        'verification_sent_at' => now()->subMinutes(5),
        'created_at' => now()->subHours(23),
    ]);

    $response = $this->postJson('/api/v1/register', [
        'firstname' => 'New',
        'lastname' => 'User',
        'email' => 'reregister.test@student.laverdad.edu.ph',
        'password' => 'newpassword123',
        'department' => 'BS Information Systems',
    ]);

    $response->assertCreated()
        ->assertJsonPath('status', 201)
        ->assertJsonPath('data.email', 'reregister.test@student.laverdad.edu.ph');

    $user->refresh();
    expect($user->firstname)->toBe('New');
    expect($user->lastname)->toBe('User');
    expect(Hash::check('newpassword123', $user->password))->toBeTrue();
    expect($user->created_at->isToday())->toBeTrue();

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

test('multiple logins remain valid and logout revokes only the current token', function (): void {
    $user = User::factory()->sysadmin()->create(['password' => Hash::make('secret123')]);
    $credentials = ['email' => $user->email, 'password' => 'secret123'];
    $first = $this->postJson('/api/v1/login', $credentials)->assertOk()->json('data.token');
    $second = $this->postJson('/api/v1/login', $credentials)->assertOk()->json('data.token');

    expect($user->fresh()->tokens()->count())->toBe(2);
    app('auth')->guard('web')->logout();
    app('auth')->forgetGuards();
    $this->withToken($first)->getJson('/api/v1/me')->assertOk();
    app('auth')->forgetGuards();
    $this->withToken($first)->postJson('/api/v1/logout')->assertOk();
    expect($user->fresh()->tokens()->count())->toBe(1);
    app('auth')->forgetGuards();
    $this->withToken($second)->getJson('/api/v1/me')->assertOk();
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

test('google callback rejects missing OAuth state before exchanging a code', function (): void {
    $response = $this->get('/api/v1/auth/google/callback?code=mock-code');

    $response->assertRedirect();
    expect($response->headers->get('Location'))->toContain('error=Google+authentication+failed');
});

test('google login keeps existing sessions valid', function (): void {
    $user = User::factory()->borrower()->create();
    $existing = $user->createToken('existing')->plainTextToken;
    $socialiteUser = Mockery::mock(SocialiteUser::class);
    $socialiteUser->shouldReceive('getEmail')->andReturn($user->email);
    $socialiteUser->shouldReceive('getAvatar')->andReturn(null);
    $provider = Mockery::mock(GoogleProvider::class);
    $provider->shouldReceive('user')->andReturn($socialiteUser);
    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $this->get('/api/v1/auth/google/callback?code=mock-code')->assertRedirect();
    expect($user->fresh()->tokens()->count())->toBe(2);
    $this->withToken($existing)->getJson('/api/v1/me')->assertOk();
});

test('oauth callback redirects unverified user with error message', function () {
    $user = User::factory()->unverified()->create([
        'email' => 'unverified@student.laverdad.edu.ph',
    ]);

    $socialiteUser = Mockery::mock(SocialiteUser::class);
    $socialiteUser->shouldReceive('getEmail')->andReturn('unverified@student.laverdad.edu.ph');
    $socialiteUser->shouldReceive('getAvatar')->andReturn(null);

    $provider = Mockery::mock(GoogleProvider::class);
    $provider->shouldReceive('user')->andReturn($socialiteUser);

    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $response = $this->get('/api/v1/auth/google/callback?code=mock-code');

    $response->assertRedirect();
    expect($response->headers->get('Location'))->toContain('error=Please+verify+your+email+first.+We+sent+you+a+verification+code.');
});

test('oauth callback redirects unregistered user to register tab', function () {
    $socialiteUser = Mockery::mock(SocialiteUser::class);
    $socialiteUser->shouldReceive('getEmail')->andReturn('new.oauth@student.laverdad.edu.ph');
    $socialiteUser->shouldReceive('getAvatar')->andReturn(null);
    $socialiteUser->shouldReceive('getName')->andReturn('New Student');
    $socialiteUser->user = ['given_name' => 'New', 'family_name' => 'Student'];

    $provider = Mockery::mock(GoogleProvider::class);
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
        'department' => 'BS Information Systems',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['email']);
});

test('user can verify email with valid 6-digit code', function () {
    $user = User::factory()->unverified()->create([
        'email' => 'otp.verify@student.laverdad.edu.ph',
        'verification_code' => '482915',
        'verification_sent_at' => now(),
    ]);

    $response = $this->postJson('/api/v1/verify-email', [
        'email' => 'otp.verify@student.laverdad.edu.ph',
        'code' => '482915',
    ]);

    $response->assertOk()
        ->assertJsonPath('message', 'Email verified successfully.');

    $user->refresh();
    expect($user->email_verified_at)->not->toBeNull();
    expect($user->verification_code)->toBeNull();
});

test('user cannot verify email with incorrect 6-digit code', function () {
    User::factory()->unverified()->create([
        'email' => 'otp.fail@student.laverdad.edu.ph',
        'verification_code' => '123456',
        'verification_sent_at' => now(),
    ]);

    $response = $this->postJson('/api/v1/verify-email', [
        'email' => 'otp.fail@student.laverdad.edu.ph',
        'code' => '999999',
    ]);

    $response->assertStatus(422)
        ->assertJsonPath('message', 'Incorrect verification code. Please try again.');
});

test('user cannot verify email with expired 6-digit code', function () {
    User::factory()->unverified()->create([
        'email' => 'otp.expired@student.laverdad.edu.ph',
        'verification_code' => '123456',
        'verification_sent_at' => now()->subMinutes(16),
    ]);

    $response = $this->postJson('/api/v1/verify-email', [
        'email' => 'otp.expired@student.laverdad.edu.ph',
        'code' => '123456',
    ]);

    $response->assertStatus(422)
        ->assertJsonPath('message', 'Verification code has expired. Please request a new one.');
});

test('user cannot verify email with invalid code format', function () {
    $response = $this->postJson('/api/v1/verify-email', [
        'email' => 'otp.format@student.laverdad.edu.ph',
        'code' => 'abc',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['code']);
});

test('reset link validation checks validity without consuming the token', function () {
    DB::table('password_reset_tokens')->insert([
        'email' => 'link@student.laverdad.edu.ph',
        'token' => 'reset-link-token',
        'created_at' => now(),
    ]);
    $payload = ['email' => 'link@student.laverdad.edu.ph', 'token' => 'reset-link-token'];
    $this->postJson('/api/v1/check-reset-token', $payload)->assertOk()->assertJsonPath('data.valid', true);
    $this->postJson('/api/v1/check-reset-token', [...$payload, 'token' => 'wrong'])->assertOk()->assertJsonPath('data.valid', false);
    DB::table('password_reset_tokens')->where('email', $payload['email'])->update(['created_at' => now()->subMinutes(16)]);
    $this->postJson('/api/v1/check-reset-token', $payload)->assertOk()->assertJsonPath('data.valid', false);
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

test('contact endpoint is throttled after five requests', function () {
    for ($i = 0; $i < 5; $i++) {
        $this->postJson('/api/v1/contact', [
            'firstname' => 'John',
            'lastname' => 'Doe',
            'email' => 'john.doe@student.laverdad.edu.ph',
            'message' => 'Hello there',
        ])->assertOk();
    }

    $this->postJson('/api/v1/contact', [
        'firstname' => 'John',
        'lastname' => 'Doe',
        'email' => 'john.doe@student.laverdad.edu.ph',
        'message' => 'Hello there',
    ])->assertStatus(429);
});

test('contact endpoint reports and logs queue failures', function (): void {
    config(['contact.recipients' => ['support@example.test']]);
    $pendingMail = Mockery::mock(PendingMail::class);
    $pendingMail->shouldReceive('queue')->once()->andThrow(new RuntimeException('queue unavailable'));
    Mail::shouldReceive('to')->once()->with('support@example.test')->andReturn($pendingMail);
    Log::shouldReceive('error')->once()->withArgs(static fn (string $message): bool => $message === 'Failed to queue contact message.'
    );

    $this->postJson('/api/v1/contact', [
        'firstname' => 'John',
        'lastname' => 'Doe',
        'email' => 'john.doe@student.laverdad.edu.ph',
        'message' => 'Hello there',
    ])->assertStatus(500)->assertJsonPath('message', 'Failed to send contact message.');
});

test('forgot password keeps its success response and logs queue failures for existing accounts', function (): void {
    $user = User::factory()->borrower()->create([
        'email' => 'reset.queue@student.laverdad.edu.ph',
    ]);
    $pendingMail = Mockery::mock(PendingMail::class);
    $pendingMail->shouldReceive('queue')->once()->andThrow(new RuntimeException('queue unavailable'));
    Mail::shouldReceive('to')->once()->with($user->email)->andReturn($pendingMail);
    Log::shouldReceive('error')->once()->withArgs(static fn (string $message, array $context): bool => $message === 'Failed to queue password reset email.' && $context['user_id'] === $user->id
    );

    $this->postJson('/api/v1/forgot-password', ['email' => $user->email])
        ->assertOk()
        ->assertJsonPath('message', 'Reset link sent to your email.');
});

test('forgot password gives the same response for an unknown account', function (): void {
    $this->postJson('/api/v1/forgot-password', ['email' => 'missing@student.laverdad.edu.ph'])
        ->assertOk()
        ->assertJsonPath('message', 'Reset link sent to your email.');
});

test('resending verification for non-existent email returns generic success message', function () {
    $response = $this->postJson('/api/v1/resend-verification', [
        'email' => 'nonexistent@student.laverdad.edu.ph',
    ]);

    $response->assertOk()
        ->assertJsonPath('message', 'If an account exists with that email and is unverified, a verification code has been sent.');
});

test('resending verification for unverified user queues verification email', function () {
    Mail::fake();

    $user = User::factory()->unverified()->create([
        'email' => 'unverified@student.laverdad.edu.ph',
        'verification_sent_at' => now()->subMinutes(5),
    ]);

    $response = $this->postJson('/api/v1/resend-verification', [
        'email' => $user->email,
    ]);

    $response->assertOk()
        ->assertJsonPath('message', 'Verification code sent to your email.');

    Mail::assertQueued(VerifyEmailMail::class);
});

test('resending verification for already verified user returns 422', function () {
    $user = User::factory()->borrower()->create([
        'email' => 'verified@student.laverdad.edu.ph',
    ]);

    $response = $this->postJson('/api/v1/resend-verification', [
        'email' => $user->email,
    ]);

    $response->assertUnprocessable()
        ->assertJsonPath('message', 'Email is already verified.');
});

test('resending verification within 60 seconds returns 429', function () {
    $user = User::factory()->unverified()->create([
        'email' => 'throttled.resend@student.laverdad.edu.ph',
        'verification_sent_at' => now()->subSeconds(20),
    ]);

    $response = $this->postJson('/api/v1/resend-verification', [
        'email' => $user->email,
    ]);

    $response->assertStatus(429)
        ->assertJsonPath('message', 'Please wait before requesting another verification code.');
});
