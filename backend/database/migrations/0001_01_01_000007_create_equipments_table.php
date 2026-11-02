<?php

use App\Enums\EquipmentStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up()
	{
		Schema::create('equipments', function ($table) {
			$table->id();
			$table->foreignId('category_id')->constrained();
			$table->foreignId('location_id')->nullable()->constrained();
			$table->string('name');
			$table->string('brand')->nullable();
			$table->string('model')->nullable();
			$table->string('serial_no')->nullable();
			$table->integer('quantity')->default(1);
			$table->string('status')->default(EquipmentStatus::Available->value);
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
