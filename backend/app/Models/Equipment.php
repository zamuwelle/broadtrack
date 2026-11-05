<?php

namespace App\Models;

use App\Enums\EquipmentCategory;
use App\Enums\EquipmentStatus;
use App\Observers\EquipmentObserver;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Collection;

#[Fillable(['category', 'name', 'brand', 'model', 'serial_no', 'status', 'description', 'specs', 'image'])]
#[ObservedBy(EquipmentObserver::class)]
#[Table('equipments')]
class Equipment extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'status' => EquipmentStatus::class,
            'category' => EquipmentCategory::class,
        ];
    }

    public function bookings(): BelongsToMany
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

        return $equipmentItems->map(static function (Equipment $item) use ($bookingsByEquipmentId): Equipment {
            if (in_array($item->status, [EquipmentStatus::Maintenance, EquipmentStatus::Borrowed], true)) {
                return $item;
            }

            $bookings = $bookingsByEquipmentId->get($item->id, collect());
            $item->status = $bookings->isNotEmpty() ? EquipmentStatus::Booked : $item->status;

            return $item;
        });
    }

    public function imagePublicId(): string
    {
        return "equipment-{$this->id}";
    }

    public function isAvailable(): bool
    {
        return $this->status === EquipmentStatus::Available;
    }

    public function isUnderMaintenance(): bool
    {
        return $this->status === EquipmentStatus::Maintenance;
    }

    public function scopeAvailable(Builder $query): Builder
    {
        return $query->where('status', EquipmentStatus::Available);
    }

    public function scopeCategory(Builder $query, EquipmentCategory|string $category): Builder
    {
        $value = $category instanceof EquipmentCategory ? $category->value : $category;

        return $query->where('category', $value);
    }
}
