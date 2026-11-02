<?php

use App\Enums\Department;
use App\Enums\UserRole;
use App\Models\User;
use Database\Seeders\TestSeeder;
use Illuminate\Support\Facades\Hash;

test('test seeder creates only the three generic test accounts with password broadtrack', function (): void {
    $this->seed(TestSeeder::class);

    expect(User::count())->toBe(3);

    $expectedAccounts = [
        [
            'email' => 'admin.test@laverdad.edu.ph',
            'firstname' => 'Test',
            'lastname' => 'Admin',
            'role' => UserRole::Admin,
        ],
        [
            'email' => 'sysadmin.test@laverdad.edu.ph',
            'firstname' => 'Test',
            'lastname' => 'Sysadmin',
            'role' => UserRole::Sysadmin,
        ],
        [
            'email' => 'borrower.test@student.laverdad.edu.ph',
            'firstname' => 'Test',
            'lastname' => 'Borrower',
            'role' => UserRole::Borrower,
        ],
    ];

    foreach ($expectedAccounts as $expected) {
        $user = User::where('email', $expected['email'])->first();

        expect($user)->not->toBeNull()
            ->and($user->firstname)->toBe($expected['firstname'])
            ->and($user->lastname)->toBe($expected['lastname'])
            ->and($user->role)->toBe($expected['role'])
            ->and($user->department)->toBe(Department::InformationSystems)
            ->and($user->email_verified_at)->not->toBeNull()
            ->and(Hash::check('broadtrack', $user->password))->toBeTrue();
    }
});

test('test seeder preserves existing users and respects updateOrCreate semantics on reseed', function (): void {
    $existingUser = User::factory()->create([
        'email' => 'custom.existing@laverdad.edu.ph',
    ]);

    $this->seed(TestSeeder::class);

    expect(User::where('email', $existingUser->email)->exists())->toBeTrue()
        ->and(User::count())->toBe(4);

    $this->seed(TestSeeder::class);

    expect(User::where('email', $existingUser->email)->exists())->toBeTrue()
        ->and(User::count())->toBe(4);
});
