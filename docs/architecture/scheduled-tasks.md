# Scheduled tasks

Laravel console commands in [`backend/routes/console.php`](../../backend/routes/console.php) automate request expiration, return reminder emails, token pruning, and unverified account cleanup.

Scheduled commands run in the `Asia/Manila` timezone.

## Schedule map

| Command                               | Schedule     | Timezone      | Description                                                                                           | Source                                                                                                              |
| :------------------------------------ | :----------- | :------------ | :---------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------ |
| `bookings:cancel-expired`             | Every minute | `Asia/Manila` | Cancels pending requests whose requested end time has passed.                                         | [`CancelExpiredPendingBookingsCommand`](../../backend/app/Console/Commands/CancelExpiredPendingBookingsCommand.php) |
| `reminders:send-return-due-emails`    | Daily        | `Asia/Manila` | Sends reminder emails for approved bookings not yet returned that are due within 24 hours or overdue. | [`SendReturnDueEmailRemindersCommand`](../../backend/app/Console/Commands/SendReturnDueEmailRemindersCommand.php)   |
| `sanctum:prune-expired --hours=24`    | Daily        | `Asia/Manila` | Deletes personal access tokens expired for over 24 hours.                                             | Laravel Sanctum                                                                                                     |
| `model:prune --model=App\Models\User` | Daily        | `Asia/Manila` | Deletes unverified user accounts created at least 24 hours ago.                                       | [`User::prunable`](../../backend/app/Models/User.php)                                                               |

## Pending booking expiration

[`CancelExpiredPendingBookingsCommand`](../../backend/app/Console/Commands/CancelExpiredPendingBookingsCommand.php) runs every minute:

1. Queries bookings where `status = BookingStatus::Pending` and `end_date < now()`.
2. Sets `status = BookingStatus::Cancelled`.
3. Sets `rejection_reason = 'Auto-cancelled: Request expired without approval'`.
4. Sets `isRead = false` so the borrower receives an unread status alert.

Run manually:

```bash
php artisan bookings:cancel-expired
```

## Return reminders and overdue alerts

[`SendReturnDueEmailRemindersCommand`](../../backend/app/Console/Commands/SendReturnDueEmailRemindersCommand.php) inspects approved bookings where `return_date` is null:

1. **Due-soon reminders**: Matches bookings ending within the next 24 hours (`now()` to `now()->addHours(24)`).
    - Acquires a 30-second atomic cache lock (`booking_reminder_{$id}_near_deadline_lock`).
    - Checks for a 14-day deduplication marker (`booking_reminder_{$id}_near_deadline`).
    - Enqueues [`EquipmentReturnReminderMail`](../../backend/app/Mail/EquipmentReturnReminderMail.php) with reminder type `near_deadline`.
    - Stores the 14-day marker on successful enqueue.
2. **Overdue alerts**: Matches bookings past their `end_date` (`end_date < now()`).
    - Acquires a 30-second atomic cache lock (`booking_reminder_{$id}_overdue_{date}_lock`).
    - Checks for a date-specific daily marker (`booking_reminder_{$id}_overdue_{YYYY-MM-DD}`).
    - Calculates overdue days and enqueues [`EquipmentReturnReminderMail`](../../backend/app/Mail/EquipmentReturnReminderMail.php) with reminder type `overdue`.
    - Stores the daily marker on successful enqueue to limit alerts to one per calendar day.

> [!IMPORTANT]
> Queuing sends the job to the configured queue connection (`QUEUE_CONNECTION`, defaulting to `database`). It means the background job was dispatched, not that the email was delivered.

Run manually:

```bash
php artisan reminders:send-return-due-emails
```

## Database pruning tasks

1. **Unverified accounts**: [`User::prunable`](../../backend/app/Models/User.php) matches records where `email_verified_at` is null and `created_at <= now()->subHours(24)`. Daily `model:prune --model=App\Models\User` deletes them.
2. **Sanctum tokens**: Daily `sanctum:prune-expired --hours=24` removes expired tokens from `personal_access_tokens`.

## Deployment requirements

Tasks in [`backend/routes/console.php`](../../backend/routes/console.php) require an active scheduler runner:

- Local development: `bun run dev` starts `php artisan schedule:work`.
- Container configuration: The container entrypoint in [`backend/entrypoint.sh`](../../backend/entrypoint.sh) runs `php artisan schedule:work` in the background. External environments can alternatively invoke `php artisan schedule:run` every minute via cron.
