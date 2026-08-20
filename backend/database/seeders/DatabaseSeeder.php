<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $this->call([
            CategorySeeder::class,
            // LocationSeeder::class,
            EquipmentSeeder::class,
        ]);

        app()->isLocal() && $this->call(TestSeeder::class);
    }
}
