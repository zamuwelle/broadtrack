<?php

namespace App\Models;

use App\Enums\BookingStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['user_id', 'returned_by_user_id', 'ticket_id', 'purpose', 'start_date', 'end_date', 'return_date', 'status', 'notes', 'rejection_reason'])]
class Booking extends Model
{
	use HasFactory;

	protected function casts()
	{
		return [
			'start_date' => 'datetime',
			'end_date' => 'datetime',
			'return_date' => 'datetime',
			'status' => BookingStatus::class,
		];
	}

	public function user()
	{
		return $this->belongsTo(User::class);
	}

	public function returnedByUser()
	{
		return $this->belongsTo(User::class, 'returned_by_user_id');
	}

	public function equipments()
	{
		return $this->belongsToMany(Equipment::class)->withTimestamps();
	}
}
