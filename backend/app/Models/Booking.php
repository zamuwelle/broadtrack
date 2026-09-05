<?php

namespace App\Models;

use App\Enums\BookingStatus;
use App\Enums\EquipmentStatus;
use App\Observers\BookingObserver;
use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Appends(['is_overdue'])]
#[Fillable(['user_id', 'returned_by_user_id', 'ticket_id', 'purpose', 'start_date', 'end_date', 'return_date', 'status', 'approval_note', 'rejection_reason', 'isRead'])]
#[ObservedBy(BookingObserver::class)]
class Booking extends Model
{
    use HasFactory;

    protected $attributes = [
        'status' => 'pending',
    ];

    protected function casts()
    {
        return [
            'start_date' => 'datetime',
            'end_date' => 'datetime',
            'return_date' => 'datetime',
            'isRead' => 'boolean',
            'status' => BookingStatus::class,
        ];
    }

    protected static function booted()
    {
        static::creating(static fn ($booking) => $booking->generateTicketId());
    }

    public function generateTicketId()
    {
        if ($this->ticket_id) {
            return;
        }

        do {
            $numericCode = str_pad(random_int(0, 99999), 5, '0', STR_PAD_LEFT);
            $suffixCode = strtoupper(bin2hex(random_bytes(2)));
            $generatedTicketId = "TKT-{$numericCode}-{$suffixCode}";
        } while (static::where('ticket_id', $generatedTicketId)->exists());

        $this->ticket_id = $generatedTicketId;
    }

    public function isActive(): bool
    {
        return in_array($this->status, [BookingStatus::Approved, BookingStatus::Released], true);
    }

    protected function isOverdue(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->isActive() && (bool)$this->end_date?->isPast(),
        );
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

    public function approve(?string $note = null): bool
    {
        $updated = $this->update([
            'status' => BookingStatus::Approved,
            'approval_note' => $note ?? $this->approval_note,
            'isRead' => false,
        ]);

        $this->equipments->each->update(['status' => EquipmentStatus::Booked]);

        return $updated;
    }

    public function reject(string $reason): bool
    {
        $updated = $this->update([
            'status' => BookingStatus::Rejected,
            'rejection_reason' => $reason,
            'isRead' => false,
        ]);

        $this->equipments->reject->isUnderMaintenance()->each->update(['status' => EquipmentStatus::Available]);

        return $updated;
    }

    public function release(): bool
    {
        $updated = $this->update(['status' => BookingStatus::Released]);

        $this->equipments->each->update(['status' => EquipmentStatus::Borrowed]);

        return $updated;
    }

    public function markAsReturned(int $returnedByUserId): bool
    {
        $updated = $this->update([
            'status' => BookingStatus::Returned,
            'return_date' => now(),
            'returned_by_user_id' => $returnedByUserId,
            'isRead' => false,
        ]);

        $this->equipments->reject->isUnderMaintenance()->each->update(['status' => EquipmentStatus::Available]);

        return $updated;
    }

    public function cancel(): bool
    {
        $this->equipments->reject->isUnderMaintenance()->each->update(['status' => EquipmentStatus::Available]);

        return $this->update([
            'status' => BookingStatus::Cancelled,
            'isRead' => false,
        ]);
    }

    public function markAsRead(): bool
    {
        return $this->update(['isRead' => true]);
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', [BookingStatus::Approved, BookingStatus::Released]);
    }

    public function scopeOverlapping($query, $startDate, $endDate)
    {
        return $query->where(static function ($q) use ($startDate, $endDate) {
            $q->where('start_date', '<', $endDate)
                ->where('end_date', '>', $startDate);
        });
    }
}
