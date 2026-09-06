<?php

namespace App\Models;

use App\Enums\Department;
use App\Enums\UserRole;
use App\Observers\UserObserver;
use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Prunable;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use function Tamtamchik\NameCase\str_name_case;

#[Appends(['full_name'])]
#[Fillable(['firstname', 'lastname', 'email', 'phone', 'password', 'role', 'department', 'profile_picture', 'email_verified_at', 'verification_token', 'verification_sent_at', 'created_at'])]
#[Hidden(['password', 'remember_token', 'verification_token'])]
#[ObservedBy(UserObserver::class)]
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Prunable;

    public function prunable(): Builder
    {
        return static::whereNull('email_verified_at')
            ->where('created_at', '<=', now()->subHours(24));
    }

    protected function casts()
    {
        return [
            'password' => 'hashed',
            'role' => UserRole::class,
            'department' => Department::class,
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
        return Attribute::make(
            get: fn (mixed $value, array $attributes) => str_name_case(
                trim(($attributes['firstname'] ?? '').' '.($attributes['lastname'] ?? ''))
            ),
        );
    }

    protected function firstname(): Attribute
    {
        return Attribute::make(
            set: static fn ($value) => is_string($value) ? str_name_case(trim($value)) : $value,
        );
    }

    protected function lastname(): Attribute
    {
        return Attribute::make(
            set: static fn ($value) => is_string($value) ? str_name_case(trim($value)) : $value,
        );
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
