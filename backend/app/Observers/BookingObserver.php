<?php

namespace App\Observers;

use App\Events\BookingUpdated;
use App\Events\EquipmentUpdated;
use App\Models\Booking;

class BookingObserver
{
    public function created(Booking $booking): void
    {
        rescue(static function () use ($booking) {
            broadcast(new BookingUpdated('created', $booking->id));
            broadcast(new EquipmentUpdated('updated'));
        }, report: false);
    }

    public function updated(Booking $booking): void
    {
        rescue(static function () use ($booking) {
            $action = $booking->status?->value ?? 'updated';
            broadcast(new BookingUpdated($action, $booking->id));
            broadcast(new EquipmentUpdated('updated'));
        }, report: false);
    }

    public function deleted(Booking $booking): void
    {
        rescue(static function () use ($booking) {
            broadcast(new BookingUpdated('deleted', $booking->id));
            broadcast(new EquipmentUpdated('updated'));
        }, report: false);
    }
}
