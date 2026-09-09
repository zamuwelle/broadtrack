<?php

use App\Console\Commands\CancelExpiredPendingBookingsCommand;
use App\Console\Commands\SendReturnDueEmailRemindersCommand;
use App\Models\User;
use Illuminate\Support\Facades\Schedule;

Schedule::command(CancelExpiredPendingBookingsCommand::class)->everyMinute()->timezone('Asia/Manila');
Schedule::command(SendReturnDueEmailRemindersCommand::class)->daily()->timezone('Asia/Manila');
Schedule::command('sanctum:prune-expired --hours=24')->daily()->timezone('Asia/Manila');
Schedule::command('model:prune', [
    '--model' => [User::class],
])->daily()->timezone('Asia/Manila');
