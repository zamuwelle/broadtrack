<?php

namespace App\Models;

use App\Enums\EquipmentStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['category_id', 'location_id', 'name', 'brand', 'model', 'serial_no', 'quantity', 'status', 'description', 'specs', 'image'])]
class Equipment extends Model
{
	use HasFactory;

	protected $table = 'equipments';

	protected function casts()
	{
		return ['status' => EquipmentStatus::class];
	}

	protected static function booted()
	{
		static::creating(fn($equipment) => $equipment->generateSerial());
	}

	public function generateSerial()
	{
		$source = $this->brand ?: $this->name;
		$code = strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $source ?? ''), 0, 3));
		$this->serial_no ??= 'SN-' . $code . '-' . str_pad((string) (static::max('id') + 1), 5, '0', STR_PAD_LEFT);
	}

	public function category()
	{
		return $this->belongsTo(Category::class);
	}

	public function location()
	{
		return $this->belongsTo(Location::class);
	}

	public function bookings()
	{
		return $this->belongsToMany(Booking::class)->withTimestamps();
	}
}
