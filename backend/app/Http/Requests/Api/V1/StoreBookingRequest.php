<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\BookingStatus;
use App\Enums\EquipmentStatus;
use App\Models\Booking;
use App\Models\Equipment;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isBorrower() ?? false;
    }

    public function rules(): array
    {
        return [
            'equipment_ids' => 'required|array|min:1',
            'equipment_ids.*' => 'required|integer|distinct|exists:equipments,id',
            'purpose' => 'required|string|max:255',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $equipmentIds = $this->input('equipment_ids', []);
            $startDate = $this->input('start_date');
            $endDate = $this->input('end_date');

            if (empty($equipmentIds) || ! $startDate || ! $endDate) {
                return;
            }

            $maintenance = Equipment::whereIn('id', $equipmentIds)
                ->where('status', EquipmentStatus::Maintenance)
                ->pluck('name');

            if ($maintenance->isNotEmpty()) {
                $validator->errors()->add(
                    'equipment_ids',
                    'The following equipment is currently under maintenance: '.$maintenance->join(', ')
                );
            }

            $overlapping = Booking::overlapping($startDate, $endDate)
                ->whereIn('status', [
                    BookingStatus::Approved,
                    BookingStatus::Released,
                ])
                ->whereHas('equipments', static fn (Builder $query): Builder => $query->whereIn('equipments.id', $equipmentIds))
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
