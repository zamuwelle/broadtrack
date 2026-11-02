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
    expect($response->headers->get('content-disposition'))->toContain('inline');
});

test('admin can export transactions report as CSV with UTF-8 BOM', function () {
    $admin = User::factory()->admin()->create();
    $borrower = User::factory()->borrower()->create([
        'firstname' => 'Juan',
        'lastname' => 'Dela Cruz',
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
    expect($content)->not->toContain('Contact Number');
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
    expect($content)->not->toContain('09123456789');
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

test('transaction exports preserve rows for zero one or multiple equipment', function (int $count): void {
    $admin = User::factory()->admin()->create(['firstname' => 'Alice', 'lastname' => 'Adams', 'department' => null]);
    $booking = Booking::factory()->returned()->create([
        'user_id' => $admin->id, 'ticket_id' => 'REPORT-ROWS', 'purpose' => '=1+1',
        'start_date' => '2026-01-10 00:00:00', 'end_date' => '2026-01-11 00:00:00', 'return_date' => '2026-01-11 01:00:00',
    ]);
    for ($index = 0; $index < $count; $index++) {
        $booking->equipments()->attach(Equipment::factory()->create([
            'name' => 'Camera '.$index, 'category' => 'Camera', 'model' => null, 'serial_no' => 'REPORT-'.$index,
        ]));
    }

    $response = $this->actingAs($admin)->get('/api/v1/bookings/reports/csv')->assertOk();
    $lines = explode("\n", trim(substr($response->streamedContent(), 3)));
    $rows = array_map(static fn (string $line): array => str_getcsv($line, ',', '"', ''), array_slice($lines, 1));

    expect($rows)->toHaveCount(max(1, $count));
    foreach ($rows as $index => $row) {
        expect($row)->toHaveCount(13)
            ->and($row[0])->toBe('REPORT-ROWS')
            ->and($row[1])->toBe('Alice Adams')
            ->and($row[3])->toBe('')
            ->and($row[4])->toBe($count ? 'Camera '.$index : 'None')
            ->and($row[5])->toBe($count ? 'Camera' : 'N/A')
            ->and($row[6])->toBe('')
            ->and($row[7])->toBe($count ? 'REPORT-'.$index : 'N/A')
            ->and($row[11])->toBe("'=1+1")
            ->and($row[12])->toBe('Returned');
    }
    $this->get('/api/v1/bookings/reports/pdf')->assertOk()->assertHeader('content-type', 'application/pdf');
})->with([0, 1, 2]);

test('csv export does not emit php deprecation warnings', function (): void {
    $admin = User::factory()->admin()->create();
    $borrower = User::factory()->borrower()->create();
    $equipment = Equipment::factory()->available()->create();

    $booking = Booking::factory()->approved()->create([
        'user_id' => $borrower->id,
    ]);
    $booking->equipments()->attach($equipment->id);

    $deprecations = [];
    set_error_handler(static function (int $errno, string $errstr) use (&$deprecations): bool {
        if ($errno === E_DEPRECATED || $errno === E_USER_DEPRECATED) {
            $deprecations[] = $errstr;
        }

        return true;
    });

    try {
        $response = $this->actingAs($admin)->get('/api/v1/bookings/reports/csv');
        $response->assertOk();
        $response->streamedContent();
    } finally {
        restore_error_handler();
    }

    expect($deprecations)->toBeEmpty();
});
