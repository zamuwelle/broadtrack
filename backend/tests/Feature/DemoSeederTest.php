<?php

use App\Enums\Department;
use App\Enums\UserRole;
use App\Models\User;
use Database\Seeders\DemoSeeder;
use Illuminate\Support\Facades\Hash;

test('demo seeder creates only the three generic demo accounts with password broadtrack', function (): void {
    $this->seed(DemoSeeder::class);

    expect(User::count())->toBe(3);

    $expectedAccounts = [
        [
            'email' => 'admin.demo@laverdad.edu.ph',
            'firstname' => 'Admin',
            'lastname' => 'Demo',
            'role' => UserRole::Admin,
        ],
        [
            'email' => 'sysadmin.demo@laverdad.edu.ph',
            'firstname' => 'Sysadmin',
            'lastname' => 'Demo',
            'role' => UserRole::Sysadmin,
        ],
        [
            'email' => 'borrower.demo@student.laverdad.edu.ph',
            'firstname' => 'Borrower',
            'lastname' => 'Demo',
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
            ->and($user->profile_picture)->toMatch('#^https://api\.dicebear\.com/10\.x/toon-head/svg\?seed=[a-zA-Z0-9]{16}$#')
            ->and($user->email_verified_at)->not->toBeNull()
            ->and(Hash::check('broadtrack', $user->password))->toBeTrue();
    }

    expect(User::pluck('profile_picture')->unique())->toHaveCount(3);
});

test('demo seeder preserves existing users and respects updateOrCreate semantics on reseed', function (): void {
    $existingUser = User::factory()->create([
        'email' => 'custom.existing@laverdad.edu.ph',
    ]);

    $this->seed(DemoSeeder::class);

    expect(User::where('email', $existingUser->email)->exists())->toBeTrue()
        ->and(User::count())->toBe(4);

    $this->seed(DemoSeeder::class);

    expect(User::where('email', $existingUser->email)->exists())->toBeTrue()
        ->and(User::count())->toBe(4);
});
