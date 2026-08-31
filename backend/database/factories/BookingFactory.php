<?php

namespace Database\Factories;

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BookingFactory extends Factory
{
    protected $model = Booking::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory()->borrower(),
            'purpose' => fake()->sentence(3),
            'start_date' => now()->addDays(1),
            'end_date' => now()->addDays(3),
            'status' => BookingStatus::Pending,
            'notes' => fake()->sentence(),
            'isRead' => false,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn () => ['status' => BookingStatus::Pending]);
    }

    public function approved(): static
    {
        return $this->state(fn () => [
            'status' => BookingStatus::Approved,
            'approval_note' => 'Approved for test use',
        ]);
    }

    public function released(): static
    {
        return $this->state(fn () => ['status' => BookingStatus::Released]);
    }

    public function returned(): static
    {
        return $this->state(fn () => [
            'status' => BookingStatus::Returned,
            'return_date' => now(),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn () => ['status' => BookingStatus::Cancelled]);
    }
}
