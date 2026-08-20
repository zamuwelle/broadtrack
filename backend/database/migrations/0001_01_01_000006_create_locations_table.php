<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        /*
        Schema::create('locations', static function ($table) {
            $table->id();
            $table->string('name');
            $table->string('floor');
            $table->timestamps();
        });
         */
    }

    public function down()
    {
        // Schema::dropIfExists('locations');
    }
};
