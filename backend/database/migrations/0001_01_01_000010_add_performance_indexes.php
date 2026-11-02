<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up()
	{
		Schema::table('equipments', function ($table) {
			$table->index('status');
		});

		Schema::table('bookings', function ($table) {
			$table->index('status');
			$table->index('user_id');
			$table->index('start_date');
		});
	}

	public function down()
	{
		Schema::table('equipments', function ($table) {
			$table->dropIndex(['status']);
		});

		Schema::table('bookings', function ($table) {
			$table->dropIndex(['status']);
			$table->dropIndex(['user_id']);
			$table->dropIndex(['start_date']);
		});
	}
};