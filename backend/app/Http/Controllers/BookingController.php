<?php

namespace App\Http\Controllers;

use App\Models\Booking;

class BookingController extends Controller
{
	public function index()
	{
		$user = request()->user();

		$bookings = $user->isAdmin()
			? Booking::with(['user', 'equipments.category', 'equipments.location'])->get()
			: $user->bookings()->with(['equipments.category', 'equipments.location'])->get();

		return $this->success($bookings);
	}

	public function show($id)
	{
		$booking = Booking::with(['user', 'equipments.category', 'equipments.location'])->sole($id);

		$user = request()->user();

		if (!$user->isAdmin() && $booking->user_id !== $user->id) {
			return $this->error('Unauthorized', 403);
		}

		return $this->success($booking);
	}

	public function store()
	{
		$validated = request()->validate([
			'equipment_ids' => 'required|array',
			'equipment_ids.*' => 'exists:equipments,id',
			'purpose' => 'required|string|max:255',
			'start_date' => 'required|date|after:today',
			'end_date' => 'required|date|after_or_equal:start_date',
			'notes' => 'nullable|string',
		]);

		$booking = Booking::create([
			'user_id' => request()->user()->id,
			'ticket_id' => 'TKT-' . strtoupper(uniqid()),
			'purpose' => $validated['purpose'],
			'start_date' => $validated['start_date'],
			'end_date' => $validated['end_date'],
			'notes' => $validated['notes'] ?? null,
		]);

		$booking->equipments()->attach($validated['equipment_ids']);

		return $this->success(
			$booking->load('equipments'),
			'Booking created',
			201
		);
	}

	public function approve($id)
	{
		$booking = Booking::sole($id);
		$booking->update(['status' => 'approved']);

		return $this->success($booking, 'Booking approved');
	}

	public function reject($id)
	{
		$validated = request()->validate([
			'rejection_reason' => 'required|string',
		]);

		$booking = Booking::sole($id);
		$booking->update([
			'status' => 'rejected',
			'rejection_reason' => $validated['rejection_reason'],
		]);

		return $this->success($booking, 'Booking rejected');
	}

	public function release($id)
	{
		$booking = Booking::sole($id);
		$booking->update(['status' => 'released']);

		return $this->success($booking, 'Booking released');
	}

	public function return($id)
	{
		$booking = Booking::sole($id);
		$booking->update([
			'status' => 'returned',
			'return_date' => now(),
			'returned_by_user_id' => request()->user()->id,
		]);

		return $this->success($booking, 'Booking returned');
	}
}
