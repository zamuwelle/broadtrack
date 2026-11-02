<?php

use App\Enums\BookingStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up()
	{
		Schema::create('bookings', function ($table) {
			$table->id();
			$table->foreignId('user_id')->constrained();
			$table->foreignId('returned_by_user_id')->nullable()->constrained('users');
			$table->string('ticket_id')->unique();
			$table->string('purpose');
			$table->dateTime('start_date');
			$table->dateTime('end_date');
			$table->dateTime('return_date')->nullable();
			$table->string('status')->default(BookingStatus::Pending->value);
			$table->text('notes')->nullable();
			$table->text('rejection_reason')->nullable();
			$table->timestamps();
		});
	}

	public function down()
	{
		Schema::dropIfExists('bookings');
	}
};
