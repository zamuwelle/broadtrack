<?php

namespace App\Http\Controllers;

use App\Enums\BookingStatus;
use App\Events\BookingUpdated;
use App\Events\EquipmentUpdated;
use App\Http\Requests\Api\V1\ApproveBookingRequest;
use App\Http\Requests\Api\V1\RejectBookingRequest;
use App\Http\Requests\Api\V1\StoreBookingRequest;
use App\Mail\EquipmentReturnReminderMail;
use App\Models\Booking;
use App\Models\Equipment;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;

class BookingController extends Controller
{
    public function index()
    {
        $user = request()->user();
        $bookings = Cache::remember('booking_list', 86400, static fn () => Booking::with(['user', 'equipments.category', 'returnedByUser'])->get()->toArray());

        return $this->success(! $user->isAdmin() && ! request()->boolean('all') ? array_values(array_filter($bookings, static fn ($booking) => $booking['user_id'] === $user->id)) : $bookings);
    }

    public function show($id)
    {
        $booking = Booking::with(['user', 'equipments.category', 'returnedByUser'])->findOrFail($id);

        $user = request()->user();

        if (! $user->isAdmin() && $booking->user_id !== $user->id) {
            return $this->error('Unauthorized', 403);
        }

        return $this->success($booking);
    }

    public function store(StoreBookingRequest $request)
    {
        $validated = $request->validated();

        $maintenanceEquipments = Equipment::whereIn('id', $validated['equipment_ids'])
            ->where('status', 'maintenance')
            ->pluck('name');

        if ($maintenanceEquipments->isNotEmpty()) {
            return $this->error('The following equipment is currently under maintenance: '.$maintenanceEquipments->join(', '), 422);
        }

        $overlapping = Booking::where(static function ($query) use ($validated) {
            $query->where('start_date', '<', $validated['end_date'])
                ->where('end_date', '>', $validated['start_date']);
        })
            ->whereNotIn('status', ['cancelled', 'canceled', 'rejected', 'returned'])
            ->whereHas('equipments', static function ($query) use ($validated) {
                $query->whereIn('equipments.id', $validated['equipment_ids']);
            })
            ->exists();

        if ($overlapping) {
            return $this->error('One or more selected items are already booked for the specified dates.', 422);
        }

        $booking = Booking::create([
            'user_id' => request()->user()->id,
            'purpose' => $validated['purpose'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'notes' => $validated['notes'] ?? null,
        ]);

        $booking->equipments()->attach($validated['equipment_ids']);
        Cache::forget('booking_list');
        broadcast(new BookingUpdated('created', $booking->id, $booking));
        broadcast(new EquipmentUpdated('updated'));

        return $this->success(
            $booking->load('equipments'),
            'Booking created',
            201
        );
    }

    public function approve(ApproveBookingRequest $request, $id)
    {
        $validated = $request->validated();

        $booking = Booking::findOrFail($id);
        $booking->update([
            'status' => 'approved',
            'approval_note' => $validated['approval_note'] ?? $booking->approval_note,
            'isRead' => false,
        ]);
        $booking->equipments->each->update(['status' => 'booked']);
        Cache::forget('booking_list');
        Cache::forget('equipment_list');
        broadcast(new BookingUpdated('approved', $booking->id, $booking));
        broadcast(new EquipmentUpdated('updated'));

        return $this->success($booking, 'Booking approved');
    }

    public function reject(RejectBookingRequest $request, $id)
    {
        $validated = $request->validated();

        $booking = Booking::findOrFail($id);
        $booking->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
            'isRead' => false,
        ]);
        $booking->equipments->each->update(['status' => 'available']);
        Cache::forget('booking_list');
        Cache::forget('equipment_list');
        broadcast(new BookingUpdated('rejected', $booking->id, $booking));
        broadcast(new EquipmentUpdated('updated'));

        return $this->success($booking, 'Booking rejected');
    }

    public function release($id)
    {
        $booking = Booking::findOrFail($id);
        $booking->update(['status' => 'released']);
        $booking->equipments->each->update(['status' => 'borrowed']);
        Cache::forget('booking_list');
        Cache::forget('equipment_list');
        broadcast(new BookingUpdated('released', $booking->id, $booking));
        broadcast(new EquipmentUpdated('updated'));

        return $this->success($booking, 'Booking released');
    }

    public function return($id)
    {
        $booking = Booking::findOrFail($id);
        $booking->update([
            'status' => 'returned',
            'return_date' => now(),
            'returned_by_user_id' => request()->user()->id,
            'isRead' => false,
        ]);
        $booking->equipments->each->update(['status' => 'available']);
        Cache::forget('booking_list');
        Cache::forget('equipment_list');
        broadcast(new BookingUpdated('returned', $booking->id, $booking));
        broadcast(new EquipmentUpdated('updated'));

        return $this->success($booking, 'Booking returned');
    }

    public function cancel($id)
    {
        $booking = Booking::findOrFail($id);
        $user = request()->user();

        if (! $user->isAdmin() && $booking->user_id !== $user->id) {
            return $this->error('Unauthorized', 403);
        }

        if ($booking->status !== BookingStatus::Pending) {
            return $this->error('Only pending bookings can be cancelled', 422);
        }

        $booking->equipments->each->update(['status' => 'available']);
        $booking->update([
            'status' => 'cancelled',
            'isRead' => false,
        ]);
        Cache::forget('booking_list');
        Cache::forget('equipment_list');
        broadcast(new BookingUpdated('cancelled', $booking->id, $booking));
        broadcast(new EquipmentUpdated('updated'));

        return $this->success($booking, 'Booking cancelled');
    }

    public function isRead($id)
    {
        $booking = Booking::findOrFail($id);
        $user = request()->user();

        if (! $user->isAdmin() && $booking->user_id !== $user->id) {
            return $this->error('Unauthorized', 403);
        }

        $booking->update(['isRead' => true]);
        Cache::forget('booking_list');

        return $this->success($booking, 'Notification marked as read');
    }

    public function remind($id)
    {
        $booking = Booking::with(['user', 'equipments'])->findOrFail($id);
        $borrowerEmail = $booking->user?->email;
        if (! $borrowerEmail) {
            return $this->error('Borrower email not found', 422);
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

        return $this->success(null, 'Reminder sent successfully');
    }
}
