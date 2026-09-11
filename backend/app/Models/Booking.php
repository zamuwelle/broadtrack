<?php

namespace App\Models;

use App\Enums\BookingStatus;
use App\Observers\BookingObserver;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Carbon;

#[Appends(['is_overdue'])]
#[Fillable(['user_id', 'returned_by_user_id', 'ticket_id', 'purpose', 'start_date', 'end_date', 'return_date', 'status', 'approval_note', 'rejection_reason', 'isRead'])]
#[ObservedBy(BookingObserver::class)]
class Booking extends Model
{
    use HasFactory;

    protected $attributes = [
        'status' => 'pending',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'datetime',
            'end_date' => 'datetime',
            'return_date' => 'datetime',
            'isRead' => 'boolean',
            'status' => BookingStatus::class,
        ];
    }

    protected static function booted(): void
    {
        static::creating(static fn ($booking) => $booking->generateTicketId());
    }

    public function generateTicketId(): string
    {
        if ($this->ticket_id) {
            return $this->ticket_id;
        }

        do {
            $numericCode = str_pad(random_int(0, 99999), 5, '0', STR_PAD_LEFT);
            $suffixCode = strtoupper(bin2hex(random_bytes(2)));
            $generatedTicketId = "TKT-{$numericCode}-{$suffixCode}";
        } while (static::where('ticket_id', $generatedTicketId)->exists());

        return $this->ticket_id = $generatedTicketId;
    }

    public function isActive(): bool
    {
        return $this->status === BookingStatus::Approved;
    }

    protected function isOverdue(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->isActive() && (bool)$this->end_date?->isPast(),
        );
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function returnedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'returned_by_user_id');
    }

    public function equipments(): BelongsToMany
    {
        return $this->belongsToMany(Equipment::class)->withTimestamps();
    }

    public function approve(?string $note = null): bool
    {
        return $this->update([
            'status' => BookingStatus::Approved,
            'approval_note' => $note ?? $this->approval_note,
            'isRead' => false,
        ]);
    }

    public function reject(string $reason): bool
    {
        return $this->update([
            'status' => BookingStatus::Rejected,
            'rejection_reason' => $reason,
            'isRead' => false,
        ]);
    }

    public function markAsReturned(int $returnedByUserId): bool
    {
        return $this->update([
            'status' => BookingStatus::Returned,
            'return_date' => now(),
            'returned_by_user_id' => $returnedByUserId,
            'isRead' => false,
        ]);
    }

    public function cancel(): bool
    {
        return $this->update([
            'status' => BookingStatus::Cancelled,
            'isRead' => false,
        ]);
    }

    public function markAsRead(): bool
    {
        return $this->update(['isRead' => true]);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', BookingStatus::Approved);
    }

    public function scopeOverlapping(Builder $query, DateTimeInterface|string $startDate, DateTimeInterface|string $endDate): Builder
    {
        $start = $startDate instanceof DateTimeInterface ? $startDate : Carbon::parse($startDate);
        $end = $endDate instanceof DateTimeInterface ? $endDate : Carbon::parse($endDate);

        return $query->where(static function ($q) use ($start, $end) {
            $q->where('start_date', '<', $end)
                ->where('end_date', '>', $start);
        });
    }
}
