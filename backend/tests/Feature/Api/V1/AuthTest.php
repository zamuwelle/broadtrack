<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

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
