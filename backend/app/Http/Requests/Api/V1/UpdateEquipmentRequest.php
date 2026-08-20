<?php

namespace App\Http\Requests\Api\V1;

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
            'category_id' => ['sometimes', 'required', 'exists:categories,id'],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'brand' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'serial_no' => 'nullable|string|max:255',
            'status' => ['sometimes', 'required', Rule::enum(EquipmentStatus::class)],
            'description' => 'nullable|string',
            'specs' => 'nullable|string',
            'image' => 'nullable|string|max:255',
        ];
    }
}
