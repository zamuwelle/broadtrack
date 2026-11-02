<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
	public function up()
	{
		Schema::table('users', function ($table) {
			$table->timestamp('email_verified_at')->nullable()->after('email');
			$table->string('verification_token')->nullable()->after('email_verified_at');
			$table->timestamp('verification_sent_at')->nullable()->after('verification_token');
		});

		DB::table('users')->whereNull('email_verified_at')->update(['email_verified_at' => now()]);
	}

	public function down()
	{
		Schema::table('users', function ($table) {
			$table->dropColumn(['email_verified_at', 'verification_token', 'verification_sent_at']);
		});
	}
};
