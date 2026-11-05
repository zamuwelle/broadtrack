<?php

use App\Models\Booking;
use App\Models\Equipment;
use App\Models\User;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\IOFactory;

function reportRows(string $content): array
{
    $file = tempnam(sys_get_temp_dir(), 'xlsx');
    try {
        file_put_contents($file, $content);

        return array_slice(IOFactory::createReader('Xlsx')->load($file)->getActiveSheet()->toArray('', true, true, false), 1);
    } finally {
        unlink($file);
    }
}

test('xlsx export contains report data as safe text', function (): void {
    $admin = User::factory()->admin()->create();
    $booking = Booking::factory()->approved()->create(['ticket_id' => 'EXCEL-001', 'purpose' => '=1+1']);
    $booking->equipments()->attach(Equipment::factory()->create()->id);
    $response = $this->actingAs($admin)->get('/api/v1/bookings/reports/xlsx?search=EXCEL-001')->assertOk();
    $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    $file = tempnam(sys_get_temp_dir(), 'xlsx');
    try {
        file_put_contents($file, $response->streamedContent());
        $sheet = IOFactory::createReader('Xlsx')->load($file)->getActiveSheet();
        expect($sheet->getCell('A2')->getValue())->toBe('EXCEL-001')
            ->and($sheet->getCell('L2')->getValue())->toBe('=1+1')
            ->and($sheet->getCell('L2')->getDataType())->toBe(DataType::TYPE_STRING);
    } finally {
        unlink($file);
    }
    $this->actingAs(User::factory()->borrower()->create())->get('/api/v1/bookings/reports/xlsx')->assertForbidden();
});

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

    $response = $this->actingAs($admin)->get('/api/v1/bookings/reports/xlsx');
    $rows = reportRows($response->streamedContent());

    expect(array_column($rows, 0))->toContain('BK-APPROVED-SHOW')->not->toContain('BK-PENDING-HIDE');
});

test('borrower cannot export transactions report', function () {
    $borrower = User::factory()->borrower()->create();

    $this->actingAs($borrower)->get('/api/v1/bookings/reports/pdf')
        ->assertForbidden();

    $this->actingAs($borrower)->get('/api/v1/bookings/reports/xlsx')
        ->assertForbidden();
});

test('unauthenticated user cannot export transactions report', function () {
    $this->getJson('/api/v1/bookings/reports/pdf')
        ->assertUnauthorized();

    $this->getJson('/api/v1/bookings/reports/xlsx')
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

    $response = $this->actingAs($admin)->get('/api/v1/bookings/reports/xlsx')->assertOk();
    $rows = reportRows($response->streamedContent());

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
            ->and($row[11])->toBe('=1+1')
            ->and($row[12])->toBe('Returned');
    }
    $this->get('/api/v1/bookings/reports/pdf')->assertOk()->assertHeader('content-type', 'application/pdf');
})->with([0, 1, 2]);
