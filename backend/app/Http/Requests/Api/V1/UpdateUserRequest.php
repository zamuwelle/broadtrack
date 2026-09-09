<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\Department;
use App\Enums\UserRole;
use App\Http\Requests\Concerns\HasUserRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    use HasUserRules;

    public function authorize(): bool
    {
        return $this->user()?->isSysAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'firstname' => $this->nameRules('sometimes'),
            'lastname' => $this->nameRules('sometimes'),
            'email' => ['sometimes', 'email', Rule::unique('users')->ignore($this->route('user')), $this->schoolEmailRule()],
            'phone' => 'sometimes|string',
            'role' => ['sometimes', Rule::enum(UserRole::class)],
            'department' => [Rule::requiredIf(fn (): bool => $this->input('role', $this->route('user')?->role?->value) === UserRole::Borrower->value
                && $this->input('department', $this->route('user')?->department) === null), 'nullable', Rule::enum(Department::class)],
            'password' => $this->passwordRules('sometimes'),
        ];
    }
}
