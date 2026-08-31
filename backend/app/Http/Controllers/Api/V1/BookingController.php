<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\BookingStatus;
use App\Enums\EquipmentStatus;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\ApproveBookingRequest;
use App\Http\Requests\Api\V1\RejectBookingRequest;
use App\Http\Requests\Api\V1\StoreBookingRequest;
use App\Http\Resources\Api\V1\BookingResource;
use App\Mail\EquipmentReturnReminderMail;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class BookingController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = $user->isAdmin()
            ? Booking::query()
            : $user->bookings();

        return $this->success(BookingResource::collection(
            $query->with(['user', 'equipments.category', 'returnedByUser'])->get()
        ));
    }

    public function show(Booking $booking): JsonResponse
    {
        $booking->load(['user', 'equipments.category', 'returnedByUser']);

        $this->authorize('view', $booking);

        return $this->success(new BookingResource($booking));
    }

    public function store(StoreBookingRequest $request): JsonResponse
    {
        $booking = $request->user()->bookings()->create(
            $request->safe()->except('equipment_ids')
        );

        $booking->equipments()->attach($request->validated('equipment_ids'));

        return $this->created(
            new BookingResource($booking->load('equipments')),
            'Booking created successfully.'
        );
    }

    public function approve(ApproveBookingRequest $request, Booking $booking): JsonResponse
    {
        $this->authorize('manage', $booking);

        $validated = $request->validated();

        $booking->update([
            'status' => BookingStatus::Approved,
            'approval_note' => $validated['approval_note'] ?? $booking->approval_note,
            'isRead' => false,
        ]);
        $booking->equipments->each->update(['status' => EquipmentStatus::Booked]);

        return $this->success(new BookingResource($booking), 'Booking approved');
    }

    public function reject(RejectBookingRequest $request, Booking $booking): JsonResponse
    {
        $this->authorize('manage', $booking);

        $validated = $request->validated();

        $booking->update([
            'status' => BookingStatus::Rejected,
            'rejection_reason' => $validated['rejection_reason'],
            'isRead' => false,
        ]);
        $booking->equipments->each->update(['status' => EquipmentStatus::Available]);

        return $this->success(new BookingResource($booking), 'Booking rejected');
    }

    public function release(Booking $booking): JsonResponse
    {
        $this->authorize('manage', $booking);

        $booking->update(['status' => BookingStatus::Released]);
        $booking->equipments->each->update(['status' => EquipmentStatus::Borrowed]);

        return $this->success(new BookingResource($booking), 'Booking released');
    }

    public function return(Request $request, Booking $booking): JsonResponse
    {
        $this->authorize('manage', $booking);

        $booking->update([
            'status' => BookingStatus::Returned,
            'return_date' => now(),
            'returned_by_user_id' => $request->user()->id,
            'isRead' => false,
        ]);
        $booking->equipments->each->update(['status' => EquipmentStatus::Available]);

        return $this->success(new BookingResource($booking), 'Booking returned');
    }

    public function cancel(Booking $booking): JsonResponse
    {
        $this->authorize('cancel', $booking);

        $booking->equipments->each->update(['status' => EquipmentStatus::Available]);
        $booking->update([
            'status' => BookingStatus::Cancelled,
            'isRead' => false,
        ]);

        return $this->success(new BookingResource($booking), 'Booking cancelled');
    }

    public function isRead(Booking $booking): JsonResponse
    {
        $this->authorize('markAsRead', $booking);

        $booking->update(['isRead' => true]);

        return $this->success(new BookingResource($booking), 'Notification marked as read');
    }

    public function remind(Booking $booking): JsonResponse
    {
        $this->authorize('manage', $booking);

        $booking->load(['user', 'equipments']);
        $borrowerEmail = $booking->user?->email;
        if (! $borrowerEmail) {
            return $this->validationError(message: 'Borrower email not found.');
        }

        $startDate = $booking->start_date?->timezone('Asia/Manila')->format('F d, Y \a\t h:i A');
        $endDate = $booking->end_date->timezone('Asia/Manila');
        $currentDate = now('Asia/Manila');

        $daysOverdue = max(0, (int)$endDate->diffInDays($currentDate));
        $reminderType = $endDate->isPast() ? 'overdue' : 'near_deadline';

        $equipmentsList = $booking->equipments->map(static fn ($equipment) => [
            'name' => $equipment->name,
            'serial_no' => $equipment->serial_no,
        ])->toArray();

        try {
            Mail::to($borrowerEmail)->queue(new EquipmentReturnReminderMail(
                $booking->ticket_id,
                $booking->user?->firstname ?? 'Borrower',
                $endDate->format('F d, Y \a\t h:i A'),
                $equipmentsList,
                $reminderType,
                $daysOverdue,
                $startDate
            ));
        } catch (\Throwable) {
        }

        return $this->success();
    }
}
