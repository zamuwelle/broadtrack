<?php

namespace App\Http\Requests\Concerns;

trait HasUserRules
{
    protected function nameRules(string $status = 'required'): array
    {
        return [$status, 'string', 'max:30', 'regex:/^[\p{L}\p{M}\s\'\.\-]+$/u'];
    }

    protected function passwordRules(string $status = 'required'): array
    {
        return [$status, 'string', 'min:8', 'max:64'];
    }

    protected function schoolEmailRule(): string
    {
        return 'ends_with:@student.laverdad.edu.ph,@laverdad.edu.ph';
    }
}
