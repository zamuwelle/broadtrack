<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Models\Booking;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\File;
use Picqer\Barcode\Renderers\SvgRenderer;
use Picqer\Barcode\Types\TypeCode128;
use Symfony\Component\HttpFoundation\Response;

class BookingSlipController extends ApiController
{
    public function show(Booking $booking): Response
    {
        $this->authorize('view', $booking);

        $booking->loadMissing(['user', 'equipments', 'returnedByUser']);

        File::ensureDirectoryExists(storage_path('fonts'));

        $pdf = Pdf::loadView('pdf.borrowing-slip', [
            'booking' => $booking,
            'barcode' => (new SvgRenderer)->render((new TypeCode128)->getBarcode($booking->ticket_id), 220, 36),
        ])->setPaper('a4', 'portrait');

        return $pdf->stream("borrowing_slip_{$booking->ticket_id}.pdf");
    }
}
