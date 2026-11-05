<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

#[Description('Permanently remove users and their booking history five years after deletion')]
#[Signature('users:purge-deleted')]
class PurgeDeletedUsersCommand extends Command
{
    public function handle(): int
    {
        $cutoff = now()->subYears(5);

        User::onlyTrashed()->where('deleted_at', '<=', $cutoff)->orderBy('id')->chunkById(100, function ($users) use ($cutoff): void {
            foreach ($users as $user) {
                DB::transaction(static function () use ($user, $cutoff): void {
                    $user = User::onlyTrashed()->whereKey($user->id)->where('deleted_at', '<=', $cutoff)->lockForUpdate()->first();
                    if (! $user) {
                        return;
                    }

                    Booking::where('returned_by_user_id', $user->id)->where('user_id', '!=', $user->id)->update(['returned_by_user_id' => null]);
                    Booking::where('user_id', $user->id)->delete();
                    $user->tokens()->delete();
                    DB::table('sessions')->where('user_id', $user->id)->delete();
                    $user->forceDelete();
                });
            }
        });

        return self::SUCCESS;
    }
}
