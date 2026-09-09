<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\Department;
use App\Http\Requests\Concerns\HasUserRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    use HasUserRules;

    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'firstname' => $this->nameRules('sometimes'),
            'lastname' => $this->nameRules('sometimes'),
            'phone' => 'sometimes|string',
            'department' => ['sometimes', Rule::requiredIf(fn (): bool => $this->user()->isBorrower()), 'nullable', Rule::enum(Department::class)],
            'profile_picture' => 'sometimes|nullable|string',
        ];
    }
}
