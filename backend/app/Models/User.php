<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

#[Appends(['full_name'])]
#[Fillable(['firstname', 'lastname', 'email', 'phone', 'password', 'role', 'department', 'profile_picture', 'email_verified_at', 'verification_token', 'verification_sent_at'])]
#[Hidden(['password', 'remember_token', 'verification_token'])]
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

    public function isBorrower()
    {
        return $this->role === UserRole::Borrower;
    }

    public function isAdmin()
    {
        return $this->role === UserRole::Admin || $this->role === UserRole::Sysadmin;
    }

    public function isSysAdmin()
    {
        return $this->role === UserRole::Sysadmin;
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
        return Attribute::make(get: fn () => "{$this->firstname} {$this->lastname}");
    }

    protected function phone(): Attribute
    {
        return Attribute::make(set: static fn ($value) => self::normalizePhone($value) ?? $value);
    }

    public static function normalizePhone($phone)
    {
        $digits = preg_replace('/[^0-9]/', '', (string)$phone);

        return str_starts_with($digits, '0')
            ? '+63'.substr($digits, 1)
            : (str_starts_with($digits, '63') ? '+'.$digits : null);
    }
}
