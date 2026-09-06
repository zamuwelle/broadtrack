<?php

use App\Enums\BookingStatus;
use App\Enums\EquipmentCategory;
use App\Enums\EquipmentStatus;
use App\Models\Booking;
use App\Models\Equipment;
use App\Models\User;

test('borrower can create booking request', function () {
    $borrower = User::factory()->borrower()->create();
    $equipment = Equipment::factory()->available()->create();

    $response = $this->actingAs($borrower)->postJson('/api/v1/bookings', [
        'purpose' => 'Final Year Project',
        'start_date' => now()->addDays(1)->format('Y-m-d H:i:s'),
        'end_date' => now()->addDays(2)->format('Y-m-d H:i:s'),
        'equipment_ids' => [$equipment->id],
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.purpose', 'Final Year Project')
        ->assertJsonPath('data.status', 'pending');

    $this->assertDatabaseHas('bookings', [
        'user_id' => $borrower->id,
        'purpose' => 'Final Year Project',
    ]);
});

test('cannot book equipment under maintenance', function () {
    $borrower = User::factory()->borrower()->create();
    $equipment = Equipment::factory()->maintenance()->create();

    $response = $this->actingAs($borrower)->postJson('/api/v1/bookings', [
        'purpose' => 'Test Booking',
        'start_date' => now()->addDays(1)->format('Y-m-d H:i:s'),
        'end_date' => now()->addDays(2)->format('Y-m-d H:i:s'),
        'equipment_ids' => [$equipment->id],
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['equipment_ids']);
});

test('admin can approve pending booking', function () {
    $admin = User::factory()->admin()->create();
    $equipment = Equipment::factory()->available()->create();
    $booking = Booking::factory()->pending()->create();
    $booking->equipments()->attach($equipment->id);

    $response = $this->actingAs($admin)->putJson("/api/v1/bookings/{$booking->id}/approve", [
        'approval_note' => 'Approved for studio use',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.status', 'approved');

    $this->assertDatabaseHas('bookings', [
        'id' => $booking->id,
        'status' => 'approved',
    ]);
});

test('admin can release approved booking', function () {
    $admin = User::factory()->admin()->create();
    $equipment = Equipment::factory()->create(['status' => EquipmentStatus::Booked]);
    $booking = Booking::factory()->approved()->create();
    $booking->equipments()->attach($equipment->id);

    $response = $this->actingAs($admin)->putJson("/api/v1/bookings/{$booking->id}/release");

    $response->assertOk()
        ->assertJsonPath('data.status', 'released');
});

test('admin can return released booking', function () {
    $admin = User::factory()->admin()->create();
    $equipment = Equipment::factory()->borrowed()->create();
    $booking = Booking::factory()->released()->create();
    $booking->equipments()->attach($equipment->id);

    $response = $this->actingAs($admin)->putJson("/api/v1/bookings/{$booking->id}/return");

    $response->assertOk()
        ->assertJsonPath('data.status', 'returned')
        ->assertJsonPath('data.returned_by_user_id', $admin->id);
});

test('borrower can cancel their own pending booking', function () {
    $borrower = User::factory()->borrower()->create();
    $booking = Booking::factory()->pending()->create(['user_id' => $borrower->id]);

    $response = $this->actingAs($borrower)->putJson("/api/v1/bookings/{$booking->id}/cancel");

    $response->assertOk()
        ->assertJsonPath('data.status', 'cancelled');
});

test('borrower cannot approve booking', function () {
    $borrower = User::factory()->borrower()->create();
    $booking = Booking::factory()->pending()->create();

    $response = $this->actingAs($borrower)->putJson("/api/v1/bookings/{$booking->id}/approve");

    $response->assertForbidden();
});

test('borrower only sees their own bookings', function () {
    $borrower = User::factory()->borrower()->create();
    $otherUser = User::factory()->borrower()->create();

    Booking::factory()->pending()->create(['user_id' => $borrower->id]);
    Booking::factory()->pending()->create(['user_id' => $otherUser->id]);

    $response = $this->actingAs($borrower)->getJson('/api/v1/bookings');

    $response->assertOk()
        ->assertJsonCount(1, 'data');
});

test('admin sees all bookings', function () {
    $admin = User::factory()->admin()->create();
    $user1 = User::factory()->borrower()->create();
    $user2 = User::factory()->borrower()->create();

    Booking::factory()->pending()->create(['user_id' => $user1->id]);
    Booking::factory()->pending()->create(['user_id' => $user2->id]);

    $response = $this->actingAs($admin)->getJson('/api/v1/bookings');

    $response->assertOk()
        ->assertJsonCount(2, 'data');
});

test('cannot book equipment with overlapping dates', function () {
    $borrower = User::factory()->borrower()->create();
    $equipment = Equipment::factory()->available()->create();

    $existingBooking = Booking::factory()->approved()->create([
        'start_date' => now()->addDays(1),
        'end_date' => now()->addDays(3),
    ]);
    $existingBooking->equipments()->attach($equipment->id);

    $response = $this->actingAs($borrower)->postJson('/api/v1/bookings', [
        'purpose' => 'Conflicting shoot',
        'start_date' => now()->addDays(2)->format('Y-m-d H:i:s'),
        'end_date' => now()->addDays(4)->format('Y-m-d H:i:s'),
        'equipment_ids' => [$equipment->id],
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['equipment_ids']);
});

test('admin can reject pending booking', function () {
    $admin = User::factory()->admin()->create();
    $equipment = Equipment::factory()->available()->create();
    $booking = Booking::factory()->pending()->create();
    $booking->equipments()->attach($equipment->id);

    $response = $this->actingAs($admin)->putJson("/api/v1/bookings/{$booking->id}/reject", [
        'rejection_reason' => 'Schedule conflict with production studio',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.status', 'rejected')
        ->assertJsonPath('data.rejection_reason', 'Schedule conflict with production studio');

    $this->assertDatabaseHas('bookings', [
        'id' => $booking->id,
        'status' => 'rejected',
        'rejection_reason' => 'Schedule conflict with production studio',
    ]);
});

test('admin cannot approve non-pending booking', function () {
    $admin = User::factory()->admin()->create();
    $booking = Booking::factory()->released()->create();

    $response = $this->actingAs($admin)->putJson("/api/v1/bookings/{$booking->id}/approve");

    $response->assertStatus(422);
});

test('admin cannot release non-approved booking', function () {
    $admin = User::factory()->admin()->create();
    $booking = Booking::factory()->pending()->create();

    $response = $this->actingAs($admin)->putJson("/api/v1/bookings/{$booking->id}/release");

    $response->assertStatus(422);
});

test('admin can return approved booking', function () {
    $admin = User::factory()->admin()->create();
    $booking = Booking::factory()->approved()->create();

    $response = $this->actingAs($admin)->putJson("/api/v1/bookings/{$booking->id}/return");

    $response->assertOk()
        ->assertJsonPath('data.status', 'returned');
    expect($booking->fresh()->status)->toBe(BookingStatus::Returned);
});

test('admin cannot return pending or cancelled booking', function () {
    $admin = User::factory()->admin()->create();
    $pendingBooking = Booking::factory()->pending()->create();
    $cancelledBooking = Booking::factory()->cancelled()->create();

    $this->actingAs($admin)->putJson("/api/v1/bookings/{$pendingBooking->id}/return")
        ->assertStatus(422);

    $this->actingAs($admin)->putJson("/api/v1/bookings/{$cancelledBooking->id}/return")
        ->assertStatus(422);
});

test('returning booking preserves equipment under maintenance', function () {
    $admin = User::factory()->admin()->create();
    $brokenEquipment = Equipment::factory()->maintenance()->create();
    $booking = Booking::factory()->released()->create();
    $booking->equipments()->attach($brokenEquipment->id);

    $response = $this->actingAs($admin)->putJson("/api/v1/bookings/{$booking->id}/return");

    $response->assertOk();
    expect($brokenEquipment->fresh()->status)->toBe(EquipmentStatus::Maintenance);
});

test('borrower cannot submit booking with empty equipment list', function () {
    $borrower = User::factory()->borrower()->create();

    $response = $this->actingAs($borrower)->postJson('/api/v1/bookings', [
        'equipment_ids' => [],
        'purpose' => 'Empty equipment test',
        'start_date' => now()->addDay()->toDateString(),
        'end_date' => now()->addDays(2)->toDateString(),
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['equipment_ids']);
});

test('admin cannot approve booking when equipment has overlapping active booking', function () {
    $admin = User::factory()->admin()->create();
    $equipment = Equipment::factory()->available()->create();

    $activeBooking = Booking::factory()->approved()->create([
        'start_date' => now()->addDays(1),
        'end_date' => now()->addDays(3),
    ]);
    $activeBooking->equipments()->attach($equipment->id);

    $pendingBooking = Booking::factory()->pending()->create([
        'start_date' => now()->addDays(2),
        'end_date' => now()->addDays(4),
    ]);
    $pendingBooking->equipments()->attach($equipment->id);

    $response = $this->actingAs($admin)->putJson("/api/v1/bookings/{$pendingBooking->id}/approve");

    $response->assertStatus(422)
        ->assertJsonPath('message', 'One or more equipment items have an active booking overlapping this period.');
});

test('borrower and admin can cancel approved booking', function () {
    $borrower = User::factory()->borrower()->create();
    $admin = User::factory()->admin()->create();
    $equipment = Equipment::factory()->available()->create();

    $booking1 = Booking::factory()->approved()->create(['user_id' => $borrower->id]);
    $booking1->equipments()->attach($equipment->id);

    $response1 = $this->actingAs($borrower)->putJson("/api/v1/bookings/{$booking1->id}/cancel");
    $response1->assertOk()
        ->assertJsonPath('data.status', 'cancelled');

    $booking2 = Booking::factory()->approved()->create(['user_id' => $borrower->id]);
    $booking2->equipments()->attach($equipment->id);

    $response2 = $this->actingAs($admin)->putJson("/api/v1/bookings/{$booking2->id}/cancel");
    $response2->assertOk()
        ->assertJsonPath('data.status', 'cancelled');
});

test('borrower can fetch public bookings with sanitized details', function () {
    $borrower = User::factory()->borrower()->create();
    $otherUser = User::factory()->borrower()->create();
    $equipment = Equipment::factory()->available()->create();

    $otherBooking = Booking::factory()->approved()->create([
        'user_id' => $otherUser->id,
        'purpose' => 'Confidential Documentary',
    ]);
    $otherBooking->equipments()->attach($equipment->id);

    $response = $this->actingAs($borrower)->getJson('/api/v1/bookings?public=1');

    $response->assertOk();
    $item = collect($response->json('data'))->firstWhere('id', $otherBooking->id);
    expect($item)->not->toBeNull();
    expect($item['purpose'])->toBeNull();
    expect($item['user'])->toBeNull();
    expect($item['user_id'])->toBeNull();
});

test('approving or returning booking does not mutate equipment table status', function () {
    $admin = User::factory()->admin()->create();
    $equipment = Equipment::factory()->available()->create();
    $booking = Booking::factory()->pending()->create();
    $booking->equipments()->attach($equipment->id);

    $this->actingAs($admin)->putJson("/api/v1/bookings/{$booking->id}/approve")->assertOk();
    expect($equipment->fresh()->getRawOriginal('status'))->toBe(EquipmentStatus::Available->value);

    $this->actingAs($admin)->putJson("/api/v1/bookings/{$booking->id}/return")->assertOk();
    expect($equipment->fresh()->getRawOriginal('status'))->toBe(EquipmentStatus::Available->value);
});

test('equipment serial number counter avoids duplicates on deletion', function () {
    $eq1 = Equipment::create([
        'name' => 'Sony FX3',
        'category' => EquipmentCategory::Camera->value,
    ]);
    $eq2 = Equipment::create([
        'name' => 'Sony FX3',
        'category' => EquipmentCategory::Camera->value,
    ]);
    expect($eq2->serial_no)->toBe('SN-SON-0002');

    $eq1->delete();

    $eq3 = Equipment::create([
        'name' => 'Sony FX3',
        'category' => EquipmentCategory::Camera->value,
    ]);
    expect($eq3->serial_no)->not->toBe($eq2->serial_no);
    expect($eq3->serial_no)->toBe('SN-SON-0003');
});

test('borrower checking out multiple equipment items creates independent bookings per item', function () {
    $borrower = User::factory()->borrower()->create();
    $admin = User::factory()->admin()->create();
    $eq1 = Equipment::factory()->available()->create();
    $eq2 = Equipment::factory()->available()->create();

    $response = $this->actingAs($borrower)->postJson('/api/v1/bookings', [
        'purpose' => 'Multi-gear shoot',
        'start_date' => now()->addDays(1)->format('Y-m-d H:i:s'),
        'end_date' => now()->addDays(2)->format('Y-m-d H:i:s'),
        'equipment_ids' => [$eq1->id, $eq2->id],
    ]);

    $response->assertCreated();
    expect($response->json('data'))->toHaveCount(2);

    $bookings = Booking::where('user_id', $borrower->id)->get();
    expect($bookings)->toHaveCount(2);

    $booking1 = $bookings->first();
    $booking2 = $bookings->last();

    expect($booking1->id)->not->toBe($booking2->id);
    expect($booking1->ticket_id)->not->toBe($booking2->ticket_id);
    expect($booking1->equipments)->toHaveCount(1);
    expect($booking2->equipments)->toHaveCount(1);

    $this->actingAs($admin)->putJson("/api/v1/bookings/{$booking1->id}/approve", [
        'approval_note' => 'Approved gear 1',
    ])->assertOk();

    expect($booking1->fresh()->status)->toBe(BookingStatus::Approved);
    expect($booking2->fresh()->status)->toBe(BookingStatus::Pending);
});
