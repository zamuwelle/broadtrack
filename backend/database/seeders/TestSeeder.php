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
        $defaultPassword = Hash::make('password123');

        $teamMembers = [
            ['prefix' => 'karl', 'firstname' => 'Karl Ashton', 'lastname' => 'Mahusay'],
            ['prefix' => 'rocelyn', 'firstname' => 'Rocelyn', 'lastname' => 'Lava'],
            ['prefix' => 'annestephanne', 'firstname' => 'Anne Stephanne', 'lastname' => 'Buenaflor'],
            ['prefix' => 'luisa', 'firstname' => 'Luisa', 'lastname' => 'Padillon'],
            ['prefix' => 'ydreyann', 'firstname' => 'Ydrey Ann', 'lastname' => 'Ramirez'],
        ];

        $roleDefinitions = [
            ['suffix' => 'borrow', 'role' => UserRole::Borrower, 'domain' => 'student.laverdad.edu.ph'],
            ['suffix' => 'admin', 'role' => UserRole::Admin, 'domain' => 'laverdad.edu.ph'],
            ['suffix' => 'sysadmin', 'role' => UserRole::Sysadmin, 'domain' => 'laverdad.edu.ph'],
        ];

        $testAccounts = [
            ['email' => 'sysadmin.test@laverdad.edu.ph', 'firstname' => 'Test', 'lastname' => 'Sysadmin', 'role' => UserRole::Sysadmin],
            ['email' => 'admin.test@laverdad.edu.ph', 'firstname' => 'Test', 'lastname' => 'Admin', 'role' => UserRole::Admin],
            ['email' => 'borrower.test@student.laverdad.edu.ph', 'firstname' => 'Test', 'lastname' => 'Borrower', 'role' => UserRole::Borrower],
        ];

        User::withoutEvents(function () use ($teamMembers, $roleDefinitions, $testAccounts, $defaultPassword): void {
            foreach ($teamMembers as $member) {
                foreach ($roleDefinitions as $roleDefinition) {
                    User::updateOrCreate(
                        ['email' => "{$member['prefix']}{$roleDefinition['suffix']}.test@{$roleDefinition['domain']}"],
                        [
                            'firstname' => $member['firstname'],
                            'lastname' => $member['lastname'],
                            'password' => $defaultPassword,
                            'role' => $roleDefinition['role'],
                            'department' => Department::InformationSystems,
                            'email_verified_at' => now(),
                        ]
                    );
                }
            }

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
