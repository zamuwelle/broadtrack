<?php

namespace Database\Seeders;

use App\Enums\Department;
use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TestSeeder extends Seeder
{
    public function run(): void
    {
        $defaultPassword = Hash::make('broadtrack');

        $testAccounts = [
            ['email' => 'admin.test@laverdad.edu.ph', 'firstname' => 'Admin', 'lastname' => 'Test', 'role' => UserRole::Admin],
            ['email' => 'sysadmin.test@laverdad.edu.ph', 'firstname' => 'Sysadmin', 'lastname' => 'Test', 'role' => UserRole::Sysadmin],
            ['email' => 'borrower.test@student.laverdad.edu.ph', 'firstname' => 'Borrower', 'lastname' => 'Test', 'role' => UserRole::Borrower],
        ];

        User::withoutEvents(function () use ($testAccounts, $defaultPassword): void {
            foreach ($testAccounts as $account) {
                User::updateOrCreate(
                    ['email' => $account['email']],
                    [
                        'firstname' => $account['firstname'],
                        'lastname' => $account['lastname'],
                        'password' => $defaultPassword,
                        'role' => $account['role'],
                        'department' => Department::InformationSystems,
                        'profile_picture' => 'https://api.dicebear.com/10.x/toon-head/svg?seed='.Str::random(16),
                        'email_verified_at' => now(),
                    ]
                );
            }
        });
    }
}
