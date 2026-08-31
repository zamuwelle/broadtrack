<?php

namespace App\Models;

use App\Enums\BookingStatus;
use App\Enums\EquipmentStatus;
use App\Observers\EquipmentObserver;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

#[Fillable(['category_id', 'location_id', 'name', 'brand', 'model', 'serial_no', 'status', 'description', 'specs', 'image'])]
#[ObservedBy(EquipmentObserver::class)]
#[Table('equipments')]
class Equipment extends Model
{
    use HasFactory;

    protected $with = ['category:id,name'];

    protected function casts()
    {
        return ['status' => EquipmentStatus::class];
    }

    protected static function booted()
    {
        static::creating(static fn ($equipment) => $equipment->generateSerial());
    }

    public function generateSerial()
    {
        $source = $this->brand ?: $this->name;
        $code = str_pad(strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $source ?? ''), 0, 3)), 3, 'X');
        $this->serial_no ??= 'SN-'.$code.'-'.str_pad((string)(static::max('id') + 1), 5, '0', STR_PAD_LEFT);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function bookings()
    {
        return $this->belongsToMany(Booking::class)->withTimestamps();
    }

    public static function resolveStatuses(Collection $equipmentItems): Collection
    {
        $bookingsByEquipmentId = Booking::with('equipments:id')
            ->whereIn('status', [BookingStatus::Approved, BookingStatus::Released])
            ->get()
            ->flatMap(static fn (Booking $booking) => $booking->equipments
                ->map(static fn (Equipment $equipment) => ['id' => $equipment->id, 'booking' => $booking]))
            ->groupBy('id')
            ->map->pluck('booking');

        return $equipmentItems->map(static function (Equipment $item) use ($bookingsByEquipmentId) {
            if ($item->status !== EquipmentStatus::Available) {
                return $item;
            }

            $bookings = $bookingsByEquipmentId->get($item->id, collect());
            $hasStarted = static fn (Booking $booking) => $booking->start_date->lessThanOrEqualTo(now());

            $item->status = match (true) {
                $bookings->contains($hasStarted) => EquipmentStatus::Borrowed,
                $bookings->isNotEmpty() => EquipmentStatus::Booked,
                default => EquipmentStatus::Available,
            };

            return $item;
        });
    }
}
