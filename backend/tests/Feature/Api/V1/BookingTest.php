<?php

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
