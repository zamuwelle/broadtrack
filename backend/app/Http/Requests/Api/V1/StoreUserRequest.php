<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\Department;
use App\Enums\UserRole;
use App\Http\Requests\Concerns\HasUserRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    use HasUserRules;

    public function authorize(): bool
    {
        return $this->user()?->isSysAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'firstname' => $this->nameRules(),
            'lastname' => $this->nameRules(),
            'email' => ['required', 'email', 'unique:users', $this->schoolEmailRule()],
            'phone' => 'required|string',
            'password' => $this->passwordRules(),
            'role' => ['required', Rule::enum(UserRole::class)],
            'department' => ['nullable', Rule::enum(Department::class)],
        ];
    }
}
