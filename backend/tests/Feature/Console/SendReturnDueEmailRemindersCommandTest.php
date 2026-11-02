<?php

use App\Models\Booking;
use App\Models\User;
use Illuminate\Mail\PendingMail;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use RuntimeException;

test('failed due reminder dispatch is retried on the next scheduled run', function (): void {
    Cache::flush();
    $borrower = User::factory()->borrower()->create([
        'email' => 'due.reminder@student.laverdad.edu.ph',
    ]);
    Booking::factory()->approved()->create([
        'user_id' => $borrower->id,
        'end_date' => now()->addHours(12),
        'return_date' => null,
    ]);

    $attempt = 0;
    $pendingMail = Mockery::mock(PendingMail::class);
    $pendingMail->shouldReceive('queue')->twice()->andReturnUsing(static function () use (&$attempt): void {
        $attempt++;
        if ($attempt === 1) {
            throw new RuntimeException('queue unavailable');
        }
    });
    Mail::shouldReceive('to')->twice()->with($borrower->email)->andReturn($pendingMail);

    try {
        Artisan::call('reminders:send-return-due-emails');
    } catch (RuntimeException) {
    }

    Artisan::call('reminders:send-return-due-emails');

    expect($attempt)->toBe(2)
        ->and(Cache::has("booking_reminder_{$borrower->bookings()->first()->id}_near_deadline"))->toBeTrue();
});
