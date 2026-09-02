# Scheduled Tasks & Console Architecture

All automated background tasks in BroadTrack are centralized in [`routes/console.php`](file:///home/sam/git/broadtrack/backend/routes/console.php), which serves strictly as a thin scheduler declaration map.

---

## Daily Schedule Overview

```php
// routes/console.php
use App\Console\Commands\SendReturnDueEmailRemindersCommand;
use App\Models\User;
use Illuminate\Support\Facades\Schedule;

// 1. Email Reminders (Due soon & Overdue notices)
Schedule::command(SendReturnDueEmailRemindersCommand::class)->daily();

// 2. Sanctum API Token Cleanup (Tokens expired >24h)
Schedule::command('sanctum:prune-expired --hours=24')->daily();

// 3. User Account Pruning (Unverified accounts >24h old)
Schedule::command('model:prune', [
    '--model' => [User::class],
])->daily();
```

---

## 1. Return Due Email Reminders (`SendReturnDueEmailRemindersCommand`)

Located in [`app/Console/Commands/SendReturnDueEmailRemindersCommand.php`](file:///home/sam/git/broadtrack/backend/app/Console/Commands/SendReturnDueEmailRemindersCommand.php).

### Two Dedicated Workflows:
1. **Due Soon Reminders (`sendDueSoonReminders`):**
   - Finds active bookings where `end_date` is between `now` and `now + 24 hours`.
   - Sends an email notice with the return deadline.
   - Cached for 14 days to prevent duplicate sends.
2. **Overdue Alerts (`sendOverdueAlerts`):**
   - Finds active bookings where `end_date < now`.
   - Calculates the exact days overdue (`daysOverdue = max(1, diffInDays)`).
   - Sends an overdue warning email.
   - Cached daily (`booking_reminder_{id}_overdue_{Y-m-d}`) so overdue borrowers receive exactly 1 alert per day until returned.

### Manual Execution:
```bash
php artisan reminders:send-return-due-emails
```

---

## 2. Expired Token Pruning (`sanctum:prune-expired`)

Sanctum's native command for cleaning up database tokens:
- Retains expired tokens for a 24-hour grace period (`--hours=24`).
- Purges all records from the `personal_access_tokens` table older than 48 hours.

### Manual Execution:
```bash
php artisan sanctum:prune-expired --hours=24
```

---

## 3. Native Model Pruning (`model:prune`)

Laravel's native Eloquent model pruning command:
- Reads the `prunable()` method on all registered models.
- Deletes unverified user rows created >24 hours ago.
- Supports dry-run inspection via `--pretend`.

### Manual Execution & Dry Run:
```bash
# Preview what would be deleted without actually deleting
php artisan model:prune --pretend

# Execute actual prune
php artisan model:prune --model="App\Models\User"
```
