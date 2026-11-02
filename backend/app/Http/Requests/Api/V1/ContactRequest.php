<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class ContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'firstname' => ['required', 'string', 'max:30', 'regex:/^[\p{L}\p{M}\s\'\.\-]+$/u'],
            'lastname' => ['required', 'string', 'max:30', 'regex:/^[\p{L}\p{M}\s\'\.\-]+$/u'],
            'email' => ['required', 'email'],
            'message' => ['required', 'string', 'max:6000'],
        ];
    }
}
