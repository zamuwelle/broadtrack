<?php

use App\Enums\EquipmentCategory;
use App\Enums\EquipmentStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('equipments', static function ($table) {
            $table->id();
            $table->string('category')->default(EquipmentCategory::Support->value)->index();
            $table->string('name');
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->string('serial_no')->nullable()->unique();
            $table->string('status')->default(EquipmentStatus::Available->value)->index();
            $table->text('description')->nullable();
            $table->text('specs')->nullable();
            $table->string('image')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('equipments');
    }
};
