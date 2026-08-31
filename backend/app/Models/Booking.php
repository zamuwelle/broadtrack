<?php

namespace App\Models;

use App\Enums\BookingStatus;
use App\Observers\BookingObserver;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['user_id', 'returned_by_user_id', 'ticket_id', 'purpose', 'start_date', 'end_date', 'return_date', 'status', 'notes', 'approval_note', 'rejection_reason', 'isRead'])]
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
