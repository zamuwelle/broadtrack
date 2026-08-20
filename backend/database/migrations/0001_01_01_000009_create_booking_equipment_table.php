<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('booking_equipment', static function ($table) {
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('equipment_id')->constrained('equipments')->cascadeOnDelete();
            $table->primary(['booking_id', 'equipment_id']);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('booking_equipment');
    }
};
