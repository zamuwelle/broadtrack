<?php

use App\Models\Booking;
use App\Models\Equipment;
use App\Models\User;

test('borrower can download their own borrowing slip as PDF', function () {
    $borrower = User::factory()->borrower()->create();
    $equipment = Equipment::factory()->available()->create([
        'name' => 'Canon EOS R5',
    ]);

    $booking = Booking::factory()->approved()->create([
        'user_id' => $borrower->id,
        'ticket_id' => 'SLIP-OWNER-TEST',
    ]);
    $booking->equipments()->attach($equipment->id);

    $response = $this->actingAs($borrower)->get("/api/v1/bookings/{$booking->id}/slip/pdf");

    $response->assertOk()
        ->assertHeader('content-type', 'application/pdf');
    expect($response->getContent())->not->toBeEmpty();
});

test('admin can download any borrower borrowing slip as PDF', function () {
    $admin = User::factory()->admin()->create();
    $borrower = User::factory()->borrower()->create();
    $equipment = Equipment::factory()->available()->create();

    $booking = Booking::factory()->approved()->create([
        'user_id' => $borrower->id,
        'ticket_id' => 'SLIP-ADMIN-TEST',
    ]);
    $booking->equipments()->attach($equipment->id);

    $response = $this->actingAs($admin)->get("/api/v1/bookings/{$booking->id}/slip/pdf");

    $response->assertOk()
        ->assertHeader('content-type', 'application/pdf');
    expect($response->getContent())->not->toBeEmpty();
});

test('borrower cannot download another borrower borrowing slip', function () {
    $borrower1 = User::factory()->borrower()->create();
    $borrower2 = User::factory()->borrower()->create();

    $booking = Booking::factory()->approved()->create([
        'user_id' => $borrower1->id,
    ]);

    $response = $this->actingAs($borrower2)->get("/api/v1/bookings/{$booking->id}/slip/pdf");

    $response->assertForbidden();
});

test('unauthenticated user cannot download borrowing slip', function () {
    $booking = Booking::factory()->approved()->create();

    $this->getJson("/api/v1/bookings/{$booking->id}/slip/pdf")
        ->assertUnauthorized();
});

test('unauthenticated user requesting pdf gets 401 instead of route not defined', function () {
    $booking = Booking::factory()->approved()->create();

    $this->get("/api/v1/bookings/{$booking->id}/slip/pdf", ['Accept' => 'application/pdf'])
        ->assertUnauthorized();
});
