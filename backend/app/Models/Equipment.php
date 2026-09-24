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

    protected static function booted(): void
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
        $maxUnit = static::where('serial_no', 'like', "SN-{$code}-%")
            ->pluck('serial_no')
            ->map(static fn (string $sn): int => (int)substr(strrchr($sn, '-'), 1))
            ->max() ?? 0;
        $unit = $maxUnit + 1;
        $this->serial_no = sprintf('SN-%s-%04d', $code, $unit);
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
