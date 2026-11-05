<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\BookingStatus;
use App\Enums\EquipmentStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\ApproveBookingRequest;
use App\Http\Requests\Api\V1\IndexBookingRequest;
use App\Http\Requests\Api\V1\RejectBookingRequest;
use App\Http\Requests\Api\V1\StoreBookingRequest;
use App\Http\Resources\Api\V1\BookingResource;
use App\Mail\BookingRequestMail;
use App\Mail\EquipmentReturnReminderMail;
use App\Models\Booking;
use App\Models\Equipment;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class BookingController extends ApiController
{
    public function index(IndexBookingRequest $request): JsonResponse
    {
        $user = $request->user();

        if ($user && $user->isAdmin()) {
            $query = Booking::query();
        } elseif ($request->validated('view') === 'calendar') {
            $query = Booking::whereIn('status', [BookingStatus::Approved, BookingStatus::Pending]);
        } else {
            $query = $user->bookings();
        }

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
        $startDate = $request->validated('start_date');
        $endDate = $request->validated('end_date');

        return DB::transaction(function () use ($request, $equipmentIds, $startDate, $endDate): JsonResponse {
            $equipment = Equipment::whereIn('id', $equipmentIds)->orderBy('id')->lockForUpdate()->get();

            if ($equipment->count() !== count($equipmentIds) || $equipment->contains(static fn (Equipment $item): bool => $item->isUnderMaintenance() || $item->status === EquipmentStatus::Borrowed)) {
                return $this->error('One or more selected items are unavailable.', 422);
            }

            $overlapping = Booking::overlapping($startDate, $endDate)
                ->where('status', BookingStatus::Approved)
                ->whereHas('equipments', static fn (Builder $query): Builder => $query->whereIn('equipments.id', $equipmentIds))
                ->exists();

            if ($overlapping) {
                return $this->error('One or more selected items are already booked for the specified dates.', 422);
            }

            $createdBookings = new Collection;
            $items = [];

            foreach ($equipmentIds as $equipmentId) {
                $booking = $request->user()->bookings()->create(
                    $request->safe()->except('equipment_ids')
                );

                $booking->equipments()->attach([$equipmentId]);
                $createdBookings->push($booking);
                $item = $equipment->firstWhere('id', $equipmentId);
                $items[] = [
                    'ticket_id' => $booking->ticket_id,
                    'name' => $item->name,
                    'serial_no' => $item->serial_no,
                ];
            }

            $this->queueRequestNotifications($request->user(), $createdBookings->first(), $items);

            if (count($equipmentIds) === 1) {
                return $this->created(
                    new BookingResource($createdBookings->first()->load('equipments')),
                    'Booking created successfully.'
                );
            }

            return $this->created(
                BookingResource::collection($createdBookings->load('equipments')),
                'Bookings created successfully.'
            );
        });
    }

    private function queueRequestNotifications(User $borrower, Booking $booking, array $items): void
    {
        $details = [
            'borrowerName' => $borrower->full_name,
            'borrowerEmail' => $borrower->email,
            'purpose' => $booking->purpose,
            'startDate' => $booking->start_date->copy()->timezone('Asia/Manila')->format('F j, Y, h:i A'),
            'endDate' => $booking->end_date->copy()->timezone('Asia/Manila')->format('F j, Y, h:i A'),
            'items' => $items,
        ];

        DB::afterCommit(static function () use ($details): void {
            try {
                $recipients = User::whereIn('role', [UserRole::Admin, UserRole::Sysadmin])->pluck('email');
                foreach ($recipients as $email) {
                    try {
                        Mail::to($email)->queue(new BookingRequestMail(...$details));
                    } catch (Throwable $exception) {
                        Log::error('Failed to queue booking request email.', ['exception' => $exception]);
                    }
                }
            } catch (Throwable $exception) {
                Log::error('Failed to find booking request email recipients.', ['exception' => $exception]);
            }
        });
    }

    public function approve(ApproveBookingRequest $request, Booking $booking): JsonResponse
    {
        $this->authorize('manage', $booking);
        $equipmentIds = $booking->equipments()->pluck('equipments.id');

        return DB::transaction(function () use ($request, $booking, $equipmentIds): JsonResponse {
            $equipment = Equipment::whereIn('id', $equipmentIds)->orderBy('id')->lockForUpdate()->get();
            $booking = Booking::whereKey($booking->id)->lockForUpdate()->firstOrFail();
            $this->authorize('manage', $booking);

            if ($booking->status !== BookingStatus::Pending) {
                return $this->error('Only pending bookings can be approved.', 422);
            }

            if ($booking->end_date->isPast()) {
                return $this->error('Cannot approve a booking whose reservation period has already passed.', 422);
            }

            if ($equipment->contains(static fn (Equipment $item): bool => $item->isUnderMaintenance())) {
                return $this->error('Equipment under maintenance cannot be approved.', 422);
            }

            if ($equipment->contains(static fn (Equipment $item): bool => $item->status === EquipmentStatus::Borrowed)) {
                return $this->error('Equipment that is currently borrowed cannot be approved.', 422);
            }

            $hasOverlap = Booking::overlapping($booking->start_date, $booking->end_date)
                ->where('id', '!=', $booking->id)
                ->where('status', BookingStatus::Approved)
                ->whereHas('equipments', static fn (Builder $query): Builder => $query->whereIn('equipments.id', $equipmentIds))
                ->exists();

            if ($hasOverlap) {
                return $this->error('One or more equipment items have an active booking overlapping this period.', 422);
            }

            $booking->approve($request->validated('approval_note'));

            return $this->success(new BookingResource($booking), 'Booking approved');
        });
    }

    public function reject(RejectBookingRequest $request, Booking $booking): JsonResponse
    {
        return DB::transaction(function () use ($request, $booking): JsonResponse {
            $booking = Booking::whereKey($booking->id)->lockForUpdate()->firstOrFail();
            $this->authorize('manage', $booking);

            if (in_array($booking->status, [BookingStatus::Pending, BookingStatus::Approved], true)) {
                $booking->reject($request->validated('rejection_reason'));

                return $this->success(new BookingResource($booking), 'Booking rejected');
            }

            return $this->error('Only pending or approved bookings can be rejected.', 422);
        });
    }

    public function markAsReturned(Request $request, Booking $booking): JsonResponse
    {
        return DB::transaction(function () use ($request, $booking): JsonResponse {
            $booking = Booking::whereKey($booking->id)->lockForUpdate()->firstOrFail();
            $this->authorize('manage', $booking);

            if (! $booking->isActive()) {
                return $this->error('Only approved bookings can be marked as returned.', 422);
            }

            $booking->markAsReturned($request->user()->id);

            return $this->success(new BookingResource($booking), 'Booking returned');
        });
    }

    public function cancel(Booking $booking): JsonResponse
    {
        return DB::transaction(function () use ($booking): JsonResponse {
            $booking = Booking::whereKey($booking->id)->lockForUpdate()->firstOrFail();
            $this->authorize('cancel', $booking);

            $booking->cancel();

            return $this->success(new BookingResource($booking), 'Booking cancelled');
        });
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

        $startDate = $booking->start_date?->format('F d, Y \a\t h:i A');
        $endDate = $booking->end_date;
        $currentDate = now();

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
        } catch (Throwable $exception) {
            Log::error('Failed to queue a manual return reminder.', [
                'booking_id' => $booking->id,
                'exception' => $exception,
            ]);

            return $this->error('Failed to queue return reminder.', 500);
        }

        return $this->success();
    }
}
