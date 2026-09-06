<?php

use App\Models\Booking;
use App\Models\Equipment;
use App\Models\User;

test('admin can export transactions report as PDF', function () {
    $admin = User::factory()->admin()->create();
    $borrower = User::factory()->borrower()->create();
    $equipment = Equipment::factory()->available()->create();

    $booking = Booking::factory()->approved()->create([
        'user_id' => $borrower->id,
    ]);
    $booking->equipments()->attach($equipment->id);

    $response = $this->actingAs($admin)->get('/api/v1/bookings/reports/pdf');

    $response->assertOk()
        ->assertHeader('content-type', 'application/pdf');
    expect($response->getContent())->not->toBeEmpty();
});

test('admin can export transactions report as CSV with UTF-8 BOM', function () {
    $admin = User::factory()->admin()->create();
    $borrower = User::factory()->borrower()->create([
        'firstname' => 'Juan',
        'lastname' => 'Dela Cruz',
        'phone' => '09123456789',
        'email' => 'juan.delacruz@student.laverdad.edu.ph',
    ]);
    $equipment = Equipment::factory()->available()->create([
        'name' => 'Sony FX3 Cinema Camera',
    ]);

    $booking = Booking::factory()->approved()->create([
        'user_id' => $borrower->id,
        'ticket_id' => 'BK-TEST-CSV',
        'purpose' => 'Short Film Project',
    ]);
    $booking->equipments()->attach($equipment->id);

    $response = $this->actingAs($admin)->get('/api/v1/bookings/reports/csv');

    $response->assertOk();
    $content = $response->streamedContent();

    expect(substr($content, 0, 3))->toBe(chr(0xEF).chr(0xBB).chr(0xBF));
    expect($content)->toContain('Ticket ID');
    expect($content)->toContain('Borrower Full Name');
    expect($content)->toContain('Contact Number');
    expect($content)->toContain('Email Address');
    expect($content)->toContain('Department');
    expect($content)->toContain('Equipment Name');
    expect($content)->toContain('Category');
    expect($content)->toContain('Model');
    expect($content)->toContain('Serial Number');
    expect($content)->toContain('Borrow Date');
    expect($content)->toContain('Due Date');
    expect($content)->toContain('Actual Return Date');
    expect($content)->toContain('Purpose');
    expect($content)->toContain('Status');
    expect($content)->toContain('BK-TEST-CSV');
    expect($content)->toContain('Juan Dela Cruz');
    expect($content)->toContain('+639123456789');
    expect($content)->toContain('juan.delacruz@student.laverdad.edu.ph');
    expect($content)->toContain('Sony FX3 Cinema Camera');
    expect($content)->toContain('Short Film Project');
});

test('transactions report excludes pending bookings by default', function () {
    $admin = User::factory()->admin()->create();
    $borrower = User::factory()->borrower()->create();
    $equipment = Equipment::factory()->available()->create();

    $pendingBooking = Booking::factory()->pending()->create([
        'user_id' => $borrower->id,
        'ticket_id' => 'BK-PENDING-HIDE',
    ]);
    $pendingBooking->equipments()->attach($equipment->id);

    $approvedBooking = Booking::factory()->approved()->create([
        'user_id' => $borrower->id,
        'ticket_id' => 'BK-APPROVED-SHOW',
    ]);
    $approvedBooking->equipments()->attach($equipment->id);

    $response = $this->actingAs($admin)->get('/api/v1/bookings/reports/csv');
    $content = $response->streamedContent();

    expect($content)->toContain('BK-APPROVED-SHOW');
    expect($content)->not->toContain('BK-PENDING-HIDE');
});

test('borrower cannot export transactions report', function () {
    $borrower = User::factory()->borrower()->create();

    $this->actingAs($borrower)->get('/api/v1/bookings/reports/pdf')
        ->assertForbidden();

    $this->actingAs($borrower)->get('/api/v1/bookings/reports/csv')
        ->assertForbidden();
});

test('unauthenticated user cannot export transactions report', function () {
    $this->getJson('/api/v1/bookings/reports/pdf')
        ->assertUnauthorized();

    $this->getJson('/api/v1/bookings/reports/csv')
        ->assertUnauthorized();
});
