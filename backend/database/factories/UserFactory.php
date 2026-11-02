<?php

namespace Database\Factories;

use App\Enums\Department;
use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        return [
            'firstname' => fake()->firstName(),
            'lastname' => fake()->lastName(),
            'email' => fake()->unique()->userName().'.test@student.laverdad.edu.ph',
            'password' => Hash::make('password123'),
            'role' => UserRole::Borrower,
            'department' => Department::InformationSystems,
            'email_verified_at' => now(),
        ];
    }

    public function borrower(): static
    {
        return $this->state(fn () => [
            'role' => UserRole::Borrower,
            'email' => fake()->unique()->userName().'.test@student.laverdad.edu.ph',
        ]);
    }

    public function admin(): static
    {
        return $this->state(fn () => [
            'role' => UserRole::Admin,
            'email' => fake()->unique()->userName().'.test@laverdad.edu.ph',
        ]);
    }

    public function sysadmin(): static
    {
        return $this->state(fn () => [
            'role' => UserRole::Sysadmin,
            'email' => fake()->unique()->userName().'.test@laverdad.edu.ph',
        ]);
    }

    public function unverified(): static
    {
        return $this->state(fn () => [
            'email_verified_at' => null,
            'verification_code' => '123456',
            'verification_sent_at' => now(),
        ]);
    }
}
