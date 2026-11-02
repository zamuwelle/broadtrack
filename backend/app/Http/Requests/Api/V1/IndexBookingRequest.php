<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class IndexBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'view' => 'sometimes|in:calendar',
        ];
    }

    public function validationData(): array
    {
        return $this->query();
    }
}
