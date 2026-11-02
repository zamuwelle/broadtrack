<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up()
	{
		Schema::create('booking_equipment', function ($table) {
			$table->foreignId('booking_id')->constrained();
			$table->foreignId('equipment_id')->constrained();
			$table->primary(['booking_id', 'equipment_id']);
			$table->timestamps();
		});
	}

	public function down()
	{
		Schema::dropIfExists('booking_equipment');
	}
};
