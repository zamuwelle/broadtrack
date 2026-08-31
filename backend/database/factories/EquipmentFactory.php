<?php

namespace Database\Factories;

use App\Enums\EquipmentStatus;
use App\Models\Category;
use App\Models\Equipment;
use Illuminate\Database\Eloquent\Factories\Factory;

class EquipmentFactory extends Factory
{
    protected $model = Equipment::class;

    public function definition(): array
    {
        return [
            'category_id' => Category::factory(),
            'name' => fake()->words(2, true),
            'brand' => fake()->company(),
            'model' => strtoupper(fake()->bothify('MOD-###')),
            'status' => EquipmentStatus::Available,
            'description' => fake()->sentence(),
            'specs' => fake()->sentence(),
        ];
    }

    public function available(): static
    {
        return $this->state(fn () => ['status' => EquipmentStatus::Available]);
    }

    public function maintenance(): static
    {
        return $this->state(fn () => ['status' => EquipmentStatus::Maintenance]);
    }

    public function borrowed(): static
    {
        return $this->state(fn () => ['status' => EquipmentStatus::Borrowed]);
    }
}
