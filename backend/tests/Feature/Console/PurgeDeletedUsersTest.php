<?php

use App\Models\Booking;
use App\Models\User;
use Illuminate\Support\Facades\DB;

test('purges users deleted at least five years ago and their booking history', function (): void {
    $old = User::factory()->borrower()->create();
    $recent = User::factory()->borrower()->create();
    $active = User::factory()->borrower()->create();
    $ownBooking = Booking::factory()->returned()->create(['user_id' => $old->id]);
    $otherBooking = Booking::factory()->returned()->create(['user_id' => $active->id, 'returned_by_user_id' => $old->id]);
    $token = $old->createToken('retention-test');
    DB::table('sessions')->insert(['id' => 'retention-session', 'user_id' => $old->id, 'payload' => '', 'last_activity' => now()->timestamp]);
    $old->delete();
    $recent->delete();
    DB::table('users')->where('id', $old->id)->update(['deleted_at' => now()->subYears(5)->subMinute()]);
    DB::table('users')->where('id', $recent->id)->update(['deleted_at' => now()->subYears(5)->addDay()]);

    $this->artisan('users:purge-deleted')->assertSuccessful();

    $this->assertDatabaseMissing('users', ['id' => $old->id]);
    $this->assertDatabaseMissing('personal_access_tokens', ['id' => $token->accessToken->id]);
    $this->assertDatabaseMissing('sessions', ['id' => 'retention-session']);
    $this->assertDatabaseMissing('bookings', ['id' => $ownBooking->id]);
    $this->assertSoftDeleted('users', ['id' => $recent->id]);
    $this->assertDatabaseHas('users', ['id' => $active->id, 'deleted_at' => null]);
    $this->assertDatabaseHas('bookings', ['id' => $otherBooking->id, 'returned_by_user_id' => null]);
});
