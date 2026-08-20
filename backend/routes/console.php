<?php

use App\Enums\BookingStatus;
use App\Mail\EquipmentReturnReminderMail;
use App\Models\Booking;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('reminders:send-return-due', function () {
    $activeBookings = Booking::with(['user', 'equipments'])
        ->where('status', BookingStatus::Released)
        ->whereNull('return_date')
        ->get();

    $sentCount = 0;

    foreach ($activeBookings as $booking) {
        $borrowerEmail = $booking->user?->email;
        if (! $borrowerEmail) {
            continue;
        }

        $startDate = $booking->start_date?->timezone('Asia/Manila')->format('F d, Y \a\t h:i A');
        $endDate = $booking->end_date->timezone('Asia/Manila');
        $currentDate = now('Asia/Manila');

        $reminderType = null;
        $cacheKey = null;
        $daysOverdue = 0;

        if ($endDate->isPast()) {
            $daysOverdue = max(1, (int)$endDate->diffInDays($currentDate));
            $reminderType = 'overdue';
            $cacheKey = "booking_reminder_{$booking->id}_overdue_".$currentDate->format('Y-m-d');
        } elseif ($endDate->isToday() || $endDate->isTomorrow() || $endDate->diffInHours($currentDate) <= 24) {
            $reminderType = 'near_deadline';
            $cacheKey = "booking_reminder_{$booking->id}_near_deadline";
        }

        if ($reminderType && Cache::add($cacheKey, true, now()->addDays(14))) {
            $equipmentsList = $booking->equipments->map(static fn ($equipment) => [
                'name' => $equipment->name,
                'serial_no' => $equipment->serial_no,
            ])->toArray();

            Mail::to($borrowerEmail)->queue(new EquipmentReturnReminderMail(
                $booking->ticket_id,
                $booking->user?->firstname ?? 'Borrower',
                $endDate->format('F d, Y \a\t h:i A'),
                $equipmentsList,
                $reminderType,
                $daysOverdue,
                $startDate
            ));
            $sentCount++;
        }
    }

    $this->info("Dispatched {$sentCount} return reminder(s)");
})->purpose('Send automated email reminders for due soon and overdue equipment');

Schedule::command('reminders:send-return-due')->dailyAt('08:00')->timezone('Asia/Manila');
Schedule::command('sanctum:prune-expired --hours=24')->daily();
