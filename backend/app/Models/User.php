<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['firstname', 'lastname', 'email', 'phone', 'password', 'role', 'department', 'email_verified_at', 'verification_token', 'verification_sent_at'])]
#[Hidden(['password', 'remember_token'])]
#[Appends(['full_name'])]
class User extends Authenticatable
{
	use HasApiTokens, HasFactory;

	protected function casts()
	{
		return [
			'password' => 'hashed',
			'role' => UserRole::class,
			'email_verified_at' => 'datetime',
			'verification_sent_at' => 'datetime',
		];
	}

	public function isAdmin()
	{
		return $this->role === UserRole::Admin;
	}

	public function bookings()
	{
		return $this->hasMany(Booking::class);
	}

	public function returnedBookings()
	{
		return $this->hasMany(Booking::class, 'returned_by_user_id');
	}

	protected function fullName(): Attribute
	{
		return Attribute::make(get: fn() => "{$this->firstname} {$this->lastname}");
	}
}