<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\EquipmentCategory;
use App\Enums\EquipmentStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEquipmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'category' => ['sometimes', 'required', Rule::enum(EquipmentCategory::class)],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'brand' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'serial_no' => ['nullable', 'string', 'max:255', Rule::when(
                $this->input('serial_no') !== $this->route('equipment')?->serial_no,
                [Rule::unique('equipments')->ignore($this->route('equipment'))]
            )],
            'status' => ['sometimes', 'required', Rule::enum(EquipmentStatus::class)],
            'description' => 'nullable|string',
            'specs' => 'nullable|string',
            'image' => 'nullable|string|max:255',
        ];
    }
}
