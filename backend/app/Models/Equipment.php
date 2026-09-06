<?php

namespace App\Models;

use App\Enums\BookingStatus;
use App\Enums\EquipmentCategory;
use App\Enums\EquipmentStatus;
use App\Observers\EquipmentObserver;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

#[Fillable(['category', 'name', 'brand', 'model', 'serial_no', 'status', 'description', 'specs', 'image'])]
#[ObservedBy(EquipmentObserver::class)]
#[Table('equipments')]
class Equipment extends Model
{
    use HasFactory;

    protected function casts()
    {
        return [
            'status' => EquipmentStatus::class,
            'category' => EquipmentCategory::class,
        ];
    }

    protected static function booted()
    {
        static::creating(static fn ($equipment) => $equipment->generateSerial());
    }

    public function generateSerial(): void
    {
        if ($this->serial_no) {
            return;
        }

        $source = $this->brand ?: $this->name;
        $code = str_pad(strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $source ?? ''), 0, 3)), 3, 'X');
        $unit = (int)(static::where('name', $this->name)->max('id') ?? 0) + 1;
        $this->serial_no = sprintf('SN-%s-%04d', $code, $unit);
    }

    public function bookings()
    {
        return $this->belongsToMany(Booking::class)->withTimestamps();
    }

    public static function resolveStatuses(Collection $equipmentItems): Collection
    {
        $bookingsByEquipmentId = Booking::active()
            ->with('equipments:id')
            ->get()
            ->flatMap(static fn (Booking $booking) => $booking->equipments
                ->map(static fn (Equipment $equipment) => ['id' => $equipment->id, 'booking' => $booking]))
            ->groupBy('id')
            ->map->pluck('booking');

        return $equipmentItems->map(static function (Equipment $item) use ($bookingsByEquipmentId) {
            if ($item->status === EquipmentStatus::Maintenance) {
                return $item;
            }

            $bookings = $bookingsByEquipmentId->get($item->id, collect());
            $isOngoing = static fn (Booking $booking) => $booking->status === BookingStatus::Released
                || ($booking->status === BookingStatus::Approved && $booking->start_date->lessThanOrEqualTo(now()) && $booking->end_date->isFuture());
            $isUpcoming = static fn (Booking $booking) => $booking->status === BookingStatus::Approved && $booking->end_date->isFuture();

            $item->status = match (true) {
                $bookings->contains($isOngoing) => EquipmentStatus::Borrowed,
                $bookings->contains($isUpcoming) => EquipmentStatus::Booked,
                default => EquipmentStatus::Available,
            };

            return $item;
        });
    }

    public function imagePublicId(): string
    {
        return strtolower($this->serial_no ?: "equipment-{$this->id}");
    }

    public function isAvailable(): bool
    {
        return $this->status === EquipmentStatus::Available;
    }

    public function isUnderMaintenance(): bool
    {
        return $this->status === EquipmentStatus::Maintenance;
    }

    public function scopeAvailable($query)
    {
        return $query->where('status', EquipmentStatus::Available);
    }

    public function scopeCategory($query, EquipmentCategory|string $category)
    {
        $value = $category instanceof EquipmentCategory ? $category->value : $category;

        return $query->where('category', $value);
    }
}
