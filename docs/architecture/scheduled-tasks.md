# Scheduled Tasks and Console Commands

[`backend/routes/console.php`](../../backend/routes/console.php) maps scheduled commands. The application scheduler must be run by the deployment environment; this repository does not establish that production is running it.

| Command                               | Schedule                    | Effect                                                                                             |
| ------------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------- |
| `bookings:cancel-expired`             | Every minute, `Asia/Manila` | Cancels pending bookings whose `end_date` is before the current time and records an expiry reason. |
| `reminders:send-return-due-emails`    | Daily, `Asia/Manila`        | Enqueues due-soon and overdue return reminders for approved, unreturned bookings.                  |
| `sanctum:prune-expired --hours=24`    | Daily, `Asia/Manila`        | Prunes expired Sanctum tokens using Laravel's command.                                             |
| `model:prune --model=App\Models\User` | Daily, `Asia/Manila`        | Runs the user model's pruning query for unverified accounts.                                       |

## Pending booking expiry

[`CancelExpiredPendingBookingsCommand`](../../backend/app/Console/Commands/CancelExpiredPendingBookingsCommand.php) selects `pending` bookings with `end_date < now()`. It changes the status to `cancelled`, records `Auto-cancelled: Request expired without approval` in `rejection_reason`, and clears the read flag. It runs every minute, rather than once a day.

Run it manually with:

```bash
cd backend
php artisan bookings:cancel-expired
```

## Return reminders

[`SendReturnDueEmailRemindersCommand`](../../backend/app/Console/Commands/SendReturnDueEmailRemindersCommand.php) handles approved bookings with no `return_date`. A due-soon reminder applies when `end_date` is from now through the next 24 hours. An overdue reminder applies when `end_date` is before now. The command uses cache locks and markers to avoid duplicate enqueues; the marker is written only after the queue call succeeds, so a failed enqueue can be retried. The daily schedule does not guarantee delivery exactly once per calendar day. A queued message has been accepted by the queue, not necessarily delivered to the borrower.

Run it manually with:

```bash
cd backend
php artisan reminders:send-return-due-emails
```

## Pruning

Unverified-user pruning is defined by [`User::prunable`](../../backend/app/Models/User.php). It selects users with no `email_verified_at` whose `created_at` is at least 24 hours old. Laravel's `model:prune` command runs daily for this model. Sanctum token pruning also runs daily with a 24-hour grace argument; refer to Laravel Sanctum behavior for the exact deletion cutoff.
