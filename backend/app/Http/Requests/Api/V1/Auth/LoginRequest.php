<?php

namespace App\Http\Requests\Api\V1\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => 'required|email|ends_with:student.laverdad.edu.ph,laverdad.edu.ph',
            'password' => 'required|string',
        ];
    }
}
