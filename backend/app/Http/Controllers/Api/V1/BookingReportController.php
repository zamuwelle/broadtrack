<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\BookingStatus;
use App\Http\Controllers\Api\ApiController;
use App\Models\Booking;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BookingReportController extends ApiController
{
    public function exportXlsx(Request $request): StreamedResponse
    {
        $this->authorize('manage', Booking::class);
        $rows = $this->flattenRows($this->getFilteredBookings($request));
        $filename = 'transactions_report_'.now()->timezone('Asia/Manila')->format('Ymd_His').'.xlsx';

        return response()->streamDownload(static function () use ($rows): void {
            $spreadsheet = new Spreadsheet;
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->fromArray(['Ticket ID', 'Borrower Full Name', 'Email Address', 'Department', 'Equipment Name', 'Category', 'Model', 'Serial Number', 'Borrow Date', 'Due Date', 'Actual Return Date', 'Purpose', 'Status'], null, 'A1');
            $keys = ['ticket_id', 'borrower', 'email', 'department', 'equipment_name', 'category', 'model', 'serial_no', 'borrow_date', 'due_date', 'actual_return_date', 'purpose', 'status_label'];
            foreach ($rows as $index => $row) {
                foreach ($keys as $column => $key) {
                    $sheet->setCellValueExplicit([$column + 1, $index + 2], (string)($row[$key] ?? ''), DataType::TYPE_STRING);
                }
            }
            (new Xlsx($spreadsheet))->save('php://output');
            $spreadsheet->disconnectWorksheets();
        }, $filename, ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']);
    }

    public function exportPdf(Request $request): Response
    {
        $this->authorize('manage', Booking::class);

        $bookings = $this->getFilteredBookings($request);
        $rows = $this->flattenRows($bookings);
        $generatedAt = now()->timezone('Asia/Manila')->format('F d, Y h:i A');

        File::ensureDirectoryExists(storage_path('fonts'));

        $pdf = Pdf::loadView('pdf.transactions-report', [
            'rows' => $rows,
            'generatedAt' => $generatedAt,
        ])->setPaper('a4', 'landscape');

        $timestamp = now()->timezone('Asia/Manila')->format('Ymd_His');

        return $pdf->stream("transactions_report_{$timestamp}.pdf");
    }

    private function getFilteredBookings(Request $request): Collection
    {
        $query = Booking::with(['user', 'equipments'])->orderByDesc('start_date');

        $category = $request->query('category', 'All');
        if ($category === 'Active') {
            $query->where('status', BookingStatus::Approved)
                ->where('end_date', '>=', now());
        } elseif ($category === 'Completed') {
            $query->where('status', BookingStatus::Returned);
        } elseif ($category === 'Overdue') {
            $query->where('status', BookingStatus::Approved)
                ->where('end_date', '<', now());
        } elseif ($category === 'Cancelled') {
            $query->whereIn('status', [BookingStatus::Cancelled, BookingStatus::Rejected]);
        } else {
            $query->whereIn('status', [
                BookingStatus::Approved,
                BookingStatus::Returned,
                BookingStatus::Cancelled,
                BookingStatus::Rejected,
            ]);
        }

        if ($search = $request->query('search')) {
            $query->where(static function ($q) use ($search) {
                $q->where('ticket_id', 'like', "%{$search}%")
                    ->orWhere('purpose', 'like', "%{$search}%")
                    ->orWhereHas('user', static function ($userQuery) use ($search) {
                        $userQuery->where('firstname', 'like', "%{$search}%")
                            ->orWhere('lastname', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('equipments', static function ($equipQuery) use ($search) {
                        $equipQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('serial_no', 'like', "%{$search}%");
                    });
            });
        }

        return $query->get();
    }

    private function flattenRows(Collection $bookings): array
    {
        $rows = [];

        foreach ($bookings as $booking) {
            $isOverdue = $booking->isActive() && $booking->end_date?->isPast();
            $statusKey = $isOverdue ? 'overdue' : $booking->status->value;
            $statusLabel = $isOverdue ? 'Overdue' : ucfirst($booking->status->value);

            $borrowDate = $booking->start_date?->timezone('Asia/Manila')->format('M d, Y h:i A') ?? 'N/A';
            $dueDate = $booking->end_date?->timezone('Asia/Manila')->format('M d, Y h:i A') ?? 'N/A';
            $actualReturnDate = $booking->return_date?->timezone('Asia/Manila')->format('M d, Y h:i A') ?? '';

            $user = $booking->user;
            $borrowerName = $user?->full_name ?? 'N/A';
            $email = $user?->email ?? 'N/A';
            $department = $user?->department?->value ?? (string)$user?->department ?? 'N/A';
            $deptShort = $user?->department?->shorthand() ?? '';
            $purpose = $booking->purpose ?: 'N/A';

            $equipments = $booking->equipments->isNotEmpty() ? $booking->equipments : [null];
            foreach ($equipments as $equipment) {
                $rows[] = [
                    'ticket_id' => $booking->ticket_id,
                    'borrower' => $borrowerName,
                    'email' => $email,
                    'department' => $department,
                    'department_short' => $deptShort,
                    'equipment_name' => $equipment?->name ?? 'None',
                    'category' => $equipment ? ($equipment->category?->value ?? (string)$equipment->category ?? 'N/A') : 'N/A',
                    'model' => $equipment?->model ?? '',
                    'serial_no' => $equipment?->serial_no ?? 'N/A',
                    'borrow_date' => $borrowDate,
                    'due_date' => $dueDate,
                    'actual_return_date' => $actualReturnDate,
                    'purpose' => $purpose,
                    'status_key' => $statusKey,
                    'status_label' => $statusLabel,
                ];
            }
        }

        return $rows;
    }
}
