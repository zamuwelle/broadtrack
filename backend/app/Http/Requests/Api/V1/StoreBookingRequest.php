<?php

namespace App\Http\Requests\Api\V1;

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
}
