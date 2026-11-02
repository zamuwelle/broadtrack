<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $this->call([
            EquipmentSeeder::class,
        ]);

        app()->isLocal() && $this->call(TestSeeder::class);
    }
}
