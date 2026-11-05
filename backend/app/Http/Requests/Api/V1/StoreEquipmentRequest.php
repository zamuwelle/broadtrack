<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\EquipmentCategory;
use App\Enums\EquipmentStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEquipmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'category' => ['required', Rule::enum(EquipmentCategory::class)],
            'name' => ['required', 'string', 'max:255'],
            'brand' => 'nullable|string|max:255',
            'model' => 'required|string|max:255',
            'serial_no' => ['required', 'string', 'max:255', Rule::unique('equipments')],
            'status' => ['nullable', Rule::enum(EquipmentStatus::class)],
            'description' => 'nullable|string',
            'specs' => 'nullable|string',
            'image' => 'nullable|string|max:255',
        ];
    }
}
