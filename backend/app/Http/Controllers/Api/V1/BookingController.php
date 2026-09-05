<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\BookingStatus;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\ApproveBookingRequest;
use App\Http\Requests\Api\V1\RejectBookingRequest;
use App\Http\Requests\Api\V1\StoreBookingRequest;
use App\Http\Resources\Api\V1\BookingResource;
use App\Mail\EquipmentReturnReminderMail;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
            $query->with(['user', 'equipments', 'returnedByUser'])->get()
        ));
    }

    public function show(Booking $booking): JsonResponse
    {
        $booking->load(['user', 'equipments', 'returnedByUser']);

        $this->authorize('view', $booking);

        return $this->success(new BookingResource($booking));
    }

    public function store(StoreBookingRequest $request): JsonResponse
    {
        $equipmentIds = $request->validated('equipment_ids');

        $booking = DB::transaction(function () use ($request, $equipmentIds) {
            $booking = $request->user()->bookings()->create(
                $request->safe()->except('equipment_ids')
            );

            $booking->equipments()->attach($equipmentIds);

            return $booking;
        });

        return $this->created(
            new BookingResource($booking->load('equipments')),
            'Booking created successfully.'
        );
    }

    public function approve(ApproveBookingRequest $request, Booking $booking): JsonResponse
    {
        $this->authorize('manage', $booking);

        if ($booking->status !== BookingStatus::Pending) {
            return $this->error('Only pending bookings can be approved.', 422);
        }

        $booking->approve($request->validated('approval_note'));

        return $this->success(new BookingResource($booking), 'Booking approved');
    }

    public function reject(RejectBookingRequest $request, Booking $booking): JsonResponse
    {
        $this->authorize('manage', $booking);

        if ($booking->status !== BookingStatus::Pending) {
            return $this->error('Only pending bookings can be rejected.', 422);
        }

        $booking->reject($request->validated('rejection_reason'));

        return $this->success(new BookingResource($booking), 'Booking rejected');
    }

    public function release(Booking $booking): JsonResponse
    {
        $this->authorize('manage', $booking);

        if ($booking->status !== BookingStatus::Approved) {
            return $this->error('Only approved bookings can be released.', 422);
        }

        $booking->release();

        return $this->success(new BookingResource($booking), 'Booking released');
    }

    public function markAsReturned(Request $request, Booking $booking): JsonResponse
    {
        $this->authorize('manage', $booking);

        if (! $booking->isActive()) {
            return $this->error('Only approved or released bookings can be marked as returned.', 422);
        }

        $booking->markAsReturned($request->user()->id);

        return $this->success(new BookingResource($booking), 'Booking returned');
    }

    public function cancel(Booking $booking): JsonResponse
    {
        $this->authorize('cancel', $booking);

        $booking->cancel();

        return $this->success(new BookingResource($booking), 'Booking cancelled');
    }

    public function markAsRead(Booking $booking): JsonResponse
    {
        $this->authorize('markAsRead', $booking);

        $booking->markAsRead();

        return $this->success(new BookingResource($booking), 'Notification marked as read');
    }

    public function remind(Booking $booking): JsonResponse
    {
        $this->authorize('manage', $booking);

        if (! $booking->isActive()) {
            return $this->error('Return reminders can only be sent for active bookings.', 422);
        }

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
