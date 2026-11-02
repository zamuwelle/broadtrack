<?php

use App\Enums\UserRole;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up()
	{
		Schema::create('users', function ($table) {
			$table->id();
			$table->string('firstname');
			$table->string('lastname');
			$table->string('email')->unique();
			$table->string('phone');
			$table->string('password');
			$table->string('role')->default(UserRole::Borrower->value);
			$table->string('department');
			$table->timestamps();
		});

		Schema::create('password_reset_tokens', function ($table) {
			$table->string('email')->primary();
			$table->string('token');
			$table->timestamp('created_at')->nullable();
		});
	}

	public function down()
	{
		Schema::dropIfExists('password_reset_tokens');
		Schema::dropIfExists('users');
	}
};
