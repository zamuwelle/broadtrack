<?php

namespace App\Console\Commands;

use App\Enums\BookingStatus;
use App\Mail\EquipmentReturnReminderMail;
use App\Models\Booking;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;

#[Description('Send automated email reminders for due soon and overdue equipment returns')]
#[Signature('reminders:send-return-due-emails')]
class SendReturnDueEmailRemindersCommand extends Command
{
    public function handle(): int
    {
        $dueSoonCount = $this->sendDueSoonReminders();
        $overdueCount = $this->sendOverdueAlerts();

        $this->info("Dispatched {$dueSoonCount} due soon reminder(s) and {$overdueCount} overdue alert(s)");

        return self::SUCCESS;
    }

    private function sendDueSoonReminders(): int
    {
        $bookings = Booking::with(['user', 'equipments'])
            ->where('status', BookingStatus::Approved)
            ->whereNull('return_date')
            ->where('end_date', '>=', now())
            ->where('end_date', '<=', now()->addHours(24))
            ->get();

        $sentCount = 0;

        foreach ($bookings as $booking) {
            $borrowerEmail = $booking->user?->email;
            if (! $borrowerEmail) {
                continue;
            }

            $cacheKey = "booking_reminder_{$booking->id}_near_deadline";
            $lock = Cache::lock("{$cacheKey}_lock", 30);
            if (! $lock->get()) {
                continue;
            }
            try {
                if (Cache::has($cacheKey)) {
                    continue;
                }
                $this->dispatchEmail($booking, 'near_deadline', 0);
                Cache::put($cacheKey, true, now()->addDays(14));
                $sentCount++;
            } finally {
                $lock->release();
            }
        }

        return $sentCount;
    }

    private function sendOverdueAlerts(): int
    {
        $bookings = Booking::with(['user', 'equipments'])
            ->where('status', BookingStatus::Approved)
            ->whereNull('return_date')
            ->where('end_date', '<', now())
            ->get();

        $sentCount = 0;

        foreach ($bookings as $booking) {
            $borrowerEmail = $booking->user?->email;
            if (! $borrowerEmail) {
                continue;
            }

            $cacheKey = "booking_reminder_{$booking->id}_overdue_".now()->format('Y-m-d');
            $lock = Cache::lock("{$cacheKey}_lock", 30);
            if (! $lock->get()) {
                continue;
            }
            try {
                if (Cache::has($cacheKey)) {
                    continue;
                }
                $daysOverdue = max(1, (int)($booking->end_date->diffInDays(now())));
                $this->dispatchEmail($booking, 'overdue', $daysOverdue);
                Cache::put($cacheKey, true, now()->addDays(14));
                $sentCount++;
            } finally {
                $lock->release();
            }
        }

        return $sentCount;
    }

    private function dispatchEmail(Booking $booking, string $reminderType, int $daysOverdue): void
    {
        $startDate = $booking->start_date?->format('F d, Y \a\t h:i A');
        $endDate = $booking->end_date->format('F d, Y \a\t h:i A');

        $equipmentsList = $booking->equipments->map(static fn ($equipment) => [
            'name' => $equipment->name,
            'serial_no' => $equipment->serial_no,
        ])->toArray();

        Mail::to($booking->user->email)->queue(new EquipmentReturnReminderMail(
            $booking->ticket_id,
            $booking->user->firstname ?? 'Borrower',
            $endDate,
            $equipmentsList,
            $reminderType,
            $daysOverdue,
            $startDate
        ));
    }
}
