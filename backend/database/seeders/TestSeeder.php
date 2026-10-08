<?php

namespace Database\Seeders;

use App\Enums\Department;
use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestSeeder extends Seeder
{
    public function run(): void
    {
        $defaultPassword = Hash::make('broadtrack');

        $testAccounts = [
            ['email' => 'admin.test@laverdad.edu.ph', 'firstname' => 'Test', 'lastname' => 'Admin', 'role' => UserRole::Admin],
            ['email' => 'sysadmin.test@laverdad.edu.ph', 'firstname' => 'Test', 'lastname' => 'Sysadmin', 'role' => UserRole::Sysadmin],
            ['email' => 'borrower.test@student.laverdad.edu.ph', 'firstname' => 'Test', 'lastname' => 'Borrower', 'role' => UserRole::Borrower],
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
                        'email_verified_at' => now(),
                    ]
                );
            }
        });
    }
}
