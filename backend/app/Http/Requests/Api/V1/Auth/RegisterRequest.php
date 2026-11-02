<?php

namespace App\Http\Requests\Api\V1\Auth;

use App\Enums\Department;
use App\Http\Requests\Concerns\HasUserRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    use HasUserRules;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'firstname' => $this->nameRules(),
            'lastname' => $this->nameRules(),
            'email' => [
                'required',
                'email',
                Rule::unique('users')->whereNotNull('email_verified_at'),
                $this->schoolEmailRule(),
            ],
            'password' => $this->passwordRules(),
            'department' => ['required', Rule::enum(Department::class)],
            'profile_picture' => 'nullable|string',
        ];
    }
}
