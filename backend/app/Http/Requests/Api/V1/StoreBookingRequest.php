<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\BookingStatus;
use App\Enums\EquipmentStatus;
use App\Models\Booking;
use App\Models\Equipment;
use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isBorrower() ?? false;
    }

    public function rules(): array
    {
        return [
            'equipment_ids' => 'required|array',
            'equipment_ids.*' => 'exists:equipments,id',
            'purpose' => 'required|string|max:255',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
            'notes' => 'nullable|string',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $equipmentIds = $this->input('equipment_ids', []);
            $startDate = $this->input('start_date');
            $endDate = $this->input('end_date');

            if (empty($equipmentIds) || ! $startDate || ! $endDate) {
                return;
            }

            $maintenance = Equipment::whereIn('id', $equipmentIds)
                ->where('status', EquipmentStatus::Maintenance->value)
                ->pluck('name');

            if ($maintenance->isNotEmpty()) {
                $validator->errors()->add(
                    'equipment_ids',
                    'The following equipment is currently under maintenance: '.$maintenance->join(', ')
                );
            }

            $overlapping = Booking::where(static function ($query) use ($startDate, $endDate) {
                $query->where('start_date', '<', $endDate)
                    ->where('end_date', '>', $startDate);
            })
                ->whereNotIn('status', [
                    BookingStatus::Cancelled->value,
                    BookingStatus::Rejected->value,
                    BookingStatus::Returned->value,
                ])
                ->whereHas('equipments', static fn ($query) => $query->whereIn('equipments.id', $equipmentIds))
                ->exists();

            if ($overlapping) {
                $validator->errors()->add(
                    'equipment_ids',
                    'One or more selected items are already booked for the specified dates.'
                );
            }
        });
    }
}
