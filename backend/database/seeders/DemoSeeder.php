<?php

namespace Database\Seeders;

use App\Enums\Department;
use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $defaultPassword = Hash::make('broadtrack');

        $demoAccounts = [
            ['email' => 'admin.demo@laverdad.edu.ph', 'firstname' => 'Admin', 'lastname' => 'Demo', 'role' => UserRole::Admin],
            ['email' => 'sysadmin.demo@laverdad.edu.ph', 'firstname' => 'Sysadmin', 'lastname' => 'Demo', 'role' => UserRole::Sysadmin],
            ['email' => 'borrower.demo@student.laverdad.edu.ph', 'firstname' => 'Borrower', 'lastname' => 'Demo', 'role' => UserRole::Borrower],
        ];

        User::withoutEvents(function () use ($demoAccounts, $defaultPassword): void {
            foreach ($demoAccounts as $account) {
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
