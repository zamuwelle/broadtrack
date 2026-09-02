<?php

use App\Enums\BookingStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('bookings', static function ($table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->foreignId('returned_by_user_id')->nullable()->constrained('users');
            $table->string('ticket_id')->unique();
            $table->string('purpose');
            $table->dateTime('start_date')->index();
            $table->dateTime('end_date');
            $table->dateTime('return_date')->nullable();
            $table->string('status')->default(BookingStatus::Pending->value)->index();
            $table->text('approval_note')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->boolean('isRead')->default(false);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('bookings');
    }
};
